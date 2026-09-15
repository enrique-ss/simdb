const { Router } = require('express');
const controller = require('../controllers/ChatController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Chat: Gerencia mensagens e notificações
 */
const router = Router();

// Buscar mensagens de chat
router.get('/messages', authenticateToken, controller.getMessages);

// Enviar mensagem de chat
router.post('/messages', authenticateToken, controller.sendMessage);

// Buscar notificações
router.get('/notifications', authenticateToken, controller.getNotifications);

module.exports = router;