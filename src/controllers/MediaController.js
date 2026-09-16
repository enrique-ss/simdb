const { db, isOfflineMode } = require('../database');

/**
 * MediaController: Gerencia mídias, progresso e avaliações
 * Responsável por gerenciar o catálogo de mídias e progresso dos usuários
 */
class MediaController {
    
    /**
     * Helper function para formatar dados de progresso com lógica de negócios
     */
    formatProgressItem = (item) => {
        const isBook = item.media_type === 'book';
        const iconBadge = isBook ? '' : '✓';
        let progressText = '';
        
        if (isBook) {
            progressText = `Pág ${item.current_chapter} de ${item.total_chapters || '?'}`;
        } else {
            progressText = `S${String(item.current_season).padStart(2, '0')} • E${String(item.current_episode).padStart(2, '0')}`;
        }
        
        return {
            ...item,
            icon_badge: iconBadge,
            progress_text: progressText
        };
    };

    /**
     * Helper function para formatar dados de mídia com emoji apropriado
     */
    formatMediaWithIcon = (item) => {
        return item;
    };

    /**
     * Retorna o progresso de mídia do usuário
     */
    getProgress = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const userId = req.user.id;
            const stmt = db.prepare('SELECT * FROM user_media_progress WHERE user_id = ? ORDER BY last_updated DESC');
            const progressItems = stmt.all(userId);
            
            // Aplica formatação de negócios no backend
            const formattedItems = progressItems.map(this.formatProgressItem);
            
            res.json(formattedItems);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Adiciona uma mídia ao progresso do usuário
     */
    addProgress = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { media_id, title, media_type, poster, total_episodes, total_chapters, current_season, current_episode, current_chapter } = req.body;
            const user_id = req.user.id;
            
            if (!media_id || !title) {
                return res.status(400).json({ error: "Dados de mídia incompletos." });
            }

            const mediaCheck = db.prepare('SELECT id FROM media_items WHERE id = ?').get(media_id);
            if (!mediaCheck) {
                db.prepare(`
                    INSERT INTO media_items (id, media_type, title, poster)
                    VALUES (?, ?, ?, ?)
                `).run(media_id, media_type || 'series', title, poster || '');
            }

            const seasonNum = parseInt(current_season) || 1;
            const episodeNum = parseInt(current_episode) || 1;
            const chapterNum = parseInt(current_chapter) || 1;

            let activityDesc = '';
            if (media_type === 'book') {
                activityDesc = `Capítulo ${chapterNum}`;
            } else if (media_type === 'series') {
                activityDesc = `Temporada ${seasonNum} • Episódio ${episodeNum}`;
            } else {
                activityDesc = `Assistindo / Jogando`;
            }

            const existing = db.prepare('SELECT id FROM user_media_progress WHERE user_id = ? AND media_id = ?').get(user_id, media_id);
            if (existing) {
                db.prepare(`
                    UPDATE user_media_progress 
                    SET current_season = ?, current_episode = ?, current_chapter = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(seasonNum, episodeNum, chapterNum, existing.id);

                this.logActivity(user_id, 'media_progress', title, activityDesc, media_id, poster);
                return res.json({ success: true, id: existing.id });
            }

            const id = 'prog_' + Date.now();
            db.prepare(`
                INSERT INTO user_media_progress (id, user_id, media_id, title, media_type, poster, current_season, current_episode, current_chapter, total_episodes, total_chapters)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, user_id, media_id, title, media_type || 'series', poster || '', seasonNum, episodeNum, chapterNum, total_episodes || 10, total_chapters || 100);

            this.logActivity(user_id, 'media_start', title, activityDesc, media_id, poster);

            res.json({ success: true, id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Avança o progresso de uma mídia
     */
    advanceProgress = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { id } = req.body;
            const item = db.prepare('SELECT * FROM user_media_progress WHERE id = ? AND user_id = ?').get(id, req.user.id);
            
            if (!item) {
                return res.status(404).json({ error: "Progresso não encontrado ou não pertence ao usuário" });
            }
            
            let activityDesc = '';
            if (item.media_type === 'series') {
                const nextEpisode = item.current_episode + 1;
                db.prepare('UPDATE user_media_progress SET current_episode = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(nextEpisode, id);
                activityDesc = `Temporada ${item.current_season} • Episódio ${nextEpisode}`;
            } else if (item.media_type === 'book') {
                const nextChapter = item.current_chapter + 1;
                db.prepare('UPDATE user_media_progress SET current_chapter = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(nextChapter, id);
                activityDesc = `Capítulo ${nextChapter}`;
            } else {
                db.prepare('UPDATE user_media_progress SET last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(id);
                activityDesc = `Concluído / Atualizado`;
            }

            this.logActivity(item.user_id, 'media_progress', item.title, activityDesc, item.media_id, item.poster);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Retorna lista de mídias
     */
    getMedia = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const tag = req.query.tag;
            const userId = req.query.user_id;
            let items = [];

            if (tag === 'favoritos' && userId) {
                items = db.prepare('SELECT m.* FROM media_items m JOIN reviews_ratings r ON m.id = r.media_id WHERE r.user_id = ? AND r.is_favorite = 1').all(userId);
            } else if (tag) {
                items = db.prepare('SELECT * FROM media_items WHERE category_tag = ?').all(tag);
            } else {
                items = db.prepare('SELECT * FROM media_items LIMIT 20').all();
            }

            res.json(items);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Retorna avaliações de uma mídia
     */
    getReviews = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const mediaId = req.query.media_id;
            if (!mediaId) return res.json([]);
            const stmt = db.prepare('SELECT * FROM reviews_ratings WHERE media_id = ? ORDER BY created_at DESC');
            res.json(stmt.all(mediaId));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Adiciona uma avaliação para uma mídia
     */
    addReview = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const { media_id, media_title, media_type, feeling, rating, review_text, is_spoiler, is_favorite } = req.body;
            const user_id = req.user.id;
            const user = db.prepare('SELECT display_name, avatar_url FROM profiles WHERE id = ?').get(user_id);
            
            const id = 'rev_' + Date.now();
            
            const mediaCheck = db.prepare('SELECT id FROM media_items WHERE id = ?').get(media_id);
            if (!mediaCheck) {
                db.prepare(`
                    INSERT INTO media_items (id, media_type, title)
                    VALUES (?, ?, ?)
                `).run(media_id, media_type || 'series', media_title || 'Mídia');
            }

            const stmt = db.prepare(`
                INSERT INTO reviews_ratings (id, user_id, friend_name, friend_avatar, media_id, media_title, media_type, feeling, rating, review_text, is_spoiler, is_favorite, date_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agora')
            `);
            stmt.run(id, user_id, user?.display_name || 'Usuário', user?.avatar_url || '', media_id, media_title, media_type || 'series', feeling || 'liked', rating || 5.0, review_text || '', is_spoiler ? 1 : 0, is_favorite ? 1 : 0);

            this.logActivity(user_id, 'review', `Avaliou ${media_title} com nota ${rating || 5}`, review_text || '', media_id);

            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Helper function para registrar atividades
     */
    logActivity = (userId, activityType, title, description = '', mediaId = null, mediaPoster = '') => {
        if (!db || !userId) return;
        try {
            const id = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            db.prepare(`
                INSERT INTO activities (id, user_id, activity_type, title, description, media_id, media_poster)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, userId, activityType, title, description, mediaId || '', mediaPoster || '');
        } catch (err) {
            console.error('Erro ao registrar atividade:', err.message);
        }
    };
}

module.exports = new MediaController();
