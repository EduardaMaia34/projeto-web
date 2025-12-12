import React from 'react';

const ReviewSearchBar = ({ searchTerm, onSearchChange, placeholder = "Pesquisar reviews, títulos..." }) => {
    return (
        <div className="d-flex align-items-center">
            <input
                type="text"
                id="searchInputReviews"
                className="form-control"
                placeholder={placeholder}
                value={searchTerm}
                onChange={onSearchChange}
                style={{ width: '250px' }} // Define uma largura padrão para ser sempre visível
            />
            <button className="btn btn-link text-dark ms-2">
                <i className="bi bi-search"></i>
            </button>
        </div>
    );
};

export default ReviewSearchBar;