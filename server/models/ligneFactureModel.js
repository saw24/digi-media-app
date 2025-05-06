const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LigneFacture = sequelize.define("T_LignesFactures", {
    id_lignefacture: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    Ref_prdt: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Des_prdt: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Prix_Achat: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Prix_vente: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Remise: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Qte_payee: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Montant: {
        type: DataTypes.DECIMAL(24,6),
        allowNull: true
    },
    Num_fact: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Stock_prdt: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Nom_Clt: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Nom_So: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    TVA_prdt: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Cat_prdt: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Num_clt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description_prdt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cout_vente: {
        type: DataTypes.DECIMAL,
        allowNull: true
    }
}, {
    tableName: "T_LignesFactures",
    timestamps: false,
    schema: 'public',
    charset: 'utf8'
});

module.exports = LigneFacture;