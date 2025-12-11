import React from "react";

export default function EditarReviewModal({ review, nota, setNota, texto, setTexto, onSave }) {
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
                                            <div className="modal-rating-input mt-1">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <i
                                                        key={i}
                                                        className={`bi ${i <= nota ? "bi-star-fill" : "bi-star"}`}
                                                        style={{ fontSize: "1.5rem", cursor: "pointer", color: "gold" }}
                                                        onClick={() => setNota(i)}
                                                    ></i>
                                                ))}
                                            </div>
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
                        <button className="btn btn-success fw-bold" onClick={onSave}>
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
