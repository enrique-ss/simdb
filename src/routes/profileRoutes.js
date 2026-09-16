const { Router } = require('express');
const controller = require('../controllers/ProfileController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Perfil: Gerencia dados de perfil do usuário
 */
const router = Router();

// Buscar o perfil do usuário autenticado
router.get('/', authenticateToken, controller.getProfile);

// Buscar o perfil de um usuário por ID
router.get('/:id', authenticateToken, controller.getProfileById);

// Atualizar o perfil do usuário autenticado
router.post('/', authenticateToken, controller.updateProfile);

module.exports = router;