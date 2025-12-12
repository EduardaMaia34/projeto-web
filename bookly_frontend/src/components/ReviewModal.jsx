// src/components/ReviewModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, saveReviewApi } from "../api/booklyApi";

const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (starValue) => {
        let newRating;

        // Se o rating atual for exatamente o valor inteiro clicado (ex: 3.0),
        // o próximo clique o reduz para o meio-ponto anterior (2.5).
        if (currentRating === starValue) {
            newRating = starValue - 0.5;
        }
            // Se o rating atual for o meio-ponto da estrela (ex: 2.5),
        // o próximo clique o eleva para o valor inteiro (3.0).
        else if (currentRating === starValue - 0.5) {
            newRating = starValue;
        }
            // Se for um clique em uma estrela diferente ou o primeiro clique,
        // define o valor inteiro da estrela clicada.
        else {
            newRating = starValue;
        }

        // Garante que o rating mínimo seja 0
        if (newRating < 0) newRating = 0;

        onRate(newRating);
    };

    return (
        <div className="star-rating mt-2">
            {stars.map((starValue) => {
                let iconClass = "bi-star";
                // A cor padrão foi adicionada para melhor consistência visual
                let color = "#e0e0e0";

                if (starValue <= currentRating) {
                    iconClass = "bi-star-fill";
                    color = "gold";
                } else if (starValue - 0.5 <= currentRating) {
                    iconClass = "bi-star-half";
                    color = "gold";
                }

                return (
                    <i
                        key={starValue}
                        className={`bi ${iconClass}`}
                        style={{ fontSize: "1.6rem", color: color, cursor: "pointer", margin: "0 4px" }}
                        onClick={() => handleClick(starValue)}
                    />
                );
            })}
        </div>
    );
};

export default function ReviewModal({ show, onHide, onSaveSuccess }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [nota, setNota] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }

        searchLivrosApi(debouncedSearch)
            .then(results => setSearchResults(results || []))
            .catch(() => setSearchResults([]));
    }, [debouncedSearch]);


    useEffect(() => {
        if (!show) {
            setSearchTerm("");
            setSearchResults([]);
            setSelectedLivro(null);
            setNota(0);
            setReviewText("");
        }
    }, [show]);

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
            onSaveSuccess?.();
        } catch (err) {
            alert("Erro ao salvar review.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Adicionar Livro + Review</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label fw-bold">Buscar livro</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Título ou autor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />

                    {searchResults.length > 0 && (
                        <div className="list-group mt-2">
                            {searchResults.map(livro => (
                                <div
                                    key={livro.id}
                                    className="list-group-item list-group-item-action d-flex align-items-center"
                                    role="button"
                                    onClick={() => handleSelect(livro)}
                                >
                                    <img
                                        src={livro.urlCapa || 'https://placehold.co/40x60'}
                                        style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '10px' }}
                                    />

                                    <div>
                                        <h6 className="mb-0">{livro.titulo}</h6>
                                        <small className="text-muted">{livro.autor}</small>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="col-4 text-center">
                        <h6 className="text-primary">{selectedLivro ? selectedLivro.titulo : "Nenhum livro selecionado"}</h6>
                        <img
                            src={selectedLivro?.urlCapa || "https://placehold.co/150x225"}
                            alt={selectedLivro?.titulo || "placeholder"}
                            className="img-fluid rounded shadow-sm mb-3"
                            style={{ width: 150, height: 225, objectFit: "cover" }}
                        />
                        <StarRatingInput currentRating={nota} onRate={setNota} />
                    </div>

                    <div className="col-8">
            <textarea
                className="form-control"
                rows="8"
                placeholder="Escreva sua review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
            />
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleSave}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}