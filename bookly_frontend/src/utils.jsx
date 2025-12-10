import React from 'react';

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const displayStarRating = (rating) => {
    const displayRating = parseFloat(rating) || 0;
    let stars = [];

    for (let i = 1; i <= 5; i++) {
        let iconClass;
        if (i <= displayRating) {
            iconClass = 'bi-star-fill';
        } else if (i - 0.5 <= displayRating) {
            iconClass = 'bi-star-half';
        } else {
            iconClass = 'bi-star';
        }
        stars.push(<i key={i} className={`bi ${iconClass}`} />);
    }
    return stars;
};

export const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.sub; // Assumindo que 'sub' contém o ID do usuário
    } catch (e) {
        console.error('Erro ao decodificar JWT:', e);
        return null;
    }
};