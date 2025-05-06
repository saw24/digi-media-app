import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, History, Settings, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import NavMenu from '../components/NavMenu';
import '../assets/css/FactureFiche.css';
import API from '../services/api';



// Application principale
const Facture_Fiche = () => {
  // États pour gérer les données
  const [panier, setPanier] = useState([]);
  const [facture, setFacture] = useState({
    Type_Doc: 'Facture',
    Mode_Reglement: 'Espèces',
    Num_Fact: generateNum_Fact(),
    Date_Fact: new Date().toISOString().split('T')[0],
    Heure_Fact: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    Nom_clt: '',
    Vendeur_Fact: '',
    TVA_Fact: null,
    TVa_Pourcent: 0,
    part_commission: 0,
    commissionPercentage: 0,
    Remise_Fact: 0,
    RemisePourCent: 0,
    bic: 0,
    BICValeur: 0,
    si_declare: false,
    si_masque: false,
    code_agent: '',
    MHT_Fact: 0,
    MTTC_Fact: 0,
    Montant_Payee: 0,
    Reste_A_Payer: 0,
    BICMontant: 0,
    validite_fact: '',
    delai_livraison: '',
    garantie_fact: '',
    montant_cout_achat: 0,
    si_tva_retenu: false,
    si_bic_retenu: false,
    mode_paiement_digimedia: '',
    id_facture: 0,

  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [newProduct, setNewProduct] = useState({
    id_prdt: 0,
    Des_prdt: '',
    Prix_vente: 0,
    Qte_payee: 1,
    Stock_prdt: 0,
    description_prdt: '',
    Ref_prdt: '',
    cout_vente: 0,
    Prix_Achat: 0,
    code_prdt: '',
    TVA_prdt: 0,
    id_lignefacture: 0,
  });



  //const [filteredProducts, setFilteredProducts] = useState(demoProducts);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Add these new state variables at the top with other states
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Add new state for domains
  const [domains, setDomains] = useState([]);

  // Fonction pour générer un numéro de facture unique
  function generateNum_Fact() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FAC-${year}${month}${day}-${random}`;
  }

  // Calcul des montants
  const calculateTotals = () => {
    let mht = 0;
    let mhtAfterRemise = 0;
    let remise = 0;
    let commission = 0;
    let bic = 0;

    // Calculate total from panier items
    if (panier.length > 0) {
      mht = panier.reduce((total, item) => {
        const price = Number(item.Prix_vente) || 0;
        const quantity = Number(item.Qte_payee) || 0;
        return total + (price * quantity);
      }, 0);
      mhtAfterRemise = mht;
    }

    // Calculate remise if applicable
    if (facture.RemisePourCent > 0) {
      remise = mht * (facture.RemisePourCent / 100);
      mhtAfterRemise = mht - remise;
    }


    // Calculate commission if applicable
    if (facture.commissionPercentage > 0) {
      commission = mhtAfterRemise * (facture.commissionPercentage / 100);
    }

    // Calculate TVA
    const tva = mhtAfterRemise * (Number(facture.TVa_Pourcent) / 100);


    // Calculate BIC if applicable
    if (facture.BICValeur > 0) {
      bic = (mhtAfterRemise + tva) * (facture.BICValeur / 100);
    }

    const mttc = mhtAfterRemise + tva + bic;

    // Set the calculated values in the facture object
    /*setFacture(prev => ({
      ...prev,
      MHT_Fact: mht.toFixed(2),
      Remise_Fact: remise.toFixed(2), 
      TVA_Fact: tva.toFixed(2),
      part_commission: commission.toFixed(2),
      BICMontant: bic.toFixed(2),
      MTTC_Fact: mttc.toFixed(2),
    }));*/


    return {
      mht: mht.toFixed(2),
      remise: remise.toFixed(2),
      mhtAfterRemise: mhtAfterRemise.toFixed(2),
      tva: tva.toFixed(2),
      commission: commission.toFixed(2),
      bic: bic.toFixed(2),
      mttc: mttc.toFixed(2)
    };
  };

  //************* GESTION DES PRODUITS   *******//
  // -----products by Domaine
  useEffect(() => {
    fetchDomains();
    fetchProductsByDomain('DO_2019.10.1511.38.43.50');
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await API.get('/domaine');
      setDomains(response.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const fetchProductsByDomain = async (domainCode) => {
    setIsLoading(true);
    try {
      const response = await API.get(`/produit/domain/${domainCode}`, {
        timeout: 30000, // Set timeout to 30 seconds
      });
      const productsArray = Array.isArray(response.data) ? response.data : [];
      setAllProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products by domain:', error);
      // More descriptive error handling
      if (error.code === 'ECONNABORTED') {
        alert('La requête a pris trop de temps. Veuillez réessayer.');
      } else {
        alert('Erreur lors du chargement des produits. Veuillez réessayer.');
      }
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDomainChange = (e) => {
    const domainCode = e.target.value;
    fetchProductsByDomain(domainCode);
  };


  // Update search effect to use backend data
  // Replace the search effect with local filtering
  useEffect(() => {
    if (searchTerm) {
      const filtered = allProducts.filter(product =>
        product.Des_prdt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.Ref_prdt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchTerm, allProducts]);



  // Ajout produits au Panier
  const addToCart = (product) => {
    if (!product || !product.Ref_prdt) {
      toast.error('Produit invalide');
      return;
    }
  
    if (product.Qte_payee < 1) {
      toast.warn('La quantité doit être supérieure à 0');
      return;
    }
  
    const existingProductIndex = panier.findIndex(item => item.Ref_prdt === product.Ref_prdt);
    const productInStock = filteredProducts.find(p => p.ref_prdt === product.Ref_prdt);
  
    if (!productInStock) {
      toast.error('Produit non trouvé');
      return;
    }
  
    const currentQuantityInCart = existingProductIndex !== -1 ? panier[existingProductIndex].Qte_payee : 0;
    const totalRequestedQuantity = currentQuantityInCart + product.Qte_payee;
  
    if (totalRequestedQuantity > productInStock.Stock_prdt) {
      toast.warn(`Stock insuffisant. Stock disponible: ${productInStock.Stock_prdt}`);
      return;
    }
  
    if (existingProductIndex !== -1) {
      const updatedCart = [...panier];
      updatedCart[existingProductIndex].Qte_payee += product.Qte_payee;
      setPanier(updatedCart);
      toast.warn('Quantité mise à jour dans le panier');
    } else {
      setPanier([...panier, { ...product }]);
      //toast.success('Produit ajouté au panier');
    }
  
    
  
    setNewProduct({
      id_prdt: '',
      Des_prdt: '',
      Prix_vente: 0,
      Qte_payee: 1,
      description_prdt: '',
      Stock_prdt: 0,
      Ref_prdt: '',
      cout_vente: 0,
      Prix_Achat: 0,
      code_prdt: '',
      TVA_prdt: 0,
      id_lignefacture: 0,
    });
  };
  

  const removeFromCart = (productId) => {
    console.log('Removing product:', productId); // Add debug log
    if (!productId) {
      console.log('No product ID provided'); // Add validation log
      return;
    }
    setPanier(prevPanier => {
      console.log('Previous cart:', prevPanier); // Add state log
      const newPanier = prevPanier.filter(item => item.Ref_prdt !== productId);
      console.log('New cart:', newPanier); // Add result log
      return newPanier;
    });
  };



  const selectProduct = (product) => {
    setNewProduct({
      id_prdt: product.id_prdt,
      Des_prdt: product.Des_prdt,

      Prix_vente: Number(product.Prix_vente),
      Qte_payee: 1,
      Stock_prdt: Number(product.Stock_prdt),
      description_prdt: product.description_prdt,
      Ref_prdt: product.ref_prdt,
      cout_vente: product.cout_vente,

      Prix_Achat: Number(product.Prix_Achat),
      code_prdt: product.code_prdt,
      TVA_prdt: product.TVA_prdt,
    });
  };



  const totals = calculateTotals();


  //----- GESTION DES MODALS
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.modal-title')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setModalPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);


  //*************** GESTION DES COMBOS *****************/
  //----- COMBO CLIENT ---/
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  // Add this effect to fetch clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await API.get('/client');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  // Add this handler for client selection
  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setFacture(prev => ({
      ...prev,
      Nom_clt: e.target.value
    }));
  };


  //---- COMBO AGENT Commercial */
  const [selectedAgentComm, setSelectedAgentComm] = useState('');
  const [AgentComms, setAgentComms] = useState([]);

  useEffect(() => {
    const fetchAgentComms = async () => {
      try {
        const response = await API.get('/user');
        setAgentComms(response.data);
      } catch (error) {
        console.error('Error fetching AgentComms:', error);
      }
    };
    fetchAgentComms();
  }, []);

  //**** Vendeur // useEffect to set the vendor when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setFacture(prev => ({
          ...prev,
          Vendeur_Fact: decodedToken.login_user
        }));
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);




  //******  GESTION CONSULTATION D'UNE FACTURE */





  //** Cnsultation d'une facture */
  const { num_fact } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchFacture = async () => {
      try {
        const token = localStorage.getItem("token");
        //const response = await API.get(`/facture/${encodeURIComponent(num_fact)}`, {
        const response = await API.get(`/facture/lignes/${encodeURIComponent(num_fact)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Set facture with existing facture data
        if (response.data) {
          
          setFacture({
            id_facture: response.data.id_facture || 0,
            Type_Doc: response.data.Type_Doc || 'Facture',
            Mode_Reglement: response.data.Mode_Reglement || 'Espèces',
            Num_Fact: response.data.Num_Fact || generateNum_Fact(),
            Date_Fact: response.data.Date_Fact ? response.data.Date_Fact.substring(0, 10) : new Date().toISOString().split('T')[0],
            Heure_Fact: response.data.Heure_Fact ? response.data.Heure_Fact.substring(0, 5) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            Nom_clt: response.data.Nom_clt || '',
            Vendeur_Fact: response.data.Vendeur_Fact || '',
            TVA_Fact: response.data.TVA_Fact || 0,
            TVa_Pourcent: response.data.TVa_Pourcent || 0,
            part_commission: response.data.part_commission || 0,
            commissionPercentage: response.data.Taux_Commission || 0,
            Remise_Fact: response.data.Remise_Fact || 0,
            RemisePourCent: response.data.RemisePourCent || 0,
            BICMontant: response.data.BICMontant || 0,
            BICValeur: response.data.BICValeur || 0,
            si_declare: response.data.si_declare || false,
            si_masque: response.data.si_masque || false,
            code_agent: response.data.code_agent || '',
            validite_fact: response.data.validite_fact || '',
            delai_livraison: response.data.delai_livraison || '',
            garantie_fact: response.data.garantie_fact || '',
            montant_cout_achat: response.data.montant_cout_achat || 0,
            si_tva_retenu: response.data.si_tva_retenu || false,
            si_bic_retenu: response.data.si_bic_retenu || false,
            mode_paiement_digimedia: response.data.mode_paiement_digimedia || '',
            MHT_Fact: response.data.MHT_Fact || 0,
            MTTC_Fact: response.data.MTTC_Fact || 0,
            Montant_Payee: response.data.Montant_Payee || 0,
            Reste_A_Payer: response.data.Reste_A_Payer || 0,

          });
          console.log("Date_Fact:", response.data.Date_Fact)
          console.log("Heure_Fact:", response.data.Heure_Fact)
        }

        // Initialize panier with invoice lines if they exist
        if (response.data?.lignes) {
          setPanier(response.data.lignes);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Failed to load invoice details");
        setLoading(false);
      }
    };

    if (num_fact) {
      fetchFacture();
    }
  }, [num_fact]);
  

  /*useEffect(() => {
    console.log('✅ Panier mis à jour :', panier);
  }, [panier]);*/
  


  if (loading && num_fact) {
    return (
      <div className="page-container">
        <NavMenu />
        <div className="main-content">
          <div className="card">
            <div className="loading-spinner">Chargement en cours...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <NavMenu />
        <div className="main-content">
          <div className="card">
            <div className="error-message">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }



  //******* ENREGISTREMENT DE LA FACTURE  **********/
  const enregistrementFacture = async () => {
    try {
      const totals = calculateTotals();

      // Prepare the facture data
      const factureData = {
        ...facture,
        lignes: panier.map(item => ({
          id_prdt: item.Ref_prdt ,
          Des_prdt: item.Des_prdt,
          Prix_vente: item.Prix_vente,
          Qte_payee: item.Qte_payee,
          description_prdt: item.description_prdt,
          Ref_prdt: item.Ref_prdt,
          cout_vente: item.cout_vente,
          Prix_Achat: item.Prix_Achat,
          code_prdt: item.code_prdt,
          TVA_prdt: item.TVA_prdt
        })),
        MHT_Fact: parseFloat(totals.mht),
        TVA_Fact: parseFloat(totals.tva),
        MTTC_Fact: parseFloat(totals.mttc),
        Remise_Fact: parseFloat(totals.remise),
        BICMontant: parseFloat(totals.bic),
        part_commission: parseFloat(totals.commission)
      };

      

      // Save the facture
      /*const response = facture.id_facture == 0
        ? await API.post(`/facture/ajout/`, factureData)
        : await API.put(`/facture/modif/${encodeURIComponent(facture.Num_Fact)}`, factureData);*/
        let response;
    if (facture.id_facture === 0) {
      response = await API.post('/facture/ajout', factureData);
    } else {
      // Fix the update endpoint
      response = await API.put(`/facture/modif/${encodeURIComponent(facture.Num_Fact)}`, factureData);
    }

      if (response.status === 201 || response.status === 200) {
        // Clear the form
        setPanier([]);
        setFacture({
          Type_Doc: 'Facture',
          Mode_Reglement: 'Espèces',
          Num_Fact: generateNum_Fact(),
          Date_Fact: new Date().toISOString().split('T')[0],
          Heure_Fact: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          Nom_clt: '',
          Vendeur_Fact: '',
          TVA_Fact: null,
          TVa_Pourcent: '',
          part_commission: '',
          commissionPercentage: '',
          Remise_Fact: '',
          RemisePourCent: '',
          bic: '',
          BICValeur: '',
          si_declare: false,
          si_masque: false,
          code_agent: '',
          MHT_Fact: 0,
          MTTC_Fact: 0,
          Montant_Payee: 0,
          Reste_A_Payer: 0,
          BICMontant: 0,
          validite_fact: '',
          delai_livraison: '',
          garantie_fact: '',
          montant_cout_achat: 0,
          si_tva_retenu: false,
          si_bic_retenu: false,
          mode_paiement_digimedia: '',
        });

        // Show success message
        toast.success('Facture enregistrée avec succès!');

        // Navigate to the factures list or the new facture's detail page
        navigate(`/factures/${encodeURIComponent(response.data.Num_Fact)}`);
      }
    } catch (error) {
      console.error('Error saving facture:', error);
      alert('Erreur lors de l\'enregistrement de la facture. Veuillez réessayer.');
    }
  };












  return (
    <div className="page-container">
      <NavMenu />


      <div className="main-content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Informations de Facture</h2>
            <button
              className="btn btn-success"
              onClick={enregistrementFacture}
              disabled={panier.length === 0}
            >
              Enregistrer
            </button>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Type de Facture</label>
              <select
                className="form-control"
                value={facture.Type_Doc}
                onChange={(e) => setFacture({ ...facture, type: e.target.value })}
              >
                <option value="Proforma">Proforma</option>
                <option value="Facture">Facture</option>
                <option value="Recu">Reçu</option>
                <option value="Bon de livraison">Bon de Livraison</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mode de Paiement</label>
              <select
                className="form-control"
                value={facture.Mode_Reglement}
                onChange={(e) => setFacture({ ...facture, Mode_Reglement: e.target.value })}
              >
                <option value="Espèces">Espèces</option>
                <option value="Virement">Virement</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Numéro de Facture</label>
              <input
                type="text"
                className="form-control"
                value={facture.Num_Fact}
                onChange={(e) => setFacture({ ...facture, Num_Fact: e.target.value })}
                readOnly
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={facture.Date_Fact}
                    onChange={(e) => setFacture({ ...facture, Date_Fact: e.target.value })}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label">Heure</label>
                  <input
                    type="time"
                    className="form-control"
                    value={facture.Heure_Fact}
                    onChange={(e) => {
                      setFacture({ ...facture, Heure_Fact: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nom du Client</label>
              <select
                value={facture ? facture.Nom_clt : ''}
                onChange={(e) => {
                  setFacture({ ...facture, Nom_clt: e.target.value });
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#374151'
                }}
              >
                <option value="">Selectionner un client</option>
                {clients.map(client => (
                  <option key={client.Num_clt} value={client.Nom_clt}>
                    {client.Nom_clt}
                  </option>
                ))}
              </select>

            </div>

            <div className="form-group">
              <label className="form-label">Conditions de Reglement</label>
              <input
                type="text"
                className="form-control"
                value={facture ? facture.condition_reglement : ''}
                onChange={(e) => setFacture({ ...facture, Nom_clt: e.target.value })}
                placeholder="Conditions de Paiement"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Validité</label>
              <input
                type="text"
                className="form-control"
                value={facture ? facture.validite_fact : ''}
                onChange={(e) => setFacture({ ...facture, vatNumber: e.target.value })}
                placeholder="Validité"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Garantie</label>
              <input
                type="text"
                className="form-control"
                value={facture ? facture.garantie_fact : ''}
                onChange={(e) => setFacture({ ...facture, vatNumber: e.target.value })}
                placeholder="Garantie"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Délais de Livraison</label>
              <input
                type="text"
                className="form-control"
                value={facture ? facture.delai_livraison : ''}
                onChange={(e) => setFacture({ ...facture, vatNumber: e.target.value })}
                placeholder="Délais de Livraison"
              />
            </div>



            <div className="form-group">
              <label className="form-label">Vendeur</label>
              <input
                type="text"
                className="form-control"
                value={facture ? facture.Vendeur_Fact : ''}
                onChange={(e) => setFacture({ ...facture, Vendeur_Fact: e.target.value })}
                placeholder="Nom du vendeur"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Agent Commercial</label>
              <select type="text"
                className="form-control"
                value={facture ? facture.code_agent : ''}
                onChange={(e) => setFacture({ ...facture, code_agent: e.target.value })}
                placeholder="Nom du vendeur">
                <option value="">Selectionner un agent</option>
                {AgentComms.map(agent => (
                  <option key={agent.code_user} value={agent.code_user}>
                    {agent.nom_user}
                  </option>
                ))}

              </select>
            </div>
          </div>

        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Panier ({panier.length} articles)</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowProductModal(true)}
            >
              <Plus size={20} />
              Ajouter un Produit
            </button>
          </div>


          {(panier.length === 0 && (!facture?.lignes || facture.lignes.length === 0)) ? (
            <p className="empty-cart">Le panier est vide</p>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                  <tr>
                    <th>Référence</th>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {panier.map(item => (
                    <tr key={item.Ref_prdt || item.Ref_prdt }>
                      <td>{item.Ref_prdt || ''}</td>
                      <td>{item.Des_prdt || ''}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.Prix_vente || 0}
                          onChange={(e) => {
                            const newPrice = e.target.valueAsNumber || 0;
                            const updatedCart = panier.map(cartItem =>
                              (cartItem.Ref_prdt  === item.Ref_prdt )
                                ? { ...cartItem, Prix_vente: newPrice }
                                : cartItem
                            );
                            setPanier(updatedCart);
                            // Update facture state if it exists
                            if (facture) {
                              setFacture({
                                ...facture,
                                lignes: updatedCart
                              });
                            }
                            // Recalculate totals after quantity update
                            calculateTotals();
                          }}
                          min="0"
                          step="0.01"
                          style={{ width: '100px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.Qte_payee || 1}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 0;
                            const updatedCart = panier.map(cartItem =>
                              (cartItem.Ref_prdt  === item.Ref_prdt )
                                ? { ...cartItem, Qte_payee: newQuantity }
                                : cartItem
                            );
                            setPanier(updatedCart);
                            // Update facture state if it exists
                            if (facture) {
                              setFacture({
                                ...facture,
                                lignes: updatedCart
                              });
                            }
                            // Recalculate totals after quantity update
                            calculateTotals();
                          }}
                          min="0"
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>{((item.Prix_vente || 0) * (item.Qte_payee || 1)).toFixed(2)} Fcfa</td>
                      <td>
                        <button
                          className="btn btn-icon"
                          onClick={() => {
                            console.log('Item being removed:', item);
                            removeFromCart(item.Ref_prdt);
                          }}
                        >
                          <Trash2 size={16} color="red" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {showProductModal && (
          <div className="modal-overlay" style={{ zIndex: 1500 }}>
            <div className="modal-container"
              style={{
                transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
                cursor: isDragging ? 'grabbing' : 'default',
                position: 'absolute',
                userSelect: 'none',
                zIndex: 1600
              }}
              onMouseDown={handleMouseDown}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0',
                padding: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  <select
                    className="form-control"
                    name="domainePrdt"
                    id="domainePrdt"
                    onChange={handleDomainChange}
                    defaultValue="DO_2019.10.1511.38.43.50"
                  >
                    {domains.map(domain => (
                      <option key={domain.code_domaine} value={domain.code_domaine}>
                        {domain.nom_domaine}
                      </option>
                    ))}
                  </select>
                  {isLoading ? 'Actualisation...' : ''}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="modal-total" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#0d6efd'
                  }}>
                    TTC: {totals.mttc}
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowProductModal(false)}
                  >
                    X
                  </button>
                </div>
              </div>

              {/* Recherche de produit */}
              <div className="search-container">
                <div className="search-input-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher par nom ou code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="search-icon" size={18} />
                </div>
              </div>

              {/* Résultats de recherche */}
              <div className="search-results" style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa',
                marginTop: '10px',
                marginBottom: '10px'
              }}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={`product-${product.id_prdt}`}
                      className="product-item"
                      onClick={() => selectProduct(product)}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        backgroundColor: newProduct.id_prdt === product.id_prdt ? '#e3f2fd' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div className="product-name" style={{
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          flex: '2'
                        }}>
                          {product.Des_prdt}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '15px',
                          color: '#666',
                          fontSize: '0.9em',
                          flex: '1',
                          justifyContent: 'flex-end'
                        }}>
                          <span style={{ display: 'none' }}>ID: {product.id_prdt}</span>
                          <span style={{ display: 'none' }}>code_prdt: {product.code_prdt}</span>
                          <span style={{ display: 'none' }}>Ref: {product.ref_prdt}</span>
                          <span style={{ display: 'none' }}>Prix_Achat: {product.Prix_Achat}</span>
                          <span style={{ display: 'none' }}>cout_vente: {product.cout_vente}</span>
                          <span >Stock: {product.Stock_prdt}</span>
                          <span style={{
                            color: '#2196f3',
                            fontWeight: '500',
                            minWidth: '100px',
                            textAlign: 'right'
                          }}>
                            {(product.Prix_vente || 0).toFixed(2)} Fcfa
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                    Aucun produit trouvé
                  </div>
                )}
              </div>

              {/* Détails du produit à ajouter */}
              <div className="product-form" style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '15px',
                  width: '100%',
                  flexWrap: 'wrap'
                }}>
                  {/* Premier groupe - Prix */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: '1 0 calc(50% - 15px)',
                    minWidth: '150px'
                  }}>
                    <label style={{ whiteSpace: 'nowrap' }}>Prix (Fcfa)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProduct.Prix_vente}
                      onChange={(e) => setNewProduct({ ...newProduct, Prix_vente: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      style={{ width: '100px' }}
                    />
                  </div>

                  {/* Deuxième groupe - Quantité */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: '1 0 calc(50% - 15px)',
                    minWidth: '150px'
                  }}>
                    <label style={{ whiteSpace: 'nowrap' }}>Quantité</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProduct.Qte_payee}
                      onChange={(e) => setNewProduct({ ...newProduct, Qte_payee: parseInt(e.target.value) || 1 })}
                      min="1"
                      style={{ width: '80px' }}
                    />
                  </div>

                  {/* Troisième groupe - Description + Bouton */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: '1 0 100%',
                    '@media (minWidth: 768px)': {
                      flex: '1 0 0',
                    }
                  }}>
                    <label style={{ whiteSpace: 'nowrap' }}>Description</label>
                    <textarea
                      type="text"
                      className="form-control"
                      value={newProduct.description_prdt}
                      onChange={(e) => setNewProduct({ ...newProduct, description_prdt: e.target.value })}
                      placeholder="Description du produit"
                      style={{ width: '100%', minWidth: '150px' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(newProduct)}
                      disabled={!newProduct.Des_prdt || newProduct.Prix_vente <= 0}
                      style={{
                        backgroundColor: '#007bff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <ShoppingCart size={20} color="white" />
                    </button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}


        {/* Section Totaux */}
        <div className="summary-section" style={{

          bottom: '0',
          left: '0',
          right: '0',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: window.innerWidth <= 768 ? 'stretch' : 'flex-start',
          zIndex: 1000
        }}>
          <div className="panel-left" style={{
            textAlign: 'left',
            flex: '1',
            paddingLeft: '20px'
          }}>
            {/* Commission Section */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <label>Commission</label>
              <div style={{ width: '120px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={facture.part_commission || ''}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    setFacture({
                      ...facture,
                      commission: amount,
                      commissionPercentage: percentage.toFixed(2)
                    });
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Montant"
                />
              </div>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={facture.commissionPercentage || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const amount = (percentage * total) / 100;
                    setFacture({
                      ...facture,
                      commission: amount.toFixed(2),
                      commissionPercentage: percentage
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              <span>Fcfa</span>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={facture.si_declare || false}
                  onChange={(e) => setFacture({ ...facture, si_declare: e.target.checked })}
                />
                Déclaré
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={facture.si_masque || false}
                  onChange={(e) => setFacture({ ...facture, si_masque: e.target.checked })}
                />
                Masqué
              </label>
            </div>
          </div>

          <div className="panel-right" style={{
            textAlign: 'right',
            flex: '1',
            paddingRight: '20px'
          }}>
            <p className="summary-text">Montant HT: {calculateTotals().mht}  Fcfa</p>
            {/* Remise Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '5px' }}>
              <span>Remise:</span>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={facture.RemisePourCent || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const amount = (percentage * total) / 100;
                    setFacture({
                      ...facture,
                      remise: amount.toFixed(2),
                      RemisePourCent: percentage
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              <span>% =</span>
              <div style={{ width: '120px', justifyContent: 'flex-end' }}>
                <input
                  type="number"
                  className="form-control"
                  value={calculateTotals().Remise_Fact}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    setFacture({
                      ...facture,
                      remise: amount,
                      RemisePourCent: percentage.toFixed(2)
                    });
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Montant"
                />
              </div>
              <span>Fcfa</span>
            </div>
            <p className="summary-text">Montant HT après remise: {calculateTotals().mhtAfterRemise} Fcfa</p>

            {/* TVA Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '5px' }}>
              <span>TVA:</span>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={facture.TVa_Pourcent || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const mhtAfterRemise = parseFloat(totals.mht) - (parseFloat(facture.Remise_Fact) || 0);
                    const amount = (percentage * mhtAfterRemise) / 100;
                    console.log('TVa_Pourcent', percentage);
                    console.log('mht', totals.mht);
                    console.log('remise', facture.Remise_Fact);
                    console.log('mhtAfterRemise', mhtAfterRemise);
                    console.log('TVA_Fact', amount);

                    setFacture({
                      ...facture,
                      TVA_Fact: amount,
                      TVa_Pourcent: percentage
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              <span>% =</span>

              <span>
                {calculateTotals().tva} Fcfa
              </span>
            </div>


            {/* BIC Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <span>BIC:</span>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={facture.BICValeur}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const mhtAfterRemise = parseFloat(totals.mht) - (parseFloat(facture.Remise_Fact) || 0);
                    const total = mhtAfterRemise + (parseFloat(facture.TVA_Fact) || 0);
                    const amount = (percentage * total) / 100;
                    setFacture({
                      ...facture,
                      bic: amount.toFixed(2),
                      BICValeur: percentage
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              <span>% =</span>
              <span>{calculateTotals().bic} Fcfa</span>
            </div>

            {/* TTC Section */}
            <p className="summary-total">Montant TTC: {calculateTotals().mttc} Fcfa</p>

          </div>
        </div>
      </div>
    </div>
  );

};

export default Facture_Fiche;