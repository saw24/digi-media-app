import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/css/NavMenu.css';

const NavMenu = () => {
    const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);

    const location = useLocation();

    const pageTitles = {
        '/accueil': 'Tableau de bord',
        '/factures': 'Factures',
        '/facture_fiche': 'Facture Fiche',
        '/facture_fiche/:num_fact': 'Facture Fiche',
        '/clients': 'Liste des clients',
        '/produits': 'Catalogue produits',
        '/parametres': 'Paramètres',
    };

    const currentTitle = pageTitles[location.pathname] || 'Fiche';

    const menuItems = [
        { icon: 'fa-home', label: 'Accueil', link: '/accueil', color: '#f97316' },
        { icon: 'fa-file-invoice', label: 'Factures', link: '/factures', color: '#6d28d9' },
        //{ icon: 'fa-file-invoice', label: 'Nouvelle Facture', link: '/facture_fiche', color: '#6d28d9' },
        { icon: 'fa-users', label: 'Clients', link: '/clients', color: '#06b6d4' },
        { icon: 'fa-box', label: 'Produits', link: '/produits', color: '#facc15' },
        { icon: 'fa-cog', label: 'Parametres', link: '/parametres', color: '#14b8a6' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                !event.target.matches('#menu-toggler')) {
                setIsGridMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
                !event.target.matches('#user-initials')) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleGridMenu = (e) => {
        e.stopPropagation();
        setIsGridMenuOpen(!isGridMenuOpen);
        setIsUserMenuOpen(false);
    };

    const toggleUserMenu = (e) => {
        e.stopPropagation();
        setIsUserMenuOpen(!isUserMenuOpen);
        setIsGridMenuOpen(false);
    };

    const filteredMenuItems = menuItems.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            localStorage.removeItem('userToken');
            sessionStorage.clear();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <nav id="menu-container" className="navbar">
                <div className="navbar-inner">
                    <a className="navbar-brand" href="/accueil">DIGI-MEDIA : </a>
                    <div className="navbar-page-title">{currentTitle}</div>
                    <div className="navbar-right">
                        <button id="menu-toggler" onClick={toggleGridMenu} className="menu-button">
                            <i className="fas fa-bars"></i>
                        </button>
                        <div id="user-initials" onClick={toggleUserMenu} className="user-initials">
                            JD
                        </div>
                    </div>
                </div>
            </nav>

            <div ref={menuRef} className={`grid-menu ${isGridMenuOpen ? 'show' : ''}`}>
                <div className="search-container-menu">
                    <input
                        type="text"
                        className="search-input-menu"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid-container">
                    {filteredMenuItems.map((item, index) => (
                        <a key={index} href={item.link} className="grid-item">
                            <div className="grid-icon" style={{ backgroundColor: item.color }}>
                                <i className={`fas ${item.icon}`}></i>
                            </div>
                            <span className="grid-label">{item.label}</span>
                        </a>
                    ))}
                </div>
            </div>

            <div ref={userMenuRef} className={`user-menu ${isUserMenuOpen ? 'show' : ''}`}>
                <a href="/profile" className="user-menu-item">
                    <i className="fas fa-user icon-blue"></i>
                    <span>Profile</span>
                </a>
                <a href="#" onClick={handleLogout} className="user-menu-item logout">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Quitter</span>
                </a>
            </div>
        </>
    );
};

export default NavMenu;
