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
// ENDPOINTS DE AUTENTICAÇÃO (CADASTRO E LOGIN)
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

        const newUser = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, series_count, movies_count, games_count, works_count FROM profiles WHERE id = ?').get(id);
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
            SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, series_count, movies_count, games_count, works_count 
            FROM profiles 
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
// ENDPOINTS DE PERFIL & DADOS DO USUÁRIO
// -------------------------------------------------------------

app.get('/api/profile', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        let stmt;
        let user;
        if (userId) {
            stmt = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count FROM profiles WHERE id = ?');
            user = stmt.get(userId);
        } else {
            // Pega o primeiro usuário cadastrado
            stmt = db.prepare('SELECT id, username, email, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count FROM profiles LIMIT 1');
            user = stmt.get();
        }
        if (!user) return res.status(404).json({ error: "Nenhum usuário cadastrado." });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/profile', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { id, display_name, avatar_url, profile_cover_url, home_banner_url, bio } = req.body;
        const targetId = id || 'u1';
        const stmt = db.prepare(`
            UPDATE profiles 
            SET display_name = COALESCE(?, display_name),
                avatar_url = COALESCE(?, avatar_url),
                profile_cover_url = COALESCE(?, profile_cover_url),
                home_banner_url = COALESCE(?, home_banner_url),
                bio = COALESCE(?, bio)
            WHERE id = ?
        `);
        stmt.run(display_name, avatar_url, profile_cover_url, home_banner_url, bio, targetId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/progress', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const userId = req.query.user_id;
        const stmt = db.prepare('SELECT * FROM user_media_progress WHERE user_id = ? ORDER BY last_updated DESC');
        const list = stmt.all(userId || 'u1');
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/progress/advance', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const { id } = req.body;
        const stmtGet = db.prepare('SELECT * FROM user_media_progress WHERE id = ?');
        const item = stmtGet.get(id);
        if (item) {
            if (item.media_type === 'series') {
                const stmtUp = db.prepare('UPDATE user_media_progress SET current_episode = current_episode + 1, last_updated = CURRENT_TIMESTAMP WHERE id = ?');
                stmtUp.run(id);
            } else if (item.media_type === 'book') {
                const stmtUp = db.prepare('UPDATE user_media_progress SET current_chapter = current_chapter + 1, last_updated = CURRENT_TIMESTAMP WHERE id = ?');
                stmtUp.run(id);
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/activities', (req, res) => {
    if (APP_MODE !== 'local') return res.status(400).json({ error: "Servidor em modo Supabase." });
    try {
        const stmt = db.prepare('SELECT * FROM reviews_ratings ORDER BY created_at DESC LIMIT 10');
        res.json(stmt.all());
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

app.listen(PORT, () => {
    console.log(`🚀 Servidor Kindred (npm run dev) rodando na porta ${PORT} no MODO [${APP_MODE.toUpperCase()}]`);
});
