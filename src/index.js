/**
 * SERVIDOR PRINCIPAL - Kindred
 * Este é o ponto de entrada da aplicação. Aqui configuramos o servidor Express,
 * as comunicações em tempo real (Socket.io) e as rotas da API.
 */
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { APP_MODE, runtimeMode } = require('./database');

// Importação das rotas e controllers
const rotasAutenticacao = require('./routes/authRoutes');
const rotasPerfil = require('./routes/profileRoutes');
const rotasAmizades = require('./routes/friendsRoutes');
const rotasMidia = require('./routes/mediaRoutes');
const rotasChat = require('./routes/chatRoutes');
const rotasAtividades = require('./routes/activityRoutes');
const rotasListas = require('./routes/listsRoutes');
const rotasSuporte = require('./routes/supportRoutes');
const rotasAdmin = require('./routes/adminRoutes');

const friendsController = require('./controllers/FriendsController');
const chatController = require('./controllers/ChatController');

// Cria a aplicação principal e o servidor de internet
const app = express();
const server = http.createServer(app);

// --- CONFIGURAÇÃO DO WEBSOCKET (SOCKET.IO) ---
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Deixa o "io" disponível para ser usado em outras partes do código
app.set('io', io);

// Define em qual porta o site vai rodar (padrão 3000)
const PORT = process.env.PORT || 3000;

// Configurações básicas de segurança e processamento de dados
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- DEFINIÇÃO DOS CAMINHOS DA API ---
app.use('/api/auth', rotasAutenticacao);
app.use('/api/profile', rotasPerfil);
app.use('/api/friends', rotasAmizades);
app.use('/api/media', rotasMidia);
app.use('/api/chat', rotasChat);
app.use('/api/activities', rotasAtividades);
app.use('/api/lists', rotasListas);
app.use('/api', rotasSuporte);
app.use('/api/admin', rotasAdmin);

// --- ROTAS GERAIS ---
app.get('/api/config', (req, res) => {
    res.json({
        appMode: APP_MODE,
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    });
});

// Verifica se o servidor está funcionando corretamente
app.get('/api/health', (req, res) => {
    res.json({
        message: 'API do Kindred',
        version: '1.0.0',
        status: 'online',
        mode: runtimeMode
    });
});

// Envia a página principal (index.html) quando acessamos o endereço base
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Caso alguém tente acessar um caminho que não existe
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.path
    });
});

// Gerenciador de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado na aplicação:', err);
    res.status(err.status || 500).json({
        error: 'Erro interno no servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um problema inesperado.'
    });
});

// --- CONFIGURAÇÃO DO WEBSOCKET (SOCKET.IO) ---
// Inicializa os controllers com a instância do IO
friendsController.setIO(io);
chatController.setIO(io);

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
            const { db } = require('./database');
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

// --- INICIALIZAÇÃO DO SERVIDOR ---
server.listen(PORT, () => {
    console.log(`Servidor Kindred com Socket.io rodando na porta ${PORT} no modo [${APP_MODE.toUpperCase()}]`);
});

// Exporta o aplicativo para possíveis testes
module.exports = app;
