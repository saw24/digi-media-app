const express = require("express");
const router = express.Router();
const authController = require("../controllers/userController");

router.post("/ajout", authController.register);
router.get("/vendeurs", authController.getVendeurs);
router.get('/', authController.getAllUsers);
router.get('/:login_user', authController.getUserByLogin);
router.get('/info/:code_user', authController.getUserByCode);

module.exports = router;