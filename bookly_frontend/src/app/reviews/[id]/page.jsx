"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
// Importações do App Router
import { useRouter, usePathname } from 'next/navigation';
import Navbar from "../../../components/Navbar.jsx";
import ReviewModal from "../../../components/ReviewModal.jsx";
// Assumindo que essas funções foram atualizadas no booklyApi.js
import { fetchReviews, updateReview, deleteReviewApi, getLoggedInUserId, getUserNameById } from "../../../api/booklyApi.js";
import { displayStarRating, formatDate } from "../../../utils.jsx";
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

// --- Funções de Ajuda (Helpers) ---
const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('jwtToken');

const getUserIdFromPathname = (pathname) => {
    // Exemplo: pathname = /reviews/123 -> retorna 123
    const segments = pathname.split('/').filter(Boolean);
    // O ID é o último segmento
    return segments.length > 0 ? segments[segments.length - 1] : null;
};


// --- Componente Principal ---

export default function ReviewsPage() {
    const router = useRouter();
    const pathname = usePathname();

    // [NOVO] Obtém o ID do pathname ou usa o ID logado como fallback.
    const urlUserId = getUserIdFromPathname(pathname);
    const loggedInUserId = useMemo(() => getLoggedInUserId(), []);
    const userIdToFetch = urlUserId && urlUserId !== 'reviews' ? urlUserId : loggedInUserId;

    const [isClient, setIsClient] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const [pageTitle, setPageTitle] = useState("Reviews");

    // [NOVO] Verifica se a página pertence ao usuário logado
    const isOwner = userIdToFetch === loggedInUserId;


    useEffect(() => {
        setIsClient(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const fetchUserReviews = useCallback(async () => {
        if (!isAuthenticated() || !userIdToFetch) return;

        setLoading(true);
        setError(null);

        try {
            // Usa userIdToFetch para buscar os dados
            const data = await fetchReviews(userIdToFetch);
            setReviews(Array.isArray(data) ? data : []);

            // Define o título da página
            if (isOwner) {
                setPageTitle('Minhas Reviews');
            } else {
                try {
                    const fetchedUserName = await getUserNameById(userIdToFetch);
                    setPageTitle(`Reviews de ${fetchedUserName}`);
                } catch (e) {
                    setPageTitle(`Reviews de Usuário ${userIdToFetch}`);
                }
            }

        } catch (err) {
            if (String(err.message).includes('403') || String(err.message).includes('401')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userData');
                }
                router.push('/login');
                return;
            }
            setError(err.message || 'Falha ao carregar reviews.');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [userIdToFetch, isOwner, router]);

    useEffect(() => {
        if (isClient && isAuthenticated() && userIdToFetch) {
            fetchUserReviews();
        }
    }, [isClient, fetchUserReviews, userIdToFetch]);

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
        setLoading(true);
        try {
            await updateReview(id, payload);
            setSelectedReview(null);
            fetchUserReviews();
        } catch (error) {
            console.error('Falha ao salvar edição:', error);
            alert('Falha ao salvar a edição da review.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir esta review?")) return;
        setLoading(true);
        try {
            await deleteReviewApi(id);
            fetchUserReviews();
        } catch (error) {
            console.error('Falha ao deletar review:', error);
            alert('Falha ao deletar a review.');
        } finally {
            setLoading(false);
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
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                currentSearchTerm={searchTerm}
            />

            <div className="container" style={{ paddingTop: '100px' }}>
                <h3 className="mb-4" style={{ color: '#594A47' }}>{pageTitle}</h3>

                {loading && <p className="text-muted">Carregando reviews...</p>}
                {error && <p className="text-danger">{error}</p>}

                {!loading && !error && filteredReviews.length === 0 && <p className="text-muted" style={{ color: '#594A47' }}>Nenhuma review encontrada.</p>}

                {(!loading && !error) && filteredReviews.map((review) => (
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

                            {/* Ações de Edição/Exclusão só para o proprietário da página */}
                            {isOwner && (
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
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mantive o ReviewModal aqui, mas ele geralmente é usado para ADICIONAR uma review,
                o que só faria sentido na página do dono */}
            {isOwner && (
                <ReviewModal
                    show={false} // Não é usado para adicionar aqui, mas para editar (usando o Modal abaixo)
                    onHide={() => {}}
                    onSaveSuccess={fetchUserReviews}
                />
            )}

            <Modal show={!!selectedReview} onHide={() => setSelectedReview(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Review</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedReview && (
                        <>
                            <p className="text-muted">Livro: {selectedReview.livro?.titulo}</p>

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