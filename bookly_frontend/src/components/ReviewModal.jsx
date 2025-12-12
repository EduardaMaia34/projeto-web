// src/components/ReviewModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, saveReviewApi } from "../api/booklyApi";

// Componente de Estrelas (Visual Dourado)
const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="d-flex justify-content-center mt-2" style={{ color: "gold" }}>
            {stars.map((starValue) => {
                let iconClass = "bi-star";
                if (starValue <= currentRating) iconClass = "bi-star-fill";

                return (
                    <i
                        key={starValue}
                        className={`bi ${iconClass}`}
                        style={{ fontSize: "1.2rem", cursor: "pointer", margin: "0 2px" }}
                        onClick={() => onRate(starValue)}
                    />
                );
            })}
        </div>
    );
};

export default function ReviewModal({ show, onHide, onSaveSuccess, initialLivro }) {
    // --- LÓGICA ---
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [nota, setNota] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Efeito de busca (Pesquisa na API quando o usuário digita)
    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }
        searchLivrosApi(debouncedSearch)
            .then(results => setSearchResults(results || []))
            .catch(() => setSearchResults([]));
    }, [debouncedSearch]);

    // Efeito de Inicialização e Limpeza (A CORREÇÃO ESTÁ AQUI)
    useEffect(() => {
        if (show) {
            // Se o modal abriu e recebeu um livro da página anterior, seleciona ele
            if (initialLivro) {
                setSelectedLivro(initialLivro);
            }
        } else {
            // Se o modal fechou, limpa todos os campos
            setSearchTerm("");
            setSearchResults([]);
            setSelectedLivro(null);
            setNota(0);
            setReviewText("");
        }
    }, [show, initialLivro]);

    const handleSelect = (livro) => {
        setSelectedLivro(livro);
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleSave = async () => {
        if (!selectedLivro) {
            alert("Selecione um livro.");
            return;
        }
        if (!nota) {
            alert("Atribua uma nota.");
            return;
        }

        const payload = {
            livroId: selectedLivro.id,
            nota,
            review: reviewText.trim(),
            status: "LIDO",
        };

        try {
            await saveReviewApi(payload);
            onHide();
            onSaveSuccess?.(); // Atualiza a lista se necessário
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar review.");
        }
    };

    // --- VISUAL (Estilo Bege/Marrom) ---
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            contentClassName="border-0 bg-transparent" // Remove bordas padrão do bootstrap
        >
            <div className="modal-content" style={{ backgroundColor: '#f5f4ed', color: '#594A47', borderRadius: '10px', border: 'none' }}>

                {/* Cabeçalho */}
                <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-bold" style={{ fontSize: '1.5rem' }}>eu li...</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onHide}
                        aria-label="Close"
                    ></button>
                </div>

                {/* Corpo do Modal */}
                <div className="modal-body pt-2 px-4">

                    {/* Área de Pesquisa */}
                    <div className="mb-3 position-relative">
                        <div className="d-flex align-items-center mb-2">
                            {/* Input com estilo "invisível" mas funcional */}
                            <input
                                type="text"
                                className="form-control border-0 bg-transparent fw-bold fs-4 p-0 shadow-none"
                                placeholder={selectedLivro ? "Alterar Livro..." : "Pesquisar Livro..."}
                                style={{ color: '#594A47', width: '100%' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                // Se não tiver livro selecionado, foca automático
                                autoFocus={!selectedLivro}
                            />
                            <i className="bi bi-search ms-2" style={{ fontSize: '1.2rem' }}></i>
                        </div>

                        {/* Dropdown de Resultados da Pesquisa (Flutuante) */}
                        {searchResults.length > 0 && (
                            <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 1050, top: '100%' }}>
                                {searchResults.map(livro => (
                                    <button
                                        key={livro.id}
                                        type="button"
                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                        onClick={() => handleSelect(livro)}
                                    >
                                        <img
                                            // Tenta pegar capa ou urlCapa, ou fallback
                                            src={livro.capa || livro.urlCapa || 'https://via.placeholder.com/40x60'}
                                            style={{ width: '30px', marginRight: '10px' }}
                                            alt="capa"
                                        />
                                        <div>
                                            <div className="fw-bold">{livro.titulo}</div>
                                            <small className="text-muted">{livro.autor}</small>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-muted small">
                        Finalizado em: <span className="fw-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                    </p>

                    <div className="row">
                        {/* Coluna Esquerda: Capa/Placeholder e Nota */}
                        <div className="col-4 d-flex flex-column align-items-center">

                            {/* Mostra Capa se tiver livro selecionado, senão mostra o "+" */}
                            {selectedLivro ? (
                                <img
                                    src={selectedLivro.capa || selectedLivro.urlCapa || "https://via.placeholder.com/100x150"}
                                    alt={selectedLivro.titulo}
                                    className="shadow-sm rounded"
                                    style={{ width: '100px', height: '150px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="d-flex justify-content-center align-items-center"
                                     style={{ width: '100px', height: '150px', backgroundColor: '#DED2C2', borderRadius: '5px', fontSize: '2rem', color: '#A0918D' }}>
                                    +
                                </div>
                            )}

                            <small className="d-block text-center mt-2 text-muted">Sua nota:</small>

                            {/* Componente de Estrelas */}
                            <StarRatingInput currentRating={nota} onRate={setNota} />
                        </div>

                        {/* Coluna Direita: Texto do Review */}
                        <div className="col-8">
                            <textarea
                                className="form-control"
                                rows="6"
                                placeholder={selectedLivro ? `O que achou de ${selectedLivro.titulo}?` : "Selecione um livro primeiro..."}
                                style={{ resize: 'none', backgroundColor: 'white', border: '1px solid #DED2C2', color: '#594A47' }}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="modal-footer border-0" style={{ backgroundColor: '#DED2C2', justifyContent: 'center', padding: '15px', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                    <button
                        type="button"
                        className="btn fw-bold text-white"
                        style={{ backgroundColor: '#7AA27D', borderColor: '#7AA27D', padding: '10px 40px' }}
                        onClick={handleSave}
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </Modal>
    );
}