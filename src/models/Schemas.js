const mongoose = require('mongoose');

// SCHÉMA USER (Déjà utilisé par ton userController)
const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, default: 'vendeur' }
});

// SCHÉMA CLIENT
const clientSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    telephone: String,
    adresse: String
});

// SCHÉMA PRODUIT
const produitSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    stock: { type: Number, default: 0 }
});

// SCHÉMA COMMANDE & VERSEMENTS
const commandeSchema = new mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    prixTotal: Number,
    montantAvance: Number,
    resteAPayer: Number,
    statut: String,
    dateCreation: { type: Date, default: Date.now },
    lignes: [{
        produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
        quantite: Number,
        prixAuMomentAchat: Number
    }],
    versements: [{
        montant: Number,
        dateVersement: { type: Date, default: Date.now }
    }]
});

// Remplace tes exports actuels à la fin de src/models/Schemas.js par ceci :
module.exports = {
    User: mongoose.models.User || mongoose.model('User', userSchema),
    Client: mongoose.models.Client || mongoose.model('Client', clientSchema),
    Produit: mongoose.models.Produit || mongoose.model('Produit', produitSchema),
    Commande: mongoose.models.Commande || mongoose.model('Commande', commandeSchema)
};