import React, { useState } from 'react';

const EstanteSearchBar = () => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const handleSearchToggle = () => {
        setIsSearchVisible(prev => !prev);
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        console.log('Pesquisando na Estante/Biblioteca:', query);
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
                    onChange={handleSearch}
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