const { Router } = require('express');
const controller = require('../controllers/SupportController');

/**
 * Rotas de Apoio: Gerencia metas de financiamento
 */
const router = Router();

// Buscar metas de apoio
router.get('/apoie', controller.getSupportGoals);

module.exports = router;