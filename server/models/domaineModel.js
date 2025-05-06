const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Domaine = sequelize.define('T_Domaines_Produits', {
  code_domaine: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  nom_domaine: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 't_domaines_produits',
  timestamps: false
});

module.exports = Domaine;