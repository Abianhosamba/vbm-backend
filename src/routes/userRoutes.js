const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Inscription
// On vérifie que la fonction registerUser existe bien dans le contrôleur
router.post('/register', userController.registerUser);

// Connexion
// On vérifie que la fonction loginUser existe bien dans le contrôleur
router.post('/login', userController.loginUser);

// Profil (si tu as gardé la fonction getMe)
if (userController.getMe) {
    router.get('/me', userController.getMe);
}

module.exports = router;