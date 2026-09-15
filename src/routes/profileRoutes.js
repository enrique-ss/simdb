const { Router } = require('express');
const controller = require('../controllers/ProfileController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Perfil: Gerencia dados de perfil do usuário
 */
const router = Router();

// Buscar o perfil do usuário autenticado
router.get('/', authenticateToken, controller.getProfile);

// Atualizar o perfil do usuário autenticado
router.post('/', authenticateToken, controller.updateProfile);

module.exports = router;