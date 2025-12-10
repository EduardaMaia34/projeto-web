import React from 'react';
import { displayStarRating } from '../utils.jsx';

const BookCard = ({ item, type }) => {
    const livro = item.livro || {};
    const rawRating = item.nota || item.review?.nota || 0;
    const rating = parseFloat(rawRating) || 0;

    const placeholderUrl = `https://placehold.co/150x225/A0A0A0/FFFFFF?text=${livro.titulo ? livro.titulo.substring(0, 6) : 'Capa'}`;
    const coverUrl = livro.urlCapa || placeholderUrl;
    const status = item.status || '';
    const starsHtml = displayStarRating(rating);

    return (
        <div className="book-card">
            <img
                src={coverUrl}
                className="book-cover mb-1"
                alt={`Capa de ${livro.titulo || 'Livro Desconhecido'}`}
                onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
            />
            {type === 'estante' && (
                <span className="star-rating">{starsHtml}</span>
            )}
            <small className="d-block text-muted">{status}</small>
        </div>
    );
};

export default BookCard;