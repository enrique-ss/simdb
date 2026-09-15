const { Router } = require('express');
const controller = require('../controllers/FriendsController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Amizades: Gerencia sistema de amizades
 */
const router = Router();

// Buscar lista de amigos e solicitações
router.get('/', authenticateToken, controller.getFriends);

// Buscar usuários para adicionar como amigos
router.get('/search', authenticateToken, controller.searchFriends);

// Enviar solicitação de amizade
router.post('/request', authenticateToken, controller.sendRequest);

// Aceitar solicitação de amizade
router.post('/accept', authenticateToken, controller.acceptRequest);

// Rejeitar solicitação de amizade
router.post('/reject', authenticateToken, controller.rejectRequest);

module.exports = router;