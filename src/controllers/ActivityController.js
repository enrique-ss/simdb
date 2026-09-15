const { db, isOfflineMode } = require('../database');

/**
 * ActivityController: Gerencia feed de atividades
 * Responsável por retornar atividades do sistema e feed social
 */
class ActivityController {
    
    /**
     * Helper function para formatar dados de mídia com emoji apropriado
     */
    formatMediaWithIcon = (item) => {
        return item;
    };

    /**
     * Retorna apenas atividades de amigos aceitos do usuário autenticado.
     */
    getActivities = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const userId = req.user.id;
            const activities = db.prepare(`
                SELECT 
                    a.id, a.user_id, p.display_name as friend_name, p.avatar_url as friend_avatar,
                    a.title as media_title, a.activity_type as media_type, a.description as review_text,
                    a.media_id, a.media_poster, a.created_at
                FROM activities a
                JOIN profiles p ON a.user_id = p.id
                WHERE a.user_id != ?
                  AND EXISTS (
                    SELECT 1
                    FROM user_relationships r
                    WHERE r.status = 'accepted'
                      AND (
                        (r.user_id = ? AND r.friend_id = a.user_id)
                        OR (r.friend_id = ? AND r.user_id = a.user_id)
                      )
                  )
                ORDER BY a.created_at DESC
                LIMIT 20
            `).all(userId, userId, userId);

            // Aplica formatação de ícones no backend
            const formattedActivities = activities.map(this.formatMediaWithIcon);
            
            res.json(formattedActivities);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

module.exports = new ActivityController();
