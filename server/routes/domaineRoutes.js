const express = require('express');
const router = express.Router();
const DomaineController = require('../controllers/domaineController');

// Get all domains
router.get('/', DomaineController.getAllDomaines);

// Get domain by code
router.get('/:code', DomaineController.getDomaineByCode);

module.exports = router;