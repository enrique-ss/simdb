const { db, isOfflineMode } = require('../database');

/**
 * ListsController: Gerencia listas personalizadas de usuários
 * Responsável por criar e gerenciar listas de mídias
 */
class ListsController {
    
    /**
     * Retorna listas do usuário
     */
    getLists = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const userId = req.user.id;
            const lists = db.prepare('SELECT * FROM custom_lists WHERE user_id = ? ORDER BY created_at DESC').all(userId);
            res.json(lists);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Cria uma nova lista
     */
    createList = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { title, description, cover_url } = req.body;
            const user_id = req.user.id;
            
            if (!title) return res.status(400).json({ error: "Título é obrigatório." });
            const id = 'list_' + Date.now();
            db.prepare('INSERT INTO custom_lists (id, user_id, title, description, cover_url) VALUES (?, ?, ?, ?, ?)').run(id, user_id, title, description || '', cover_url || '');
            
            this.logActivity(user_id, 'list_create', `Criou a lista "${title}"`, description || '');

            res.json({ success: true, id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Helper function para registrar atividades
     */
    logActivity = (userId, activityType, title, description = '') => {
        if (!db || !userId) return;
        try {
            const id = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            db.prepare(`
                INSERT INTO activities (id, user_id, activity_type, title, description, media_id, media_poster)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, userId, activityType, title, description, '', '');
        } catch (err) {
            console.error('Erro ao registrar atividade:', err.message);
        }
    };
}

module.exports = new ListsController();