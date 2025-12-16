import React from 'react';

const ReviewSearchBar = ({ searchTerm, onSearchChange, placeholder = "Pesquisar reviews, títulos..." }) => {
    return (
        <div className="d-flex align-items-center w-100">
            <input
                type="text"
                id="searchInputReviews"
                className="form-control"
                placeholder={placeholder}
                value={searchTerm}
                onChange={onSearchChange}
                autoComplete="off"
                autoFocus
                style={{ width: '100%' }}
            />
            <button className="btn btn-link text-dark ms-2">
                <i className="bi bi-search"></i>
            </button>
        </div>
    );
};

export default ReviewSearchBar;