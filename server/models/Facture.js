const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Facture = sequelize.define("T_Factures", {
    id_facture: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    Num_Fact: { type: DataTypes.STRING(50), allowNull: true },
    Date_Fact: { type: DataTypes.DATE, allowNull: true },
    Heure_Fact: { type: DataTypes.TIME, allowNull: true },
    TVA_Fact: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    Remise_Fact: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    MontAchat_Fact: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    MHT_Fact: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    MTTC_Fact: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    Vendeur_Fact: { type: DataTypes.STRING(50), allowNull: true },
    Etat_Fact: { type: DataTypes.STRING(50), allowNull: true },
    Montant_Paye: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    Reste_A_Payer: { type: DataTypes.DECIMAL(24,6), allowNull: true },
    Nom_clt: { type: DataTypes.STRING(50), allowNull: true },
    Type_Doc: { type: DataTypes.STRING(50), allowNull: true },
    statut_fact: { type: DataTypes.STRING(50), allowNull: true },
    code_agent: { type: DataTypes.STRING(50), allowNull: true },
    
    // Nouveaux champs
    delai_livraison: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    garantie_fact: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    validite_fact: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    condition_reglement: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    mode_paiement_digimedia: { 
        type: DataTypes.STRING(50), 
        allowNull: true 
    },
    part_commission: { 
        type: DataTypes.DECIMAL(24,6), 
        allowNull: true 
    },
    avance_fact: { 
        type: DataTypes.DECIMAL(24,6), 
        allowNull: true 
    },
    si_declare: { 
        type: DataTypes.BOOLEAN, 
        allowNull: true,
        defaultValue: false 
    },
    si_masque: { 
        type: DataTypes.BOOLEAN, 
        allowNull: true,
        defaultValue: false 
    },
    BICValeur: { 
        type: DataTypes.DECIMAL(24,6), 
        allowNull: true 
    },
    BICMontant: { 
        type: DataTypes.DECIMAL(24,6), 
        allowNull: true 
    },
    TVa_Pourcent: { 
        type: DataTypes.DECIMAL(10,2), 
        allowNull: true 
    }
}, {
    tableName: "T_Factures",
    timestamps: false,
    schema: 'public',
    charset: 'utf8'
});

module.exports = Facture;