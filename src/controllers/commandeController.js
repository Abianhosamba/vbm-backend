const { Commande } = require('../models/Schemas');

// CETTE FONCTION MANQUAIT POUR TES ROUTES
exports.getAllCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find()
            .populate('client_id', 'nom')      // Récupère le nom du client
            .populate('utilisateur_id', 'nom') // Récupère le nom du vendeur
            .sort({ createdAt: -1 });

        res.status(200).json(commandes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const commandes = await Commande.find();
        
        // Calcul rapide pour le dashboard si besoin d'un condensé
        const stats = {
            totalCA: commandes.reduce((acc, c) => acc + (c.montant_total || 0), 0),
            totalPaye: commandes.reduce((acc, c) => acc + (c.montant_paye || 0), 0),
            nbCommandes: commandes.length
        };

        res.status(200).json(stats);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

exports.createCommande = async (req, res) => {
    try {
        const { client_id, montant_total, montant_paye, lignes } = req.body;
        const nouvelleCommande = new Commande({
            client_id,
            montant_total: parseFloat(montant_total) || 0,
            montant_paye: parseFloat(montant_paye) || 0,
            lignes,
            statut: (montant_paye >= montant_total) ? 'Payée' : 'Ouverte'
        });
        await nouvelleCommande.save();
        res.status(201).json(nouvelleCommande);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

// ... Garde tes autres fonctions (solderCommande, updateAvance, etc.) telles quelles

exports.solderCommande = async (req, res) => {
    try {
        const cmd = await Commande.findByIdAndUpdate(req.params.id, { statut: 'Payée' }, { new: true });
        res.json(cmd);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateAvance = async (req, res) => {
    try {
        const cmd = await Commande.findById(req.params.id);
        if (!cmd) return res.status(404).json({ message: "Commande non trouvée" });
        cmd.montantAvance += parseFloat(req.body.montant || 0);
        await cmd.save();
        res.json(cmd);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getVersements = async (req, res) => { res.json({ message: "Historique disponible" }); };

exports.getCommandeDetails = async (req, res) => {
    try {
        const cmd = await Commande.findById(req.params.id).populate('client_id').populate('lignes.produitId');
        res.json(cmd);
    } catch (e) { res.status(500).json({ error: e.message }); }
};