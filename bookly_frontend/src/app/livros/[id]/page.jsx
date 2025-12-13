"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getLivroById, getReviewsByLivroId } from '../../../api/booklyApi';
import Navbar from '../../../components/Navbar';
import ReviewModal from '../../../components/ReviewModal';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './bookDetails.css';

const StaticStars = ({ nota }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
        <span className="text-warning">
            {stars.map(star => {
                if (star <= nota) return <i key={star} className="bi bi-star-fill"></i>;
                if (star - 0.5 <= nota) return <i key={star} className="bi bi-star-half"></i>;
                return <i key={star} className="bi bi-star" style={{ color: '#ddd' }}></i>;
            })}
        </span>
    );
};

export default function BookPage() {
    const params = useParams();
    const { id } = params;

    const [livro, setLivro] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const carregarDados = useCallback(() => {
        if (!id) return;

        setLoading(true);

        const promiseLivro = getLivroById(id);
        const promiseReviews = getReviewsByLivroId(id);

        Promise.all([promiseLivro, promiseReviews])
            .then(([dadosLivro, dadosReviews]) => {
                setLivro(dadosLivro);
                setReviews(dadosReviews || []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro ao carregar página:", error);
                setErro("Erro ao carregar informações.");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleSaveSuccess = () => {
        carregarDados();
    };

    if (loading && !livro) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (erro || !livro) {
        return (
            <div className="container mt-5 pt-5 text-center">
                <Navbar />
                <h3>{erro || "Livro não encontrado."}</h3>
            </div>
        );
    }

    return (
        <div className="book-page-wrapper" style={{ backgroundColor: '#fdfbf7', minHeight: '100vh' }}>
            <Navbar />

            <ReviewModal
                show={showModal}
                onHide={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                initialLivro={livro}
            />

            <div className="container mt-4">
                <hr className="custom-hr" />

                <div className="row book-details-section py-4">
                    <div className="col-md-3 text-center">
                        <img
                            src={livro.urlCapa || livro.capa || "https://via.placeholder.com/180x270?text=Sem+Capa"}
                            className="img-fluid rounded shadow"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                            alt={`Capa de ${livro.titulo}`}
                        />
                    </div>

                    <div className="col-md-6 book-info ps-md-4">
                        <div className="d-flex justify-content-between align-items-start">
                            <h2 className="fw-bold text-dark">
                                {livro.titulo} <small className="text-muted fs-6">({livro.anoPublicacao})</small>
                            </h2>
                        </div>

                        <div className="mb-3">
                            <StaticStars nota={livro.mediaAvaliacao || 0} />
                            <span className="ms-2 text-muted fw-bold">
                                {livro.mediaAvaliacao ? livro.mediaAvaliacao.toFixed(1) : "N/A"}
                            </span>
                        </div>

                        <div className="mb-3">
                            <span className="badge bg-secondary me-2">{livro.genero}</span>
                        </div>

                        <p className="fs-5">Autor: <strong>{livro.autor}</strong></p>

                        <p className="text-muted mt-3" style={{ lineHeight: '1.6' }}>
                            {livro.descricao || "Sinopse não disponível."}
                        </p>
                    </div>

                    <div className="col-md-3 d-flex flex-column justify-content-center align-items-center">
                        <button
                            className="btn btn-review-primary btn-lg w-100 shadow-sm"
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
                                                    {review.usuarioNome ? review.usuarioNome.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{review.usuarioNome || "Usuário Anônimo"}</h6>
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
        </div>
    );
}