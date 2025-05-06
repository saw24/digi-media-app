const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const factureRoutes = require("./routes/factureRoutes");
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const domaineRoutes = require('./routes/domaineRoutes');

const app = express();

// Single CORS configuration
app.use(cors({
  origin: ['http://localhost:6284', 'http://192.168.2.200:6284'], 
  credentials: true
}));

// ✅ Middleware pour parser le JSON
app.use(express.json());




// ✅ Middleware de debug des requêtes entrantes
/*app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});*/


app.get("/", (req, res) => {
  res.send("🚀 API backend Express opérationnelle !");
});



// ✅ Routes d'authentification
app.use("/api/auth", authRoutes);

// ✅ Routes Users
app.use("/api/user", userRoutes);

// ✅ Routes pour les factures
app.use("/api/facture", factureRoutes);

// ✅ Routes pour les clients
app.use("/api/client", clientRoutes);

// ✅ Routes pour les produits
app.use("/api/produit", productRoutes);

// ✅ Routes pour les domaines
app.use('/api/domaine', domaineRoutes);



// ✅ Connexion DB
sequelize
  .authenticate()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    console.log("✅ Connexion à la base de données réussie");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend en cours sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Impossible de se connecter à la base de données :", err);
  });
