const { Router } = require('express');
const controller = require('../controllers/MediaController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Mídia: Gerencia catálogo de mídias e progresso
 */
const router = Router();

// Buscar progresso de mídia do usuário
router.get('/progress', authenticateToken, controller.getProgress);

// Adicionar mídia ao progresso
router.post('/progress/add', authenticateToken, controller.addProgress);

// Avançar progresso de mídia
router.post('/progress/advance', authenticateToken, controller.advanceProgress);

// Buscar lista de mídias
router.get('/', controller.getMedia);

// Buscar avaliações de uma mídia
router.get('/reviews', controller.getReviews);

// Adicionar avaliação para uma mídia
router.post('/reviews', authenticateToken, controller.addReview);

module.exports = router;