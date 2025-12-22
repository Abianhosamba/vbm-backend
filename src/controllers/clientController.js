const { Client } = require('../models/Schemas');

exports.createClient = async (req, res) => {
    try {
        const c = new Client(req.body);
        await c.save();
        res.status(201).json(c);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getAllClients = async (req, res) => {
    try { res.json(await Client.find()); } catch (e) { res.status(500).json({ error: e.message }); }
};