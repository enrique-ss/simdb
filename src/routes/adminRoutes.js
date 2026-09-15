const { Router } = require('express');
const controller = require('../controllers/AdminController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = Router();
router.use(authenticateToken, requireAdmin);
router.get('/users', controller.listUsers);
router.post('/users/ban', controller.setBan);
router.post('/media', controller.createMedia);

module.exports = router;
