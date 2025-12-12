import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/Navbar.jsx";
import ReviewSearchBar from "../src/components/ReviewSearchBar.jsx";
import { fetchReviews, updateReview, deleteReviewApi } from "../src/api/booklyApi.js";
import { displayStarRating, formatDate } from "../src/utils.jsx";

import { Modal, Button } from "react-bootstrap";

const ReviewListItem = ({ review, onEdit, onDelete }) => {
    const starsHtml = displayStarRating(review?.nota || 0);
    const dataFormatada = review?.data ? formatDate(review.data) : "Data desconhecida";

    return (
        <div className="review-card-item list-group-item d-flex justify-content-between align-items-center p-3 mb-3 border rounded">
            <div className="review-content">
                <h5 className="mb-1">{review?.livro?.titulo}</h5>
                <p className="small text-muted mb-1">
                    Por: {review?.autor} | {dataFormatada}
                </p>
                <div className="star-rating mb-2">{starsHtml}</div>
                <p className="mb-0">{review?.review}</p>
            </div>

            <div className="review-actions">
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(review)}>
                    <i className="bi bi-pencil"></i> Editar
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(review.id)}>
                    <i className="bi bi-trash"></i> Excluir
                </button>
            </div>
        </div>
    );
};

const renderStarsForInput = (rating, setNota) => {
    const displayRating = parseFloat(rating) || 0;
    let stars = [];

    const handleStarClick = (starValue) => {
        let newRating;

        if (displayRating === starValue) {
            newRating = starValue - 0.5;
        }
        else if (displayRating === starValue - 0.5) {
            newRating = starValue;
        }
        else {
            newRating = starValue;
        }

        if (newRating < 0) newRating = 0;
        if (newRating > 5) newRating = 5;

        setNota(newRating);
    };

    for (let i = 1; i <= 5; i++) {
        let iconClass;
        let starColor = '#e0e0e0';

        if (i <= displayRating) {
            iconClass = 'bi-star-fill';
            starColor = 'gold';
        } else if (i - 0.5 <= displayRating) {
            iconClass = 'bi-star-half';
            starColor = 'gold';
        } else {
            iconClass = 'bi-star';
        }

        stars.push(
            <i
                key={i}
                className={`bi ${iconClass}`}
                style={{ fontSize: "1.5rem", color: starColor, cursor: "pointer" }}
                onClick={() => handleStarClick(i)}
            ></i>
        );
    }
    return stars;
};


export default function Reviews() {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedReview, setSelectedReview] = useState(null);
    const [nota, setNota] = useState(0);
    const [texto, setTexto] = useState("");

    const { userId } = router.query;

    const fetchUserReviews = useCallback(async () => {
        try {
            const data = await fetchReviews(userId);
            console.log("LOG 1 - Dados da API de Reviews recebidos:", data);
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (router.isReady) fetchUserReviews();
    }, [router.isReady, fetchUserReviews]);

    const filteredReviews = useMemo(() => {
        console.log("LOG 2 - Aplicando filtro. Termo:", searchTerm, "Total de Reviews:", reviews.length);
        if (!searchTerm) {
            return reviews;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();

        return reviews.filter(review => {
            const titulo = review.livro?.titulo?.toLowerCase() || '';
            const reviewText = review.review?.toLowerCase() || '';

            return titulo.includes(lowerCaseSearch) || reviewText.includes(lowerCaseSearch);
        });
    }, [reviews, searchTerm]);

    const openEditModal = (review) => {
        setSelectedReview(review);
        setNota(review.nota);
        setTexto(review.review);
    };

    const handleSaveReview = async () => {
        try {
            await updateReview(selectedReview.id, { nota, review: texto });
            setSelectedReview(null);
            fetchUserReviews();
        } catch (error) {
            console.error('Falha ao salvar a review:', error);
            alert('Falha ao salvar a review. Consulte o console para detalhes.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir esta review?")) return;
        try {
            await deleteReviewApi(id);
            fetchUserReviews();
        } catch (error) {
            console.error('Falha ao deletar a review:', error);
            alert('Falha ao deletar a review. Consulte o console para detalhes.');
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        console.log("LOG 4 - Termo de Busca Atualizado para:", value);
    };

    return (
        <>
            <Navbar onSearchChange={handleSearchChange} currentSearchTerm={searchTerm} />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Minhas Reviews</h3>
                    <ReviewSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </div>

                {loading && <p className="text-muted">Carregando reviews...</p>}
                {!loading && error && <p className="text-danger">Erro: {error}</p>}
                {!loading && filteredReviews.length === 0 && (
                    <p className="text-muted">
                        {searchTerm ? `Nenhuma review encontrada para "${searchTerm}".` : "Você ainda não fez nenhuma review."}
                    </p>
                )}

                {!loading && !error && filteredReviews.map((review) => (
                    <ReviewListItem
                        key={review.id}
                        review={review}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            <Modal show={!!selectedReview} onHide={() => setSelectedReview(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Review</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedReview && (
                        <>
                            <p className="text-muted">Livro: {selectedReview.livro.titulo}</p>

                            <div className="mb-3">
                                <span className="fw-bold">Nota:</span>
                                <div className="mt-2">
                                    {renderStarsForInput(nota, setNota)}
                                </div>
                            </div>

                            <textarea
                                className="form-control"
                                rows="4"
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                            ></textarea>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedReview(null)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleSaveReview}>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}