const { Router } = require('express');
const controller = require('../controllers/AuthController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * Rotas de Autenticação: Gerencia o acesso ao sistema (Entrada, Cadastro e Perfil)
 */
const router = Router();

// Buscar os dados do usuário autenticado atual
router.get('/me', authenticateToken, controller.getMe);

// Criar uma nova conta no sistema
router.post('/register', controller.register);

// Entrar no sistema com e-mail/usuário e senha
router.post('/login', controller.login);

module.exports = router;