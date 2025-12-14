// src/components/BookCard.jsx

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BookCard({ item, type }) {
    const router = useRouter();

    // Lógica para extrair IDs, títulos e URLs
    const livroId = item.livro?.id || item.livroId || item.id;
    const titulo = item.titulo || item.livro?.titulo || "Título Desconhecido";
    const urlCapa = item.urlCapa || item.livro?.urlCapa || "https://placehold.co/150x225?text=Sem+Capa";

    // As notas não são mais necessárias

    if (!livroId) {
        return <div className="book-card text-danger">Erro de ID</div>;
    }

    const handleCardClick = () => {
        // A navegação continua funcional ao clicar na capa
        router.push(`/livros/${livroId}`);
    };

    // Estilos para garantir o layout de grid (tamanho da capa)
    const cardStyle = {
        width: '100%',
        maxWidth: '150px',
        display: 'block', // Alterado para block
        cursor: 'pointer'
    };

    // Estilos da Capa (mantendo o tamanho)
    const coverStyle = {
        width: '100%',
        height: '225px',
        objectFit: 'cover',
        borderRadius: '4px',
        // Removida a margem inferior para evitar espaço extra
    };


    return (
        <div
            className="book-card p-0" // Removendo padding padrão se houver
            onClick={handleCardClick}
            style={cardStyle}
        >
            <img
                src={urlCapa}
                className="book-cover"
                alt={`Capa de ${titulo}`}
                style={coverStyle}
                onError={(e) => { e.target.src = "https://placehold.co/150x225?text=Sem+Capa" }}
            />

            {/* ESTRELAS, TÍTULO E AUTOR REMOVIDOS */}

        </div>
    );
}