const { db, isOfflineMode } = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');

/**
 * AuthController: Gerencia autenticação e perfis de usuários
 * Responsável por login, registro, e gerenciamento de dados de perfil
 */
class AuthController {
    
    /**
     * Retorna os dados do usuário autenticado atual
     */
    getMe = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Modo Supabase ativo" });
        try {
            const user = db.prepare('SELECT id, username, email, role, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, profile_theme, is_private, stats_private, media_filter, language_region, notifications_enabled, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(req.user.id);
            
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

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
     * Registra um novo usuário no sistema
     */
    register = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Modo Supabase ativo" });
        try {
            const { display_name, username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
            }

            const formattedUsername = username.trim().toLowerCase().replace(/^@/, '');
            const finalDisplayName = display_name ? display_name.trim() : formattedUsername;

            const id = 'user_' + Date.now();
            const hashedPassword = bcrypt.hashSync(password, 10);
            const normalizedEmail = email.trim().toLowerCase();
            const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
            const role = adminEmail && normalizedEmail === adminEmail ? 'admin' : 'user';
            
            const stmt = db.prepare(`
                INSERT INTO profiles (id, username, email, password, display_name, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            stmt.run(id, formattedUsername, normalizedEmail, hashedPassword, finalDisplayName, role);

            const newUser = db.prepare('SELECT id, username, email, role, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, profile_theme, is_private, stats_private, media_filter, language_region, notifications_enabled, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(id);
            
            const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

            this.logActivity(id, 'welcome', 'Juntou-se ao Kindred!', 'Nova conta criada');

            res.json({ success: true, user: newUser, token });
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Nome de usuário (@handle) ou E-mail já cadastrado." });
            }
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Realiza login do usuário
     */
    login = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Modo Supabase ativo" });
        try {
            const { emailOrUsername, password } = req.body;
            if (!emailOrUsername || !password) {
                return res.status(400).json({ error: "Informe seu e-mail/usuário e a senha." });
            }

            const queryVal = emailOrUsername.trim().toLowerCase().replace(/^@/, '');

            const user = db.prepare(`
                SELECT * FROM profiles 
                WHERE email = ? OR username = ?
            `).get(queryVal, queryVal);

            if (!user) {
                return res.status(401).json({ error: "Credenciais inválidas. Verifique seu e-mail/usuário e senha." });
            }

            if (user.is_banned) return res.status(403).json({ error: 'Esta conta foi banida.' });

            const isPasswordValid = user.password.startsWith('$2') 
                ? bcrypt.compareSync(password, user.password)
                : user.password === password;

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Credenciais inválidas. Verifique seu e-mail/usuário e senha." });
            }

            if (!user.password.startsWith('$2')) {
                const newHash = bcrypt.hashSync(password, 10);
                db.prepare('UPDATE profiles SET password = ? WHERE id = ?').run(newHash, user.id);
            }

            const { password: _, is_banned: __, banned_at: ___, banned_reason: ____, ...userWithoutPassword } = user;
            const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

            res.json({ success: true, user: userWithoutPassword, token });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    /**
     * Helper function para registrar atividades no sistema
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

module.exports = new AuthController();
