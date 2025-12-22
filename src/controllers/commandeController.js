const { Commande } = require('../models/Schemas');

exports.createCommande = async (req, res) => {
    try {
        const nouvelleCommande = new Commande(req.body);
        await nouvelleCommande.save();
        res.status(201).json(nouvelleCommande);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getStats = async (req, res) => {
    try {
        const commandes = await Commande.find();
        res.json(commandes);
    } catch (e) { res.status(500).json({ error: e.message }); }
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
        cmd.montantAvance += req.body.montant;
        await cmd.save();
        res.json(cmd);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getVersements = async (req, res) => { res.json({ message: "Historique" }); };
exports.getCommandeDetails = async (req, res) => {
    try {
        const cmd = await Commande.findById(req.params.id).populate('client_id');
        res.json(cmd);
    } catch (e) { res.status(500).json({ error: e.message }); }
};