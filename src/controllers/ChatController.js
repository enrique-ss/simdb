const { db, isOfflineMode } = require('../database');

/**
 * ChatController: Gerencia mensagens e notificações
 * Responsável por comunicação em tempo real entre usuários
 */
class ChatController {
    
    constructor() {
        this.io = null;
    }

    setIO(ioInstance) {
        this.io = ioInstance;
    }
    
    /**
     * Retorna mensagens de chat entre o usuário e um amigo
     */
    getMessages = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const user_id = req.user.id;
            const { friend_id } = req.query;
            if (!friend_id) return res.json([]);

            const messages = db.prepare(`
                SELECT * FROM messages
                WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at ASC
            `).all(user_id, friend_id, friend_id, user_id);

            res.json(messages);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Envia uma mensagem de chat
     */
    sendMessage = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { receiver_id, content } = req.body;
            const sender_id = req.user.id;
            
            if (!receiver_id || !content) return res.status(400).json({ error: "Dados incompletos." });

            const id = 'msg_' + Date.now();
            db.prepare(`
                INSERT INTO messages (id, sender_id, receiver_id, content)
                VALUES (?, ?, ?, ?)
            `).run(id, sender_id, receiver_id, content);

            const senderObj = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(sender_id);
            this.createNotification(receiver_id, 'chat', `Nova mensagem de ${senderObj ? senderObj.display_name : 'Amigo'}`, content);

            const msgObj = { id, sender_id, receiver_id, content, created_at: new Date().toISOString() };
            
            if (this.io) {
                this.io.to(`user_${receiver_id}`).emit('new_chat_message', msgObj);
                this.io.to(`user_${sender_id}`).emit('new_chat_message', msgObj);
            }

            res.json({ success: true, message: msgObj });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Retorna notificações do usuário
     */
    getNotifications = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const userId = req.user.id;
            const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(userId);
            res.json(notifs);
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

            if (this.io) {
                this.io.to(`user_${userId}`).emit('new_notification', { id, type, title, content, created_at: new Date().toISOString() });
            }
        } catch (err) {
            console.error('Erro ao criar notificação:', err.message);
        }
    };
}

module.exports = new ChatController();