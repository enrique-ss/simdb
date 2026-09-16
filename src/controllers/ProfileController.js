const { db, isOfflineMode } = require('../database');

/**
 * ProfileController: Gerencia perfis de usuários
 * Responsável por buscar e atualizar dados de perfil
 */
class ProfileController {
    
    /**
     * Retorna o perfil do usuário autenticado
     */
    getProfile = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const userId = req.user.id;
            const user = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, profile_theme, is_private, stats_private, media_filter, language_region, notifications_enabled, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(userId);
            
            if (!user) return res.json(null);

            const seriesCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'series'`).get(user.id).c;
            const moviesCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'movie'`).get(user.id).c;
            const gamesCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'game'`).get(user.id).c;
            const booksCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'book'`).get(user.id).c;

            user.series_count = seriesCount;
            user.movies_count = moviesCount;
            user.games_count = gamesCount;
            user.works_count = booksCount;

            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Retorna o perfil de um usuário específico por ID com estatísticas e relacionamento
     */
    getProfileById = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const targetUserId = req.params.id;
            const currentUserId = req.user.id;

            const user = db.prepare('SELECT id, username, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, profile_theme, is_private, stats_private, media_filter, language_region, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(targetUserId);

            if (!user) return res.status(404).json({ error: "Perfil não encontrado." });

            const seriesCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'series'`).get(user.id).c;
            const moviesCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'movie'`).get(user.id).c;
            const gamesCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'game'`).get(user.id).c;
            const booksCount = db.prepare(`SELECT COUNT(DISTINCT media_id) as c FROM user_media_progress WHERE user_id = ? AND media_type = 'book'`).get(user.id).c;

            user.series_count = seriesCount;
            user.movies_count = moviesCount;
            user.games_count = gamesCount;
            user.works_count = booksCount;

            let relationshipStatus = 'none';
            let relationshipId = null;

            if (currentUserId !== targetUserId) {
                const rel = db.prepare(`
                    SELECT id, user_id, friend_id, status 
                    FROM user_relationships 
                    WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
                `).get(currentUserId, targetUserId, targetUserId, currentUserId);

                if (rel) {
                    relationshipId = rel.id;
                    if (rel.status === 'accepted') {
                        relationshipStatus = 'accepted';
                    } else if (rel.user_id === currentUserId) {
                        relationshipStatus = 'pending_sent';
                    } else {
                        relationshipStatus = 'pending_received';
                    }
                }
            } else {
                relationshipStatus = 'self';
            }

            user.relationshipStatus = relationshipStatus;
            user.relationshipId = relationshipId;

            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Atualiza o perfil do usuário autenticado
     */
    updateProfile = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, profile_theme, is_private, stats_private, media_filter, language_region, notifications_enabled } = req.body;
            const id = req.user.id;

            const updates = [];
            const params = [];
            
            if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name); }
            if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
            if (profile_cover_url !== undefined) { updates.push('profile_cover_url = ?'); params.push(profile_cover_url); }
            if (home_banner_url !== undefined) { updates.push('home_banner_url = ?'); params.push(home_banner_url); }
            if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
            if (letterboxd_link !== undefined) { updates.push('letterboxd_link = ?'); params.push(letterboxd_link); }
            if (serializd_link !== undefined) { updates.push('serializd_link = ?'); params.push(serializd_link); }
            if (['violet', 'rose', 'ocean'].includes(profile_theme)) { updates.push('profile_theme = ?'); params.push(profile_theme); }
            if (typeof is_private === 'boolean') { updates.push('is_private = ?'); params.push(is_private ? 1 : 0); }
            if (typeof stats_private === 'boolean') { updates.push('stats_private = ?'); params.push(stats_private ? 1 : 0); }
            if (['all', 'movies', 'series', 'games', 'books'].includes(media_filter)) { updates.push('media_filter = ?'); params.push(media_filter); }
            if (typeof language_region === 'string' && /^[a-z]{2,3}-[A-Z]{2}$/.test(language_region)) { updates.push('language_region = ?'); params.push(language_region); }
            if (typeof notifications_enabled === 'boolean') { updates.push('notifications_enabled = ?'); params.push(notifications_enabled ? 1 : 0); }
            
            if (updates.length > 0) {
                params.push(id);
                const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`;
                db.prepare(query).run(...params);
            }
            
            const updated = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, profile_theme, is_private, stats_private, media_filter, language_region, notifications_enabled, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(id);
            res.json({ success: true, user: updated });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

module.exports = new ProfileController();
