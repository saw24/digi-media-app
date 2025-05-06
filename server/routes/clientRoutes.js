const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
//const { Op } = require('sequelize');

// Routes CRUD complètes
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Route de recherche (optionnelle)
router.get('/search', clientController.searchClients);

module.exports = router;