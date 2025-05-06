const Client = require('../models/clientModel');
const { Op } = require("sequelize");

const clientController = {
    // Récupérer tous les clients avec conditions et tri
    getAllClients: async (req, res) => {
        try {
            const clients = await Client.findAll({
                where: {
                    [Op.and]: [
                        { Num_clt: { [Op.lt]: 500 } },         // Num_clt < 500
                        { Nom_clt: { [Op.not]: null } },       // Nom_clt non null
                        { Nom_clt: { [Op.ne]: '' } }          // Nom_clt non vide
                    ]
                },
                order: [['Nom_clt', 'ASC']]                   // Tri par Nom_clt ASC
            });
            
            res.status(200).json(clients);
        } catch (error) {
            console.error('Erreur dans getAllClients:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Récupérer un client par son ID
    getClientById: async (req, res) => {
        try {
            const client = await Client.findByPk(req.params.id);
            if (!client) {
                return res.status(404).json({ error: 'Client non trouvé' });
            }
            res.status(200).json(client);
        } catch (error) {
            console.error('Erreur dans getClientById:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Créer un nouveau client
    createClient: async (req, res) => {
        try {
            const newClient = await Client.create({
                Nom_clt: req.body.Nom_clt,
                Tel_clt: req.body.Tel_clt,
                Adr_clt: req.body.Adr_clt,
                Email_Clt: req.body.Email_Clt,
                odbserv_clt: req.body.odbserv_clt
            });
            res.status(201).json(newClient);
        } catch (error) {
            console.error('Erreur dans createClient:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Mettre à jour un client
    updateClient: async (req, res) => {
        try {
            const [updated] = await Client.update(req.body, {
                where: { Num_clt: req.params.id }
            });
            if (updated) {
                const updatedClient = await Client.findByPk(req.params.id);
                return res.status(200).json(updatedClient);
            }
            res.status(404).json({ error: 'Client non trouvé' });
        } catch (error) {
            console.error('Erreur dans updateClient:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Supprimer un client
    deleteClient: async (req, res) => {
        try {
            const deleted = await Client.destroy({
                where: { Num_clt: req.params.id }
            });
            if (deleted) {
                return res.status(204).send();
            }
            res.status(404).json({ error: 'Client non trouvé' });
        } catch (error) {
            console.error('Erreur dans deleteClient:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Rechercher des clients (exemple par nom)
    searchClients: async (req, res) => {
        try {
            const clients = await Client.findAll({
                where: {
                    Nom_clt: {
                        [Op.like]: `%${req.query.nom}%`
                    }
                }
            });
            res.status(200).json(clients);
        } catch (error) {
            console.error('Erreur dans searchClients:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

module.exports = clientController;