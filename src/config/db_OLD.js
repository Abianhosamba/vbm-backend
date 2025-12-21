// verielle-business-manager/src/config/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let dbInstance = null;
const DB_PATH = path.join(__dirname, '..', '..', 'verielle.db');

/**
 * Initialise la connexion à la base de données et crée les tables.
 * @returns {Promise<void>}
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        
        // Ouvre la base de données
        dbInstance = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('Erreur lors de la connexion à la base de données:', err.message);
                return reject(err);
            }
            console.log(`Connecté à la base de données SQLite à ${DB_PATH}`);
            
            // Exécute le script de création des tables
            dbInstance.exec(CREATE_TABLES_SQL, (err) => {
                if (err) {
                    console.error('Erreur lors de la création des tables:', err.message);
                    return reject(err);
                }
                console.log('Tables vérifiées/créées avec succès.');
                resolve();
            });
        });
    });
};

/**
 * Schéma de la base de données VBM.
 */
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, email TEXT UNIQUE NOT NULL, motDePasse TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'vendeur');
CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, telephone TEXT, adresse TEXT);
CREATE TABLE IF NOT EXISTS produits (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, description TEXT, prixUnitaire REAL NOT NULL, stock INTEGER NOT NULL DEFAULT 0, categorie TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS commandes (id INTEGER PRIMARY KEY AUTOINCREMENT, clientId INTEGER, userId INTEGER NOT NULL, prixTotal REAL NOT NULL, montantAvance REAL NOT NULL DEFAULT 0.0, resteAPayer REAL NOT NULL, statut TEXT NOT NULL DEFAULT 'Ouverte', dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (clientId) REFERENCES clients(id), FOREIGN KEY (userId) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS ligne_commandes (id INTEGER PRIMARY KEY AUTOINCREMENT, commandeId INTEGER NOT NULL, produitId INTEGER NOT NULL, quantite INTEGER NOT NULL, prixAuMomentAchat REAL NOT NULL, FOREIGN KEY (commandeId) REFERENCES commandes(id), FOREIGN KEY (produitId) REFERENCES produits(id));
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commandeId INTEGER NOT NULL,
        produitId INTEGER NOT NULL,
        quantite INTEGER NOT NULL,
        prixAuMomentAchat REAL NOT NULL,
        FOREIGN KEY (commandeId) REFERENCES commandes(id),
        FOREIGN KEY (produitId) REFERENCES produits(id)
    );
`;

/**
 * Exporte l'instance de la DB
 */
const getInstance = () => dbInstance;

/**
 * Fonction utilitaire pour exécuter des requêtes (INSERT, UPDATE, DELETE).
 * Elle retourne l'ID de la dernière insertion ou le nombre de lignes modifiées.
 */
const runAsync = (sql, params = []) => {
    const db = getInstance();
    if (!db) return Promise.reject(new Error("DB non connectée."));
    
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

/**
 * Fonction utilitaire pour récupérer des enregistrements (SELECT).
 */
const allAsync = (sql, params = []) => {
    const db = getInstance();
    if (!db) return Promise.reject(new Error("DB non connectée."));

    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};


module.exports = {
    initDB,
    getInstance,
    runAsync, 
    allAsync 
};