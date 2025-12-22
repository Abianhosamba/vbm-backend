const { Produit } = require('../models/Schemas');

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
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getAllProduits = async (req, res) => {
    try { res.json(await Produit.find()); } catch (e) { res.status(500).json({ error: e.message }); }
};