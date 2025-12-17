import React from 'react';
// Certifique-se de que o arquivo utils.jsx existe nesse caminho
import { displayStarRating } from '../utils.jsx';
// MUDANÇA 1: Import do React Router Dom
import { useNavigate } from 'react-router-dom';

export default function BookCard({ item, type }) {
    // MUDANÇA 2: Hook useNavigate
    const navigate = useNavigate();

    // --- 1. Extração de Dados Segura ---
    // Tenta pegar o ID de vários lugares possíveis (estrutura de review ou livro direto)
    const livroId = item.livro?.id || item.livroId || item.id;
    const titulo = item.titulo || item.livro?.titulo || "Título Desconhecido";
    const urlCapa = item.urlCapa || item.livro?.urlCapa || "https://placehold.co/150x225?text=Sem+Capa";
    const autor = item.autor || item.livro?.autor || "Autor Desconhecido";

    // --- 2. Lógica de Avaliação (Rating) ---
    const rawRating = item.nota || item.review?.nota || 0;
    const rating = parseFloat(rawRating) || 0;

    // Gera as estrelas (assumindo que sua função retorna JSX válido)
    const starsHtml = displayStarRating(rating);

    // --- 3. Proteção contra Erros ---
    if (!livroId) {
        // Retorna um aviso visual se o ID for inválido
        return (
            <div className="text-danger p-2 border border-danger small text-center" style={{maxWidth: '150px'}}>
                Erro: ID nulo
            </div>
        );
    }

    const handleCardClick = () => {
        // MUDANÇA 3: Navegação
        navigate(`/livros/${livroId}`);
    };

    // Estilos inline para garantir consistência
    const cardStyle = {
        width: '100%',
        maxWidth: '150px',
        display: 'block',
        cursor: 'pointer',
        textAlign: 'center'
    };

    const coverStyle = {
        width: '100%',
        height: '225px',
        objectFit: 'cover',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' // Um leve sombreado fica bonito
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
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/150x225?text=Sem+Capa";
                }}
            />

            {/* Renderiza Estrelas APENAS se for tipo estante ou tiver nota maior que 0 */}
            {(type === 'estante' || rating > 0) && (
                <div className="star-rating d-flex justify-content-center mb-1">
                    {starsHtml}
                </div>
            )}

            <p className="book-title-small mb-0 fw-bold text-truncate text-dark" style={{fontSize: '0.95rem'}} title={titulo}>
                {titulo}
            </p>

            <small className="book-author-small text-muted text-truncate d-block">
                {autor}
            </small>
        </div>
    );
}