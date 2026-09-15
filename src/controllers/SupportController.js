const { db, isOfflineMode } = require('../database');

/**
 * SupportController: Gerencia metas de apoio ao projeto
 * Responsável por retornar informações de financiamento
 */
class SupportController {
    
    /**
     * Retorna metas de apoio ao projeto
     */
    getSupportGoals = (req, res) => {
        if (!isOfflineMode) return res.status(400).json({ error: "Servidor em modo Supabase." });
        try {
            const stmt = db.prepare('SELECT * FROM support_goals WHERE id = "g1"');
            res.json(stmt.get('g1') || { title: 'Lançar a versão para IOS', target_amount: 550.0, current_amount: 0.0, ads_watched_count: 0 });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

module.exports = new SupportController();