// routes/factures.js
const express = require("express");
const router = express.Router();
const factureController = require("../controllers/factureController");

// Get all factures with filtering
router.get("/", factureController.facture_get_liste);

// Get a single facture by ID
router.get("/:id", factureController.facture_get);

// Get a facture by num_fact
router.get("/by-number/:num_fact", factureController.getFacture_by_num_fact);

// Get facture with its lines
router.get('/lignes/:num_fact', factureController.getFactureWithLignes);

// Create new facture
router.post("/ajout/", factureController.facture_ajout);

// Update facture
router.put('/modif/:num_fact', factureController.facture_modif);

// Delete facture
router.delete('/supp/:num_fact', factureController.facture_supp);

module.exports = router;
