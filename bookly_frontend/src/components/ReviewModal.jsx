// src/components/ReviewModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, saveReviewApi } from "../api/booklyApi";

// Componente de Estrelas (Visual Dourado)
import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, saveReviewApi } from "../api/booklyApi";

const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="d-flex justify-content-center mt-2" style={{ color: "gold" }}>
            {stars.map((starValue) => {
                let iconClass = "bi-star";
                if (starValue <= currentRating) iconClass = "bi-star-fill";
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

export default function ReviewModal({ show, onHide, onSaveSuccess, initialLivro }) {
    // --- LÓGICA ---
    const [searchTerm, setSearchTerm] = useState("");
export default function ReviewModal({ show, onHide, onSaveSuccess }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [nota, setNota] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Efeito de busca (Pesquisa na API quando o usuário digita)
    useEffect(() => {
        if (!debouncedSearch) {
    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }

        searchLivrosApi(debouncedSearch)
            .then(results => setSearchResults(results || []))
            .catch(() => setSearchResults([]));
    }, [debouncedSearch]);

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