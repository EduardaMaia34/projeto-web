import React, { useState } from 'react';


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
                style={{
                    overflow: 'hidden', // Garante que o input não vaze durante a animação
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <input
                    type="text"
                    id="searchInputEstante"
                    className="form-control border-0 shadow-none" // Bootstrap classes para limpar estilo padrão
                    placeholder="Pesquisar livros, autores..."
                    onChange={onSearchChange}
                    value={searchTerm}
                    style={{ background: 'transparent' }}
                />
            </div>

            <button
                className="btn btn-link text-dark ms-2"
                id="searchToggleBtnEstante"
                onClick={handleSearchToggle}
                title="Pesquisar na estante"
            >
                <i className="bi bi-search" style={{ fontSize: '1.2rem' }}></i>
            </button>
        </div>
    );
};

export default EstanteSearchBar;