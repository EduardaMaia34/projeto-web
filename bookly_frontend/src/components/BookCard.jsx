"use client";

import React from 'react';
import { displayStarRating } from '../utils.jsx';
import { useRouter } from 'next/navigation';

export default function BookCard({ item, type }) {
    const router = useRouter();

    // --- 1. Extração de Dados (Compatível com 'item' sendo Livro ou ItemEstante) ---
    // Tenta pegar o ID de 'item.livro.id' (Estante) ou 'item.id' (Busca/Lista)
    const livroId = item.livro?.id || item.id || item.livroId;

    const titulo = item.livro?.titulo || item.titulo || "Título Desconhecido";
    const autor = item.livro?.autor || item.autor || "Autor Desconhecido";

    // Define a URL da capa com fallback para imagem genérica
    const urlCapa = item.livro?.urlCapa || item.urlCapa || "https://placehold.co/150x225?text=Sem+Capa";

    // --- 2. Lógica de Avaliação (Rating) ---
    // Pega a nota do review (se existir) ou do item
    const rawRating = item.nota || item.review?.nota || 0;
    const rating = parseFloat(rawRating) || 0;

    // Gera as estrelas dinamicamente usando a função utils
    const starsHtml = displayStarRating(rating);

    // Status de leitura (se existir)
    const status = item.status || '';

    // --- 3. Proteção contra Erros ---
    if (!livroId) {
        return <div className="book-card text-danger p-2 border border-danger">Erro: Livro sem ID</div>;
    }

    // --- 4. Navegação ---
    const handleCardClick = () => {
        router.push(`/livros/${livroId}`);
    };

    return (
        <div
            className="book-card"
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
            title={`Ver detalhes de ${titulo}`}
        >
            <img
                src={urlCapa}
                className="book-cover mb-2"
                alt={`Capa de ${titulo}`}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/150x225?text=Sem+Capa";
                }}
            />

            {/* Renderiza Estrelas APENAS se for tipo estante ou tiver nota */}
            {(type === 'estante' || rating > 0) && (
                <span className="star-rating d-flex justify-content-center mb-1">
                    {starsHtml}
                </span>
            )}

            {/* Mostra status se houver (ex: Lendo, Lido) */}
            {status && <small className="d-block text-muted mb-1">{status}</small>}

            <p className="book-title-small mb-0 fw-bold" title={titulo}>
                {titulo}
            </p>

            <small className="book-author-small text-muted">
                {autor}
            </small>
        </div>
    );
}