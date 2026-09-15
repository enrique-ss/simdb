const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'kindred.db');

// Se o banco não existir, executa o setup primeiro
if (!fs.existsSync(DB_PATH)) {
    console.log('⚡ Banco de dados não encontrado. Inicializando tabelas...');
    require('./setup-db.js');
}

console.log('🌱 Executando npm run asset: alimentando o banco de dados com volume de usuários, mídias e interações...');

const db = new Database(DB_PATH);

// Habilitar Foreign Keys
db.pragma('foreign_keys = ON');

// 1. Inserir Perfis de Usuário de Exemplo
const stmtUser = db.prepare(`
    INSERT OR REPLACE INTO profiles (id, username, email, password, display_name, avatar_url, profile_cover_url, home_banner_url, bio, letterboxd_link, serializd_link, series_count, movies_count, games_count, works_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

stmtUser.run(
    'u1',
    'inhunicent',
    'inhunicent@example.test',
    'kindred-demo-password',
    'nicoly',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    'it was as if he understood the flame that burned inside her as nobody else ever could. as if together they could do anything they liked, conquer the world or destroy it.',
    'letterboxd.com/itsmylucy',
    'serializd.com/inhunicent',
    300, 1333, 86, 8
);

stmtUser.run('u2', 'luana_c', 'luana_c@example.test', 'kindred-demo-password', 'Luana', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '', '', 'Fã de séries e drama.', '', '', 120, 450, 10, 5);
stmtUser.run('u3', 'thay_v', 'thay_v@example.test', 'kindred-demo-password', 'Thay', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', '', '', 'Cineasta e leitora assídua.', '', '', 210, 890, 40, 12);
stmtUser.run('u4', 'mafe_g', 'mafe_g@example.test', 'kindred-demo-password', 'Mafe', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '', '', 'Gamer e fã de RPGs.', '', '', 80, 300, 150, 2);
stmtUser.run('u5', 'alice_b', 'alice_b@example.test', 'kindred-demo-password', 'Alice', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '', '', 'Leitora de fantasia.', '', '', 45, 120, 5, 25);

// 2. Inserir Mídias no Catálogo
const stmtMedia = db.prepare(`
    INSERT OR REPLACE INTO media_items (id, media_type, external_id, title, poster, release_year, overview, rating, category_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

stmtMedia.run('m1', 'series', '1399', 'Death Note', 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg', '2006', 'Um estudante encontra um caderno com poderes mortais.', 4.8, 'continuar');
stmtMedia.run('m2', 'book', 'ol1', 'Case File Compendium', 'https://covers.openlibrary.org/b/id/8311916-M.jpg', '2022', 'Romance misterioso e envolvente.', 4.7, 'continuar');
stmtMedia.run('m3', 'series', '1114', 'Arcane', 'https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg', '2021', 'Em meio ao conflito entre cidades-gêmeas, duas irmãs lutam em lados opostos.', 4.9, 'continuar');
stmtMedia.run('m4', 'series', '1200', 'Buffy the Vampire Slayer', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', '1997', 'Uma jovem é escolhida para enfrentar forças das trevas.', 4.5, 'continuar');

stmtMedia.run('m5', 'series', '101', 'Mindhunter', 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg', '2017', 'Agentes do FBI investigam a mente de assassinos.', 4.8, 'novos_episodios');
stmtMedia.run('m6', 'series', '102', 'Gilmore Girls', 'https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg', '2000', 'Relação entre mãe e filha na pequena Stars Hollow.', 4.6, 'novos_episodios');

stmtMedia.run('m7', 'movie', '201', 'Good Omens', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', '2019', 'Um anjo e um demônio tentam evitar o apocalipse.', 4.7, 'atividade');
stmtMedia.run('m8', 'series', '202', 'The Vampire Diaries', 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg', '2009', 'Dois irmãos vampiros disputam a alma de Elena.', 4.4, 'atividade');
stmtMedia.run('m9', 'game', '203', 'The Witcher 3', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', '2015', 'Geralt de Rívia caça a Criança da Profecia.', 4.9, 'atividade');
stmtMedia.run('m10', 'book', '204', 'Bottoms', 'https://covers.openlibrary.org/b/id/8406786-M.jpg', '2023', 'Uma história instigante.', 4.2, 'atividade');

// 3. Inserir Progresso Contínuo
const stmtProg = db.prepare(`
    INSERT OR REPLACE INTO user_media_progress (id, user_id, media_id, title, media_type, poster, current_season, current_episode, current_chapter, total_episodes, total_chapters, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

stmtProg.run('p1', 'u1', 'm1', 'Death Note', 'series', 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg', 1, 1, 1, 37, 0, 'in_progress');
stmtProg.run('p2', 'u1', 'm2', 'Case File Compendium', 'book', 'https://covers.openlibrary.org/b/id/8311916-M.jpg', 1, 1, 1, 0, 436, 'in_progress');
stmtProg.run('p3', 'u1', 'm3', 'Arcane', 'series', 'https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg', 1, 1, 1, 9, 0, 'in_progress');
stmtProg.run('p4', 'u1', 'm4', 'Buffy the Vampire Slayer', 'series', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 1, 1, 1, 144, 0, 'in_progress');

// 4. Inserir Atividades de Amigos
const stmtAct = db.prepare(`
    INSERT OR REPLACE INTO reviews_ratings (id, user_id, friend_name, friend_avatar, media_id, media_title, media_type, feeling, rating, review_text, date_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

stmtAct.run('a1', 'u2', 'Luana', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'm7', 'Good Omens', 'series', 'liked', 5.0, 'Simplesmente perfeito!', '2h');
stmtAct.run('a2', 'u3', 'Thay', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'm8', 'The Vampire Diaries', 'movie', 'liked', 5.0, 'Reassistindo pela décima vez.', '4h');
stmtAct.run('a3', 'u4', 'Mafe', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'm9', 'The Witcher 3', 'game', 'liked', 5.0, 'Melhor jogo da década.', '8h');
stmtAct.run('a4', 'u5', 'Alice', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'm10', 'Bottoms', 'book', 'liked', 4.5, 'Uma leitura super divertida!', '1d');

// 5. Meta de Doações
const stmtGoal = db.prepare(`
    INSERT OR REPLACE INTO support_goals (id, title, target_amount, current_amount, ads_watched_count)
    VALUES ('g1', 'Lançar a versão para IOS', 550.0, 0.0, 0);
`);
stmtGoal.run();

db.close();

console.log('✅ npm run asset concluído! O banco de dados kindred.db foi preenchido com sucesso.');
