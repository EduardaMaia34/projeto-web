import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const NavbarContent = ({ onAddBookClick }) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const handleSearchToggle = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    return (
        <nav className="navbar navbar-light header-bar p-3 mb-4">
            <div className="container-fluid">
                <a className="navbar-brand d-flex align-items-center" href="/biblioteca">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" height="30" className="d-inline-block align-text-top me-2" style={{ height: '50px' }} />
                </a>

                <div className="d-flex align-items-center ms-auto">

                    <div id="searchBarContainerNavbar"
                         className={`form-control search-bar-hidden ${isSearchVisible ? 'search-bar-visible-navbar' : ''}`}>
                        <input type="text" id="searchInputNavbar" className="form-control" placeholder="Pesquisar livros, autores..." />
                    </div>

                    <button className="btn btn-link text-dark me-3" id="searchToggleBtnNavbar" onClick={handleSearchToggle}>
                        <i className="bi bi-search"></i>
                    </button>

                    <div id="profileGroupNavbar"
                         className={`d-flex align-items-center ${isSearchVisible ? 'profile-group-hidden' : ''}`}>

                        <a href="/perfil" className="d-flex align-items-center me-3">
                            <img src="https://imgur.com/pcf2EUA.png" alt="Perfil Mari" className="rounded-circle" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                        </a>

                        <span className="fw-bold me-3">Mari</span>
                        <button className="btn btn-success me-3 d-flex align-items-center"
                                onClick={onAddBookClick}>
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Livro
                        </button>
                        <button className="btn btn-link text-dark">
                            <i className="bi bi-box-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Desabilita o SSR, carregando o componente apenas no cliente
const Navbar = dynamic(() => Promise.resolve(NavbarContent), {
    ssr: false,
});

export default Navbar;