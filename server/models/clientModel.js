const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Client = sequelize.define('Client', {
    Num_clt: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nom_clt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Tel_clt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Adr_clt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Email_Clt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    odbserv_clt: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'T_Clients',
    schema: 'public',
    timestamps: false
});



module.exports = Client;