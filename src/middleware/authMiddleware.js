// verielle-business-manager/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

/**
 * Vérifie la validité du token JWT dans l'en-tête de la requête.
 * Si le token est valide, attache les informations de l'utilisateur (req.user) à la requête.
 */
const authMiddleware = (req, res, next) => {
    // Récupère le token de l'en-tête 'Authorization' (Format: 'Bearer [token]')
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 401: Non autorisé
        return res.status(401).json({ message: "Accès refusé. Token manquant ou mal formaté." });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // Vérifie et décode le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attache les données utilisateur décodées (id, nom, email) à la requête
        req.user = decoded; 
        
        next(); // Passe au contrôleur suivant
        
    } catch (ex) {
        // 400: Mauvaise requête (Token invalide ou expiré)
        res.status(400).json({ message: "Token invalide ou expiré." });
    }
};

module.exports = authMiddleware;