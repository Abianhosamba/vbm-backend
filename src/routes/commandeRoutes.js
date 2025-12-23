const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');
const authMiddleware = require('../middleware/authMiddleware'); // Import direct

// Routes corrigées
router.post('/', authMiddleware, commandeController.createCommande);
router.get('/stats', authMiddleware, commandeController.getStats);
router.get('/', authMiddleware, commandeController.getAllCommandes);

// Encaisser la totalité du reste
router.put('/:id/solder', authMiddleware, commandeController.solderCommande);

// Ajouter un versement partiel
router.put('/:id/avance', authMiddleware, commandeController.updateAvance);

// Route pour l'historique des versements d'une commande
router.get('/:id/versements', authMiddleware, commandeController.getVersements);

router.get('/:id/details', authMiddleware, commandeController.getCommandeDetails);

module.exports = router;