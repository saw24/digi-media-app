const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define('Product', {
  id_prdt: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Des_prdt: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Cat_prdt: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Prix_Achat: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TVA_prdt: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Prix_vente: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Stock_prdt: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ref_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  marque_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  seuil_prdt: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  code_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  modele_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  obser_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_prdt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pourcentage_benefice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date_peremption: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cout_vente: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  code_domaine: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  si_obsolete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'T_Produits',
  schema: 'public',
  timestamps: false
});

module.exports = Product;