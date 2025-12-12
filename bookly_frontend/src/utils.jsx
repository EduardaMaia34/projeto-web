import React from 'react';

export const formatDate = (dateString) => {
    if (!dateString) return '';

    let date;

    if (Array.isArray(dateString) && dateString.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;

        date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    } else {
        date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
        console.error("Data inválida após processamento:", dateString);
        return 'Data Inválida'; // Mensagem de fallback
    }

    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const displayStarRating = (rating) => {
    const displayRating = parseFloat(rating) || 0;
    let stars = [];

    for (let i = 1; i <= 5; i++) {
        let iconClass;
        let starStyle = {};

        if (i <= displayRating) {
            iconClass = 'bi-star-fill';
            starStyle.color = 'gold';
        } else if (i - 0.5 <= displayRating) {
            iconClass = 'bi-star-half';
            starStyle.color = 'gold';
        } else {
            iconClass = 'bi-star';
            starStyle.color = 'lightgray';
        }
        stars.push(<i key={i} className={`bi ${iconClass}`} style={starStyle} />);
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
        return payload.sub;
    } catch (e) {
        console.error('Erro ao decodificar JWT:', e);
        return null;
    }
};