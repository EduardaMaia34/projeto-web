// components/ReviewCard.jsx

import React from "react";
import { displayStarRating, formatDate } from "../utils.jsx";

export default function ReviewCard({ review, isOwner, onEdit, onDelete }) {
    return (
        <div key={review.id} className="border rounded p-3 mb-3" style={{ backgroundColor: '#f5f4ed' }}>
            <div className="d-flex justify-content-between">
                <div className="flex-grow-1 me-3">
                    {/* Título do Livro e Nota */}
                    <div className="d-flex align-items-center flex-wrap">
                        <h5 className="mb-0 me-3" style={{ color: '#594A47' }}>{review.livro?.titulo}</h5>
                        <div className="mt-0">{displayStarRating(review.nota)}</div>
                    </div>

                    {/* Autor e Data */}
                    <div className="small text-muted mt-1 mb-2">
                        {review.autor} • {formatDate(review.data)}
                    </div>

                    {/* Conteúdo da Review */}
                    <p className="mb-0" style={{ color: '#333' }}>{review.review}</p>
                </div>

                {/* Botões de Ação (somente para o dono) */}
                {isOwner && (
                    <div className="d-flex flex-column align-items-end flex-shrink-0">
                        <button
                            className="btn btn-sm btn-outline-secondary mb-2"
                            onClick={onEdit}
                        >
                            Editar
                        </button>

                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(review.id)}
                        >
                            Excluir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}