// verielle-business-manager/src/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/authMiddleware'); 

// On vérifie si c'est "auth" ou "auth.authenticateToken" qui doit être utilisé
const protect = typeof auth === 'function' ? auth : auth.authenticateToken;

if (!protect) {
    console.error("❌ ERREUR: Le middleware d'authentification est introuvable ou mal exporté.");
}

// Route POST /api/clients : Créer un nouveau client
router.post('/', protect, clientController.createClient);

// Route GET /api/clients : Récupérer tous les clients
router.get('/', protect, clientController.getAllClients);

module.exports = router;