const { runAsync, allAsync } = require('../config/db');

exports.createCommande = async (req, res) => {
    const { client_id, montantAvance, lignes } = req.body;
    const userId = req.user.id; 

    if (!client_id || !lignes || lignes.length === 0 || montantAvance === undefined) {
        return res.status(400).json({ message: "Données manquantes." });
    }

    try {
        let totalPrixCommande = 0;
        for (const ligne of lignes) {
            const produit = await allAsync("SELECT prix, stock FROM produits WHERE id = ?", [ligne.produitId]);
            if (!produit[0]) throw new Error(`Produit ${ligne.produitId} introuvable.`);
            totalPrixCommande += produit[0].prix * ligne.quantite; 
        }

        const resteAPayer = totalPrixCommande - montantAvance;
        const statut = resteAPayer > 0 ? 'Ouverte' : 'Payée';

        const sqlCmd = `INSERT INTO commandes (client_id, userId, prixTotal, montantAvance, resteAPayer, statut) VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await runAsync(sqlCmd, [client_id, userId, totalPrixCommande, montantAvance, resteAPayer, statut]);
        const commandeId = result.lastID;

        for (const ligne of lignes) {
            const produit = await allAsync("SELECT prix FROM produits WHERE id = ?", [ligne.produitId]);
            await runAsync(`INSERT INTO ligne_commandes (commandeId, produitId, quantite, prixAuMomentAchat) VALUES (?, ?, ?, ?)`,
                [commandeId, ligne.produitId, ligne.quantite, produit[0].prix]);
            await runAsync(`UPDATE produits SET stock = stock - ? WHERE id = ?`, [ligne.quantite, ligne.produitId]);
        }
        res.status(201).json({ message: "Succès", commandeId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    const { periode } = req.query;
    let filter = "";
    if (periode === 'jour') filter = "WHERE date(c.dateCreation) = date('now')";
    else if (periode === 'semaine') filter = "WHERE date(c.dateCreation) >= date('now', '-7 days')";
    else if (periode === 'mois') filter = "WHERE date(c.dateCreation) >= date('now', 'start of month')";

    try {
        const statsSql = `SELECT COUNT(c.id) AS totalCommandes, COALESCE(SUM(c.prixTotal), 0) AS CA_theorique, COALESCE(SUM(c.montantAvance), 0) AS CA_reel, COALESCE(SUM(c.resteAPayer), 0) AS totalDettes FROM commandes c ${filter}`;
        const apercu = await allAsync(statsSql);
        // Dans exports.getStats, remplace la requête historique par celle-ci :
const historique = await allAsync(`
    SELECT 
        c.*, 
        cl.nom AS clientNom, 
        cl.telephone AS clientTelephone, -- Ajout du téléphone ici
        u.nom AS vendeurNom 
    FROM commandes c 
    JOIN clients cl ON c.client_id = cl.id 
    JOIN users u ON c.userId = u.id
    ${filter} 
    ORDER BY c.dateCreation DESC
`);
        res.status(200).json({ apercu: apercu[0], historique });
    } catch (error) {
        res.status(500).json({ message: "Erreur Bilan" });
    }
};

// Solder totalement
exports.solderCommande = async (req, res) => {
    const { id } = req.params;
    try {
        await runAsync(`UPDATE commandes SET montantAvance = prixTotal, resteAPayer = 0, statut = 'Payée' WHERE id = ?`, [id]);
        res.status(200).json({ message: "Soldée" });
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
};

// Verser une partie
exports.updateAvance = async (req, res) => {
    const { id } = req.params;
    const { montant } = req.body;
    try {
        const cmd = await allAsync("SELECT montantAvance, prixTotal, resteAPayer FROM commandes WHERE id = ?", [id]);
        if (!cmd[0]) return res.status(404).json({ message: "Introuvable" });

        const montantVersement = parseFloat(montant);
        const nouvelleAvance = cmd[0].montantAvance + montantVersement;
        const nouveauReste = cmd[0].prixTotal - nouvelleAvance;
        const nouveauStatut = nouveauReste <= 0 ? 'Payée' : 'Ouverte';

        // 1. Mise à jour de la commande
        await runAsync(`UPDATE commandes SET montantAvance = ?, resteAPayer = ?, statut = ? WHERE id = ?`, 
            [nouvelleAvance, nouveauReste > 0 ? nouveauReste : 0, nouveauStatut, id]);
        
        // 2. Enregistrement dans le journal des versements
        await runAsync(`INSERT INTO versements (commandeId, montant) VALUES (?, ?)`, [id, montantVersement]);
        
        res.status(200).json({ message: "Versement enregistré" });
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
};

// Solder totalement
exports.solderCommande = async (req, res) => {
    const { id } = req.params;
    try {
        const cmd = await allAsync("SELECT resteAPayer FROM commandes WHERE id = ?", [id]);
        const reste = cmd[0].resteAPayer;

        if (reste > 0) {
            await runAsync(`UPDATE commandes SET montantAvance = prixTotal, resteAPayer = 0, statut = 'Payée' WHERE id = ?`, [id]);
            await runAsync(`INSERT INTO versements (commandeId, montant) VALUES (?, ?)`, [id, reste]);
        }
        res.status(200).json({ message: "Soldée" });
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
};

// Nouvelle fonction pour voir l'historique d'une commande
exports.getVersements = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await allAsync(
            "SELECT * FROM versements WHERE commandeId = ? ORDER BY dateVersement DESC", 
            [id]
        );
        res.status(200).json(data);
    } catch (e) { 
        res.status(500).json({ message: "Erreur lors de la récupération du journal" }); 
    }
};
exports.getAllCommandes = async (req, res) => {
    try {
        const data = await allAsync(`
            SELECT c.*, u.nom AS vendeurNom, cl.nom AS clientNom 
            FROM commandes c 
            JOIN users u ON c.userId = u.id 
            JOIN clients cl ON c.client_id = cl.id 
            ORDER BY dateCreation DESC
        `);
        res.status(200).json(data);
    } catch (e) { 
        res.status(500).json({ message: "Erreur lors de la récupération des commandes" }); 
    }
};
exports.getCommandeDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT lc.*, p.nom 
            FROM ligne_commandes lc 
            JOIN produits p ON lc.produitId = p.id 
            WHERE lc.commandeId = ?`;
        const articles = await allAsync(sql, [id]);
        res.status(200).json(articles);
    } catch (e) {
        res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
};