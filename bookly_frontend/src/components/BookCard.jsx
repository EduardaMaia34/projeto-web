"use client";

import React from 'react';
import { displayStarRating } from '../utils.jsx';
import { useRouter } from 'next/navigation';

export default function BookCard({ item, type }) {
    const router = useRouter();

    // --- 1. Extração de Dados Segura ---
    const livroId = item.livro?.id || item.livroId || item.id;
    const titulo = item.titulo || item.livro?.titulo || "Título Desconhecido";
    const urlCapa = item.urlCapa || item.livro?.urlCapa || "https://placehold.co/150x225?text=Sem+Capa";

    // CORREÇÃO: Definindo a variável autor que faltava
    const autor = item.autor || item.livro?.autor || "Autor Desconhecido";

    // --- 2. Lógica de Avaliação (Rating) ---
    const rawRating = item.nota || item.review?.nota || 0;
    const rating = parseFloat(rawRating) || 0;
    const starsHtml = displayStarRating(rating);

    // Status de leitura (se existir)
    const status = item.status || '';

    // --- 3. Proteção contra Erros ---
    if (!livroId) {
        return <div className="text-danger p-2 border border-danger">Erro: Livro sem ID</div>;
    }

    const handleCardClick = () => {
        router.push(`/livros/${livroId}`);
    };

    // Estilos
    const cardStyle = {
        width: '100%',
        maxWidth: '150px',
        display: 'block',
        cursor: 'pointer',
        textAlign: 'center' // Centraliza texto do card
    };

    const coverStyle = {
        width: '100%',
        height: '225px',
        objectFit: 'cover',
        borderRadius: '4px',
    };

    return (
        <div
            className="book-card p-0"
            onClick={handleCardClick}
            style={cardStyle}
            title={`Ver detalhes de ${titulo}`}
        >
            <img
                src={urlCapa}
                className="book-cover mb-2"
                alt={`Capa de ${titulo}`}
                style={coverStyle}
                onError={(e) => {
                    e.target.onerror = null; // Evita loop infinito
                    e.target.src = "https://placehold.co/150x225?text=Sem+Capa";
                }}
            />

            {/* Renderiza Estrelas APENAS se for tipo estante ou tiver nota */}
            {(type === 'estante' || rating > 0) && (
                <span className="star-rating d-flex justify-content-center mb-1">
                    {starsHtml}
                </span>
            )}

            {/* Mostra status se houver */}


            <p className="book-title-small mb-0 fw-bold text-truncate" title={titulo}>
                {titulo}
            </p>

            {/* Agora a variável autor existe e não dará erro */}
            <small className="book-author-small text-muted text-truncate d-block">
                {autor}
            </small>
        </div>
    );
}