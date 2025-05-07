const express = require('express');
const router = express.Router();
const TrancheController = require('../controllers/trancheController');
//const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/',  TrancheController.create);
router.get('/facture/:num_fact',  TrancheController.getByFacture);
router.get('/facture/:num_fact/total',  TrancheController.getTotalPayments);
router.put('/:num_tran',  TrancheController.update);
router.delete('/:num_tran',  TrancheController.delete);

module.exports = router;