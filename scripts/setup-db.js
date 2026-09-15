const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'kindred.db');

console.log('🔄 Executando npm run setup: criando banco de dados SQLite ZERADO...');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = OFF');

db.exec('DROP TABLE IF EXISTS messages;');
db.exec('DROP TABLE IF EXISTS notifications;');
db.exec('DROP TABLE IF EXISTS activities;');
db.exec('DROP TABLE IF EXISTS user_media_progress;');
db.exec('DROP TABLE IF EXISTS reviews_ratings;');
db.exec('DROP TABLE IF EXISTS user_relationships;');
db.exec('DROP TABLE IF EXISTS custom_list_items;');
db.exec('DROP TABLE IF EXISTS custom_lists;');
db.exec('DROP TABLE IF EXISTS media_items;');
db.exec('DROP TABLE IF EXISTS profiles;');
db.exec('DROP TABLE IF EXISTS support_goals;');

db.pragma('foreign_keys = ON');

// Tabela de Perfis (Zerada)
db.exec(`
    CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        is_banned INTEGER NOT NULL DEFAULT 0 CHECK(is_banned IN (0, 1)),
        banned_at DATETIME,
        banned_reason TEXT DEFAULT '',
        display_name TEXT,
        avatar_url TEXT DEFAULT '',
        profile_cover_url TEXT DEFAULT '',
        home_banner_url TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        letterboxd_link TEXT DEFAULT '',
        serializd_link TEXT DEFAULT '',
        profile_theme TEXT NOT NULL DEFAULT 'violet' CHECK(profile_theme IN ('violet', 'rose', 'ocean')),
        is_private INTEGER NOT NULL DEFAULT 0 CHECK(is_private IN (0, 1)),
        stats_private INTEGER NOT NULL DEFAULT 0 CHECK(stats_private IN (0, 1)),
        media_filter TEXT NOT NULL DEFAULT 'all' CHECK(media_filter IN ('all', 'movies', 'series', 'games', 'books')),
        language_region TEXT NOT NULL DEFAULT 'pt-BR',
        notifications_enabled INTEGER NOT NULL DEFAULT 1 CHECK(notifications_enabled IN (0, 1)),
        series_count INTEGER DEFAULT 0,
        movies_count INTEGER DEFAULT 0,
        games_count INTEGER DEFAULT 0,
        works_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Mídias
db.exec(`
    CREATE TABLE media_items (
        id TEXT PRIMARY KEY,
        media_type TEXT NOT NULL CHECK(media_type IN ('movie', 'series', 'game', 'book')),
        external_id TEXT,
        title TEXT NOT NULL,
        poster TEXT,
        backdrop TEXT,
        release_year TEXT,
        overview TEXT,
        rating REAL DEFAULT 0,
        category_tag TEXT
    );
`);

// Tabela de Progresso
db.exec(`
    CREATE TABLE user_media_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        media_type TEXT NOT NULL,
        poster TEXT,
        current_season INTEGER DEFAULT 1,
        current_episode INTEGER DEFAULT 1,
        current_chapter INTEGER DEFAULT 1,
        total_episodes INTEGER DEFAULT 10,
        total_chapters INTEGER DEFAULT 100,
        status TEXT DEFAULT 'in_progress',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Avaliações
db.exec(`
    CREATE TABLE reviews_ratings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        friend_name TEXT,
        friend_avatar TEXT,
        media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
        media_title TEXT NOT NULL,
        media_type TEXT NOT NULL,
        season_number INTEGER,
        episode_number INTEGER,
        feeling TEXT CHECK(feeling IN ('liked', 'disliked', 'indifferent')),
        rating REAL DEFAULT 5.0,
        review_text TEXT,
        is_spoiler INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        date_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Relacionamentos
db.exec(`
    CREATE TABLE user_relationships (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        friend_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        affinity_percentage REAL DEFAULT 85.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Atividades (Feed Social)
db.exec(`
    CREATE TABLE activities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        media_id TEXT,
        media_poster TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Metas
db.exec(`
    CREATE TABLE support_goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        target_amount REAL DEFAULT 550.0,
        current_amount REAL DEFAULT 0.0,
        ads_watched_count INTEGER DEFAULT 0
    );
`);

db.exec(`
    INSERT INTO support_goals (id, title, target_amount, current_amount, ads_watched_count)
    VALUES ('g1', 'Lançar a versão para IOS', 550.0, 0.0, 0);
`);

// Tabela de Listas Personalizadas
db.exec(`
    CREATE TABLE custom_lists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        cover_url TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

db.exec(`
    CREATE TABLE custom_list_items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
        media_id TEXT REFERENCES media_items(id) ON DELETE CASCADE,
        media_title TEXT,
        media_poster TEXT,
        media_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Mensagens de Chat (Direct Messages & WebSockets)
db.exec(`
    CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        receiver_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Tabela de Notificações em Tempo Real
db.exec(`
    CREATE TABLE notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

db.close();

console.log('✅ npm run setup concluído com sucesso! Banco SQLite limpo e ZERADO.');
