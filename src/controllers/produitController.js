const { Produit } = require('../models/Schemas');

// 1. Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
    try { 
        const produits = await Produit.find().sort({ createdAt: -1 });
        res.json(produits); 
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// 2. Créer un produit
exports.createProduit = async (req, res) => {
    console.log("📦 Données Produit reçues :", req.body);
    try {
        const p = new Produit({
            nom: req.body.nom || req.body.name,
            prix: req.body.prix || req.body.price || 0,
            stock: req.body.stock || 0
        });
        await p.save();
        res.status(201).json(p);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// 3. Mettre à jour un produit (CETTE FONCTION MANQUAIT !)
exports.updateProduit = async (req, res) => {
    try {
        const { nom, prix, stock } = req.body;
        const produit = await Produit.findByIdAndUpdate(
            req.params.id,
            { nom, prix, stock },
            { new: true } // Pour renvoyer l'objet modifié
        );
        if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
        res.json(produit);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 4. Supprimer un produit (CELLE-CI AUSSI !)
exports.deleteProduit = async (req, res) => {
    try {
        const produit = await Produit.findByIdAndDelete(req.params.id);
        if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
        res.json({ message: "Produit supprimé avec succès" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};