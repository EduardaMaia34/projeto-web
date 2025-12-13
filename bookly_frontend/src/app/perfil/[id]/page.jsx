"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ReviewModal from '../../../components/ReviewModal.jsx';
import { getUserById, getUserStats, followUser, unfollowUser, getFollowStatus } from '../../../api/booklyApi';

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

const SuccessToast = ({ show, onClose, message }) => {
    return (
        <div
            className="toast show align-items-center text-white bg-success border-0"
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


export default function PerfilDinamicoPage() {
    const params = useParams();
    const { id } = params;

    const [perfil, setPerfil] = useState(null);
    const [isMeuPerfil, setIsMeuPerfil] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    const [stats, setStats] = useState({
        totalLidos: 0,
        lidosEsteAno: 0,
        totalNaBiblioteca: 0
    });

    const [openAddModal, setOpenAddModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isFollowing, setIsFollowing] = useState(false);


    useEffect(() => {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
        if (storedUser) {
            try {
                const meuUsuario = JSON.parse(storedUser);
                setLoggedInUserId(meuUsuario.id);
            } catch (e) {
                setLoggedInUserId(null);
            }
        }
    }, []);


    const carregarPerfil = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const dadosUsuario = await getUserById(id);
            setPerfil(dadosUsuario);

            const loggedUserId = loggedInUserId;

            const isCurrentUsersProfile = String(id) === String(loggedUserId);
            setIsMeuPerfil(isCurrentUsersProfile);

            const dadosStats = await getUserStats(id);
            setStats(dadosStats);

            if (!isCurrentUsersProfile && loggedUserId) {
                const status = await getFollowStatus(id);
                setIsFollowing(status);
            } else {
                setIsFollowing(false);
            }

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            setPerfil(null);
        } finally {
            setLoading(false);
        }
    }, [id, loggedInUserId]);


    useEffect(() => {
        if (id) {
            carregarPerfil();
        }
    }, [id, loggedInUserId, carregarPerfil]);


    const handleSaveSuccess = useCallback(() => {
        carregarPerfil();
    }, [id, carregarPerfil]);


    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);


    const handleAddBookClick = useCallback(() => {
        setOpenAddModal(true);
    }, []);

    const handleFollowClick = async () => {
        if (!perfil || !loggedInUserId) return;

        if (isFollowing) {
            try {
                await unfollowUser(id);
                setIsFollowing(false);
                setToast({ show: true, message: `Você deixou de seguir ${perfil.nome}.` });
            } catch (error) {
                alert(error.message || "Falha ao deixar de seguir.");
            }
        } else {
            try {
                await followUser(id);
                setIsFollowing(true);
                setToast({ show: true, message: `Você agora está seguindo ${perfil.nome}!` });
            } catch (error) {
                alert(error.message || "Falha ao seguir usuário.");
            }
        }
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


    const followButtonClass = isFollowing ? "btn-success" : "btn-outline-success";
    const followButtonText = isFollowing ? "Seguindo" : "Seguir";
    const followButtonStyle = isFollowing ? { backgroundColor: '#387638', borderColor: '#387638', color: 'white' } : {};


    return (
        <div className="perfil-page-container" style={{ paddingTop: '100px' }}>
            <Navbar onAddBookClick={handleAddBookClick} />

            <div className="container mt-4">

                <div className="row">

                    <div className="col-lg-8 pe-lg-5">

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
                                        loggedInUserId && (
                                            <button
                                                className={`btn btn-sm ms-3 fw-bold rounded-pill px-3 ${followButtonClass}`}
                                                style={followButtonStyle}
                                                onClick={handleFollowClick}
                                            >
                                                {followButtonText}
                                            </button>
                                        )
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
                                    <h5 className="mb-0 fw-bold fs-4">{stats.totalLidos}</h5>
                                    <small className="text-muted text-uppercase fw-bold">Lidos</small>
                                </div>
                                <div className="stats-item">
                                    <h5 className="mb-0 fw-bold fs-4">{stats.lidosEsteAno}</h5>
                                    <small className="text-muted text-uppercase fw-bold">Ano</small>
                                </div>
                                <div className="stats-item me-0">
                                    <h5 className="mb-0 fw-bold fs-4">{stats.totalNaBiblioteca}</h5>
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

                    <div className="col-lg-4 mt-5 mt-lg-0">
                        <div className="p-3 sidebar-container">

                            {isMeuPerfil ? (
                                <>
                                    <a href={`/biblioteca/${id}`} className="sidebar-link">
                                        <span className="sidebar-icon bi bi-bookmarks-fill"></span> Minha Biblioteca
                                    </a>
                                    <a href={`/estante/${id}`} className="sidebar-link">
                                        <span className="sidebar-icon bi bi-book-fill"></span> Meus Lidos
                                    </a>
                                    <a href={`/reviews/${id}`} className="sidebar-link">
                                        <span className="sidebar-icon bi bi-pencil-square"></span> Minhas Reviews
                                    </a>
                                </>
                            ) : (
                                <>
                                    <div className="alert alert-light border shadow-sm">
                                        <small className="text-dark-custom text-uppercase fw-bold mb-2 d-block">Explorar</small>

                                        <a href={`/biblioteca/${id}`} className="sidebar-link ps-0">
                                            <span className="sidebar-icon bi bi-bookmarks-fill"></span> Biblioteca de {perfil.nome}
                                        </a>
                                        <a href={`/estante/${id}`} className="sidebar-link ps-0">
                                            <span className="sidebar-icon bi bi-book-fill"></span> Estante de {perfil.nome}
                                        </a>
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

            <ReviewModal
                show={openAddModal}
                onHide={() => setOpenAddModal(false)}
                onSaveSuccess={handleSaveSuccess}
            />

            <SuccessToast
                show={toast.show}
                onClose={() => setToast({ show: false, message: '' })}
                message={toast.message}
            />
        </div>
    );
}