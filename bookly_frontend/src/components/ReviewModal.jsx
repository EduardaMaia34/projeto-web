"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { saveReviewApi } from "../api/booklyApi";
import ReviewSearchModal from "./ReviewSearchModal"; // <--- Certifique-se que o arquivo existe nessa pasta

/** Componente de Estrelas */
const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];
    const handleClick = (starValue) => {
        let newRating;
        if (currentRating === starValue) newRating = starValue - 0.5;
        else if (currentRating === starValue - 0.5) newRating = starValue;
        else newRating = starValue;
        if (newRating < 0) newRating = 0;
        onRate(newRating);
    };

    return (
        <div className="star-rating mt-2">
            {stars.map((starValue) => {
                let iconClass = "bi-star";
                let color = "#e0e0e0";
                if (starValue <= currentRating) { iconClass = "bi-star-fill"; color = "gold"; }
                else if (starValue - 0.5 <= currentRating) { iconClass = "bi-star-half"; color = "gold"; }
                return (
                    <i key={starValue} className={`bi ${iconClass}`} style={{ fontSize: "1.6rem", color: color, cursor: "pointer", margin: "0 4px" }} onClick={() => handleClick(starValue)} />
                );
            })}
        </div>
    );
};

export default function ReviewModal({ show, onHide, onSaveSuccess, initialLivro }) {
    // Estados do Review
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [nota, setNota] = useState(0);
    const [reviewText, setReviewText] = useState("");

    // Estado para controlar o SEGUNDO modal (de busca)
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Inicialização
    useEffect(() => {
        if (show) {
            if (initialLivro) setSelectedLivro(initialLivro);
        } else {
            // Resetar ao fechar
            setSelectedLivro(null);
            setNota(0);
            setReviewText("");
        }
    }, [show, initialLivro]);

    // Função chamada quando o ReviewSearchModal devolve um livro
    const handleBookSelected = (livro) => {
        console.log("Livro recebido da busca:", livro); // Debug para confirmar
        setSelectedLivro(livro);
        setShowSearchModal(false); // Fecha o modal de busca
    };

    const handleSave = async () => {
        if (!selectedLivro) {
            alert("Selecione um livro.");
            return;
        }
        if (!nota || nota === 0) {
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
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar review: " + err.message);
        }
    };

    return (
        <>
            {/* --- MODAL PRINCIPAL DE REVIEW --- */}
            <Modal
                show={show}
                onHide={onHide}
                centered
                size="lg"
                contentClassName="border-0 bg-transparent"
            >
                <div className="modal-content" style={{ backgroundColor: '#f5f4ed', color: '#594A47', borderRadius: '10px', border: 'none' }}>

                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: '1.5rem' }}>eu li...</h5>
                        <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
                    </div>

                    <div className="modal-body pt-2 px-4">
                        <p className="text-muted small mb-4">
                            Finalizado em: <span className="fw-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                        </p>

                        <div className="row">
                            {/* COLUNA DA ESQUERDA: CAPA E NOTA */}
                            <div className="col-4 d-flex flex-column align-items-center">

                                {selectedLivro && (
                                    <h6 className="text-center fw-bold mb-2 small">{selectedLivro.titulo}</h6>
                                )}
                                

                                {/* --- AQUI ESTÁ O "CARDZINHO" CLICÁVEL --- */}
                                <div
                                    onClick={() => setShowSearchModal(true)} // Abre o modal de busca
                                    style={{ cursor: 'pointer' }}
                                    title="Clique para selecionar um livro"
                                >
                                    {selectedLivro ? (
                                        <img
                                            src={selectedLivro.urlCapa || selectedLivro.capa || "https://via.placeholder.com/150x225"}
                                            alt={selectedLivro.titulo}
                                            className="shadow-sm rounded mb-2"
                                            style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        // O CARD VAZIO COM "+"
                                        <div className="d-flex justify-content-center align-items-center shadow-sm mb-2"
                                             style={{ width: '120px', height: '180px', backgroundColor: '#DED2C2', borderRadius: '5px', fontSize: '2rem', color: '#A0918D', transition: '0.3s' }}
                                             onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d4c6b5'}
                                             onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DED2C2'}
                                        >
                                            <i className="bi bi-plus-lg"></i>
                                        </div>
                                    )}
                                </div>

                                {!selectedLivro && (
                                    <small className="text-muted mt-1" style={{cursor: 'pointer'}} onClick={() => setShowSearchModal(true)}>
                                        Selecionar Livro
                                    </small>
                                )}

                                <small className="d-block text-center mt-3 text-muted">Sua nota:</small>
                                <StarRatingInput currentRating={nota} onRate={setNota} />
                            </div>

                            {/* COLUNA DA DIREITA: TEXTO */}
                            <div className="col-8">
                                <textarea
                                    className="form-control"
                                    rows="8"
                                    placeholder={selectedLivro ? `O que achou de ${selectedLivro.titulo}?` : "Selecione um livro clicando na imagem ao lado..."}
                                    style={{ resize: 'none', backgroundColor: 'white', border: '1px solid #DED2C2', color: '#594A47' }}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-0" style={{ backgroundColor: '#DED2C2', justifyContent: 'center', padding: '15px', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
                        <button
                            type="button"
                            className="btn fw-bold text-white shadow-sm"
                            style={{ backgroundColor: '#7AA27D', borderColor: '#7AA27D', padding: '10px 40px' }}
                            onClick={handleSave}
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </Modal>

            <ReviewSearchModal
                show={showSearchModal}
                onHide={() => setShowSearchModal(false)}
                onSelectBook={handleBookSelected}
            />
        </>
    );
}