import React from 'react';
import NavMenu from '../components/NavMenu';
import '../assets/css/style.css';

export default function Accueil() {
  return (
    <div className="page-container">
      <NavMenu />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Tableau de bord</h1>
        
        <div className="card-grid">
          <div className="card">
            <h3 className="card-title">Factures du mois</h3>
            <p className="card-value primary">45</p>
            <p className="card-desc">Total: 12,500,000 XAF</p>
          </div>
          
          <div className="card">
            <h3 className="card-title">Factures impayées</h3>
            <p className="card-value danger">8</p>
            <p className="card-desc">Montant: 2,300,000 XAF</p>
          </div>
          
          <div className="card">
            <h3 className="card-title">Stock faible</h3>
            <p className="card-value warning">5</p>
            <p className="card-desc">Produits à commander</p>
          </div>

          <div className="card">
            <h3 className="card-title">Clients actifs</h3>
            <p className="card-value primary">28</p>
            <p className="card-desc">Ce mois</p>
          </div>
        </div>

        <div className="recent-activity">
          <h2 className="section-title">Activités récentes</h2>
          <div className="activity-box">
            <div className="activity-item">
              <p className="activity-title">Nouvelle facture #F00123/2024</p>
              <p className="activity-meta">Il y a 30 minutes - 450,000 XAF</p>
            </div>
            <div className="activity-item">
              <p className="activity-title">Stock mis à jour - Produit X</p>
              <p className="activity-meta">Il y a 2 heures</p>
            </div>
            <div className="activity-item">
              <p className="activity-title">Paiement reçu - Client Y</p>
              <p className="activity-meta">Il y a 3 heures - 850,000 XAF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
