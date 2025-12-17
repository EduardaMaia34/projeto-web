import React, { useState, useEffect, useCallback } from 'react';
// MUDANÇA 1: Imports do React Router Dom em vez do Next.js
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from '../../components/Navbar.jsx';
import {
    getLivroById,
    getReviewsByLivroId,
    getLoggedInUserId,
    adicionarLivroApi,
    removerLivroApi,
    fetchLivroStatus
} from '../../api/booklyApi.js';
import ReviewModal from '../../components/ReviewModal.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './bookDetails.css'; // Certifique-se que esse arquivo está na mesma pasta

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
                <div className="toast-body">{message}</div>
                <button
                    type="button"
                    className="btn-close btn-close-white me-2 m-auto"
                    aria-label="Close"
                    onClick={onClose}
                ></button>
            </div>
        </div>
    );
};

const StaticStars = ({ nota }) => {
    const stars = [1, 2, 3, 4, 5];
    const notaArredondada = Math.round(nota * 2) / 2;

    return (
        <span className="text-warning">
            {stars.map(star => {
                if (star <= notaArredondada) return <i key={star} className="bi bi-star-fill"></i>;
                if (star - 0.5 === notaArredondada) return <i key={star} className="bi bi-star-half"></i>;
                return <i key={star} className="bi bi-star" style={{ color: '#ddd' }}></i>;
            })}
        </span>
    );
};

export default function LivroPage() {
    // MUDANÇA 2: Usando os hooks do React Router Dom
    const { id } = useParams(); // Pega o ID direto da URL
    const navigate = useNavigate(); // Substituto do router.push

    const livroId = id;
    const userId = getLoggedInUserId();

    const [livro, setLivro] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [bibliotecaStatus, setBibliotecaStatus] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);


    const carregarDados = useCallback(async () => {
        if (!livroId) {
            setLoading(false);
            setError('ID do livro não encontrado.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promises = [getLivroById(livroId), getReviewsByLivroId(livroId)];

            let statusPromise = Promise.resolve(null);
            if (userId) {
                statusPromise = fetchLivroStatus(livroId);
            }
            promises.push(statusPromise);

            const [livroData, reviewsData, status] = await Promise.all(promises);
            console.log(status)
            setLivro(livroData);
            setReviews(reviewsData || []);
            if (userId) setBibliotecaStatus(status);
        } catch {
            setError('Não foi possível carregar os detalhes do livro.');
        } finally {
            setLoading(false);
        }
    }, [livroId, userId]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleBookmarkClick = async (event) => {
        event.stopPropagation();

        if (bibliotecaStatus === 'LIDO') return;

        if (!userId) {
            setToast({ show: true, message: 'Você precisa estar logado para adicionar livros à sua biblioteca.', type: 'danger' });
            // MUDANÇA 3: router.push vira navigate
            navigate('/login');
            return;
        }

        try {
            if (bibliotecaStatus) {
                await removerLivroApi(livroId);
                setBibliotecaStatus(null);
                setToast({ show: true, message: 'Livro removido da sua biblioteca.', type: 'success' });
            } else {
                await adicionarLivroApi({ livroId, status: 'QUERO_LER' });
                setBibliotecaStatus('QUERO_LER');
                setToast({ show: true, message: "Livro adicionado à lista 'Quero Ler'.", type: 'success' });
            }
        } catch (error) {
            setToast({ show: true, message: error.message || 'Falha ao atualizar a biblioteca.', type: 'danger' });
        }
    };

    const handleCreateReviewClick = () => {
        if (!userId) {
            // MUDANÇA 4: router.push vira navigate
            navigate('/login');
            return;
        }
        setShowReviewModal(true);
    };

    const handleReviewSuccess = () => {
        carregarDados();
        setToast({ show: true, message: 'Review salva com sucesso!', type: 'success' });
        setShowReviewModal(false);
    };

    if (loading && !livro) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Navbar />
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (error || !livro) {
        return (
            <div className="container mt-5 pt-5 text-center">
                <Navbar />
                <h3 className="text-danger">{error || 'Livro não encontrado.'}</h3>
            </div>
        );
    }

    // --- Lógica do Botão ---
    const isLido = bibliotecaStatus === 'LIDO';
    const isBookmarked = !!bibliotecaStatus;

    const bookmarkButtonClass = isBookmarked ? 'bi bi-bookmark-fill bookmark-icon' : 'bi bi-bookmark bookmark-icon';

    const bookmarkColorClass = isLido
        ? 'text-success'
        : isBookmarked
            ? 'text-dark-brown'
            : 'text-muted';

    const bookmarkTitle = isLido
        ? `Status: Lido. Gerencie o status na sua estante.`
        : bibliotecaStatus
            ? `Status atual: ${bibliotecaStatus}. Clique para remover.`
            : 'Adicionar à Biblioteca (Quero Ler)';

    return (
        <div className="book-page-wrapper" style={{ backgroundColor: '#fdfbf7', minHeight: '100vh', paddingTop: '80px' }}>
            <Navbar />

            <ReviewModal
                show={showReviewModal}
                onHide={() => setShowReviewModal(false)}
                onSaveSuccess={handleReviewSuccess}
                initialLivro={livro}
            />

            <div className="container mt-4">
                <hr className="custom-hr" />

                <div className="row book-details-section py-4">
                    <div className="col-md-3 text-center">
                        <img
                            src={livro.urlCapa || livro.capa || 'https://via.placeholder.com/180x270?text=Sem+Capa'}
                            className="img-fluid rounded shadow"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                            alt={`Capa de ${livro.titulo}`}
                        />
                    </div>

                    <div className="col-md-6 book-info ps-md-4">
                        <div className="d-flex align-items-center mb-1">
                            <h2 className="fw-bold text-dark mb-0 me-3">{livro.titulo}</h2>

                            {userId && (
                                <button
                                    className={`btn p-0 border-0 ${bookmarkColorClass}`}
                                    onClick={handleBookmarkClick}
                                    title={bookmarkTitle}
                                    style={{ fontSize: '2rem' }}
                                    disabled={isLido}
                                >
                                    <i className={bookmarkButtonClass}></i>
                                </button>
                            )}
                        </div>

                        <h4 className="text-muted mb-3">por {livro.autor} ({livro.ano || livro.anoPublicacao})</h4>

                        <div className="mb-3">
                            <StaticStars nota={livro.mediaAvaliacao || 0} />
                            <span className="ms-2 text-muted fw-bold">
                                {livro.mediaAvaliacao ? livro.mediaAvaliacao.toFixed(1) : 'N/A'}
                            </span>
                        </div>

                        <div className="mb-4">
                            {(livro.interesses || [livro.genero]).filter(Boolean).map(tag => (
                                <span key={tag} className="badge bg-secondary me-2">{tag}</span>
                            ))}
                        </div>

                        <p className="text-muted mt-3" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {livro.descricao || 'Sinopse não disponível.'}
                        </p>
                    </div>

                    <div className="col-md-3 d-flex flex-column justify-content-start align-items-center pt-md-4">
                        <button
                            className="btn btn-review-dark-brown btn-lg w-100 shadow-sm"
                            onClick={handleCreateReviewClick}
                        >
                            <i className="bi bi-feather me-2"></i>
                            Criar Review
                        </button>
                    </div>
                </div>

                <hr className="custom-hr" />

                <div className="row justify-content-center my-5">
                    <div className="col-md-10">
                        <h4 className="mb-4 fw-bold" style={{ color: '#594A47' }}>Avaliações dos Leitores</h4>

                        {reviews.length === 0 ? (
                            <div className="text-center text-muted p-5 bg-white rounded shadow-sm">
                                <i className="bi bi-chat-square-text fs-1 d-block mb-3"></i>
                                <p>Este livro ainda não tem avaliações. Seja o primeiro a opinar!</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {reviews.map(review => (
                                    <div key={review.id} className="card border-0 shadow-sm p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white fw-bold"
                                                    style={{ width: '40px', height: '40px', flexShrink: 0 }}
                                                >
                                                    {review.autor ? review.autor.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{review.autor || review.usuarioNome || 'Usuário Anônimo'}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                        {review.dataAvaliacao ? new Date(review.dataAvaliacao).toLocaleDateString('pt-BR') : ''}
                                                    </small>
                                                </div>
                                            </div>
                                            <div>
                                                <StaticStars nota={review.nota} />
                                            </div>
                                        </div>
                                        <p className="card-text text-secondary mb-0 ps-5">
                                            "{review.review || review.comentario}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SuccessToast
                show={toast.show}
                onClose={() => setToast({ show: false, message: '', type: 'success' })}
                message={toast.message}
                type={toast.type}
            />
        </div>
    );
}