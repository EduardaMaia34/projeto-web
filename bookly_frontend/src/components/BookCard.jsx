"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BookCard({ item, type }) {
    // Inicializa o hook useRouter
    const router = useRouter();

    // Lógica para extrair IDs, títulos e URLs
    const livroId = item.livro?.id || item.livroId;
    const titulo = item.livro?.titulo || item.titulo || "Título Desconhecido";
    const autor = item.livro?.autor || item.autor || "Autor Desconhecido";
    const urlCapa = item.livro?.urlCapa || item.urlCapa || "https://placehold.co/150x225?text=Sem+Capa";

    if (!livroId) {
        return <div className="book-card text-danger">Erro de ID</div>;
    }

    // Função de navegação que utiliza o router.push()
    const handleCardClick = () => {
        // Redireciona para a página dinâmica do livro, e.g., /livros/123
        router.push(`/livros/${livroId}`);
    };

    return (
        <div
            className="book-card"
            onClick={handleCardClick} // Aciona a navegação
            style={{ cursor: 'pointer' }}
        >
            <img
                src={urlCapa}
                className="book-cover"
                alt={`Capa de ${titulo}`}
                onError={(e) => { e.target.src = "https://placehold.co/150x225?text=Sem+Capa" }}
            />
            <span className="star-rating">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star"></i>
                <i className="bi bi-star"></i>
            </span>
            <p className="book-title-small mb-0 mt-1" title={titulo}>{titulo}</p>
            <small className="book-author-small text-muted">{autor}</small>
        </div>
    );
}