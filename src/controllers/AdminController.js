const { db, isOfflineMode } = require('../database');

class AdminController {
    listUsers = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: 'Servidor em modo Supabase.' });
        const query = (req.query.q || '').trim();
        try {
            const users = db.prepare(`
                SELECT id, username, email, display_name, avatar_url, role, is_banned, banned_at, banned_reason, created_at
                FROM profiles
                WHERE username LIKE ? OR display_name LIKE ? OR email LIKE ?
                ORDER BY created_at DESC LIMIT 30
            `).all(`%${query}%`, `%${query}%`, `%${query}%`);
            res.json(users);
        } catch (error) { res.status(500).json({ error: error.message }); }
    };

    setBan = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: 'Servidor em modo Supabase.' });
        const { user_id, banned, reason = '' } = req.body;
        if (!user_id || typeof banned !== 'boolean') return res.status(400).json({ error: 'Dados de moderação inválidos.' });
        if (user_id === req.user.id) return res.status(400).json({ error: 'Um administrador não pode banir a própria conta.' });
        try {
            const target = db.prepare('SELECT id, role FROM profiles WHERE id = ?').get(user_id);
            if (!target) return res.status(404).json({ error: 'Usuário não encontrado.' });
            if (target.role === 'admin') return res.status(403).json({ error: 'Administradores não podem ser banidos por esta ação.' });
            db.prepare(`UPDATE profiles SET is_banned = ?, banned_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END, banned_reason = ? WHERE id = ?`)
                .run(banned ? 1 : 0, banned ? 1 : 0, banned ? reason.trim() : '', user_id);
            res.json({ success: true });
        } catch (error) { res.status(500).json({ error: error.message }); }
    };

    createMedia = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: 'Servidor em modo Supabase.' });
        const { media_type, title, poster = '', backdrop = '', release_year = '', overview = '', rating = 0, category_tag = '' } = req.body;
        const allowedTypes = ['movie', 'series', 'game', 'book'];
        if (!allowedTypes.includes(media_type) || !title?.trim()) return res.status(400).json({ error: 'Informe título e tipo de mídia válidos.' });
        try {
            const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            db.prepare(`INSERT INTO media_items (id, media_type, title, poster, backdrop, release_year, overview, rating, category_tag)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .run(id, media_type, title.trim(), poster.trim(), backdrop.trim(), release_year.trim(), overview.trim(), Number(rating) || 0, category_tag.trim());
            res.status(201).json({ success: true, id });
        } catch (error) { res.status(500).json({ error: error.message }); }
    };
}

module.exports = new AdminController();
