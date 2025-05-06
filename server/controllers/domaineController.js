const Domaine = require('../models/domaineModel');
const { Op } = require("sequelize");

class DomaineController {
  // Get all domains
  async getAllDomaines(req, res) {
    try {
      const domaines = await Domaine.findAll({
        order: [['nom_domaine', 'ASC']]
      });
      res.json(domaines);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get domain by code
  async getDomaineByCode(req, res) {
    try {
      const { code } = req.params;
      const domaine = await Domaine.findByPk(code);
      if (domaine) {
        res.json(domaine);
      } else {
        res.status(404).json({ message: 'Domain not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DomaineController();