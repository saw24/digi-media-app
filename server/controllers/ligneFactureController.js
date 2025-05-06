const LigneFacture = require('../models/LigneFacture');

// Get all ligne factures
exports.getAllLigneFactures = async (req, res) => {
    try {
        const ligneFactures = await LigneFacture.findAll();
        res.json(ligneFactures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single ligne facture by ID
exports.getLigneFactureById = async (req, res) => {
    try {
        const ligneFacture = await LigneFacture.findByPk(req.params.id);
        if (ligneFacture) {
            res.json(ligneFacture);
        } else {
            res.status(404).json({ message: 'Ligne facture not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new ligne facture
exports.createLigneFacture = async (req, res) => {
    try {
        const newLigneFacture = await LigneFacture.create(req.body);
        res.status(201).json(newLigneFacture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a ligne facture
exports.updateLigneFacture = async (req, res) => {
    try {
        const ligneFacture = await LigneFacture.findByPk(req.params.id);
        if (ligneFacture) {
            await ligneFacture.update(req.body);
            res.json(ligneFacture);
        } else {
            res.status(404).json({ message: 'Ligne facture not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a ligne facture
exports.deleteLigneFacture = async (req, res) => {
    try {
        const ligneFacture = await LigneFacture.findByPk(req.params.id);
        if (ligneFacture) {
            await ligneFacture.destroy();
            res.json({ message: 'Ligne facture deleted successfully' });
        } else {
            res.status(404).json({ message: 'Ligne facture not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};