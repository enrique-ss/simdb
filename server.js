require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./src/middlewares/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;
const APP_MODE = process.env.APP_MODE || 'local';
const DB_PATH = path.join(__dirname, 'kindred.db');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/config', (req, res) => {
    res.json({
        appMode: APP_MODE,
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    });
});

if (APP_MODE === 'local' && !fs.existsSync(DB_PATH)) {
    console.log('⚡ Banco de dados SQLite não encontrado. Executando setup...');
    require('./scripts/setup-db.js');
}

let db = null;
if (APP_MODE === 'local') {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA foreign_keys = ON;');
}

// -------------------------------------------------------------
// HELPER FUNCTIONS (ATIVIDADES & NOTIFICAÇÕES)
// -------------------------------------------------------------

function logActivity(userId, activityType, title, description = '', mediaId = null, mediaPoster = '') {
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
}

function createNotification(userId, type, title, content = '') {
    if (!db || !userId) return;
    try {
        const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        db.prepare(`
            INSERT INTO notifications (id, user_id, type, title, content)
            VALUES (?, ?, ?, ?, ?)
        `).run(id, userId, type, title, content);

        // Notifica em tempo real via Socket.io
        io.to(`user_${userId}`).emit('new_notification', { id, type, title, content, created_at: new Date().toISOString() });
    } catch (err) {
        console.error('Erro ao criar notificação:', err.message);
    }
}

// -------------------------------------------------------------
// WEBSOCKET (SOCKET.IO - BIBLIOVERSO CONCEPT)
// -------------------------------------------------------------

io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
        }
    });

    socket.on('send_chat_message', (data) => {
        const { sender_id, receiver_id, content } = data;
        if (!sender_id || !receiver_id || !content) return;

        try {
            const id = 'msg_' + Date.now();
            db.prepare(`
                INSERT INTO messages (id, sender_id, receiver_id, content)
                VALUES (?, ?, ?, ?)
            `).run(id, sender_id, receiver_id, content);

            const msgObj = { id, sender_id, receiver_id, content, created_at: new Date().toISOString() };
            io.to(`user_${receiver_id}`).emit('new_chat_message', msgObj);
            io.to(`user_${sender_id}`).emit('new_chat_message', msgObj);
        } catch (err) {
            console.error('Erro ao processar mensagem via socket:', err.message);
        }
    });
});

// -------------------------------------------------------------
// AUTENTICAÇÃO (DIFERENÇA NOME DE USUÁRIO E DISPLAY NAME)
// -------------------------------------------------------------

app.post('/api/auth/register', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Modo Supabase ativo" });
    try {
        const { display_name, username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
        }

        const formattedUsername = username.trim().toLowerCase().replace(/^@/, '');
        const finalDisplayName = display_name ? display_name.trim() : formattedUsername;

        const id = 'user_' + Date.now();
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const stmt = db.prepare(`
            INSERT INTO profiles (id, username, email, password, display_name)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(id, formattedUsername, email.trim().toLowerCase(), hashedPassword, finalDisplayName);

        const newUser = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(id);
        
        const token = jwt.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        logActivity(id, 'welcome', 'Juntou-se ao Kindred!', 'Nova conta criada');

        res.json({ success: true, user: newUser, token });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Nome de usuário (@handle) ou E-mail já cadastrado." });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Modo Supabase ativo" });
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

        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, user: userWithoutPassword, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// CHAT & NOTIFICAÇÕES (WEBSOCKET INTEGRATED)
// -------------------------------------------------------------

app.get('/api/chat/messages', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { user_id, friend_id } = req.query;
        if (!user_id || !friend_id) return res.json([]);

        const messages = db.prepare(`
            SELECT * FROM messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `).all(user_id, friend_id, friend_id, user_id);

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat/messages', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { sender_id, receiver_id, content } = req.body;
        if (!sender_id || !receiver_id || !content) return res.status(400).json({ error: "Dados incompletos." });

        const id = 'msg_' + Date.now();
        db.prepare(`
            INSERT INTO messages (id, sender_id, receiver_id, content)
            VALUES (?, ?, ?, ?)
        `).run(id, sender_id, receiver_id, content);

        const senderObj = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(sender_id);
        createNotification(receiver_id, 'chat', `Nova mensagem de ${senderObj ? senderObj.display_name : 'Amigo'}`, content);

        const msgObj = { id, sender_id, receiver_id, content, created_at: new Date().toISOString() };
        io.to(`user_${receiver_id}`).emit('new_chat_message', msgObj);

        res.json({ success: true, message: msgObj });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notifications', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        if (!userId) return res.json([]);

        const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(userId);
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// PERFIL DO USUÁRIO
// -------------------------------------------------------------

app.get('/api/profile', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        let user;
        if (userId) {
            user = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(userId);
        } else {
            user = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count, created_at FROM profiles LIMIT 1').get();
        }
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
});

app.post('/api/profile', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { id, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link } = req.body;
        if (!id) return res.status(400).json({ error: "ID do usuário não fornecido." });

        db.prepare(`
            UPDATE profiles 
            SET display_name = COALESCE(?, display_name),
                avatar_url = COALESCE(?, avatar_url),
                profile_cover_url = COALESCE(?, profile_cover_url),
                home_banner_url = COALESCE(?, home_banner_url),
                bio = COALESCE(?, bio),
                letterboxd_link = COALESCE(?, letterboxd_link),
                serializd_link = COALESCE(?, serializd_link)
            WHERE id = ?
        `).run(display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, id);
        
        const updated = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count, created_at FROM profiles WHERE id = ?').get(id);
        res.json({ success: true, user: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// AMIZADES (WEBSOCKET INTEGRATED)
// -------------------------------------------------------------

app.get('/api/friends', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        if (!userId) return res.json({ friends: [], pendingIncoming: [], pendingOutgoing: [] });

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
});

app.get('/api/friends/search', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const q = req.query.q || '';
        const currentUserId = req.query.user_id;

        if (!q.trim()) return res.json([]);

        const users = db.prepare(`
            SELECT id, username, display_name, avatar_url, bio
            FROM profiles
            WHERE (username LIKE ? OR display_name LIKE ?) AND id != ?
            LIMIT 10
        `).all(`%${q}%`, `%${q}%`, currentUserId || '');

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/friends/request', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { user_id, friend_id } = req.body;
        if (!user_id || !friend_id || user_id === friend_id) {
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
        createNotification(friend_id, 'friend_request', `Solicitação de Amizade`, `${senderObj ? senderObj.display_name : 'Alguém'} quer ser seu amigo no Kindred.`);

        res.json({ success: true, relationship_id: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/friends/accept', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { relationship_id } = req.body;
        if (!relationship_id) return res.status(400).json({ error: "ID de solicitação não fornecido." });

        const rel = db.prepare('SELECT * FROM user_relationships WHERE id = ?').get(relationship_id);
        if (!rel) return res.status(404).json({ error: "Solicitação não encontrada." });

        db.prepare(`UPDATE user_relationships SET status = 'accepted' WHERE id = ?`).run(relationship_id);

        const user1 = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(rel.user_id);
        const user2 = db.prepare('SELECT display_name, username FROM profiles WHERE id = ?').get(rel.friend_id);

        createNotification(rel.user_id, 'friend_accept', `Solicitação Aceita!`, `${user2 ? user2.display_name : 'Um amigo'} aceitou seu pedido de amizade.`);
        createNotification(rel.friend_id, 'friend_accept', `Solicitação Aceita!`, `Você e ${user1 ? user1.display_name : 'um amigo'} agora são amigos no Kindred.`);

        logActivity(rel.user_id, 'friendship', `Nova amizade com ${user2 ? user2.display_name : 'Usuário'}!`, 'Conexão estabelecida');
        logActivity(rel.friend_id, 'friendship', `Nova amizade com ${user1 ? user1.display_name : 'Usuário'}!`, 'Conexão estabelecida');

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/friends/reject', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { relationship_id } = req.body;
        if (!relationship_id) return res.status(400).json({ error: "ID de solicitação não fornecido." });

        db.prepare('DELETE FROM user_relationships WHERE id = ?').run(relationship_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// PROGRESSO & MÍDIAS
// -------------------------------------------------------------

app.get('/api/progress', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        if (!userId) return res.json([]);
        const stmt = db.prepare('SELECT * FROM user_media_progress WHERE user_id = ? ORDER BY last_updated DESC');
        res.json(stmt.all(userId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/progress/add', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { user_id, media_id, title, media_type, poster, total_episodes, total_chapters } = req.body;
        if (!user_id || !media_id || !title) {
            return res.status(400).json({ error: "Dados de mídia ou usuário incompletos." });
        }

        const mediaCheck = db.prepare('SELECT id FROM media_items WHERE id = ?').get(media_id);
        if (!mediaCheck) {
            db.prepare(`
                INSERT INTO media_items (id, media_type, title, poster)
                VALUES (?, ?, ?, ?)
            `).run(media_id, media_type || 'series', title, poster || '');
        }

        const existing = db.prepare('SELECT id FROM user_media_progress WHERE user_id = ? AND media_id = ?').get(user_id, media_id);
        if (existing) {
            db.prepare(`
                UPDATE user_media_progress 
                SET last_updated = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(existing.id);
            return res.json({ success: true, id: existing.id });
        }

        const id = 'prog_' + Date.now();
        db.prepare(`
            INSERT INTO user_media_progress (id, user_id, media_id, title, media_type, poster, current_season, current_episode, current_chapter, total_episodes, total_chapters)
            VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?)
        `).run(id, user_id, media_id, title, media_type || 'series', poster || '', total_episodes || 10, total_chapters || 100);

        logActivity(user_id, 'media_start', `Começou a assistir/ler ${title}`, media_type, media_id, poster);

        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/progress/advance', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { id } = req.body;
        const item = db.prepare('SELECT * FROM user_media_progress WHERE id = ?').get(id);
        if (item) {
            if (item.media_type === 'series') {
                db.prepare('UPDATE user_media_progress SET current_episode = current_episode + 1, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(id);
            } else if (item.media_type === 'book') {
                db.prepare('UPDATE user_media_progress SET current_chapter = current_chapter + 1, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(id);
            }

            logActivity(item.user_id, 'media_progress', `Avançou no progresso de ${item.title}`, `Episódio/Capítulo avançado`, item.media_id, item.poster);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// FEED DE ATIVIDADES & REVIEWS
// -------------------------------------------------------------

app.get('/api/activities', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        let activities = db.prepare(`
            SELECT 
                a.id, a.user_id, p.display_name as friend_name, p.avatar_url as friend_avatar,
                a.title as media_title, a.activity_type as media_type, a.description as review_text,
                a.media_id, a.media_poster, a.created_at
            FROM activities a
            JOIN profiles p ON a.user_id = p.id
            ORDER BY a.created_at DESC
            LIMIT 20
        `).all();

        if (activities.length === 0) {
            activities = db.prepare('SELECT * FROM reviews_ratings ORDER BY created_at DESC LIMIT 10').all();
        }

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/media', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
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
});

app.get('/api/reviews', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const mediaId = req.query.media_id;
        if (!mediaId) return res.json([]);
        const stmt = db.prepare('SELECT * FROM reviews_ratings WHERE media_id = ? ORDER BY created_at DESC');
        res.json(stmt.all(mediaId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { user_id, friend_name, friend_avatar, media_id, media_title, media_type, feeling, rating, review_text, is_spoiler, is_favorite } = req.body;
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
        stmt.run(id, user_id, friend_name || 'Usuário', friend_avatar || '', media_id, media_title, media_type || 'series', feeling || 'liked', rating || 5.0, review_text || '', is_spoiler ? 1 : 0, is_favorite ? 1 : 0);

        logActivity(user_id, 'review', `Avaliou ${media_title} com nota ${rating || 5}`, review_text || '', media_id);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// LISTAS & METAS
// -------------------------------------------------------------

app.get('/api/lists', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        if (!userId) return res.json([]);
        const lists = db.prepare('SELECT * FROM custom_lists WHERE user_id = ? ORDER BY created_at DESC').all(userId);
        res.json(lists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/lists', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { user_id, title, description, cover_url } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: "Título e ID do usuário são obrigatórios." });
        const id = 'list_' + Date.now();
        db.prepare('INSERT INTO custom_lists (id, user_id, title, description, cover_url) VALUES (?, ?, ?, ?, ?)').run(id, user_id, title, description || '', cover_url || '');
        
        logActivity(user_id, 'list_create', `Criou a lista "${title}"`, description || '');

        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/apoie', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const stmt = db.prepare('SELECT * FROM support_goals WHERE id = "g1"');
        res.json(stmt.get('g1') || { title: 'Lançar a versão para IOS', target_amount: 550.0, current_amount: 0.0, ads_watched_count: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor Kindred com Socket.io rodando na porta ${PORT} no MODO [${APP_MODE.toUpperCase()}]`);
});
