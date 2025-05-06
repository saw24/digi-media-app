import React, { useState } from "react";
import NavMenu from '../components/NavMenu';
import '../assets/css/style.css';

const produitsDisponibles = [
  { id: 1, nom: "Smartphone Galaxy S23", prix: 899, description: "Dernier modèle Samsung avec appareil photo 108MP" },
  { id: 2, nom: "Laptop Pro X1", prix: 1299, description: "Ordinateur portable avec écran 4K et processeur i9" },
  { id: 3, nom: "Tablette Air 5", prix: 599, description: "Tablette légère avec stylet inclus" },
  { id: 4, nom: "Écouteurs Sans Fil Pro", prix: 199, description: "" },
  { id: 5, nom: "Montre Connectée Sport", prix: 299, description: "Tracker fitness avec GPS intégré" },
  { id: 6, nom: "Caméra Action 4K", prix: 399, description: "Caméra étanche jusqu'à 30m" },
  { id: 7, nom: "Enceinte Bluetooth XL", prix: 159, description: "" },
  { id: 8, nom: "Clavier Mécanique RGB", prix: 129, description: "Switches Cherry MX Blue" },
  { id: 9, nom: "Souris Gaming Pro", prix: 89, description: "Capteur 16000 DPI avec 8 boutons programmables" },
  { id: 10, nom: "Hub USB-C 8 ports", prix: 49, description: "" },
  { id: 11, nom: "SSD 1TB NVMe", prix: 129, description: "Vitesse lecture 7000MB/s" },
  { id: 12, nom: "Routeur WiFi 6", prix: 199, description: "Double bande avec couverture maximale" },
  { id: 13, nom: "Webcam 4K", prix: 89, description: "" }
];

export default function FicheVente() {
  const [produitSelectionne, setProduitSelectionne] = useState("");
  const [panier, setPanier] = useState([]);
  const [remise, setRemise] = useState(0);
  const [nouveauProduit, setNouveauProduit] = useState({
    id: "",
    quantite: 1,
    prix: 0
  });

  const handleProduitChange = (e) => {
    const produit = produitsDisponibles.find(p => p.id === parseInt(e.target.value));
    if (produit) {
      // Check if product already exists in cart
      const existingProduct = panier.find(p => p.id === produit.id);
      if (existingProduct) {
        // Scroll to existing product card
        const productCard = document.querySelector(`[data-product-id="${produit.id}"]`);
        if (productCard) {
          productCard.scrollIntoView({ behavior: 'smooth' });
          productCard.classList.add('highlight');
          setTimeout(() => productCard.classList.remove('highlight'), 2000);
        }
        // Reset selection
        setProduitSelectionne("");
        return;
      }
      
      setNouveauProduit({
        id: produit.id,
        quantite: 1,
        prix: produit.prix
      });
    }
    setProduitSelectionne(e.target.value);
  };

  const handleQuantiteChange = (e) => {
    setNouveauProduit(prev => ({
      ...prev,
      quantite: parseInt(e.target.value) || 0
    }));
  };

  const handlePrixChange = (e) => {
    setNouveauProduit(prev => ({
      ...prev,
      prix: parseFloat(e.target.value) || 0
    }));
  };

  const ajouterAuPanier = () => {
    const produit = produitsDisponibles.find(p => p.id === parseInt(produitSelectionne));
    if (produit && nouveauProduit.quantite > 0 && nouveauProduit.prix >= 0) {
      setPanier(prev => [...prev, {
        ...produit,
        quantite: nouveauProduit.quantite,
        prix: nouveauProduit.prix
      }]);
      // Reset form
      setProduitSelectionne("");
      setNouveauProduit({
        id: "",
        quantite: 1,
        prix: 0
      });
    }
  };

  const modifierQuantite = (id, quantite) => {
    setPanier(panier.map(p => p.id === id ? { ...p, quantite } : p));
  };

  const supprimerProduit = id => {
    setPanier(panier.filter(p => p.id !== id));
  };

  const totalHT = panier.reduce((total, p) => total + p.prix * p.quantite, 0);
  const montantRemise = (totalHT * remise) / 100;
  const totalTTC = totalHT - montantRemise;

  const handleProductUpdate = (id, field, value) => {
    setPanier(panier.map(p => {
      if (p.id === id) {
        const updatedProduct = { ...p, [field]: value };
        // Recalculate total if needed
        return updatedProduct;
      }
      return p;
    }));
  };

  return (
    <div className="page-container">
      <NavMenu />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Nouvelle Facture</h1>
        
        <div className="fiche-vente">
          <div className="panel-gauche">
            <h2>Facture</h2>
            <div className="form-group">
              <label>Date:</label>
              <input 
                type="date" 
                className="form-control"
                defaultValue={new Date().toISOString().substr(0, 10)} 
              />
            </div>

            <div className="form-group">
              <label>Client:</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Nom du client" 
              />
            </div>

            <div className="form-group">
              <label>Remise (%):</label>
              <input 
                type="number"
                className="form-control" 
                value={remise} 
                onChange={e => setRemise(e.target.value)} 
              />
            </div>

            <div className="total-panier">
              <p>Total HT: {totalHT} FCFA</p>
              <p>Remise: {montantRemise} FCFA</p>
              <h3>Total TTC: {totalTTC} FCFA</h3>
            </div>

            <button className="btn btn-primary valider">Valider la vente</button>
          </div>

          <div className="panel-droit">
            <div className="ajout-produit">
              <div className="form-group">
                <label>Produit:</label>
                <select 
                  className="form-control"
                  value={produitSelectionne} 
                  onChange={handleProduitChange}
                >
                  <option value="">-- Sélectionner un produit --</option>
                  {produitsDisponibles.map(produit => (
                    <option key={produit.id} value={produit.id}>{produit.nom}</option>
                  ))}
                </select>
              </div>

              {produitSelectionne && (
                <div className="product-inputs">
                  <div className="input-group">
                    <div className="form-group">
                      <label className="input-label">Quantité:
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={nouveauProduit.quantite}
                          onChange={handleQuantiteChange}
                        />
                      </label>
                    </div>

                    <div className="form-group">
                    <label className="input-label">Prix unitaire:
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        value={nouveauProduit.prix}
                        onChange={handlePrixChange}
                      />
                      </label>
                    </div>

                    <button 
                      className="btn-add"
                      onClick={ajouterAuPanier}
                      disabled={!nouveauProduit.quantite || nouveauProduit.prix <= 0}
                    >
                      <i className="fas fa-shopping-cart"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="panier">
              {panier.map(produit => {
                const produitInfo = produitsDisponibles.find(p => p.id === produit.id);
                return (
                  <div 
                    key={produit.id} 
                    className="card-produit"
                    data-product-id={produit.id}
                  >
                    <div className="produit-header">
                      <div className="produit-info">
                        <h4>{produit.nom}</h4>
                        {produitInfo?.description && (
                          <p className="produit-description">{produitInfo.description}</p>
                        )}
                      </div>
                      <div className="produit-actions">
                        <button 
                          className="btn-delete"
                          onClick={() => supprimerProduit(produit.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="produit-details">
                      <span className="detail-item">
                        Quantité: 
                        <input
                          type="number"
                          min="1"
                          value={produit.quantite}
                          onChange={(e) => handleProductUpdate(produit.id, 'quantite', parseInt(e.target.value) || 0)}
                          className="inline-input"
                        />
                      </span>
                      <span className="detail-item">
                        Prix unitaire: 
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={produit.prix}
                          onChange={(e) => handleProductUpdate(produit.id, 'prix', parseFloat(e.target.value) || 0)}
                          className="inline-input"
                        />
                        FCFA
                      </span>
                      <span className="detail-item">
                        Total: {(produit.prix * produit.quantite).toFixed(2)} FCFA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


