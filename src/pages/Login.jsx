import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import API from "../services/api";
import '../assets/css/Login.css'; // à inclure pour charger le style

export default function Login() {
  const navigate = useNavigate();
  const [login_user, setLoginUser] = useState("");
  const [mot_passe_user, setMotPasseUser] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { 
        login_user, 
        mot_passe_user 
      });
      localStorage.setItem("token", res.data.token);
      navigate('/accueil');
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage;
      
      switch (error.code) {
        case 'ERR_NETWORK':
          errorMessage = "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.";
          break;
        case 'ECONNABORTED':
          errorMessage = "La requête a pris trop de temps. Veuillez réessayer.";
          break;
        case 'ERR_BAD_REQUEST':
          errorMessage = "Identifiants invalides. Veuillez vérifier vos informations.";
          break;
        case 'ERR_CONNECTION_REFUSED':
          errorMessage = "Le serveur est inaccessible. Veuillez réessayer plus tard.";
          break;
        default:
          errorMessage = "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">Connexion</div>
        <p className="login-subheader">Système de Gestion de Factures</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="text"
            name="login"
            placeholder="Login" 
            value={login_user}
            onChange={(e) => setLoginUser(e.target.value)} 
            required
          />
          <input 
            type="password"
            name="password" 
            placeholder="Mot de passe" 
            value={mot_passe_user}
            onChange={(e) => setMotPasseUser(e.target.value)} 
            required
          />
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
