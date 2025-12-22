const { Produit } = require('../models/Schemas');

exports.getAllProduits = async (req, res) => {
    try { res.json(await Produit.find()); } catch (e) { res.status(500).send(e.message); }
};

exports.createProduit = async (req, res) => {
    try {
        const p = new Produit(req.body);
        await p.save();
        res.status(201).json(p);
    } catch (e) { res.status(500).send(e.message); }
};

exports.updateProduit = async (req, res) => {
    try {
        const p = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(p);
    } catch (e) { res.status(500).send(e.message); }
};

exports.deleteProduit = async (req, res) => {
    try {
        await Produit.findByIdAndDelete(req.params.id);
        res.json({ message: "Supprimé" });
    } catch (e) { res.status(500).send(e.message); }
};