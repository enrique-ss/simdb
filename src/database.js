require('dotenv').config();
const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const APP_MODE = process.env.APP_MODE || 'local';
const DB_PATH = path.join(__dirname, '..', 'kindred.db');

// SQLite Database (Local Mode)
let db = null;
if (APP_MODE === 'local') {
    if (!fs.existsSync(DB_PATH)) {
        console.log('⚡ Banco de dados SQLite não encontrado. Executando setup...');
        require('../scripts/setup-db.js');
    }
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');

    // Mantém bancos locais existentes compatíveis com o esquema atual sem
    // apagar os dados do usuário. O esquema completo continua em setup-db.js.
    const profileColumns = new Set(db.prepare('PRAGMA table_info(profiles)').all().map(column => column.name));
    const profileMigrations = [
        ['role', "TEXT NOT NULL DEFAULT 'user'"],
        ['is_banned', 'INTEGER NOT NULL DEFAULT 0'],
        ['banned_at', 'DATETIME'],
        ['banned_reason', "TEXT DEFAULT ''"],
        ['profile_theme', "TEXT NOT NULL DEFAULT 'violet'"],
        ['is_private', 'INTEGER NOT NULL DEFAULT 0'],
        ['stats_private', 'INTEGER NOT NULL DEFAULT 0'],
        ['media_filter', "TEXT NOT NULL DEFAULT 'all'"],
        ['language_region', "TEXT NOT NULL DEFAULT 'pt-BR'"],
        ['notifications_enabled', 'INTEGER NOT NULL DEFAULT 1']
    ];
    for (const [name, definition] of profileMigrations) {
        if (!profileColumns.has(name)) db.exec(`ALTER TABLE profiles ADD COLUMN ${name} ${definition}`);
    }
}

// Supabase Client (Online Mode)
let supabaseAdmin = null;
let supabaseAuth = null;
let isOfflineMode = true;

if (APP_MODE === 'supabase') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (supabaseUrl && supabaseKey) {
        supabaseAdmin = createClient(supabaseUrl, supabaseKey);
        supabaseAuth = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);
        isOfflineMode = false;
    }
}

module.exports = {
    db,
    supabaseAdmin,
    supabaseAuth,
    isOfflineMode,
    APP_MODE,
    runtimeMode: APP_MODE === 'local' ? 'offline' : 'online'
};
