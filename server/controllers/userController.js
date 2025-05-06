const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { Op } = require("sequelize");


exports.getVendeurs = async (req, res) => {
  try {
    const vendeurs = await User.findAll({
      attributes: ['login_user', 'nom_user'],
      where: {
        login_user: {
          [Op.not]: null
        }
      },
      order: [['login_user', 'ASC']]
    });
    
    res.json(vendeurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'code_user',
        'fonct_user',
        'tel_user',
        'adre_user',
        'email_user',
        'observ_user',
        'login_user',
        'nom_user',
        'type_user',
        'service_user'
      ],
      order: [
        ['nom_user', 'ASC']
      ]
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.register = async (req, res) => {
  try {
    const { 
      code_user,
      login_user,
      mot_passe_user,
      nom_user,
      email_user,
      tel_user,
      adre_user,
      fonct_user,
      type_user,
      service_user,
      observ_user
    } = req.body;

    const hashedPassword = await bcrypt.hash(mot_passe_user, 10);

    const user = await User.create({
      code_user,
      login_user,
      mot_passe_user: hashedPassword,
      nom_user,
      email_user,
      tel_user,
      adre_user,
      fonct_user,
      type_user,
      service_user,
      observ_user
    });

    res.json({
      message: "Utilisateur créé avec succès",
      user: {
        code_user: user.code_user,
        login_user: user.login_user,
        nom_user: user.nom_user,
        type_user: user.type_user
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserByLogin = async (req, res) => {
  try {
    const { login_user } = req.params;

    const user = await User.findOne({
      attributes: [
        'code_user',
        'fonct_user',
        'tel_user',
        'adre_user',
        'email_user',
        'observ_user',
        'login_user',
        'nom_user',
        'type_user',
        'service_user'
      ],
      where: {
        login_user: login_user
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByCode = async (req, res) => {
  try {
    const { code_user } = req.params;

    const user = await User.findOne({
      attributes: [
        'code_user',
        'fonct_user',
        'tel_user',
        'adre_user',
        'email_user',
        'observ_user',
        'login_user',
        'nom_user',
        'type_user',
        'service_user'
      ],
      where: {
        code_user: code_user
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};