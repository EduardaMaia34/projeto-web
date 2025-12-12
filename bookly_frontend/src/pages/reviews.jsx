"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import ReviewModal from "../components/ReviewModal.jsx";
import { fetchReviews, updateReview, deleteReviewApi } from "../api/booklyApi.js";
import { displayStarRating, formatDate } from "../utils.jsx";
import { Modal, Button } from "react-bootstrap";

const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (starValue) => {
        let newRating;
        if (currentRating === starValue) {
            newRating = starValue - 0.5;
        } else if (currentRating === starValue - 0.5) {
            newRating = starValue;
        } else {
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


export default function Reviews() {
    const [userId, setUserId] = useState(null);
    const [isClient, setIsClient] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedReview, setSelectedReview] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setUserId(getUserId());
    }, []);

    const fetchUserReviews = useCallback(async () => {
        if (!isClient) return;

        try {
            const data = await fetchReviews(userId);
            setReviews(Array.isArray(data) ? data : []);
        } catch {
            setReviews([]);
        }
    }, [isClient, userId]);

    useEffect(() => {
        if (isClient) {
            fetchUserReviews();
        }
    }, [isClient, fetchUserReviews]);

    const filteredReviews = useMemo(() => {
        const term = searchTerm.toLowerCase();

        const filtered = reviews.filter(
            (r) =>
                r.livro?.titulo?.toLowerCase().includes(term) ||
                (r.review || "").toLowerCase().includes(term)
        );

        return filtered.slice().sort((a, b) => {
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);

            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;

            return dateB.getTime() - dateA.getTime();
        });
    }, [reviews, searchTerm]);

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

            <div className="container" style={{ paddingTop: '100px' }}>
                <h3 className="mb-4">Minhas Reviews</h3>

                {filteredReviews.length === 0 && <p className="text-muted">Nenhuma review encontrada.</p>}

                {filteredReviews.map((review) => (
                    <div key={review.id} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between">
                            <div className="flex-grow-1 me-3">
                                <div className="d-flex align-items-center flex-wrap">
                                    <h5 className="mb-0 me-3">{review.livro?.titulo}</h5>
                                    <div className="mt-0">{displayStarRating(review.nota)}</div>
                                </div>

                                <div className="small text-muted mt-1 mb-2">
                                    {review.autor} • {formatDate(review.data)}
                                </div>

                                <p className="mb-0">{review.review}</p>
                            </div>

                            <div className="d-flex flex-column align-items-end flex-shrink-0">
                                <button
                                    className="btn btn-sm btn-outline-secondary mb-2"
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

            <ReviewModal
                show={openAddModal}
                onHide={() => {
                    setOpenAddModal(false);
                    fetchUserReviews();
                }}
                onSaveSuccess={fetchUserReviews}
            />

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