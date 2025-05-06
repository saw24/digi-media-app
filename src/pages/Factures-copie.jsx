import { useEffect, useState } from "react";
import { FaEye, FaTrash, FaPrint } from 'react-icons/fa';
import API from '../services/api';
import NavMenu from '../components/NavMenu';
import '../assets/css/style.css';

export default function Factures() {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    // Modifier l'état initial pour définir le mois en cours par défaut
    const [filters, setFilters] = useState(() => {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        return {
            numeroFacture: '',
            //typeFacture: ['Facture'], // Valeur par défaut pour le type de facture
            typeFacture: [],
            etatPaiement: [],
            modePaiement: '',
            client: '',
            vendeur: '',
            siDeclaree: false,
            siMasquee: false,
            startDate: startDate,
            endDate: today.toISOString().split('T')[0],
            periode: 'Mois en cours'
        };
    });

    const handlePeriodeChange = (e) => {
        const periode = e.target.value;
        let startDate = '';
        let endDate = '';

        const today = new Date();

        switch (periode) {
            case 'Aujourdhui':
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
                break;
            case 'Hier':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                startDate = yesterday.toISOString().split('T')[0];
                endDate = startDate;
                break;
            case 'Semaine en Cours':
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay());
                startDate = firstDayOfWeek.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'Semaine Passée':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
                startDate = lastWeekStart.toISOString().split('T')[0];
                endDate = lastWeekEnd.toISOString().split('T')[0];
                break;
            case 'Mois en cours':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'Mois Passé':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                break;
            case 'Année en cours':
                startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'Année Passée':
                startDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
                break;
            default:
                break;
        }

        setFilters(prev => ({
            ...prev,
            periode,
            startDate,
            endDate
        }));
    };

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                const token = localStorage.getItem("token");
                const queryParams = new URLSearchParams();

                // Ajout des paramètres de filtrage initiaux
                if (filters.numeroFacture) {
                    queryParams.append('numeroFacture', filters.numeroFacture);
                }

                if (filters.typeFacture.length > 0) {
                    filters.typeFacture.forEach(type => {
                        queryParams.append('typeFacture', type);
                    });
                }

                if (filters.etatPaiement.length > 0) {
                    filters.etatPaiement.forEach(etat => {
                        queryParams.append('etatPaiement', etat);
                    });
                }

                if (filters.modePaiement) {
                    queryParams.append('modePaiement', filters.modePaiement);
                }

                if (filters.client) {
                    queryParams.append('client', filters.client);
                }

                if (filters.vendeur) {
                    queryParams.append('vendeur', filters.vendeur);
                }

                if (filters.startDate) {
                    queryParams.append('startDate', filters.startDate);
                }

                if (filters.endDate) {
                    queryParams.append('endDate', filters.endDate);
                }

                const res = await API.get(`/factures?${queryParams.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFactures(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des factures :", err);
                setError("Impossible de charger les factures.");
                setLoading(false);
            }
        };

        fetchFactures();
    }, [filters]); // Ajout de filters comme dépendance

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'En attente': 'badge badge-warning',
            'Validé': 'badge badge-success',
            'Annulé': 'badge badge-danger',
            'default': 'badge'
        };
        return statusClasses[status] || statusClasses.default;
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const queryParams = new URLSearchParams();

            // Ajout des paramètres de filtrage
            if (filters.numeroFacture) {
                queryParams.append('numeroFacture', filters.numeroFacture);
            }

            if (filters.typeFacture.length > 0) {
                filters.typeFacture.forEach(type => {
                    queryParams.append('typeFacture', type);
                });
            }

            if (filters.etatPaiement.length > 0) {
                filters.etatPaiement.forEach(etat => {
                    queryParams.append('etatPaiement', etat);
                });
            }

            if (filters.modePaiement) {
                queryParams.append('modePaiement', filters.modePaiement);
            }

            if (filters.client) {
                queryParams.append('client', filters.client);
            }

            if (filters.vendeur) {
                queryParams.append('vendeur', filters.vendeur);
            }

            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate);
            }

            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate);
            }

            queryParams.append('siDeclaree', filters.siDeclaree);
            queryParams.append('siMasquee', filters.siMasquee);

            const res = await API.get(`/factures?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFactures(res.data);
            setLoading(false);
            setShowFilterModal(false);
        } catch (err) {
            console.error("Erreur lors de l'application des filtres :", err);
            setError("Impossible d'appliquer les filtres.");
            setLoading(false);
        }
    };

    const [showCAModal, setShowCAModal] = useState(false);
    const [chiffreAffaires, setChiffreAffaires] = useState({
        coutAchat: 0,
        mht: 0,
        tva: 0,
        mttc: 0,
        encaisse: 0,
        dette: 0,
        charges: 0,
        benefice: 0
    });

    // Ajout de la fonction pour calculer le chiffre d'affaires
    const calculateCA = () => {
        const ca = factures.reduce((acc, facture) => {
            // Ne prendre en compte que les factures et reçus
            if (!['Facture', 'Recu'].includes(facture.Type_Doc)) {
                return acc;
            }

            // Conversion des valeurs en nombres
            const montantAchat = parseFloat(facture.montant_cout_achat) || 0;
            const mht = parseFloat(facture.MHT_Fact) || 0;
            const tva = parseFloat(facture.TVA_Fact) || 0;
            const mttc = parseFloat(facture.MTTC_Fact) || 0;
            const montantPaye = parseFloat(facture.Montant_Paye) || 0;
            const resteAPayer = parseFloat(facture.Reste_A_Payer) || 0;

            return {
                coutAchat: acc.coutAchat + montantAchat,
                mht: acc.mht + mht,
                tva: acc.tva + tva,
                mttc: acc.mttc + mttc,
                encaisse: acc.encaisse + montantPaye,
                dette: acc.dette + resteAPayer,
                charges: acc.charges + montantAchat,
                benefice: acc.benefice + (mht - montantAchat)
            };
        }, {
            coutAchat: 0,
            mht: 0,
            tva: 0,
            mttc: 0,
            encaisse: 0,
            dette: 0,
            charges: 0,
            benefice: 0
        });
        setChiffreAffaires(ca);
        setShowCAModal(true);
    };
    // Ajout d'une fonction utilitaire pour le formatage des nombres
    const formatNumber = (number) => {
        if (number === null || number === undefined) return '0';
        return parseFloat(number).toLocaleString('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Modification des fonctions de coloration
    const getTVAColor = (facture) => {
        return facture.si_tva_retenu ? '#98FB98' : '#FF6B6B';  // Vert si retenu, rouge sinon
    };

    const getBICColor = (facture) => {
        return facture.si_bic_retenu ? '#98FB98' : '#FF6B6B';  // Vert si retenu, rouge sinon
    };

    // Ajoutez cet état pour gérer la visibilité de la sidebar
    const [sidebarVisible, setSidebarVisible] = useState(false);


    // Ajout de la fonction pour calculer les totaux des colonnes
    const calculateColumnTotals = () => {
        return factures.reduce((acc, facture) => {
            return {
                totalMontantAchat: acc.totalMontantAchat + (parseFloat(facture.montant_cout_achat) || 0),
                totalMHT: acc.totalMHT + (parseFloat(facture.MHT_Fact) || 0),
                totalTVA: acc.totalTVA + (parseFloat(facture.TVA_Fact) || 0),
                totalMTTC: acc.totalMTTC + (parseFloat(facture.MTTC_Fact) || 0),
                totalCoutAchat: acc.totalCoutAchat + (parseFloat(facture.montant_cout_achat) || 0),
                totalMontantPaye: acc.totalMontantPaye + (parseFloat(facture.Montant_Paye) || 0),
                totalResteAPayer: acc.totalResteAPayer + (parseFloat(facture.Reste_A_Payer) || 0),
                totalRemise: acc.totalRemise + (parseFloat(facture.Remise_Fact) || 0),
                totalBIC: acc.totalBIC + (parseFloat(facture.BICMontant) || 0),
                totalBenefice: acc.totalBenefice + ((parseFloat(facture.MHT_Fact) || 0) - (parseFloat(facture.montant_cout_achat) || 0))
            };
        }, {
            totalMontantAchat: 0,
            totalMHT: 0,
            totalTVA: 0,
            totalMTTC: 0,
            totalMontantPaye: 0,
            totalResteAPayer: 0,
            totalCoutAchat: 0,
            totalRemise: 0,
            totalBIC: 0,
            totalBenefice: 0
        });
    };


    // Add these handler functions before the return statement
    const handleView = (facture) => {
        // Implement view logic here
        console.log('View facture:', facture.Num_Fact);
    };

    const handleDelete = (facture) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture N°${facture.Num_Fact} du client ${facture.Nom_clt} ?`)) {
            // Implement actual delete logic here
            console.log('Deleting facture:', facture.Num_Fact);
        }
    };

    // Add the print handler function before the return statement
    const handlePrint = (facture) => {
        // Implement print logic here
        console.log('Printing facture:', facture.Num_Fact);
    };



    // Ajout des états pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);// Valeur par défaut : 15

    // Fonction pour gérer le changement du nombre d'éléments par page
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Réinitialiser à la première page lors du changement
    };

    // Calcul des factures à afficher pour la page courante
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFactures = factures.slice(indexOfFirstItem, indexOfLastItem);


    // Fonction pour changer de page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Composant de pagination
    const Pagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(factures.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '20px',
                gap: '5px'
            }}>
                {/* Sélecteur du nombre d'éléments par page */}
                <div style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px', color: '#666' }}>
                        Éléments par page:
                    </label>
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        style={{
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Précédent
                </button>

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor: currentPage === number ? '#005B85' : 'white',
                            color: currentPage === number ? 'white' : 'black',
                            cursor: 'pointer'
                        }}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => paginate(Math.min(Math.ceil(factures.length / itemsPerPage), currentPage + 1))}
                    disabled={currentPage === Math.ceil(factures.length / itemsPerPage)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        backgroundColor: currentPage === Math.ceil(factures.length / itemsPerPage) ? '#f3f4f6' : 'white',
                        cursor: currentPage === Math.ceil(factures.length / itemsPerPage) ? 'not-allowed' : 'pointer'
                    }}
                >
                    Suivant
                </button>
            </div>
        );
    };

    return (
        <div className="page-container">
            <NavMenu />


            {/* Modal du chiffre d'affaires */}
            {showCAModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '400px'
                    }}>
                        <h2 style={{ marginBottom: '20px' }}>Chiffre d'affaires</h2>
                        {/* Modification de l'affichage des montants dans la modale */}
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Coût d'achat:</strong> {chiffreAffaires.coutAchat.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>M.H.T:</strong> {chiffreAffaires.mht.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>TVA:</strong> {chiffreAffaires.tva.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>MTTC:</strong> {chiffreAffaires.mttc.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Encaissé:</strong> {chiffreAffaires.encaisse.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Dette:</strong> {chiffreAffaires.dette.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '10px', color: 'red' }}>
                            <strong>Charges:</strong> {chiffreAffaires.charges.toLocaleString()} FCFA
                        </div>
                        <div style={{ marginBottom: '20px', color: chiffreAffaires.benefice >= 0 ? 'green' : 'red' }}>
                            <strong>Bénéfice:</strong> {chiffreAffaires.benefice.toLocaleString()} FCFA
                        </div>
                        <button
                            onClick={() => setShowCAModal(false)}
                            style={{
                                backgroundColor: '#005B85',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}





            <div style={{
                display: 'flex',
                width: '100%',
                height: 'calc(100vh - 64px)',
                marginTop: '10px'
            }}>
                {/* Filter Panel avec animation */}
                <div style={{
                    width: sidebarVisible ? '300px' : '0',
                    minWidth: sidebarVisible ? '300px' : '0',
                    backgroundColor: '#f8fafc',
                    borderRight: '1px solid #e5e7eb',
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    padding: sidebarVisible ? '0' : '0',
                    paddingTop: sidebarVisible ? '1rem' : '0',
                    transition: 'all 0.3s ease',
                    opacity: sidebarVisible ? 1 : 0,
                    visibility: sidebarVisible ? 'visible' : 'hidden',
                    marginTop: '0px',
                    position: 'absolute', // Changé de relative en position absolute
                    zIndex: 10  // Ajouté pour assurer que le panneau reste au-dessus
                }}>
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                    }}>
                        <button
                            type="submit"
                            onClick={handleFilterSubmit}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                backgroundColor: '#005B85',
                                color: 'white',
                                width: '100%',
                                cursor: 'pointer'
                            }}
                        >
                            Appliquer les filtres
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleFilterSubmit();
                        }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>N° Facture</label>
                                <input
                                    type="text"
                                    value={filters.numeroFacture}
                                    onChange={(e) => setFilters({ ...filters, numeroFacture: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.375rem'
                                    }}
                                    placeholder="Entrez le numéro de facture"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Période</label>
                                <select
                                    value={filters.periode}
                                    onChange={handlePeriodeChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.375rem',
                                        marginBottom: '1rem'
                                    }}
                                >
                                    <option value="">Sélectionner une période</option>
                                    <option value="Aujourdhui">Aujourd'hui</option>
                                    <option value="Hier">Hier</option>
                                    <option value="Semaine en Cours">Semaine en cours</option>
                                    <option value="Semaine Passée">Semaine passée</option>
                                    <option value="Mois en cours">Mois en cours</option>
                                    <option value="Mois Passé">Mois passé</option>
                                    <option value="Année en cours">Année en cours</option>
                                    <option value="Année Passée">Année passée</option>
                                </select>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date début</label>
                                        <input
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, periode: '' })}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.375rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date fin</label>
                                        <input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, periode: '' })}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.375rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <legend>Type facture</legend>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.typeFacture.includes('Facture')}
                                                onChange={(e) => {
                                                    const newTypeFacture = e.target.checked
                                                        ? [...filters.typeFacture, 'Facture']
                                                        : filters.typeFacture.filter(item => item !== 'Facture');
                                                    setFilters({ ...filters, typeFacture: newTypeFacture });
                                                }}
                                            />
                                            Facture
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.typeFacture.includes('Recu')}
                                                onChange={(e) => {
                                                    const newTypeFacture = e.target.checked
                                                        ? [...filters.typeFacture, 'Recu']
                                                        : filters.typeFacture.filter(item => item !== 'Recu');
                                                    setFilters({ ...filters, typeFacture: newTypeFacture });
                                                }}
                                            />
                                            Reçu
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.typeFacture.includes('Proforma')}
                                                onChange={(e) => {
                                                    const newTypeFacture = e.target.checked
                                                        ? [...filters.typeFacture, 'Proforma']
                                                        : filters.typeFacture.filter(item => item !== 'Proforma');
                                                    setFilters({ ...filters, typeFacture: newTypeFacture });
                                                }}
                                            />
                                            Proforma
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.typeFacture.includes('Bon de livraison')}
                                                onChange={(e) => {
                                                    const newTypeFacture = e.target.checked
                                                        ? [...filters.typeFacture, 'Bon de livraison']
                                                        : filters.typeFacture.filter(item => item !== 'Bon de livraison');
                                                    setFilters({ ...filters, typeFacture: newTypeFacture });
                                                }}
                                            />
                                            Bon de Livraison
                                        </label>
                                    </div>
                                </fieldset>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <legend>Etat paiement</legend>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.etatPaiement.includes('Payée')}
                                                onChange={(e) => {
                                                    const newEtatPaiement = e.target.checked
                                                        ? [...filters.etatPaiement, 'Payée']
                                                        : filters.etatPaiement.filter(item => item !== 'Payée');
                                                    setFilters({ ...filters, etatPaiement: newEtatPaiement });
                                                }}
                                            />
                                            Payées
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.etatPaiement.includes('Nouveau')}
                                                onChange={(e) => {
                                                    const newEtatPaiement = e.target.checked
                                                        ? [...filters.etatPaiement, 'Nouveau']
                                                        : filters.etatPaiement.filter(item => item !== 'Nouveau');
                                                    setFilters({ ...filters, etatPaiement: newEtatPaiement });
                                                }}
                                            />
                                            Paiement En Cours
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.etatPaiement.includes('Partiel')}
                                                onChange={(e) => {
                                                    const newEtatPaiement = e.target.checked
                                                        ? [...filters.etatPaiement, 'Partiel']
                                                        : filters.etatPaiement.filter(item => item !== 'Partiel');
                                                    setFilters({ ...filters, etatPaiement: newEtatPaiement });
                                                }}
                                            />
                                            Paiement partiel
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={filters.etatPaiement.includes('Non Payée')}
                                                onChange={(e) => {
                                                    const newEtatPaiement = e.target.checked
                                                        ? [...filters.etatPaiement, 'Non Payée']
                                                        : filters.etatPaiement.filter(item => item !== 'Non Payée');
                                                    setFilters({ ...filters, etatPaiement: newEtatPaiement });
                                                }}
                                            />
                                            Impayées
                                        </label>
                                    </div>
                                </fieldset>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mode Paiement</label>
                                <select
                                    value={filters.modePaiement}
                                    onChange={(e) => setFilters({ ...filters, modePaiement: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.375rem'
                                    }}
                                >
                                    <option value="">Tous</option>
                                    <option value="Espèces">Espèces</option>
                                    <option value="Chèque">Chèque</option>
                                    <option value="Virement">Virement</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Client</label>
                                <select
                                    value={filters.client}
                                    onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.375rem'
                                    }}
                                >
                                    <option value="">Tous</option>
                                    {/* Add client options dynamically */}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendeur</label>
                                <select
                                    value={filters.vendeur}
                                    onChange={(e) => setFilters({ ...filters, vendeur: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.375rem'
                                    }}
                                >
                                    <option value="">Tous</option>
                                    {/* Add vendeur options dynamically */}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <legend>Si Déclarée ?</legend>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="siDeclaree"
                                                checked={filters.siDeclaree === true}
                                                onChange={() => setFilters({ ...filters, siDeclaree: true })}
                                            />
                                            Oui
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="siDeclaree"
                                                checked={filters.siDeclaree === false}
                                                onChange={() => setFilters({ ...filters, siDeclaree: false })}
                                            />
                                            Non
                                        </label>
                                    </div>
                                </fieldset>

                                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <legend>Si Masquée ?</legend>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="siMasquee"
                                                checked={filters.siMasquee === true}
                                                onChange={() => setFilters({ ...filters, siMasquee: true })}
                                            />
                                            Oui
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="siMasquee"
                                                checked={filters.siMasquee === false}
                                                onChange={() => setFilters({ ...filters, siMasquee: false })}
                                            />
                                            Non
                                        </label>
                                    </div>
                                </fieldset>
                            </div>
                        </form>
                    </div>
                </div>


                {/* Contenu principal avec transition */}
                <div style={{
                    flex: 1,
                    transition: 'margin-left 0.3s ease',
                    marginLeft: sidebarVisible ? '300px' : '0', // Ajout de la marge dynamique
                    padding: '20px',
                    paddingLeft: sidebarVisible ? '20px' : '0px', // Ajout d'un padding plus important lorsque le menu est masqué
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'hidden'
                }}>
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '2rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #005B85',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <p style={{ color: '#666', margin: 0 }}>Chargement des données en cours...</p>
                        </div>
                    )}

                    {error ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#FF6B6B'
                        }}>
                            {error}
                        </div>
                    ) : factures.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#666'
                        }}>
                            Aucune facture trouvée
                        </div>
                    ) : (
                        <div>

                            {/* Ajout du compteur de lignes */}
                            <div style={{
                                marginBottom: '0px',
                                fontStyle: 'italic',
                                color: '#666',
                                float: 'right',
                            }}>
                                {factures.length} élément{factures.length > 1 ? 's' : ''} trouvé{factures.length > 1 ? 's' : ''}
                            </div>


                            {/* Table des factures */}
                            <div className="table-container" style={{
                                flex: 1,
                                paddingLeft: '1rem',
                                paddingRight: '1rem',
                                paddingBottom: '1rem',
                                overflowX: 'auto',
                                width: '100%',
                                maxWidth: '100%'
                            }}>
                                <table className="table" style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>N°</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Client</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Total Général</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Payée</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Reste</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Type</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>TVA</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>BIC</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Coût Achat</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Commission</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Bénéfice</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Etat Fact</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Remise</th>
                                            <th style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/*{factures.map((facture) => (*/}
                                        {currentFactures.map((facture) => (
                                            <tr
                                                key={facture.Num_Fact}
                                                style={{
                                                    backgroundColor: 'white',
                                                    transition: 'background-color 0.2s ease',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#97b7f8'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                            >
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb' }}>{facture.Num_Fact}</td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb' }}>
                                                    {new Date(facture.Date_Fact).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb' }}>{facture.Nom_clt}</td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                    {formatNumber(facture.MTTC_Fact)}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                    {formatNumber(facture.Montant_Paye) || 0}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                    {(facture.MTTC_Fact - (facture.Montant_Paye || 0)).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb' }}>{facture.Type_Doc}</td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right', backgroundColor: getTVAColor(facture) }}>
                                                    {formatNumber(facture.TVA_Fact) || 0}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right', backgroundColor: getBICColor(facture) }}>
                                                    {formatNumber(facture.BICMontant) || 0}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                    {formatNumber(facture.montant_cout_achat) || 0}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                    {facture.commission || 0}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                                                    {(facture.MTTC_Fact - (facture.montant_cout_achat || 0)).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb' }}>
                                                    <span className={getStatusBadgeClass(facture.Etat_Fact)}>
                                                        {facture.Etat_Fact}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.30rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                    {formatNumber(facture.Remise_Fact) || 0}
                                                </td>
                                                <td style={{
                                                    padding: '0.30rem',
                                                    textAlign: 'center',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleView(facture);
                                                        }}
                                                        style={{
                                                            padding: '8px',
                                                            marginRight: '8px',
                                                            border: 'none',
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            color: '#005B85'
                                                        }}
                                                        title="Voir"
                                                    >
                                                        <FaEye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrint(facture);
                                                        }}
                                                        style={{
                                                            padding: '8px',
                                                            marginRight: '8px',
                                                            border: 'none',
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            color: '#2563eb'  // Blue color for print icon
                                                        }}
                                                        title="Imprimer"
                                                    >
                                                        <FaPrint size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(facture);
                                                        }}
                                                        style={{
                                                            padding: '8px',
                                                            border: 'none',
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            color: '#dc2626'
                                                        }}
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Ajout de la ligne des totaux */}
                                        <tr style={{
                                            backgroundColor: '#f8fafc',
                                            fontWeight: 'bold',
                                            borderTop: '2px solid #e5e7eb'
                                        }}>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalMTTC)}</td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalMontantPaye)}</td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalResteAPayer)}</td>
                                            <td></td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalTVA)}</td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalBIC)}</td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalCoutAchat)}</td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(0)}</td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalBenefice)}</td>
                                            <td></td>
                                            <td style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatNumber(calculateColumnTotals().totalRemise)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {/* Ajout du composant de pagination */}
                                <Pagination />
                            </div>


                        </div>
                    )}
                </div>

                {/* Boutons flottants */}
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    zIndex: 1000
                }}>
                    {/* Bouton hamburger */}
                    <button
                        onClick={() => setSidebarVisible(!sidebarVisible)}
                        title="Afficher/Masquer Panneau des filtres"
                        style={{
                            position: 'fixed',
                            left: '5px',
                            top: '45px',
                            zIndex: 1000,
                            padding: '5px',
                            backgroundColor: '#005B85',
                            border: 'none',
                            borderRadius: '5%', // Rend le bouton circulaire
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)', // Ajoute une ombre portée
                            width: '40px', // Taille fixe
                            height: '40px' // Taille fixe
                        }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {sidebarVisible ? (
                                <>
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </>
                            ) : (
                                <>
                                    <path d="M3 12h18" />
                                    <path d="M3 6h18" />
                                    <path d="M3 18h18" />
                                </>
                            )}
                        </svg>
                    </button>


                    {/* Bouton Nouvelle Facture */}
                    <button
                        onClick={() => window.location.href = '/facture_fiche'}
                        title="Nouvelle facture"
                        style={{
                            backgroundColor: '#005B85',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-plus"></i>
                    </button>

                    {/* Bouton Chiffre d'affaires */}
                    <button
                        onClick={calculateCA}
                        title="Afficher le chiffre d'affaires"
                        style={{
                            backgroundColor: '#FFD700',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        €
                    </button>
                </div>
            </div>
        </div>
    );
}
