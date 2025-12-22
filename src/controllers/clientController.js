// verielle-business-manager/src/controllers/clientController.js
const { Produit } = require('../models/Schemas'); // Import du nouveau modèle

/**
 * Créer un nouveau client dans MongoDB
 */
exports.createClient = async (req, res) => {
    console.log("CORPS REÇU :", req.body);
    const { nom, telephone, adresse } = req.body;

    if (!nom) {
        return res.status(400).json({ message: "Le nom du client est obligatoire." });
    }

    try {
        // On crée l'objet selon le schéma MongoDB
        const nouveauClient = new Client({
            nom,
            telephone,
            adresse
        });

        // Sauvegarde réelle dans MongoDB Atlas
        const clientSauvegarde = await nouveauClient.save();

        res.status(201).json({
            message: "Client créé avec succès.",
            id: clientSauvegarde._id, // MongoDB utilise _id
            nom: clientSauvegarde.nom,
            telephone: clientSauvegarde.telephone,
            adresse: clientSauvegarde.adresse
        });

    } catch (error) {
        console.error("ERREUR CRITIQUE MONGODB :", error.message);
        console.error("Erreur création client MongoDB:", error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement dans MongoDB." });
    }
};

/**
 * Récupérer tous les clients de MongoDB
 */
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ nom: 1 });
        res.status(200).json(clients);
    } catch (error) {
        console.error("Erreur récupération clients MongoDB:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des clients." });
    }
};