// verielle-business-manager/src/controllers/clientController.js

const { runAsync, allAsync } = require('../config/db'); // Utilisation du fichier db standard

/**
 * Créer un nouveau client
 */
exports.createClient = async (req, res) => {
    console.log("CORPS REÇU :", req.body);
    const { nom, telephone, adresse } = req.body;

    // Validation minimale pour correspondre au ClientScreen
    if (!nom) {
        return res.status(400).json({ message: "Le nom du client est obligatoire." });
    }

    try {
        const result = await runAsync(
            `INSERT INTO clients (nom, telephone, adresse) 
             VALUES (?, ?, ?)`,
            [nom, telephone || null, adresse || null]
        );

        res.status(201).json({
            message: "Client créé avec succès.",
            id: result.lastID, // 'id' au lieu de 'clientId' pour faciliter le mapping frontend
            nom: nom,
            telephone: telephone,
            adresse: adresse
        });

    } catch (error) {
        console.error("Erreur création client:", error);
        res.status(500).json({ message: "Erreur serveur interne lors de la création du client." });
    }
};

/**
 * Récupérer tous les clients
 */
exports.getAllClients = async (req, res) => {
    try {
        // Tri alphabétique pour une liste plus propre
        const clients = await allAsync('SELECT * FROM clients ORDER BY nom ASC');
        res.status(200).json(clients);
    } catch (error) {
        console.error("Erreur récupération clients:", error);
        res.status(500).json({ message: "Erreur serveur interne lors de la récupération des clients." });
    }
};