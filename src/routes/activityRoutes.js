const { Router } = require('express');
const controller = require('../controllers/ActivityController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Atividades: Gerencia feed de atividades
 */
const router = Router();

// O feed é pessoal: só pode trazer atividades de amizades aceitas do usuário autenticado.
router.get('/', authenticateToken, controller.getActivities);

module.exports = router;
