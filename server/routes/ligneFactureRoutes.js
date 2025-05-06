const express = require('express');
const router = express.Router();
const ligneFactureController = require('../controllers/ligneFactureController');

// Get all ligne factures
router.get('/', ligneFactureController.getAllLigneFactures);

// Get a single ligne facture by ID
router.get('/:id', ligneFactureController.getLigneFactureById);

// Create a new ligne facture
router.post('/', ligneFactureController.createLigneFacture);

// Update a ligne facture
router.put('/:id', ligneFactureController.updateLigneFacture);

// Delete a ligne facture
router.delete('/:id', ligneFactureController.deleteLigneFacture);

module.exports = router;