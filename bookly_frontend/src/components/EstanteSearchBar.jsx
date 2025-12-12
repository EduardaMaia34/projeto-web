// src/components/EstanteSearchBar.jsx
import React, { useState } from 'react';

// O componente agora aceita as props searchTerm e onSearchChange
const EstanteSearchBar = ({ searchTerm, onSearchChange }) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const handleSearchToggle = () => {
        setIsSearchVisible(prev => !prev);
    };

    return (
        <div className="d-flex align-items-center">

            <div
                id="searchBarEstanteContainer"
                className={`form-control search-bar-hidden ${isSearchVisible ? 'search-bar-visible-estante' : ''}`}
            >
                <input
                    type="text"
                    id="searchInputEstante"
                    className="form-control"
                    placeholder="Pesquisar livros, autores..."
                    onChange={onSearchChange} // Repassa a mudança de valor para o componente pai
                    value={searchTerm}        // Usa o valor de busca controlado pelo componente pai
                    style={{ border: 'none', padding: '0', background: 'transparent' }}
                />
            </div>

            <button
                className="btn btn-link text-dark"
                id="searchToggleBtnEstante"
                onClick={handleSearchToggle}
            >
                <i className="bi bi-search"></i>
            </button>
        </div>
    );
};

export default EstanteSearchBar;