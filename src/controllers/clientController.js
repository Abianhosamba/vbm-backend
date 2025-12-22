const { Client } = require('../models/Schemas');

exports.createClient = async (req, res) => {
    try {
        // Sécurité : on accepte 'nom' ou 'name'
        const nom = req.body.nom || req.body.name;
        // Sécurité : on accepte 'telephone' ou 'tel'
        const telephone = req.body.telephone || req.body.tel;

        if (!nom) {
            return res.status(400).json({ message: "Le nom est obligatoire" });
        }

        const nouveauClient = new Client({
            nom: nom,
            telephone: telephone || "",
            adresse: req.body.adresse || ""
        });

        await nouveauClient.save();
        res.status(201).json(nouveauClient);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.getAllClients = async (req, res) => {
    try { res.json(await Client.find()); } catch (e) { res.status(500).json({ error: e.message }); }
};