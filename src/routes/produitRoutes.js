const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const authMiddleware = require('../middleware/authMiddleware'); // <--- Ajoute cet import

// On protège toutes les routes avec authMiddleware
// GET /api/produits
router.get('/', authMiddleware, produitController.getAllProduits);

// POST /api/produits
router.post('/', authMiddleware, produitController.createProduit);

// PUT /api/produits/:id
router.put('/:id', authMiddleware, produitController.updateProduit);

// DELETE /api/produits/:id
router.delete('/:id', authMiddleware, produitController.deleteProduit);

module.exports = router;