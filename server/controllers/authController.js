const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { Op } = require("sequelize");
const { LogOut } = require("lucide-react");


exports.login = async (req, res) => {
  try {
    const { login_user, mot_passe_user } = req.body;

    const user = await User.findOne({ 
      where: { login_user }
    });

    if (!user || !(await bcrypt.compare(mot_passe_user, user.mot_passe_user))) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { 
        code_user: user.code_user,
        login_user: user.login_user,
        type_user: user.type_user 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        code_user: user.code_user,
        login_user: user.login_user,
        nom_user: user.nom_user,
        type_user: user.type_user
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
};

