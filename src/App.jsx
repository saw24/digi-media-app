import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login.jsx';
import Accueil from './pages/Accueil.jsx';
import Factures from './pages/Factures.jsx';
import Facture_Fiche from './pages/Facture_Fiche.jsx';
//import './App.css'

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/factures" element={<Factures />} />
          <Route path="/factures/:num_fact" element={<Factures />} />
          <Route path="/facture_fiche" element={<Facture_Fiche />} />
          <Route path="/facture_fiche/:num_fact" element={<Facture_Fiche />} />
        </Routes>

        {/* ✅ Container global pour afficher les notifications */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </>
    </Router>
  );
}

export default App;
