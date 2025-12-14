"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import ReviewModal from '../../../components/ReviewModal.jsx';
import AddBookSearchModal from '../../../components/AddBookModal.jsx';
import BookCard from '../../../components/BookCard.jsx';
import {
    getUserById,
    getUserStats,
    followUser,
    unfollowUser,
    getFollowStatus,
    fetchInteresses,
    fetchFavoriteBooks
} from '../../../api/booklyApi';

import './perfilDetails.css';


const AddBookSlot = ({ onClick }) => (
    <div className="col-6 col-md-3 mb-4 text-center">
        <button
            onClick={onClick}
            className="btn btn-outline-secondary d-flex justify-content-center align-items-center mx-auto"
            style={{
                width: '100%',
                maxWidth: '150px',
                height: '225px',
                borderWidth: '2px',
                borderStyle: 'dashed',
                color: '#387638',
                borderColor: '#387638',
                backgroundColor: 'transparent'
            }}
        >
            <i className="bi bi-plus-lg" style={{ fontSize: '2rem' }}></i>
        </button>
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

    const [interessesMap, setInteressesMap] = useState({});
    const [favoritos, setFavoritos] = useState([]);

    const [stats, setStats] = useState({
        totalLidos: 0,
        lidosEsteAno: 0,
        totalNaBiblioteca: 0
    });

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isFollowing, setIsFollowing] = useState(false);


    useEffect(() => {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
        if (storedUser) {
            try {
                const meuUsuario = JSON.parse(storedUser);
                if (meuUsuario && (typeof meuUsuario.id === 'string' || typeof meuUsuario.id === 'number')) {
                    setLoggedInUserId(meuUsuario.id);
                }
            } catch (e) {
                setLoggedInUserId(null);
            }
        }

        const loadInteresses = async () => {
            try {
                const interessesList = await fetchInteresses();
                const map = {};
                interessesList.forEach(interesse => {
                    map[interesse.id] = interesse.nome;
                });
                setInteressesMap(map);
            } catch (error) {
                console.error("Erro ao carregar lista de interesses:", error);
            }
        };

        loadInteresses();
    }, []);


    const carregarPerfil = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [dadosUsuario, dadosStats, dadosFavoritos] = await Promise.all([
                getUserById(id),
                getUserStats(id),
                fetchFavoriteBooks(id)
            ]);

            setPerfil(dadosUsuario);
            setStats(dadosStats);
            setFavoritos(dadosFavoritos);

            const loggedUserId = loggedInUserId;
            const isCurrentUsersProfile = String(id) === String(loggedUserId);
            setIsMeuPerfil(isCurrentUsersProfile);

            if (!isCurrentUsersProfile && loggedUserId) {
                const status = await getFollowStatus(id);
                setIsFollowing(status);
            } else {
                setIsFollowing(false);
            }

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            setPerfil(null);
            setFavoritos([]);
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


    const handleOpenAddBookModal = useCallback(() => {
        setOpenSearchModal(true);
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

    const userInteresses = perfil.interessesIds
        ? perfil.interessesIds
            .map(id => interessesMap[id])
            .filter(name => name)
        : [];

    const MAX_FAVORITES = 4;
    const canAddFavorite = isMeuPerfil && favoritos.length < MAX_FAVORITES;


    return (
        <div className="perfil-page-container" style={{  paddingTop: '100px' }}>
            <Navbar />

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
                                    {userInteresses.length > 0 ? (
                                        userInteresses.map(interesseNome => (
                                            <span key={interesseNome} className="interest-tag">
                                                {interesseNome}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-muted small">Nenhum interesse listado.</span>
                                    )}
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
                            {favoritos.length > 0 ? (
                                favoritos.map(livro => (
                                    <div key={livro.id} className="col-6 col-md-3 mb-4 text-center">
                                        {/* SUBSTITUIÇÃO: Usando BookCard para renderizar */}
                                        <BookCard item={livro} type="favorite" />
                                    </div>
                                ))
                            ) : (
                                !canAddFavorite && !isMeuPerfil && (
                                    <div className="col-12">
                                        <p className="text-muted">
                                            {perfil.nome} ainda não adicionou livros favoritos.
                                        </p>
                                    </div>
                                )
                            )}

                            {/* Slot de adição: aparece se puder adicionar (é o próprio perfil e não atingiu o limite) */}
                            {canAddFavorite && (
                                <AddBookSlot onClick={handleOpenAddBookModal} />
                            )}

                            {/* Caso a lista esteja vazia E seja o perfil logado */}
                            {isMeuPerfil && favoritos.length === 0 && (
                                <AddBookSlot onClick={handleOpenAddBookModal} />
                            )}
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
                                        <span className="sidebar-icon bi bi-book-fill"></span> Minha Estante
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

            <AddBookSearchModal
                show={openSearchModal}
                onHide={() => setOpenSearchModal(false)}
                currentUserId={loggedInUserId}
                onBookAdded={handleSaveSuccess}
                currentFavoritesCount={favoritos.length}
                maxFavorites={MAX_FAVORITES}
            />

            <SuccessToast
                show={toast.show}
                onClose={() => setToast({ show: false, message: '' })}
                message={toast.message}
            />
        </div>
    );
}