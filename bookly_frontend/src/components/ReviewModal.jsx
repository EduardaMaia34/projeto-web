import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
// Certifique-se que o caminho da API está correto
import { saveReviewApi } from "../api/booklyApi";
import ReviewSearchModal from "./ReviewSearchModal";

/** Componente de Estrelas Interno */
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
        <div className="star-rating mt-2 d-flex justify-content-center">
            {stars.map((starValue) => {
                let iconClass = "bi-star";
                let color = "#e0e0e0"; // Cinza claro

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
    // Estados do Review
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [nota, setNota] = useState(0);
    const [reviewText, setReviewText] = useState("");

    // Estado para controlar o SEGUNDO modal (de busca)
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [loading, setLoading] = useState(false);

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
        setSelectedLivro(livro);
        setShowSearchModal(false); // Fecha o modal de busca
    };

    const handleSave = async () => {
        if (!selectedLivro) {
            alert("Por favor, selecione um livro clicando no sinal de '+'.");
            return;
        }
        if (!nota || nota === 0) {
            alert("Por favor, atribua uma nota para o livro.");
            return;
        }

        setLoading(true);

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
        } finally {
            setLoading(false);
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
                <div className="modal-content shadow-lg" style={{ backgroundColor: '#f5f4ed', color: '#594A47', borderRadius: '10px', border: 'none' }}>

                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: '1.5rem', fontFamily: 'Georgia, serif' }}>eu li...</h5>
                        <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
                    </div>

                    <div className="modal-body pt-2 px-4">
                        <p className="text-muted small mb-4">
                            Finalizado em: <span className="fw-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                        </p>

                        <div className="row">
                            {/* COLUNA DA ESQUERDA: CAPA E NOTA */}
                            <div className="col-md-4 d-flex flex-column align-items-center mb-3 mb-md-0">

                                {selectedLivro && (
                                    <h6 className="text-center fw-bold mb-2 small px-2 text-truncate w-100">{selectedLivro.titulo}</h6>
                                )}

                                {/* --- CARD CLICÁVEL --- */}
                                <div
                                    onClick={() => setShowSearchModal(true)}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                    title="Clique para selecionar um livro"
                                >
                                    {selectedLivro ? (
                                        <img
                                            src={selectedLivro.urlCapa || "https://placehold.co/120x180?text=Capa"}
                                            alt={selectedLivro.titulo}
                                            className="shadow-sm rounded mb-2"
                                            style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                                            onError={(e) => e.target.src = "https://placehold.co/120x180?text=Capa"}
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
                                    <small className="text-muted mt-1 text-decoration-underline" style={{cursor: 'pointer'}} onClick={() => setShowSearchModal(true)}>
                                        Selecionar Livro
                                    </small>
                                )}

                                <small className="d-block text-center mt-3 text-muted fw-bold">Sua nota:</small>
                                <StarRatingInput currentRating={nota} onRate={setNota} />
                            </div>

                            {/* COLUNA DA DIREITA: TEXTO */}
                            <div className="col-md-8">
                                <textarea
                                    className="form-control h-100"
                                    rows="8"
                                    placeholder={selectedLivro ? `O que você achou de "${selectedLivro.titulo}"? Escreva sua resenha aqui...` : "Selecione um livro clicando na imagem ao lado para começar a escrever..."}
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
                            disabled={loading}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Salvar Review"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* O modal de busca precisa estar aqui */}
            <ReviewSearchModal
                show={showSearchModal}
                onHide={() => setShowSearchModal(false)}
                onSelectBook={handleBookSelected}
            />
        </>
    );
}