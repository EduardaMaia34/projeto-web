"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getLivroById } from '../../../api/booklyApi';
import Navbar from '../../../components/Navbar';

// NOVO: Importando o Modal que criamos
import ReviewModal from '../../../components/ReviewModal';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './bookDetails.css';

export default function BookPage() {
    const params = useParams();
    const { id } = params;

    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // NOVO: Estado para controlar a abertura do modal
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (id) {
            getLivroById(id)
                .then(data => {
                    setLivro(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Erro ao buscar livro:", error);
                    setErro("Não foi possível carregar o livro.");
                    setLoading(false);
                });
        }
    }, [id]);

    // NOVO: Funções para abrir e fechar o modal
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // NOVO: O que fazer quando salvar com sucesso (ex: recarregar a página ou avisar)
    const handleSaveSuccess = () => {
        alert("Livro logado com sucesso!");
        // Aqui você poderia chamar uma função para recarregar as reviews, por exemplo
    };

    if (loading) {
        return (
            <div className="book-page-wrapper d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    if (erro || !livro) {
        return (
            <div className="book-page-wrapper container mt-5 pt-5 text-center">
                <Navbar />
                <h3>Opa! {erro || "Livro não encontrado."}</h3>
            </div>
        );
    }

    return (
        <div className="book-page-wrapper">
            <Navbar />

            <ReviewModal
                show={showModal}
                onHide={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                initialLivro={livro}  // <--- VOCÊ PRECISA ADICIONAR ESTA LINHA
            />

            <div className="container mt-4">
                <hr className="custom-hr" />

                <div className="row book-details-section py-4">
                    <div className="col-md-3 text-center">
                        <img
                            // OBS: Corrigi o link placeholder, pois link da wikipedia não é imagem e quebraria o layout
                            src={livro.capa || "https://via.placeholder.com/180x270?text=Sem+Capa"}
                            className="img-fluid book-cover"
                            alt={`Capa de ${livro.titulo}`}
                        />
                    </div>

                    <div className="col-md-6 book-info ps-md-4">
                        <div className="d-flex justify-content-between align-items-start">
                            <h2 className="book-title">
                                {livro.titulo} <span className="text-muted fs-5">{livro.anoPublicacao}</span>
                            </h2>
                            <i className="bi bi-bookmark-fill book-bookmark"></i>
                        </div>

                        <p className="rating-text">
                            <span className="fs-4 fw-bold">{livro.mediaAvaliacao || "N/A"}</span>
                            <span className="star-rating ms-2">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                            </span>
                        </p>

                        <div className="mt-2 mb-3">
                            <span className="badge bg-custom-tag me-2">{livro.genero}</span>
                        </div>

                        <p className="book-author">Autor: <strong>{livro.autor}</strong></p>

                        <p className="book-synopsis">
                            {livro.sinopse || "Sinopse não disponível."}
                        </p>
                    </div>

                    <div className="col-md-3 d-flex justify-content-center align-items-center">
                        {/* ALTERADO: Adicionado o evento onClick */}
                        <button
                            className="btn btn-locar-livro"
                            onClick={handleOpenModal}
                        >
                            <span className="feather-icon me-2">
                                <i className="bi bi-feather"></i>
                            </span>
                            Logar Livro
                        </button>
                    </div>
                </div>

                <hr className="custom-hr" />

                <div className="row justify-content-center my-4">
                    <div className="col-md-9 text-center text-muted">
                        <p>As avaliações aparecerão aqui...</p>
                    </div>
                </div>

            </div>
        </div>
    );
}