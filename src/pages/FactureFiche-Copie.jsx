import React, { useState, useEffect } from 'react';
import { ShoppingCart, History, Settings, Search, Plus, Minus, Trash2 } from 'lucide-react';
import NavMenu from '../components/NavMenu';
import '../assets/css/FactureFiche.css';
import API from '../services/api';



// Application principale
const POSApplication = () => {
  // États pour gérer les données
  const [cart, setCart] = useState([]);
  const [invoiceInfo, setInvoiceInfo] = useState({
    type: 'facture',
    paymentMode: 'espèces',
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    sellerName: '',
    bic: '',
    tvaAmount: null,
    tvaPercentage: 20,
    commission: 0,
    commissionPercentage: 0,
    remise: 0,
    remisePercentage: 0,
    bic: 0,
    bicPercentage: 0,
    si_declare: false,
    si_masque: false,
    commercialAgent: '',
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [newProduct, setNewProduct] = useState({
    id_prdt: '',
    Des_prdt: '',
    Prix_vente: 0,
    quantity: 1,
    Stock_prdt: 0,
    description_prdt: '',
    ref_prdt: ''
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
  function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FAC-${year}${month}${day}-${random}`;
  }

  // Calcul des montants
  const calculateTotals = () => {
    const mht = cart.reduce((total, item) => total + (item.Prix_vente * item.quantity), 0);
    const tva = mht * 0.2; // TVA à 20%
    const mttc = mht + tva;

    return {
      mht: mht.toFixed(2),
      tva: tva.toFixed(2),
      mttc: mttc.toFixed(2)
    };
  };

  //************* GESTION DES PRODUITS   *******//
  // Add useEffect to fetch products from backend
  /*useEffect(() => {
    fetchProducts();
  }, []);*/

   // Add new useEffect to fetch products when component mounts
   useEffect(() => {
    fetchDomains();
    // Fetch products for default domain on component mount
    fetchProductsByDomain('DO_2019.10.1511.38.43.50');
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await API.get('/domaines');
      setDomains(response.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const fetchProductsByDomain = async (domainCode) => {
    setIsLoading(true);
    try {
      const response = await API.get(`/produits/domain/${domainCode}`);
      const productsArray = Array.isArray(response.data) ? response.data : [];
      setAllProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products by domain:', error);
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
        product.ref_prdt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchTerm, allProducts]);



  // Gestion des produits
  const addToCart = (product) => {
    if (!product || !product.id_prdt) {
      alert('Produit invalide');
      return;
    }

    if (product.quantity < 1) {
      alert('La quantité doit être supérieure à 0');
      return;
    }

    const existingProductIndex = cart.findIndex(item => item.id_prdt === product.id_prdt);
    const productInStock = filteredProducts.find(p => p.id_prdt === product.id_prdt);

    if (!productInStock) {
      alert('Produit non trouvé');
      return;
    }

    const currentQuantityInCart = existingProductIndex !== -1 ? cart[existingProductIndex].quantity : 0;
    const totalRequestedQuantity = currentQuantityInCart + product.quantity;

    if (totalRequestedQuantity > productInStock.Stock_prdt) {
      alert(`Stock insuffisant. Stock disponible: ${productInStock.Stock_prdt}`);
      return;
    }

    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += product.quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, product]);
    }

    setNewProduct({
      id_prdt: '',
      Des_prdt: '',
      Prix_vente: 0,
      quantity: 1,
      description_prdt: '',
      Stock_prdt: 0
    });
    //setShowProductModal(false);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id_prdt !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const productInStock = filteredProducts.find(p => p.id_prdt === productId);

    if (!productInStock || newQuantity > productInStock.Stock_prdt) {
      alert(`Stock insuffisant. Stock disponible: ${productInStock?.Stock_prdt || 0}`);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id_prdt === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const selectProduct = (product) => {
    setNewProduct({
      id_prdt: product.id_prdt,
      Des_prdt: product.Des_prdt,
      Prix_vente: Number(product.Prix_vente),
      quantity: 1,
      Stock_prdt: Number(product.Stock_prdt),
      description_prdt: product.description_prdt
    });
  };

  // Finaliser la vente
  const completeSale = () => {
    const totals = calculateTotals();
    const sale = {
      ...invoiceInfo,
      items: [...cart],
      mht: totals.mht,
      tva: totals.tva,
      mttc: totals.mttc,
      timestamp: new Date().toISOString()
    };


    // Réinitialiser le panier et les infos de facturation
    setCart([]);
    setInvoiceInfo({
      ...invoiceInfo,
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      customerName: ''
    });

    // Afficher une confirmation
    alert('Vente enregistrée avec succès!');
  };

  const totals = calculateTotals();

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

  return (
    <div className="page-container">
      <NavMenu />


      <div className="main-content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Informations de Facture</h2>
            <button
              className="btn btn-success"
              onClick={completeSale}
              disabled={cart.length === 0}
            >
              Finaliser la Vente
            </button>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Type de Facture</label>
              <select
                className="form-control"
                value={invoiceInfo.type}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, type: e.target.value })}
              >
                <option value="facture">Facture</option>
                <option value="recu">Reçu</option>
                <option value="proforma">Proforma</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mode de Paiement</label>
              <select
                className="form-control"
                value={invoiceInfo.paymentMode}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, paymentMode: e.target.value })}
              >
                <option value="espèces">Espèces</option>
                <option value="virement">Virement</option>
                <option value="carte">Carte Bancaire</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Numéro de Facture</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.invoiceNumber}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, invoiceNumber: e.target.value })}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={invoiceInfo.date}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nom du Client</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.customerName}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, customerName: e.target.value })}
                placeholder="Nom du client"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Conditions de Paiement</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.customerName}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, customerName: e.target.value })}
                placeholder="Conditions de Paiement"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Validité</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.vatNumber || ''}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, vatNumber: e.target.value })}
                placeholder="Validité"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Garantie</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.vatNumber || ''}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, vatNumber: e.target.value })}
                placeholder="Garantie"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Délais de Livraison</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.vatNumber || ''}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, vatNumber: e.target.value })}
                placeholder="Délais de Livraison"
              />
            </div>



            <div className="form-group">
              <label className="form-label">Nom du Vendeur</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.sellerName}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, sellerName: e.target.value })}
                placeholder="Nom du vendeur"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Agent Commercial</label>
              <input
                type="text"
                className="form-control"
                value={invoiceInfo.commercialAgent}
                onChange={(e) => setInvoiceInfo({ ...invoiceInfo, commercialAgent: e.target.value })}
                placeholder="Nom du vendeur"
              />
            </div>
          </div>

        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Panier ({cart.length} articles)</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowProductModal(true)}
            >
              <Plus size={20} />
              Ajouter un Produit
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="empty-cart">Le panier est vide</p>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                  <tr>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id_prdt}>
                      <td>{item.Des_prdt || ''}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.Prix_vente || 0}
                          onChange={(e) => {
                            const newPrix_vente = parseFloat(e.target.value) || 0;
                            const updatedCart = cart.map(cartItem =>
                              cartItem.id_prdt === item.id_prdt ? { ...cartItem, Prix_vente: newPrix_vente } : cartItem
                            );
                            setCart(updatedCart);
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
                          value={item.quantity || 1}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            const updatedCart = cart.map(cartItem =>
                              cartItem.id_prdt === item.id_prdt ? { ...cartItem, quantity: newQuantity } : cartItem
                            );
                            setCart(updatedCart);
                          }}
                          min="1"
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>{((item.Prix_vente || 0) * (item.quantity || 1)).toFixed(2)} Fcfa</td>
                      <td>
                        <button
                          className="btn btn-icon"
                          onClick={() => removeFromCart(item.id_prdt)}
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
                          <span style={{ display: 'none' }}>Ref: {product.ref_prdt}</span>
                          <span>Stock: {product.Stock_prdt}</span>
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
                )  : (
                  <div className="no-results" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                    Aucun produit trouvé
                  </div>
                )}
              </div>

              {/* Détails du produit à ajouter */}
              {/* Détails du produit à ajouter */}
              <div className="product-form" style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ whiteSpace: 'nowrap' }}>Quantité</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      style={{ width: '80px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <label style={{ whiteSpace: 'nowrap' }}>Description</label>
                    <textarea
                      type="text"
                      className="form-control"
                      value={newProduct.description_prdt}
                      onChange={(e) => setNewProduct({ ...newProduct, description_prdt: e.target.value })}
                      placeholder="Description du produit"
                      style={{ width: '100%' }}
                    />
                    <button
                    className="btn btn-primary"
                    onClick={() => addToCart(newProduct)}
                    disabled={!newProduct.Des_prdt || newProduct.Prix_vente <= 0}
                    style={{ backgroundColor: '#007bff', display: 'flex', alignItems: 'center', gap: '5px' }}
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
                  value={invoiceInfo.commission || ''}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    setInvoiceInfo({
                      ...invoiceInfo,
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
                  value={invoiceInfo.commissionPercentage || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const amount = (percentage * total) / 100;
                    setInvoiceInfo({
                      ...invoiceInfo,
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
                  checked={invoiceInfo.si_declare || false}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, si_declare: e.target.checked })}
                />
                Déclaré
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={invoiceInfo.si_masque || false}
                  onChange={(e) => setInvoiceInfo({ ...invoiceInfo, si_masque: e.target.checked })}
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
            <p className="summary-text">Montant HT: {totals.mht} Fcfa</p>
            {/* Remise Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '5px' }}>
              <span>Remise:</span>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={invoiceInfo.remisePercentage || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const amount = (percentage * total) / 100;
                    setInvoiceInfo({
                      ...invoiceInfo,
                      remise: amount.toFixed(2),
                      remisePercentage: percentage
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
                  value={invoiceInfo.remise || ''}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    const total = parseFloat(totals.mht) || 0;
                    const percentage = total > 0 ? (amount / total) * 100 : 0;
                    setInvoiceInfo({
                      ...invoiceInfo,
                      remise: amount,
                      remisePercentage: percentage.toFixed(2)
                    });
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Montant"
                />
              </div>
              <span>Fcfa</span>
            </div>
            <p className="summary-text">Montant HT après remise: {(parseFloat(totals.mht) - (parseFloat(invoiceInfo.remise) || 0)).toFixed(2)} Fcfa</p>

            {/* TVA Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '5px' }}>
              <span>TVA:</span>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={invoiceInfo.tvaPercentage || '20'}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const mhtAfterRemise = parseFloat(totals.mht) - (parseFloat(invoiceInfo.remise) || 0);
                    const amount = (percentage * mhtAfterRemise) / 100;
                    setInvoiceInfo({
                      ...invoiceInfo,
                      tvaAmount: amount.toFixed(2),
                      tvaPercentage: percentage
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              <span>% =</span>
              <span>{(parseFloat(invoiceInfo.tvaPercentage || 20) * (parseFloat(totals.mht) - (parseFloat(invoiceInfo.remise) || 0)) / 100).toFixed(2)} Fcfa</span>
            </div>


            {/* BIC Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <span>BIC:</span>
              <div style={{ width: '80px' }}>
                <input
                  type="number"
                  className="form-control"
                  value={invoiceInfo.bicPercentage || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    const mhtAfterRemise = parseFloat(totals.mht) - (parseFloat(invoiceInfo.remise) || 0);
                    const total = mhtAfterRemise + (parseFloat(invoiceInfo.tvaAmount) || 0);
                    const amount = (percentage * total) / 100;
                    setInvoiceInfo({
                      ...invoiceInfo,
                      bic: amount.toFixed(2),
                      bicPercentage: percentage
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              <span>% =</span>
              <span>{invoiceInfo.bic || '0.00'} Fcfa</span>
            </div>

            {/* TTC Section */}
            <p className="summary-total">Montant TTC: {(
              parseFloat(totals.mht) -
              (parseFloat(invoiceInfo.remise) || 0) +
              (parseFloat(invoiceInfo.tvaPercentage || 20) * (parseFloat(totals.mht) - (parseFloat(invoiceInfo.remise) || 0)) / 100) +
              (parseFloat(invoiceInfo.bic) || 0)
            ).toFixed(2)} Fcfa</p>

          </div>
        </div>
      </div>
    </div>
  );

};

export default POSApplication;