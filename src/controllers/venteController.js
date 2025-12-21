// src/controllers/venteController.js
const db = require('../config/db');

exports.effectuerVente = async (req, res) => {
    try {
        const { produitId, quantite, total } = req.body;

        // Log pour voir ce que le serveur reçoit
        console.log("Données reçues pour la vente:", req.body);

        if (!produitId || !quantite) {
            return res.status(400).json({ message: "ID produit ou quantité manquant" });
        }

        // 1. Enregistrer la vente
        const sqlVente = `INSERT INTO commandes (produitId, quantite, total, date) VALUES (?, ?, ?, ?)`;
        await db.runAsync(sqlVente, [produitId, quantite, total, new Date().toISOString()]);

        // 2. Mettre à jour le stock
        const sqlStock = `UPDATE produits SET stock = stock - ? WHERE id = ?`;
        await db.runAsync(sqlStock, [quantite, produitId]);

        res.status(201).json({ message: "Vente réussie !" });
    } catch (error) {
        console.error("ERREUR SERVEUR VENTE:", error.message); // Ceci s'affichera dans ton terminal VS Code
        res.status(500).json({ message: "Erreur interne : " + error.message });
    }
};
// Récupérer les statistiques globales
exports.getStats = async (req, res) => {
    try {
        const stats = await db.allAsync(`
            SELECT 
                COUNT(*) as nbVentes, 
                SUM(total) as CA_Total 
            FROM commandes
        `);
        const historique = await db.allAsync(`
            SELECT c.*, p.nom as produitNom 
            FROM commandes c 
            JOIN produits p ON c.produitId = p.id 
            ORDER BY c.date DESC LIMIT 10
        `);
        res.json({ stats: stats[0], historique });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};