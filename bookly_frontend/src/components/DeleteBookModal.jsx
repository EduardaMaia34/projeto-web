import React from "react";

export default function DeleteBookModal({ show, onHide, book, onConfirm, loading }) {
    // Se não estiver visível, não renderiza nada
    if (!show) return null;

    return (
        <>
            {/* Fundo Escuro (Backdrop) Manual */}
            <div
                className="modal-backdrop show"
                style={{ opacity: 0.5, backgroundColor: '#000', zIndex: 1040 }}
                onClick={onHide} // Fecha ao clicar fora (opcional)
            ></div>

            {/* Modal */}
            <div
                className="modal show d-block"
                tabIndex="-1"
                role="dialog"
                style={{ zIndex: 1050 }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>

                        {/* Cabeçalho Vermelho para indicar PERIGO */}
                        <div className="modal-header text-white border-0" style={{ backgroundColor: "#dc3545" }}>
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>Excluir Livro
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
                        </div>

                        <div className="modal-body p-4 text-center bg-white">
                            <p className="fs-5 text-secondary">
                                Tem certeza que deseja excluir o livro:
                            </p>
                            <h4 className="fw-bold text-dark my-3" style={{ fontFamily: 'Georgia, serif' }}>
                                "{book?.titulo}"?
                            </h4>
                            <p className="small text-muted mb-0">
                                Essa ação é permanente e não pode ser desfeita.
                            </p>
                        </div>

                        <div className="modal-footer border-0 bg-light justify-content-center pb-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-4 me-2"
                                onClick={onHide}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger rounded-pill px-4"
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2"></span>Excluindo...</span>
                                ) : (
                                    <span><i className="bi bi-trash-fill me-2"></i>Sim, Excluir</span>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}