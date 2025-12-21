// src/controllers/produitController.js
const Produit = require('../models/Produit');

// 1. Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
    try {
        const produits = await Produit.find().sort({ nom: 1 });
        // On renvoie un tableau d'objets formatés pour le frontend
        res.json(produits.map(p => ({
            id: p._id,
            nom: p.nom,
            prix: p.prix,
            stock: p.stock
        })));
    } catch (error) {
        console.error("Erreur récupération produits MongoDB:", error);
        res.status(500).json({ message: "Erreur récupération." });
    }
};

// 2. Créer un produit
exports.createProduit = async (req, res) => {
    const { nom, prix, stock } = req.body;
    try {
        const nouveauProduit = new Produit({
            nom,
            prix: parseFloat(prix),
            stock: parseInt(stock) || 0
        });
        const sauvegarde = await nouveauProduit.save();
        res.status(201).json({ id: sauvegarde._id, nom, prix, stock });
    } catch (error) {
        console.error("Erreur création produit MongoDB:", error);
        res.status(500).json({ message: "Erreur lors de l'ajout." });
    }
};

// 3. Mettre à jour
exports.updateProduit = async (req, res) => {
    const { id } = req.params;
    const { nom, prix, stock } = req.body;
    try {
        await Produit.findByIdAndUpdate(id, { nom, prix, stock });
        res.json({ message: "Produit mis à jour" });
    } catch (error) {
        console.error("Erreur MAJ produit:", error);
        res.status(500).json({ message: "Erreur mise à jour" });
    }
};

// 4. Supprimer
exports.deleteProduit = async (req, res) => {
    const { id } = req.params;
    try {
        await Produit.findByIdAndDelete(id);
        res.json({ message: "Supprimé" });
    } catch (error) {
        console.error("Erreur suppression produit:", error);
        res.status(500).json({ message: "Erreur suppression" });
    }
};