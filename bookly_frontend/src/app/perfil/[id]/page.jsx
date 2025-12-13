"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ReviewModal from '../../../components/ReviewModal.jsx'; // Importar o Modal de Review
import { getUserById } from '../../../api/booklyApi';

import './perfilDetails.css';

const BookGridItem = ({ src, title, rating }) => (
    <div className="col-6 col-md-3 mb-4 text-center">
        <img
            src={src || "https://via.placeholder.com/150x225?text=Capa"}
            className="book-cover-profile mb-1"
            alt={title}
        />
        {rating && <span className="star-rating-static">★ {rating}</span>}
    </div>
);

export default function PerfilDinamicoPage() {
    const params = useParams();
    const { id } = params;

    const [perfil, setPerfil] = useState(null);
    const [isMeuPerfil, setIsMeuPerfil] = useState(false);
    const [loading, setLoading] = useState(true);

    // Estado para controlar a visibilidade do modal de review
    const [openAddModal, setOpenAddModal] = useState(false);


    useEffect(() => {
        if (id) {
            carregarPerfil();
        }
    }, [id]);

    const carregarPerfil = async () => {
        setLoading(true);
        try {
            const dadosUsuario = await getUserById(id);
            setPerfil(dadosUsuario);

            // Verifica se é o perfil do usuário logado
            const storedUser = localStorage.getItem('userData');
            if (storedUser) {
                const meuUsuario = JSON.parse(storedUser);
                // Verifica se o ID do perfil na URL é igual ao ID do usuário logado
                if (String(meuUsuario.id) === String(id)) {
                    setIsMeuPerfil(true);
                } else {
                    setIsMeuPerfil(false);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    // [ATUALIZADO] Handler para abrir o modal SEM VERIFICAR isMeuPerfil
    const handleAddBookClick = useCallback(() => {
        // O modal deve abrir se o usuário estiver logado (o que é implícito pela Navbar)
        setOpenAddModal(true);
    }, []);

    // Handler para o sucesso da review (pode recarregar a lista de favoritos se necessário)
    const handleSaveSuccess = () => {
        carregarPerfil();
    };

    if (loading) {
        return (
            <div className="perfil-page-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="perfil-page-container text-center pt-5" style={{ minHeight: '100vh' }}>
                <Navbar />
                <h3>Usuário não encontrado.</h3>
            </div>
        );
    }

    const stats = {
        lidos: perfil.totalLidos || 40,
        esteAno: perfil.lidosEsteAno || 10,
        salvos: perfil.totalSalvos || 90
    };

    return (
        <div className="perfil-page-container" style={{ paddingTop: '100px' }}>
            {/* Passando o handler para a Navbar */}
            <Navbar onAddBookClick={handleAddBookClick} />

            <div className="container mt-4">
                <div className="row">

                    {/* === COLUNA DA ESQUERDA === */}
                    <div className="col-lg-8 pe-lg-5">

                        {/* ... (Conteúdo do Perfil) ... */}
                        <div className="d-flex align-items-start mb-5 profile-header-wrapper">

                            <img
                                src={perfil.fotoPerfil || "https://i.imgur.com/i4m4D7y.png"}
                                alt={`Foto de ${perfil.nome}`}
                                className="profile-img-large me-4"
                            />

                            <div className="d-flex flex-column pt-2 w-100">

                                <div className="d-flex align-items-center mb-2 profile-name-block">
                                    <h4 className="mb-0 fw-bold" style={{ fontSize: '2rem' }}>
                                        {perfil.nome}
                                    </h4>

                                    {isMeuPerfil ? (
                                        <a href="/editar-perfil" className="edit-profile-tag ms-3 text-decoration-none">
                                            EDITAR PERFIL
                                        </a>
                                    ) : (
                                        <button className="btn btn-sm btn-outline-success ms-3 fw-bold rounded-pill px-3">
                                            Seguir
                                        </button>
                                    )}
                                </div>

                                <p className="text-muted small mb-3 text-uppercase" style={{ fontSize: '1.1rem', lineHeight: '1.2' }}>
                                    {perfil.bio || "Leitor apaixonado pelo Bookly."}
                                </p>

                                <div className="d-flex mt-2 mb-4 flex-wrap gap-2">
                                    <span className="interest-tag">Romance</span>
                                    <span className="interest-tag">Ficção</span>
                                </div>
                            </div>

                            <div className="stats-container ms-auto pt-2">
                                <div className="stats-item">
                                    <h5 className="mb-0 fw-bold fs-4">{stats.lidos}</h5>
                                    <small className="text-muted text-uppercase fw-bold">Lidos</small>
                                </div>
                                <div className="stats-item">
                                    <h5 className="mb-0 fw-bold fs-4">{stats.esteAno}</h5>
                                    <small className="text-muted text-uppercase fw-bold">Ano</small>
                                </div>
                                <div className="stats-item me-0">
                                    <h5 className="mb-0 fw-bold fs-4">{stats.salvos}</h5>
                                    <small className="text-muted text-uppercase fw-bold">Salvos</small>
                                </div>
                            </div>
                        </div>

                        <h5 className="mb-4 fw-bold text-uppercase ls-1">Favoritos</h5>
                        <div className="row mb-5 gx-3 gy-4">
                            <BookGridItem src="https://i.imgur.com/k9b8f2G.png" title="Livro 1" rating="★★★★☆" />
                            <BookGridItem src="https://i.imgur.com/eBv6d1P.png" title="Livro 2" rating="★★★★☆" />
                            <BookGridItem src="https://i.imgur.com/pY40i0A.png" title="Livro 3" rating="★★★☆☆" />
                            <BookGridItem src="https://i.imgur.com/j4C6s9x.png" title="Livro 4" rating="★★★☆☆" />
                        </div>

                    </div>

                    {/* === SIDEBAR === */}
                    <div className="col-lg-4 mt-5 mt-lg-0">
                        <div className="p-3 sidebar-container">

                            {isMeuPerfil ? (
                                <>
                                    {/* Minha Biblioteca (Watchlist) */}
                                    <a href={`/biblioteca/${id}`} className="sidebar-link">
                                        <span className="sidebar-icon bi bi-bookmarks-fill"></span> Minha Biblioteca
                                    </a>
                                    {/* Minha Estante (Lidos/Com Review) */}
                                    <a href={`/estante/${id}`} className="sidebar-link">
                                        <span className="sidebar-icon bi bi-book-fill"></span> Meus Lidos
                                    </a>
                                    {/* Minhas Reviews */}
                                    <a href={`/reviews/${id}`} className="sidebar-link">
                                        <span className="sidebar-icon bi bi-pencil-square"></span> Minhas Reviews
                                    </a>
                                </>
                            ) : (
                                <>
                                    <div className="alert alert-light border shadow-sm">
                                        <small className="text-dark-custom text-uppercase fw-bold mb-2 d-block">Explorar</small>

                                        {/* Biblioteca (Watchlist) de Outro Usuário */}
                                        <a href={`/biblioteca/${id}`} className="sidebar-link ps-0">
                                            <span className="sidebar-icon bi bi-bookmarks-fill"></span> Biblioteca de {perfil.nome}
                                        </a>
                                        {/* Estante (Lidos) de Outro Usuário */}
                                        <a href={`/estante/${id}`} className="sidebar-link ps-0">
                                            <span className="sidebar-icon bi bi-book-fill"></span> Estante de {perfil.nome}
                                        </a>
                                        {/* Reviews de Outro Usuário */}
                                        <a href={`/reviews/${id}`} className="sidebar-link ps-0">
                                            <span className="sidebar-icon bi bi-chat-quote-fill"></span> Reviews de {perfil.nome}
                                        </a>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* Renderizar o Modal de Review. Ele deve ser visível se a flag show for true */}
            <ReviewModal
                show={openAddModal}
                onHide={() => setOpenAddModal(false)}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
}