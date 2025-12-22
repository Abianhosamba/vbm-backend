const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: String,
    email: { type: String, unique: true, required: true },
    motDePasse: { type: String, required: true },
    role: { type: String, default: 'manager' }
});

const clientSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    telephone: String,
    adresse: String
});

const produitSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    stock: { type: Number, default: 0 }
});

const commandeSchema = new mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    lignes: [{ produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }, quantite: Number }],
    montantAvance: { type: Number, default: 0 },
    statut: { type: String, default: 'Ouverte' }
});

module.exports = {
    User: mongoose.models.User || mongoose.model('User', userSchema),
    Client: mongoose.models.Client || mongoose.model('Client', clientSchema),
    Produit: mongoose.models.Produit || mongoose.model('Produit', produitSchema),
    Commande: mongoose.models.Commande || mongoose.model('Commande', commandeSchema)
};