const sequelize = require("../config/db");
const Facture = require('./Facture');
const LigneFacture = require('./ligneFactureModel');



// Une facture a plusieurs lignes
Facture.hasMany(LigneFacture, {
  foreignKey: 'Num_fact',  // matches T_LignesFactures column
  sourceKey: 'Num_Fact',   // matches T_Factures column
  as: 'lignes'
});


// Une ligne appartient à une facture
LigneFacture.belongsTo(Facture, {
  foreignKey: 'Num_fact',  // matches T_LignesFactures column
  targetKey: 'Num_Fact',   // matches T_Factures column
  as: 'facture'
});

module.exports = { Facture, LigneFacture, sequelize }; // <-- Ajoutez sequelize ici
