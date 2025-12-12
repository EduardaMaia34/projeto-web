import React from "react";

// Componente StarRatingInput (adaptado do ReviewModal.jsx para usar a prop 'onRate')
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
                        style={{ fontSize: "1.5rem", cursor: "pointer", color: color }}
                        onClick={() => handleClick(starValue)}
                    ></i>
                );
            })}
        </div>
    );
};


export default function EditarReviewModal({ review, nota, setNota, texto, setTexto, onSave }) {

    // A função 'onRate' é o próprio setNota
    const handleSetNota = (newRating) => {
        setNota(newRating);
    };

    return (
        <div className="modal fade" id="editarReviewModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content custom-modal-content">
                    <div className="modal-header custom-modal-header">
                        <h5 className="modal-title">
                            Editar Review de: {review?.livro?.titulo || ""}
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div className="modal-body p-4">
                        {review && (
                            <>
                                <div className="d-flex">
                                    <img
                                        src={review?.livro?.urlCapa}
                                        className="modal-cover me-3"
                                        alt="Capa"
                                        style={{ width: "90px" }}
                                    />

                                    <div>
                                        <p className="text-muted mb-2">
                                            Finalizado em: {new Date(review?.data).toLocaleDateString("pt-BR")}
                                        </p>

                                        <div className="mb-3">
                                            <span className="fw-bold">Sua nota:</span>
                                            {/* ✅ USANDO O COMPONENTE STAR RATING COM MEIO-PONTO */}
                                            <StarRatingInput currentRating={nota} onRate={handleSetNota} />
                                        </div>
                                    </div>
                                </div>

                                <textarea
                                    className="form-control mt-3 modal-review-text"
                                    rows="4"
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                    style={{ resize: "none" }}
                                ></textarea>
                            </>
                        )}
                    </div>

                    <div className="modal-footer custom-modal-footer d-flex justify-content-center">
                        <button className="btn btn-success fw-bold" onClick={onSave} data-bs-dismiss="modal">
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}