const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tranche = sequelize.define('Tranche', {
    Num_Tran: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Date_Tran: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Heure_Tran: {
        type: DataTypes.TIME,
        allowNull: true
    },
    Montant_Tran: {
        type: DataTypes.DECIMAL(24, 6),
        allowNull: true,
        defaultValue: null
    },
    ModePaie_Tran: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null
    },
    Num_Fact: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null
    },
    code_paiement: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    etat_paiement: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'T_Tranches',
    schema: 'public',
    timestamps: false
});

module.exports = Tranche;