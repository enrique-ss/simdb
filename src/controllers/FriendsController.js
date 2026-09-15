const { db, isOfflineMode } = require('../database');

/**
 * FriendsController: Gerencia sistema de amizades
 * Responsável por solicitações, aceitação, rejeição e busca de amigos
 */
class FriendsController {
    
    constructor() {
        this.io = null;
    }

    setIO(ioInstance) {
        this.io = ioInstance;
    }
    
    /**
     * Retorna lista de amigos e solicitações pendentes
     */
    getFriends = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const userId = req.user.id;

            const friends = db.prepare(`
                SELECT p.id, p.username, p.display_name, p.avatar_url, p.bio, r.affinity_percentage, r.id as relationship_id
                FROM user_relationships r
                JOIN profiles p ON (r.friend_id = p.id AND r.user_id = ?) OR (r.user_id = p.id AND r.friend_id = ?)
                WHERE r.status = 'accepted' AND p.id != ?
            `).all(userId, userId, userId);

            const pendingIncoming = db.prepare(`
                SELECT p.id, p.username, p.display_name, p.avatar_url, r.id as relationship_id, r.created_at
                FROM user_relationships r
                JOIN profiles p ON r.user_id = p.id
                WHERE r.friend_id = ? AND r.status = 'pending'
            `).all(userId);

            const pendingOutgoing = db.prepare(`
                SELECT p.id, p.username, p.display_name, p.avatar_url, r.id as relationship_id, r.created_at
                FROM user_relationships r
                JOIN profiles p ON r.friend_id = p.id
                WHERE r.user_id = ? AND r.status = 'pending'
            `).all(userId);

            res.json({ friends, pendingIncoming, pendingOutgoing });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Busca usuários para adicionar como amigos
     */
    searchFriends = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const q = req.query.q || '';
            const currentUserId = req.user.id;

            if (!q.trim()) return res.json([]);

            const users = db.prepare(`
                SELECT id, username, display_name, avatar_url, bio
                FROM profiles
                WHERE (username LIKE ? OR display_name LIKE ?) AND id != ? AND is_banned = 0
                LIMIT 10
            `).all(`%${q}%`, `%${q}%`, currentUserId);

            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Envia solicitação de amizade
     */
    sendRequest = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { friend_id } = req.body;
            const user_id = req.user.id;
            
            if (!friend_id || user_id === friend_id) {
                return res.status(400).json({ error: "IDs de usuário inválidos." });
            }

            const existing = db.prepare(`
                SELECT * FROM user_relationships
                WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
            `).get(user_id, friend_id, friend_id, user_id);

            if (existing) {
                return res.status(400).json({ error: "Já existe uma solicitação ou amizade com este usuário." });
            }

            const id = 'rel_' + Date.now();
            db.prepare(`
                INSERT INTO user_relationships (id, user_id, friend_id, status, affinity_percentage)
                VALUES (?, ?, ?, 'pending', 85.0)
            `).run(id, user_id, friend_id);

            const senderObj = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(user_id);
            this.createNotification(friend_id, 'friend_request', `Solicitação de Amizade`, `${senderObj ? senderObj.display_name : 'Alguém'} quer ser seu amigo no Kindred.`);

            res.json({ success: true, relationship_id: id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Aceita solicitação de amizade
     */
    acceptRequest = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { relationship_id } = req.body;
            if (!relationship_id) return res.status(400).json({ error: "ID de solicitação não fornecido." });

            const rel = db.prepare('SELECT * FROM user_relationships WHERE id = ?').get(relationship_id);
            if (!rel) return res.status(404).json({ error: "Solicitação não encontrada." });

            db.prepare(`UPDATE user_relationships SET status = 'accepted' WHERE id = ?`).run(relationship_id);

            const user1 = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(rel.user_id);
            const user2 = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(rel.friend_id);

            this.createNotification(rel.user_id, 'friend_accept', `Solicitação Aceita!`, `${user2 ? user2.display_name : 'Um amigo'} aceitou seu pedido de amizade.`);
            this.createNotification(rel.friend_id, 'friend_accept', `Solicitação Aceita!`, `Você e ${user1 ? user1.display_name : 'um amigo'} agora são amigos no Kindred.`);

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Rejeita solicitação de amizade
     */
    rejectRequest = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { relationship_id } = req.body;
            if (!relationship_id) return res.status(400).json({ error: "ID de solicitação não fornecido." });

            db.prepare('DELETE FROM user_relationships WHERE id = ?').run(relationship_id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Helper function para criar notificações
     */
    createNotification = (userId, type, title, content = '') => {
        if (!db || !userId) return;
        try {
            const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            db.prepare(`
                INSERT INTO notifications (id, user_id, type, title, content)
                VALUES (?, ?, ?, ?, ?)
            `).run(id, userId, type, title, content);

            // Notifica em tempo real via Socket.io
            if (this.io) {
                this.io.to(`user_${userId}`).emit('new_notification', { id, type, title, content, created_at: new Date().toISOString() });
            }
        } catch (err) {
            console.error('Erro ao criar notificação:', err.message);
        }
    };
}

module.exports = new FriendsController();
