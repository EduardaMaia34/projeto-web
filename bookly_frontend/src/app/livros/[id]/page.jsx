"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import {
    getLivroById,
    getReviewsByLivroId,
    getLoggedInUserId,
    adicionarLivroApi,
    removerLivroApi,
    fetchEstanteData
} from '../../../api/booklyApi';
import ReviewModal from '../../../components/ReviewModal.jsx'; // Ajuste o caminho se necessário

// Estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './bookDetails.css'; // Importa os estilos customizados

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

// Função auxiliar para renderizar estrelas estáticas
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
    const params = useParams();
    const { id } = params;
    const livroId = id;
    const userId = getLoggedInUserId();

    const [livro, setLivro] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [bibliotecaStatus, setBibliotecaStatus] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);


    const checkInitialStatus = useCallback(async () => {
        if (!userId || !livroId) return null;
        try {
            const data = await fetchEstanteData('biblioteca', userId, 0, 100);
            const entry = data?.content?.find(item => String(item.livroId) === String(livroId));
            return entry ? entry.status : null;
        } catch (e) {
            console.error("Falha ao checar status da biblioteca:", e);
            return null;
        }
    }, [userId, livroId]);


    const carregarDados = useCallback(async () => {
        if (!livroId) {
            setLoading(false);
            setError("ID do livro não encontrado.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const promises = [
                getLivroById(livroId),
                getReviewsByLivroId(livroId),
            ];
            if (userId) {
                promises.push(checkInitialStatus());
            }

            const [livroData, reviewsData, status] = await Promise.all(promises);

            setLivro(livroData);
            setReviews(reviewsData || []);
            if (userId) {
                setBibliotecaStatus(status);
            }

        } catch (err) {
            console.error("Erro ao carregar livro:", err);
            setError("Não foi possível carregar os detalhes do livro.");
        } finally {
            setLoading(false);
        }
    }, [livroId, userId, checkInitialStatus]);


    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);


    useEffect(() => {
        carregarDados();
    }, [carregarDados]);


    const handleBookmarkClick = async (event) => {
        event.stopPropagation();

        if (!userId) {
            setToast({ show: true, message: "Você precisa estar logado para adicionar livros à sua biblioteca.", type: 'danger' });
            return;
        }

        try {
            if (bibliotecaStatus) {
                await removerLivroApi(livroId);
                setBibliotecaStatus(null);
                setToast({ show: true, message: `Livro removido da sua biblioteca.`, type: 'success' });
            } else {
                await adicionarLivroApi({ livroId: livroId, status: 'QUERO_LER' });
                setBibliotecaStatus('QUERO_LER');
                setToast({ show: true, message: `Livro adicionado à lista 'Quero Ler'.`, type: 'success' });
            }
        } catch (error) {
            console.error("Erro ao gerenciar biblioteca:", error);
            setToast({ show: true, message: error.message || "Falha ao atualizar a biblioteca.", type: 'danger' });
        }
    };

    const handleReviewSuccess = () => {
        carregarDados();
        setToast({ show: true, message: "Review salva com sucesso!", type: 'success' });
        setShowReviewModal(false);
    }

    const handleOpenModal = () => setShowReviewModal(true);
    const handleCloseModal = () => setShowReviewModal(false);


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
                <h3 className="text-danger">{error || "Livro não encontrado."}</h3>
            </div>
        );
    }

    const bookmarkButtonClass = bibliotecaStatus
        ? 'bi bi-bookmark-fill'
        : 'bi bi-bookmark';

    const bookmarkTitle = bibliotecaStatus
        ? `Status atual: ${bibliotecaStatus}. Clique para remover.`
        : "Adicionar à Biblioteca (Quero Ler)";


    return (
        <div className="book-page-wrapper" style={{ backgroundColor: '#fdfbf7', minHeight: '100vh', paddingTop: '80px' }}>
            <Navbar />

            <ReviewModal
                show={showReviewModal}
                onHide={handleCloseModal}
                livroId={livroId}
                livroTitle={livro.titulo}
                onSaveSuccess={handleReviewSuccess}
            />

            <div className="container mt-4">
                <hr className="custom-hr" />

                <div className="row book-details-section py-4">

                    {/* Coluna da Imagem */}
                    <div className="col-md-3 text-center">
                        <img
                            src={livro.urlCapa || livro.capa || "https://via.placeholder.com/180x270?text=Sem+Capa"}
                            className="img-fluid rounded shadow"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                            alt={`Capa de ${livro.titulo}`}
                        />
                    </div>

                    {/* Coluna dos Detalhes (col-md-6) */}
                    <div className="col-md-6 book-info ps-md-4">
                        <div className="d-flex align-items-center mb-1">
                            <h2 className="fw-bold text-dark mb-0 me-3">
                                {livro.titulo}
                            </h2>

                            {/* Botão de Bookmark (Marrom Escuro) */}
                            {userId && (
                                <button
                                    // Usamos a classe 'text-dark-brown' para o ícone.
                                    className={`btn p-0 border-0 ${bibliotecaStatus ? 'text-dark-brown' : 'text-muted'}`}
                                    onClick={handleBookmarkClick}
                                    title={bookmarkTitle}
                                    style={{ fontSize: '2rem' }}
                                >
                                    <i className={`${bookmarkButtonClass}`}></i>
                                </button>
                            )}
                        </div>

                        <h4 className="text-muted mb-3">por {livro.autor} ({livro.ano || livro.anoPublicacao})</h4>

                        {/* Avaliação */}
                        <div className="mb-3">
                            <StaticStars nota={livro.mediaAvaliacao || 0} />
                            <span className="ms-2 text-muted fw-bold">
                                {livro.mediaAvaliacao ? livro.mediaAvaliacao.toFixed(1) : "N/A"}
                            </span>
                        </div>

                        {/* Tags / Gênero */}
                        <div className="mb-4">
                            {(livro.interesses || [livro.genero]).filter(Boolean).map(tag => (
                                <span key={tag} className="badge bg-secondary me-2">{tag}</span>
                            ))}
                        </div>

                        {/* Descrição */}
                        <p className="text-muted mt-3" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {livro.descricao || "Sinopse não disponível."}
                        </p>
                    </div>

                    {/* Coluna das Ações (col-md-3) - Review */}
                    <div className="col-md-3 d-flex flex-column justify-content-start align-items-center pt-md-4">
                        <button
                            // Classe do botão de Review, usando o novo estilo com hover invertido
                            className="btn btn-review-dark-brown btn-lg w-100 shadow-sm"
                            onClick={handleOpenModal}
                        >
                            <i className="bi bi-feather me-2"></i>
                            Criar Review
                        </button>
                    </div>
                </div>

                <hr className="custom-hr" />

                {/* --- SEÇÃO DE REVIEWS --- */}
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
                                {reviews.map((review) => (
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
                                                    <h6 className="mb-0 fw-bold">{review.autor || review.usuarioNome || "Usuário Anônimo"}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                        {review.dataAvaliacao ? new Date(review.dataAvaliacao).toLocaleDateString('pt-BR') : ""}
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

            {/* Renderização do Toast */}
            <SuccessToast
                show={toast.show}
                onClose={() => setToast({ show: false, message: '', type: 'success' })}
                message={toast.message}
                type={toast.type}
            />
        </div>
    );
}