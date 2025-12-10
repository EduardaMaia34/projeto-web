import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../src/components/Navbar.jsx';
import EstanteSearchBar from '../src/components/EstanteSearchBar.jsx';
import { fetchReviews, updateReview, deleteReviewApi } from '../src/api/booklyApi.js';
import { displayStarRating, formatDate } from '../src/utils.jsx';

const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('jwtToken');

const ReviewListItem = ({ review, onEdit, onDelete }) => {
    const starsHtml = displayStarRating(review.nota);
    const dataCriacaoFormatada = formatDate(review.dataCriacao);

    return (
        <div className="review-card-item list-group-item d-flex justify-content-between align-items-center p-3 mb-3 border rounded">
            <div className="review-content">
                <h5 className="mb-1">{review.livro.titulo}</h5>
                <p className="small text-muted mb-1">Por: {review.user.nome} | {dataCriacaoFormatada}</p>
                <div className="star-rating mb-2">{starsHtml}</div>
                <p className="mb-0">{review.review}</p>
            </div>
            <div className="review-actions">
                <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => onEdit(review)}>
                    <i className="bi bi-pencil"></i> Editar
                </button>
                <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(review.id)}>
                    <i className="bi bi-trash"></i> Excluir
                </button>
            </div>
        </div>
    );
};

const EditReviewModal = ({ review, onSave }) => {
    const [currentReviewText, setCurrentReviewText] = useState(review.review || '');
    const [currentNota, setCurrentNota] = useState(review.nota || 0);

    useEffect(() => {
        setCurrentReviewText(review.review || '');
        setCurrentNota(review.nota || 0);
    }, [review]);

    const handleSave = async () => {
        if (currentNota === 0) {
            alert('Por favor, atribua uma nota ao livro.');
            return;
        }

        const payload = {
            nota: parseFloat(currentNota),
            review: currentReviewText
        };
        await onSave(review.id, payload);
    };

    const StarRatingInput = ({ rating, setRating }) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`bi ${i <= rating ? 'bi-star-fill' : 'bi-star'}`}
                    onClick={() => setRating(i)}
                    style={{ cursor: 'pointer', color: 'gold', fontSize: '1.5rem' }}
                />
            );
        }
        return <div className="modal-rating-input">{stars}</div>;
    };

    return (
        <div className="modal fade" id="editReviewModal" tabIndex="-1" aria-labelledby="editReviewModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content custom-modal-content">
                    <div className="modal-header custom-modal-header">
                        <h5 className="modal-title" id="editReviewModalLabel">Editar Review de {review.livro.titulo}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <StarRatingInput rating={currentNota} setRating={setCurrentNota} />
                        <div className="mb-3 mt-3">
                            <label htmlFor="reviewText" className="form-label">Sua opinião sobre o livro:</label>
                            <textarea
                                className="form-control"
                                id="reviewText"
                                rows="3"
                                value={currentReviewText}
                                onChange={(e) => setCurrentReviewText(e.target.value)}></textarea>
                        </div>
                    </div>
                    <div className="modal-footer modal-footer-custom">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" className="btn btn-success" onClick={handleSave}>Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Reviews = () => {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);

    // 1. Importa o JS do Bootstrap APENAS no lado do cliente
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('bootstrap/dist/js/bootstrap.bundle.min.js');
        }
    }, []);

    // 2. Lógica de Proteção de Rota
    useEffect(() => {
        if (typeof window !== 'undefined' && !isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);


    const fetchUserReviews = useCallback(async () => {
        if (!isAuthenticated()) return;

        setLoading(true);
        setError(null);
        try {
            const data = await fetchReviews();
            setReviews(data);
        } catch (err) {
            setError(err.message);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchUserReviews();
        }
    }, [fetchUserReviews]);

    const handleEdit = (review) => {
        setSelectedReview(review);
        // Acessa o Modal do Bootstrap através do objeto global 'window'
        if (typeof window === 'undefined' || !window.bootstrap || !window.bootstrap.Modal) return;
        const modalElement = document.getElementById('editReviewModal');
        const editModal = new window.bootstrap.Modal(modalElement);
        editModal.show();
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('Tem certeza de que deseja excluir esta review?')) {
            try {
                await deleteReviewApi(reviewId);
                fetchUserReviews();
            } catch (err) {
                alert(`Erro ao excluir review: ${err.message}`);
            }
        }
    };

    const handleSaveReview = async (reviewId, payload) => {
        try {
            await updateReview(reviewId, payload);
            if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
                const modalElement = document.getElementById('editReviewModal');
                // Usa getInstance para obter a instância existente e ocultá-la
                window.bootstrap.Modal.getInstance(modalElement).hide();
            }
            fetchUserReviews();
        } catch (err) {
            alert(`Erro ao salvar review: ${err.message}`);
        }
    };

    if (!isAuthenticated()) {
        return <div className="text-center p-5">Redirecionando...</div>;
    }


    return (
        <>
            <Navbar />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 id="pageTitle">Minhas Reviews</h3>
                    <EstanteSearchBar />
                </div>

                <div id="reviewsListContainer" className="list-group list-group-flush">
                    {loading && <p className="text-muted">Carregando reviews...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && reviews.length === 0 && (
                        <p className="text-muted">Você ainda não fez nenhuma review.</p>
                    )}

                    {!loading && !error && reviews.map(review => (
                        <ReviewListItem
                            key={review.id}
                            review={review}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                <div id="pagination-controls" className="d-flex justify-content-center mt-5">

                </div>
            </div>

            {selectedReview && (
                <EditReviewModal review={selectedReview} onSave={handleSaveReview} />
            )}
        </>
    );

};

export default Reviews;