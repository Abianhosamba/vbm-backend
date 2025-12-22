const { Commande } = require('../models/Schemas');

exports.getStats = async (req, res) => {
    try {
        const { periode } = req.query;
        console.log("📊 Dashboard demande stats pour :", periode);
        
        const commandes = await Commande.find().populate('client_id');
        
        // Sécurité : si aucune commande, on renvoie une structure vide propre
        if (!commandes) return res.status(200).json([]);
        
        res.status(200).json(commandes);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

exports.createCommande = async (req, res) => {
    try {
        const { client_id, montantAvance, lignes } = req.body;
        const nouvelleCommande = new Commande({
            client_id,
            montantAvance: parseFloat(montantAvance) || 0,
            lignes,
            statut: 'Ouverte'
        });
        await nouvelleCommande.save();
        res.status(201).json(nouvelleCommande);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
};

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