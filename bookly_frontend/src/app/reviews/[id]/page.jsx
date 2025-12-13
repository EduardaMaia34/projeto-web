"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from 'next/navigation';
import Navbar from "../../../components/Navbar.jsx";
import ReviewModal from "../../../components/ReviewModal.jsx";
import { fetchReviews, updateReview, deleteReviewApi, getLoggedInUserId, getUserNameById } from "../../../api/booklyApi.js";
import { displayStarRating, formatDate } from "../../../utils.jsx";
import { Modal, Button } from "react-bootstrap";


// --- COMPONENTE TOAST DE CONFIRMAÇÃO ---
const SuccessToast = ({ show, onClose, message, type = 'success' }) => {
    const bgColor = type === 'success' ? 'bg-success' : 'bg-danger';

    return (
        <div
            className={`toast show align-items-center text-white ${bgColor} border-0`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{
                position: 'fixed',
                top: '70px',
                right: '20px',
                zIndex: 1100,
                transition: 'opacity 0.3s ease-in-out',
                opacity: show ? 1 : 0
            }}
        >
            <div className="d-flex">
                <div className="toast-body">
                    {message}
                </div>
                <button
                    type="button"
                    className="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                    onClick={onClose}
                ></button>
            </div>
        </div>
    );
};
// ----------------------------------------


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
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
};


// --- Componente Principal ---

export default function ReviewsPage() {
    const router = useRouter();
    const pathname = usePathname();

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

    // [NOVO] Estado para o Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const isOwner = userIdToFetch === loggedInUserId;

    useEffect(() => {
        setIsClient(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Efeito para esconder o Toast automaticamente
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);


    const fetchUserReviews = useCallback(async () => {
        if (!isAuthenticated() || !userIdToFetch) return;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchReviews(userIdToFetch);
            setReviews(Array.isArray(data) ? data : []);

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

    // [ATUALIZADO] Handler para Salvar Edição
    const handleSaveEdit = async (id, payload) => {
        setLoading(true);
        try {
            await updateReview(id, payload);
            setSelectedReview(null);
            await fetchUserReviews(); // Aguarda o recarregamento dos dados
            setToast({ show: true, message: 'Review editada com sucesso!', type: 'success' });
        } catch (error) {
            console.error('Falha ao salvar edição:', error);
            setToast({ show: true, message: error.message || 'Falha ao salvar a edição da review.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    // [ATUALIZADO] Handler para Deletar
    const handleDelete = async (id) => {
        if (!confirm("Excluir esta review?")) return;
        setLoading(true);
        try {
            await deleteReviewApi(id);
            await fetchUserReviews(); // Aguarda o recarregamento dos dados
            setToast({ show: true, message: 'Review deletada com sucesso!', type: 'success' });
        } catch (error) {
            console.error('Falha ao deletar review:', error);
            setToast({ show: true, message: error.message || 'Falha ao deletar a review.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    // [NOVO] Handler de Sucesso de Criação (para ser passado ao ReviewModal)
    const handleReviewCreationSuccess = () => {
        fetchUserReviews();
        setToast({ show: true, message: 'Review criada com sucesso!', type: 'success' });
    }


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

            {/* O ReviewModal para ADICIONAR Review (se estiver no contexto do dono) */}
            {isOwner && (
                <ReviewModal
                    show={false}
                    onHide={() => {}}
                    onSaveSuccess={handleReviewCreationSuccess} // <-- USANDO NOVO HANDLER
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

            {/* RENDERIZAÇÃO DO TOAST */}
            <SuccessToast
                show={toast.show}
                onClose={() => setToast({ show: false, message: '', type: 'success' })}
                message={toast.message}
                type={toast.type}
            />
        </>
    );
}