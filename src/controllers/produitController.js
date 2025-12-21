const db = require('../config/db');

// 1. Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
    try {
        // On sélectionne 'prix' car c'est le nom dans ta DB
        const produits = await db.allAsync('SELECT id, nom, prix, stock FROM produits ORDER BY nom ASC');
        res.json(produits);
    } catch (error) {
        console.error("Erreur récupération produits:", error);
        res.status(500).json({ message: "Erreur récupération." });
    }
};

// 2. Créer un produit
exports.createProduit = async (req, res) => {
    const { nom, prix, stock } = req.body;
    
    try {
        // ON UTILISE 'prix' ICI POUR CORRESPONDRE À TA TABLE
        const result = await db.runAsync(
            `INSERT INTO produits (nom, prix, stock) VALUES (?, ?, ?)`,
            [nom, parseFloat(prix), parseInt(stock)]
        );
        res.status(201).json({ id: result.lastID, nom, prix, stock });
    } catch (error) {
        console.error("Erreur INSERT produit:", error); // Garde ce log pour voir les erreurs
        res.status(500).json({ message: "Erreur lors de l'ajout en base de données." });
    }
};

// 3. Mettre à jour
exports.updateProduit = async (req, res) => {
    const { id } = req.params;
    const { nom, prix, stock } = req.body;
    try {
        await db.runAsync(
            `UPDATE produits SET nom=?, prix=?, stock=? WHERE id=?`,
            [nom, prix, stock, id]
        );
        res.json({ message: "Produit mis à jour" });
    } catch (error) {
        res.status(500).json({ message: "Erreur mise à jour" });
    }
};

// 4. Supprimer
exports.deleteProduit = async (req, res) => {
    const { id } = req.params;
    try {
        await db.runAsync('DELETE FROM produits WHERE id = ?', [id]);
        res.json({ message: "Supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression" });
    }
};