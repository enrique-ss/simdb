const jwt = require('jsonwebtoken');
const { db, isOfflineMode } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'kindred-secret-key-change-in-prod';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (isOfflineMode && db) {
            const account = db.prepare('SELECT id, role, is_banned FROM profiles WHERE id = ?').get(decoded.id);
            if (!account) return res.status(401).json({ error: 'Conta não encontrada.' });
            if (account.is_banned) return res.status(403).json({ error: 'Esta conta foi banida.' });
            decoded.role = account.role;
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    next();
}

module.exports = {
    authenticateToken: authMiddleware,
    requireAdmin,
    JWT_SECRET
};
