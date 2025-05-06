/*const Facture = require("../models/Facture");
const LigneFacture = require("../models/ligneFactureModel");*/

const { Facture, LigneFacture, sequelize } = require("../models/associations");
//const moment = require('moment-timezone');


const { Op } = require("sequelize");

const factureController = {
    facture_get_liste: async (req, res) => {
        try {
            const {
                numeroFacture,
                typeFacture,
                etatPaiement,
                modePaiement,
                client,
                vendeur,
                startDate,
                endDate,
                siDeclaree,
                siMasquee
            } = req.query;

            // Construction des conditions de filtrage
            const whereConditions = {};

            if (numeroFacture) {
                whereConditions.Num_Fact = {
                    [Op.like]: `%${numeroFacture}%`
                };
            }

            // Handle typeFacture as array
            if (typeFacture) {
                const typeArray = Array.isArray(typeFacture) ? typeFacture : [typeFacture];
                if (typeArray.length > 0) {
                    whereConditions.Type_Doc = {
                        [Op.in]: typeArray
                    };
                }
            }

            // Handle etatPaiement as array
            if (etatPaiement) {
                const etatArray = Array.isArray(etatPaiement) ? etatPaiement : [etatPaiement];
                if (etatArray.length > 0) {
                    whereConditions.Etat_Fact = {
                        [Op.in]: etatArray
                    };
                }
            }

            if (modePaiement) {
                whereConditions.mode_paiement = modePaiement;
            }

            if (client) {
                whereConditions.NunClt = {
                    [Op.like]: `%${client}%`
                };
            }

            if (vendeur) {
                whereConditions.Vendeur_Fact = {
                    [Op.like]: `%${vendeur}%`
                };
            }

            // Handle date range with proper validation
            if (startDate && endDate) {
                try {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        whereConditions.Date_Fact = {
                            [Op.between]: [start, end]
                        };
                    }
                } catch (error) {
                    console.error("Date parsing error:", error);
                }
            }

            const factures = await Facture.findAll({
                where: whereConditions,
                order: [['Date_Fact', 'DESC']],
                attributes: [
                    'id_facture',
                    'Num_Fact',
                    'Date_Fact',
                    'MTTC_Fact',
                    'MHT_Fact',
                    'Nom_clt',
                    'Etat_Fact',
                    'Type_Doc',
                    'statut_fact',
                    'Montant_Paye',
                    'TVA_Fact',
                    'BICMontant',
                    'montant_cout_achat',
                    'part_commission',
                    'mode_paiement',
                    'Montant_Paye',
                    'Reste_A_Payer',
                    'si_masque',
                    'si_declare',
                    'Remise_Fact',
                    'Vendeur_Fact',
                    'si_tva_retenu',
                    'si_bic_retenu'
                ]
            });

            res.json(factures);
        } catch (error) {
            console.error("Server error:", error);
            res.status(500).json({
                error: "Erreur serveur lors de la récupération des factures",
                details: error.message
            });
        }
    },

    facture_get: async (req, res) => {
        try {
            const { id } = req.params;
            const facture = await Facture.findByPk(id);

            if (!facture) {
                return res.status(404).json({ message: "Facture non trouvée" });
            }

            res.json(facture);
        } catch (error) {
            res.status(500).json({ error: "Erreur serveur : " + error.message });
        }
    },

    getFacture_by_num_fact: async (req, res) => {
        const { num_fact } = req.params; // <-- changement ici

        try {
            const facture = await Facture.findOne({
                where: { Num_Fact: num_fact } // <-- utiliser num_fact ici
            });

            if (facture) {
                res.status(200).json(facture);
            } else {
                res.status(404).json({ message: "Facture non trouvée" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },


    getFactureWithLignes: async (req, res) => {
        const { num_fact } = req.params;
        try {
            const facture = await Facture.findOne({
                where: { Num_Fact: num_fact },  
                include: [{
                    model: LigneFacture,
                    as: 'lignes',
                    order: [
                        ['Date_Fact', 'DESC'],
                        ['Heure_Fact', 'DESC']
                    ]
                }]
            });

            if (!facture) {
                return res.status(404).json({ message: "Facture non trouvée" });
            }

            res.status(200).json(facture);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },

    facture_ajout: async (req, res) => {
        //const { Num_Fact } = req.params;
        try {
            const { lignes, ...factureData } = req.body;
            // Start a transaction
            const result = await sequelize.transaction(async (t) => {

                //**** Generate new invoice number (FACT-YYYY-XXXX format) */                
                const typeDoc = req.body.Type_Doc; // Récupérer le type de document
                // Appeler la fonction SQL
                const [results, metadata] = await sequelize.query(
                    `SELECT public.generer_numero_facture(:type_facture) AS numero_facture`,
                    {
                        replacements: { type_facture: typeDoc },
                        type: sequelize.QueryTypes.SELECT
                    }
                );
                const newNumFact = results.numero_facture; // Récupérer le nouveau numéro

                // Current time in GMT+1 with 1 hour added
                const heureFacturation = factureData.Heure_Fact + ':00';

                console.log("date fact in controller : ", factureData.Date_Fact);
                console.log("heure fact in controller: ", factureData.Heure_Fact);
                console.log("heure fact transform in controller: ", heureFacturation);
              


                // First create the factureData object with the new number
                const factureToCreate = {
                    ...factureData,
                    Num_Fact: newNumFact,
                    Heure_Fact: heureFacturation,
                };

                delete factureToCreate.id_facture;

              
                // Create the facture
                const facture = await Facture.create(factureToCreate, { transaction: t });

                if (lignes && lignes.length > 0) {
                    // Add the facture number to each line
                    const lignesWithFactureNum = lignes.map(ligne => ({
                        ...ligne,
                        Num_fact: facture.Num_Fact
                    }));

                    // Create all ligne factures within the same transaction
                    await LigneFacture.bulkCreate(lignesWithFactureNum, { transaction: t });
                }

                // Fetch the complete facture with its lines
                const completeFacture = await Facture.findOne({
                    where: { Num_Fact: facture.Num_Fact },  // Changed from id_facture to Num_Fact
                    include: [{
                        model: LigneFacture,
                        as: 'lignes'
                    }],
                    transaction: t
                });

                return completeFacture;
            });

            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating facture:', error);
            res.status(500).json({
                error: "Erreur lors de la création de la facture",
                details: error.message
            });
        }
    },



    facture_modif: async (req, res) => {
        try {
            const { num_fact } = req.params;

            if (!num_fact) {
                return res.status(400).json({
                    error: "Numéro de facture manquant",
                    details: "Le numéro de facture est requis pour la modification"
                });
            }

            const { lignes = [], ...factureData } = req.body;

            /*const dateFact = req.body.Date_Fact.split(' ')[0];
            const heure = req.body.Heure_Fact;
            const fullDateTime = `${dateFact} ${heure}:00`;
            factureData.Heure_Fact = fullDateTime;*/

            const result = await sequelize.transaction(async (t) => {
                await Facture.update(factureData, {
                    where: { Num_Fact: num_fact },
                    transaction: t
                });


                if (lignes && lignes.length > 0) {
                    // Delete existing ligne factures using Num_fact
                    await LigneFacture.destroy({
                        where: { Num_fact: num_fact },  
                        transaction: t
                    });

                    // Create new ligne factures with Num_fact
                    const lignesWithFactureNum = lignes.map(ligne => ({
                        ...ligne,
                        Num_fact: num_fact
                    }));

                    await LigneFacture.bulkCreate(lignesWithFactureNum, {
                        transaction: t
                    });
                }

               /* // Récupérer les anciennes lignes
                const oldLignes = await LigneFacture.findAll({
                    where: { Num_fact: num_fact },
                    transaction: t
                });

                const oldLignesMap = new Map(oldLignes.map(l => [l.id_lignefacture, l]));
                const newLignesMap = new Map(lignes.map(l => [l.id_lignefacture, l]));

                // Lignes à supprimer
                const codesToDelete = [...oldLignesMap.keys()].filter(id_lignefacture => !newLignesMap.has(id_lignefacture));
                if (codesToDelete.length > 0) {
                    await LigneFacture.destroy({
                        where: {
                            id_lignefacture: { [Op.in]: codesToDelete }
                        },
                        transaction: t
                    });
                }

                // Lignes à mettre à jour ou insérer
                for (const ligne of lignes) {
                    if (ligne.id_lignefacture && oldLignesMap.has(ligne.id_lignefacture)) {
                        // Ligne existante -> mise à jour
                        await LigneFacture.update(
                            ligne,
                            {
                                where: { id_lignefacture: ligne.id_lignefacture },
                                transaction: t
                            }
                        );
                    } else {
                        // Nouvelle ligne -> insertion
                        await LigneFacture.create(
                            { ...ligne, Num_fact: num_fact },
                            { transaction: t }
                        );
                    }
                }*/

                return num_fact;
            });

            res.json(result);
        } catch (error) {
            console.error('Error updating facture:', error);
            res.status(error.message === 'Facture non trouvée' ? 404 : 500)
                .json({
                    error: error.message === 'Facture non trouvée'
                        ? "Facture non trouvée"
                        : "Erreur lors de la mise à jour de la facture",
                    details: error.message
                });
        }
    },

    facture_supp: async (req, res) => {
        const { num_fact } = req.params;
        try {
            const result = await sequelize.transaction(async (t) => {
                // First, delete all associated ligne factures
                await LigneFacture.destroy({
                    where: { Num_fact: num_fact },
                    transaction: t
                });

                // Then delete the facture
                const deletedCount = await Facture.destroy({
                    where: { Num_Fact: num_fact },
                    transaction: t
                });

                if (deletedCount === 0) {
                    throw new Error('Facture non trouvée');
                }

                return deletedCount;
            });

            res.status(200).json({
                message: "Facture supprimée avec succès",
                deletedCount: result
            });
        } catch (error) {
            console.error('Error deleting facture:', error);
            res.status(error.message === 'Facture non trouvée' ? 404 : 500)
                .json({
                    error: error.message === 'Facture non trouvée'
                        ? "Facture non trouvée"
                        : "Erreur lors de la suppression de la facture",
                    details: error.message
                });
        }
    }
};

module.exports = factureController;