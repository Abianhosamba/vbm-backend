const { Commande, Produit } = require('../models/Schemas');

exports.effectuerVente = async (req, res) => {
    try {
        const { produitId, quantite, total } = req.body;

        const produit = await Produit.findById(produitId);
        if (!produit) return res.status(404).json({ message: "Produit non trouvé" });

        const vente = new Commande({
            prixTotal: total,
            montantAvance: total,
            resteAPayer: 0,
            statut: 'Payée',
            lignes: [{ produitId, quantite, prixAuMomentAchat: total / quantite }]
        });

        await vente.save();
        produit.stock -= quantite;
        await produit.save();

        res.status(201).json({ message: "Vente réussie !" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};