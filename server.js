require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./src/config/db');

// --- CORRECTION ICI : On importe User depuis Schemas ---
const { User } = require('./src/models/Schemas'); 

// Import des routes
const userRoutes = require('./src/routes/userRoutes');
const produitRoutes = require('./src/routes/produitRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const commandeRoutes = require('./src/routes/commandeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Log des requêtes pour le débogage
app.use((req, res, next) => {
    console.log(`📡 Requête reçue : ${req.method} ${req.url}`);
    next();
});

// --- INITIALISATION DU SERVEUR ET DE LA BASE ---
db.initDB()
    .then(async () => {
        try {
            const saltRounds = 10;

            // --- GESTION DU COMPTE ABIEL (ADMIN) ---
            const emailAbiel = 'abiel.admin@vbm.com';
            const checkAbiel = await User.findOne({ email: emailAbiel });
            
            if (!checkAbiel) {
                const hacheAbiel = await bcrypt.hash('verielle1papa', saltRounds);
                await User.create({
                    nom: 'Abiel',
                    email: emailAbiel,
                    motDePasse: hacheAbiel,
                    role: 'admin'
                });
                console.log("👤 Compte Admin (Abiel) créé.");
            }

            // --- GESTION DU COMPTE VÉRONIQUE (MANAGER) ---
            const emailVero = 'veronique.manager@vbm.com';
            const checkVero = await User.findOne({ email: emailVero });
            
            if (!checkVero) {
                const hacheVero = await bcrypt.hash('verielle2maman', saltRounds);
                await User.create({
                    nom: 'Véronique',
                    email: emailVero,
                    motDePasse: hacheVero,
                    role: 'manager'
                });
                console.log("👤 Compte Manager (Véronique) créé.");
            }

        } catch (e) {
            console.error("❌ Erreur lors de l'initialisation des comptes:", e.message);
        }

        // Configuration des routes
        app.use('/api/users', userRoutes);
        app.use('/api/produits', produitRoutes);
        app.use('/api/clients', clientRoutes);
        app.use('/api/commandes', commandeRoutes);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Serveur actif sur le port : ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Erreur au démarrage :', err.message);
        process.exit(1);
    });