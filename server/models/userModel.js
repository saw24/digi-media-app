const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("t_users", {
  code_user: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  fonct_user: { type: DataTypes.STRING(50), allowNull: true },
  tel_user: { type: DataTypes.STRING(50), allowNull: true },
  adre_user: { type: DataTypes.STRING(50), allowNull: true },
  email_user: { type: DataTypes.STRING(50), allowNull: true },
  observ_user: { type: DataTypes.TEXT, allowNull: true },
  login_user: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  nom_user: { type: DataTypes.STRING(50), allowNull: true },
  mot_passe_user: { type: DataTypes.STRING(100), allowNull: true },
  type_user: { type: DataTypes.STRING(50), allowNull: true },
  photo_user: { type: DataTypes.BLOB, allowNull: true },
  service_user: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: "t_users",
  timestamps: false,
  schema: 'public',
  charset: 'utf8'
});

module.exports = User;
