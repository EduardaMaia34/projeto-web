import React from "react";

// Componente StarRatingInput
const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (starValue) => {
        let newRating;

        // Lógica de alternância entre valor inteiro e meio-ponto
        if (currentRating === starValue) {
            newRating = starValue - 0.5;
        }
        else if (currentRating === starValue - 0.5) {
            newRating = starValue;
        }
        else {
            newRating = starValue;
        }

        if (newRating < 0) newRating = 0;
        if (newRating > 5) newRating = 5;

        onRate(newRating);
    };

    return (
        <div className="modal-rating-input mt-1">
            {stars.map((starValue) => {
                let iconClass = "bi-star";
                let color = "#e0e0e0";

                // Lógica de renderização com meio-ponto
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
                        style={{ fontSize: "1.5rem", cursor: "pointer", color: color, marginRight: '4px' }}
                        onClick={() => handleClick(starValue)}
                    ></i>
                );
            })}
        </div>
    );
};

export default function EditarReviewModal({ show, onHide, review, nota, setNota, texto, setTexto, onSave }) {

    // Se não estiver visível, não renderiza nada
    if (!show) return null;

    const handleSetNota = (newRating) => {
        setNota(newRating);
    };

    const handleSaveClick = () => {
        onSave();
        onHide(); // Fecha o modal após salvar
    };

    return (
        <>
            {/* Backdrop (Fundo Escuro) */}
            <div
                className="modal-backdrop show"
                style={{ opacity: 0.5, backgroundColor: '#000', zIndex: 1050 }}
                onClick={onHide}
            ></div>

            {/* Modal */}
            <div
                className="modal show d-block"
                tabIndex="-1"
                role="dialog"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px' }}>

                        {/* Header */}
                        <div className="modal-header border-bottom-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
                            <h5 className="modal-title fw-bold text-dark">
                                Editar Review
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                                aria-label="Close"
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4">
                            {review && (
                                <>
                                    <div className="d-flex mb-4">
                                        <img
                                            src={review?.livro?.urlCapa || "https://placehold.co/90x130"}
                                            className="modal-cover me-3 rounded shadow-sm"
                                            alt="Capa"
                                            style={{ width: "90px", objectFit: 'cover' }}
                                        />

                                        <div>
                                            <h6 className="fw-bold mb-1">{review?.livro?.titulo}</h6>
                                            <p className="text-muted small mb-2">
                                                Finalizado em: {review?.data ? new Date(review.data).toLocaleDateString("pt-BR") : "-"}
                                            </p>

                                            <div className="mb-1">
                                                <span className="fw-bold d-block mb-1" style={{fontSize: '0.9rem'}}>Sua avaliação:</span>
                                                <StarRatingInput currentRating={nota} onRate={handleSetNota} />
                                            </div>
                                        </div>
                                    </div>

                                    <label className="form-label fw-bold small text-muted">Seu comentário:</label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        value={texto}
                                        onChange={(e) => setTexto(e.target.value)}
                                        style={{ resize: "none", backgroundColor: '#fdfbf7', border: '1px solid #ddd' }}
                                        placeholder="Escreva o que você achou do livro..."
                                    ></textarea>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top-0 justify-content-center pb-4">
                            <button
                                className="btn btn-outline-secondary me-2 px-4"
                                onClick={onHide}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-success fw-bold px-4"
                                onClick={handleSaveClick}
                                style={{ backgroundColor: '#198754' }}
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}