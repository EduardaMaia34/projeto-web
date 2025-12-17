import React from "react";
// Certifique-se de que o utils.jsx tem as duas funções exportadas
import { displayStarRating, formatDate } from "../utils.jsx";

export default function ReviewCard({ review, isOwner, onEdit, onDelete }) {
    return (
        <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#f5f4ed' }}>
            <div className="d-flex justify-content-between">
                <div className="flex-grow-1 me-3">
                    {/* Título do Livro e Nota */}
                    <div className="d-flex align-items-center flex-wrap">
                        <h5 className="mb-0 me-3" style={{ color: '#594A47' }}>
                            {review.livro?.titulo || "Livro Desconhecido"}
                        </h5>
                        <div className="mt-0">
                            {displayStarRating(review.nota)}
                        </div>
                    </div>

                    {/* Autor e Data */}
                    <div className="small text-muted mt-1 mb-2">
                        {/* Se tiver review.autor, mostra. Se não, tenta pegar do usuário */}
                        {review.autor || "Usuário"} • {formatDate(review.data)}
                    </div>

                    {/* Conteúdo da Review */}
                    <p className="mb-0 text-break" style={{ color: '#333' }}>
                        {review.review || review.texto}
                    </p>
                </div>

                {/* Botões de Ação (somente para o dono) */}
                {isOwner && (
                    <div className="d-flex flex-column align-items-end flex-shrink-0 ms-2">
                        <button
                            className="btn btn-sm btn-outline-secondary mb-2"
                            onClick={onEdit}
                            style={{ minWidth: '70px' }}
                        >
                            Editar
                        </button>

                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(review.id)}
                            style={{ minWidth: '70px' }}
                        >
                            Excluir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}