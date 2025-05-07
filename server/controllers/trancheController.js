const Tranche = require('../models/trancheModel');
const Facture = require('../models/Facture');
const { Op } = require('sequelize');

class TrancheController {
    // Create new tranche
    static async create(req, res) {
        try {
            // Add the current time to the request body
            //req.body.Date_Tran = new Date();
            //req.body.Heure_Tran = new Date();

            //Create and add a new num_tranche
            const lastTranche = await Tranche.findOne({
                order: [['Num_Tran', 'DESC']]
            });
            const lastNumTran = lastTranche ? lastTranche.Num_Tran : 0;
            const newNumTran = lastNumTran + 1;
            req.body.Num_Tran = newNumTran;


            const tranche = await Tranche.create(req.body);
            // Update the facture with the new tranche
            const facture = await Facture.findOne({
                where: { Num_Fact: req.body.Num_Fact }
            });
            if (facture) {
                // Handle null values by defaulting to 0 if undefined
                const currentResteAPayer = facture.Reste_A_Payer || 0;
                const currentMontantPaye = facture.Montant_Paye || 0;
                const montantTran = req.body.Montant_Tran || 0;

                facture.Reste_A_Payer = Number(currentResteAPayer) - Number(montantTran);
                facture.Montant_Paye = Number(currentMontantPaye) + Number(montantTran);
                await facture.save();
            }

            res.status(201).json({
                tranche,
                facture
            });
        } catch (error) {
            console.error('Error creating tranche:', error);
            res.status(500).json({ error: 'Error creating payment tranche' });
        }
    }

    // Get all tranches for a specific facture
    static async getByFacture(req, res) {
        try {
            const tranches = await Tranche.findAll({
                where: {
                    Num_Fact: req.params.num_fact
                },
                order: [['Date_Tran', 'DESC']]
            });
            res.json(tranches);
        } catch (error) {
            console.error('Error fetching tranches:', error);
            res.status(500).json({ error: 'Error fetching payment tranches' });
        }
    }

    // Update a tranche
    static async update(req, res) {
        try {
            // Get the original tranche before update
            const originalTranche = await Tranche.findByPk(req.params.num_tran);
            if (!originalTranche) {
                return res.status(404).json({ error: 'Tranche not found' });
            }

            // Update the tranche
            const [updated] = await Tranche.update(req.body, {
                where: { Num_Tran: req.params.num_tran }
            });

            if (updated) {
                const updatedTranche = await Tranche.findByPk(req.params.num_tran);
                
                // Update the facture
                const facture = await Facture.findOne({
                    where: { Num_Fact: updatedTranche.Num_Fact }
                });

                if (facture) {
                    // Calculate the difference between new and old amounts
                    const amountDifference = Number(updatedTranche.Montant_Tran) - Number(originalTranche.Montant_Tran);
                    
                    // Update facture amounts
                    facture.Montant_Paye = Number(facture.Montant_Paye || 0) + amountDifference;
                    facture.Reste_A_Payer = Number(facture.Reste_A_Payer || 0) - amountDifference;
                    
                    await facture.save();
                }

                res.json({
                    tranche: updatedTranche,
                    facture: facture
                });
            } else {
                res.status(404).json({ error: 'Tranche not found' });
            }
        } catch (error) {
            console.error('Error updating tranche:', error);
            res.status(500).json({ error: 'Error updating payment tranche' });
        }
    }

    // Delete a tranche
    static async delete(req, res) {
        try {
            // Get the tranche before deleting to know the amount
            const trancheToDelete = await Tranche.findByPk(req.params.num_tran);
            if (!trancheToDelete) {
                return res.status(404).json({ error: 'Tranche not found' });
            }

            // Get the associated facture
            const facture = await Facture.findOne({
                where: { Num_Fact: trancheToDelete.Num_Fact }
            });

            // Delete the tranche
            const deleted = await Tranche.destroy({
                where: { Num_Tran: req.params.num_tran }
            });

            if (deleted && facture) {
                // Update facture amounts
                facture.Montant_Paye = Number(facture.Montant_Paye || 0) - Number(trancheToDelete.Montant_Tran);
                facture.Reste_A_Payer = Number(facture.Reste_A_Payer || 0) + Number(trancheToDelete.Montant_Tran);
                await facture.save();

                res.json({
                    message: 'Tranche deleted successfully',
                    facture: facture
                });
            } else {
                res.status(404).json({ error: 'Tranche not found' });
            }
        } catch (error) {
            console.error('Error deleting tranche:', error);
            res.status(500).json({ error: 'Error deleting payment tranche' });
        }
    }

    // Get total payments for a facture
    static async getTotalPayments(req, res) {
        try {
            const total = await Tranche.sum('Montant_Tran', {
                where: {
                    Num_Fact: req.params.num_fact,
                    etat_paiement: true
                }
            });
            res.json({ total: total || 0 });
        } catch (error) {
            console.error('Error calculating total payments:', error);
            res.status(500).json({ error: 'Error calculating total payments' });
        }
    }
}

module.exports = TrancheController;