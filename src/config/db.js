const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
        process.exit(1);
    }
};

// On garde une structure similaire pour ne pas tout casser dans server.js
module.exports = { initDB: connectDB };