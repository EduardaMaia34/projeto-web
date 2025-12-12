"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import ReviewModal from "../components/ReviewModal.jsx";
import { fetchReviews, updateReview, deleteReviewApi } from "../api/booklyApi.js";
import { displayStarRating, formatDate } from "../utils.jsx";
import { Modal, Button } from "react-bootstrap";

/* ------------------------- COMPONENTE STAR RATING INPUT (COM MEIO-PONTO) ------------------------- */
const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (starValue) => {
        let newRating;

        // Lógica para alternar entre valor inteiro e meio-ponto (0.5)
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
        <div className="star-rating mt-1">
            {stars.map((starValue) => {
                let iconClass = "bi-star";
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
                        style={{ fontSize: "1.5rem", cursor: "pointer", color: color }}
                        onClick={() => handleClick(starValue)}
                    ></i>
                );
            })}
        </div>
    );
};
/* ------------------------------------------------------------------------------------------------- */

/* ------------------------- PEGAR USERID COMO NA BIBLIOTECA ------------------------- */
function getUserId() {
    if (typeof window === "undefined") return null;

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("userId");
    if (fromUrl) return fromUrl;

    try {
        const stored = JSON.parse(localStorage.getItem("userData"));
        return stored?.id || stored?.userId || null;
    } catch {
        return null;
    }
}
/* ------------------------------------------------------------------------------- */

export default function Reviews() {
    const [userId, setUserId] = useState(null);
    const [isClient, setIsClient] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedReview, setSelectedReview] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);

    /* ------------------------- CLIENT SIDE SETUP ------------------------- */
    useEffect(() => {
        setIsClient(true);
        setUserId(getUserId());
    }, []);

    /* --------------------- BUSCAR REVIEWS --------------------- */
    const fetchUserReviews = useCallback(async () => {
        // Se o userId for null (usuário logado), a API usa o token JWT (rota /me)
        if (!isClient) return;

        try {
            // userId pode ser null, mas a função fetchReviews lida com isso.
            const data = await fetchReviews(userId);
            setReviews(Array.isArray(data) ? data : []);
        } catch {
            setReviews([]);
        }
    }, [isClient, userId]);

    useEffect(() => {
        // Chama a busca assim que o componente é montado (isClient) e o userId é resolvido.
        if (isClient) {
            fetchUserReviews();
        }
    }, [isClient, fetchUserReviews]);

    /* ----------------------- FILTRAGEM ------------------------ */
    const filteredReviews = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return reviews.filter(
            (r) =>
                r.livro?.titulo?.toLowerCase().includes(term) ||
                (r.review || "").toLowerCase().includes(term)
        );
    }, [reviews, searchTerm]);

    /* ----------------------- EDITAR REVIEW ------------------------ */
    const handleSaveEdit = async (id, payload) => {
        try {
            await updateReview(id, payload);
            setSelectedReview(null);
            fetchUserReviews();
        } catch (error) {
            console.error('Falha ao salvar edição:', error);
            alert('Falha ao salvar a edição da review.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir esta review?")) return;
        try {
            await deleteReviewApi(id);
            fetchUserReviews();
        } catch (error) {
            console.error('Falha ao deletar review:', error);
            alert('Falha ao deletar a review.');
        }
    };

    // NOVO HANDLER: Atualiza a nota do review selecionado quando as estrelas são clicadas
    const handleEditNotaChange = (newRating) => {
        setSelectedReview(prevReview => ({
            ...prevReview,
            nota: newRating,
        }));
    };


    if (!isClient) return null;

    return (
        <>
            <Navbar
                onAddBookClick={() => setOpenAddModal(true)}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                currentSearchTerm={searchTerm}
            />

            <div className="container">
                <h3 className="mb-4">Minhas Reviews</h3>

                {filteredReviews.length === 0 && <p className="text-muted">Nenhuma review encontrada.</p>}

                {filteredReviews.map((review) => (
                    <div key={review.id} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h5>{review.livro?.titulo}</h5>
                                <div className="small text-muted">
                                    {review.autor} • {formatDate(review.data)}
                                </div>
                                <div className="mt-2">{displayStarRating(review.nota)}</div>
                                <p className="mt-2">{review.review}</p>
                            </div>

                            <div className="d-flex flex-column align-items-end">
                                <button
                                    className="btn btn-sm btn-outline-secondary me-2"
                                    onClick={() => setSelectedReview(review)}
                                >
                                    Editar
                                </button>

                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(review.id)}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---------------------- MODAL ADICIONAR REVIEW --------------------- */}
            <ReviewModal
                show={openAddModal}
                onHide={() => {
                    setOpenAddModal(false);
                    fetchUserReviews();
                }}
                onSaveSuccess={fetchUserReviews}
            />

            {/* ---------------------- MODAL EDITAR REVIEW --------------------- */}
            <Modal show={!!selectedReview} onHide={() => setSelectedReview(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Review</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedReview && (
                        <>
                            <p className="text-muted">Livro: {selectedReview.livro.titulo}</p>

                            <div className="mb-3">
                                <span className="form-label fw-bold">Nota:</span>

                                {/* ✅ SUBSTITUÍDO O INPUT NUMÉRICO PELO COMPONENTE DE ESTRELAS */}
                                <div className="mt-2">
                                    <StarRatingInput
                                        currentRating={parseFloat(selectedReview.nota) || 0}
                                        onRate={handleEditNotaChange}
                                    />
                                </div>
                            </div>

                            <textarea
                                className="form-control"
                                rows="4"
                                value={selectedReview.review || ""}
                                onChange={(e) =>
                                    setSelectedReview({
                                        ...selectedReview,
                                        review: e.target.value,
                                    })
                                }
                            />
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedReview(null)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        onClick={async () => {
                            if (!selectedReview) return;
                            await handleSaveEdit(selectedReview.id, {
                                // A nota já é atualizada no estado pelo StarRatingInput
                                nota: selectedReview.nota,
                                review: selectedReview.review,
                            });
                        }}
                    >
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}