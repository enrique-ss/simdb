require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const app = express();
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
// AUTENTICAÇÃO
// -------------------------------------------------------------

app.post('/api/auth/register', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Modo Supabase ativo" });
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
        }

        const id = 'user_' + Date.now();
        const stmt = db.prepare(`
            INSERT INTO profiles (id, username, email, password, display_name)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(id, username, email, password, username);

        const newUser = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
        res.json({ success: true, user: newUser });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Nome de usuário ou E-mail já cadastrado." });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Modo Supabase ativo" });
    try {
        const { emailOrUsername, password } = req.body;
        const stmt = db.prepare(`
            SELECT * FROM profiles 
            WHERE (email = ? OR username = ?) AND password = ?
        `);
        const user = stmt.get(emailOrUsername, emailOrUsername, password);
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas. Verifique seu e-mail/usuário e senha." });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DINÂMICOS DO BANCO DE DADOS
// -------------------------------------------------------------

// Perfil do Usuário por ID
app.get('/api/profile', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        let user;
        if (userId) {
            user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId);
        } else {
            user = db.prepare('SELECT * FROM profiles LIMIT 1').get();
        }
        res.json(user || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualizar Perfil
app.post('/api/profile', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { id, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link } = req.body;
        if (!id) return res.status(400).json({ error: "ID do usuário não fornecido." });

        const stmt = db.prepare(`
            UPDATE profiles 
            SET display_name = COALESCE(?, display_name),
                avatar_url = COALESCE(?, avatar_url),
                profile_cover_url = COALESCE(?, profile_cover_url),
                home_banner_url = COALESCE(?, home_banner_url),
                bio = COALESCE(?, bio),
                letterboxd_link = COALESCE(?, letterboxd_link),
                serializd_link = COALESCE(?, serializd_link)
            WHERE id = ?
        `);
        stmt.run(display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, id);
        
        const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
        res.json({ success: true, user: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Continuar Consumo (Progresso)
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
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atividades de Amigos
app.get('/api/activities', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const stmt = db.prepare('SELECT * FROM reviews_ratings ORDER BY created_at DESC LIMIT 10');
        res.json(stmt.all());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mídias do Catálogo por Categoria (novos_episodios, lancamentos, para_voce, aguardados, popular)
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

// Reviews de uma Mídia Específica + Criar Review
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
        const stmt = db.prepare(`
            INSERT INTO reviews_ratings (id, user_id, friend_name, friend_avatar, media_id, media_title, media_type, feeling, rating, review_text, is_spoiler, is_favorite, date_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agora')
        `);
        stmt.run(id, user_id, friend_name || 'Usuário', friend_avatar || '', media_id, media_title, media_type, feeling, rating, review_text, is_spoiler ? 1 : 0, is_favorite ? 1 : 0);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Meta Apoie o Kindred
app.get('/api/apoie', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const stmt = db.prepare('SELECT * FROM support_goals WHERE id = "g1"');
        res.json(stmt.get('g1') || { title: 'Lançar a versão para IOS', target_amount: 550.0, current_amount: 0.0, ads_watched_count: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Kindred (npm run dev) rodando na porta ${PORT} no MODO [${APP_MODE.toUpperCase()}]`);
});
