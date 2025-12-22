const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Utilisation directe du middleware
router.post('/', authMiddleware, clientController.createClient);
router.get('/', authMiddleware, clientController.getAllClients);

module.exports = router;