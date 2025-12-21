const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Schemas'); // On importe le nouveau modèle Mongoose

const SALT_ROUNDS = 10;

// --- INSCRIPTION ---
exports.registerUser = async (req, res) => {
    const { nom, email, password, role } = req.body;

    if (!nom || !email || !password) {
        return res.status(400).json({ 
            message: "Veuillez fournir un nom, un email et un password." 
        });
    }

    try {
        // Mongoose remplace SELECT id FROM users WHERE email = ?
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Mongoose remplace INSERT INTO
        const newUser = new User({
            nom,
            email,
            motDePasse: hashedPassword,
            role: role || 'vendeur'
        });

        await newUser.save();

        res.status(201).json({ 
            message: "Utilisateur créé avec succès.", 
            userId: newUser._id 
        });
    } catch (error) {
        console.error("Erreur d'inscription:", error);
        res.status(500).json({ message: "Erreur serveur interne." });
    }
};

// --- CONNEXION ---
exports.loginUser = async (req, res) => {
    const { email, password, motDePasse } = req.body;
    const pass = password || motDePasse;

    if (!email || !pass) {
        return res.status(400).json({ message: "Veuillez fournir l'email et le mot de passe." });
    }

    try {
        // Mongoose remplace SELECT ... WHERE email = ?
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(pass, user.motDePasse))) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: user._id, nom: user.nom, email: user.email, role: user.role }, 
            process.env.JWT_SECRET || 'VerielleBusiness', 
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: "Connexion réussie.",
            token,
            user: { id: user._id, nom: user.nom, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Erreur de connexion:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};