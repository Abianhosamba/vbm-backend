const { Commande, Produit, Client, User } = require('../models/Schemas');

exports.createCommande = async (req, res) => {
    const { client_id, montantAvance, lignes } = req.body;
    const userId = req.user.id;

    try {
        let totalPrixCommande = 0;
        const lignesFinales = [];

        for (const ligne of lignes) {
            const produit = await Produit.findById(ligne.produitId);
            if (!produit) throw new Error(`Produit ${ligne.produitId} introuvable.`);
            
            totalPrixCommande += produit.prix * ligne.quantite;
            lignesFinales.push({
                produitId: ligne.produitId,
                quantite: ligne.quantite,
                prixAuMomentAchat: produit.prix
            });

            // Mise à jour du stock
            produit.stock -= ligne.quantite;
            await produit.save();
        }

        const resteAPayer = totalPrixCommande - montantAvance;
        const commande = new Commande({
            client_id,
            userId,
            prixTotal: totalPrixCommande,
            montantAvance,
            resteAPayer: resteAPayer > 0 ? resteAPayer : 0,
            statut: resteAPayer > 0 ? 'Ouverte' : 'Payée',
            lignes: lignesFinales,
            versements: montantAvance > 0 ? [{ montant: montantAvance }] : []
        });

        await commande.save();
        res.status(201).json({ message: "Succès", commandeId: commande._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const commandes = await Commande.find().populate('client_id').populate('userId');
        
        const apercu = {
            totalCommandes: commandes.length,
            CA_theorique: commandes.reduce((acc, c) => acc + c.prixTotal, 0),
            CA_reel: commandes.reduce((acc, c) => acc + c.montantAvance, 0),
            totalDettes: commandes.reduce((acc, c) => acc + c.resteAPayer, 0)
        };

        const historique = commandes.map(c => ({
            ...c._doc,
            clientNom: c.client_id?.nom,
            clientTelephone: c.client_id?.telephone,
            vendeurNom: c.userId?.nom
        }));

        res.status(200).json({ apercu, historique });
    } catch (error) {
        res.status(500).json({ message: "Erreur Bilan" });
    }
};

exports.updateAvance = async (req, res) => {
    const { id } = req.params;
    const { montant } = req.body;
    try {
        const cmd = await Commande.findById(id);
        const montantVersement = parseFloat(montant);
        
        cmd.montantAvance += montantVersement;
        cmd.resteAPayer = cmd.prixTotal - cmd.montantAvance;
        if (cmd.resteAPayer < 0) cmd.resteAPayer = 0;
        cmd.statut = cmd.resteAPayer <= 0 ? 'Payée' : 'Ouverte';
        
        cmd.versements.push({ montant: montantVersement });
        await cmd.save();
        
        res.status(200).json({ message: "Versement enregistré" });
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
};

// ... Autres fonctions (getAllCommandes, etc.) utilisent désormais Commande.find()