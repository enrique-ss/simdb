const { Router } = require('express');
const controller = require('../controllers/ListsController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Listas: Gerencia listas personalizadas
 */
const router = Router();

// Buscar listas do usuário
router.get('/', authenticateToken, controller.getLists);

// Criar nova lista
router.post('/', authenticateToken, controller.createList);

module.exports = router;