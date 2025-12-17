import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import Navbar from '../../components/Navbar.jsx';
import ReviewModal from '../../components/ReviewModal.jsx';
import AddBookSearchModal from '../../components/AddBookModal.jsx'; // Nome do arquivo ajustado
import BookCard from '../../components/BookCard.jsx';

// Certifique-se que o caminho da API está correto
import {
    getUserById,
    getUserStats,
    followUser,
    unfollowUser,
    getFollowStatus,
    fetchInteresses,
    fetchFavoriteBooks
} from '../../api/booklyApi.js';

// Se você não tiver esse CSS, pode remover o import ou criar o arquivo
// import './perfilDetails.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- Subcomponentes ---

const BookGridItem = ({ src, title, rating }) => (
    <div className="col-6 col-md-3 mb-4 text-center">
        <img src={src} alt={title} className="img-fluid rounded shadow-sm mb-2" style={{ width: '100px', height: '150px', objectFit: 'cover' }} />
        <h6 className="mb-1" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</h6>
        <small className="text-warning">{rating}</small>
    </div>
);

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
            style={{
                position: 'fixed',
                top: '80px', // Abaixo da navbar
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
                    onClick={onClose}
                ></button>
            </div>
        </div>
    );
};

export default function PerfilDinamicoPage() {
    const params = useParams();
    const navigate = useNavigate();

    // Estados
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

    // 1. Carregar Usuário Logado e Interesses (Montagem)
    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const meuUsuario = JSON.parse(storedUser);
                if (meuUsuario && meuUsuario.id) {
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
                if(Array.isArray(interessesList)){
                    interessesList.forEach(interesse => {
                        map[interesse.id] = interesse.nome;
                    });
                }
                setInteressesMap(map);
            } catch (error) {
                console.error("Erro ao carregar lista de interesses:", error);
            }
        };

        loadInteresses();
    }, []);

    // 2. Definir qual ID buscar
    // Se params.id existir, usa ele. Se não, usa o ID do logado.
    const targetId = params.id || loggedInUserId;

    // 3. Função de Carregar Perfil
    const carregarPerfil = useCallback(async () => {
        // Se ainda não temos nem ID da URL nem ID logado, espera
        if (!targetId) {
            // Se não tem params.id e o loggedInUserId ainda está null (mas pode carregar), mantemos loading false momentaneamente
            // Mas se realmente não tiver ninguém logado e acessar /perfil, redirecionamos:
            if (!params.id && loggedInUserId === null) {
                // Aguarda um pouco ou redireciona para login (opcional)
                // navigate('/login');
            }
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [dadosUsuario, dadosStats, dadosFavoritos] = await Promise.all([
                getUserById(targetId),
                getUserStats(targetId),
                fetchFavoriteBooks(targetId)
            ]);

            setPerfil(dadosUsuario);
            setStats(dadosStats);
            setFavoritos(dadosFavoritos || []);

            // Verifica se é o dono do perfil
            const isCurrentUsersProfile = String(targetId) === String(loggedInUserId);
            setIsMeuPerfil(isCurrentUsersProfile);

            // Verifica status de seguir (apenas se não for o próprio perfil e estiver logado)
            if (!isCurrentUsersProfile && loggedInUserId) {
                try {
                    const status = await getFollowStatus(targetId);
                    setIsFollowing(status);
                } catch (e) {
                    console.warn("Erro ao checar follow status", e);
                    setIsFollowing(false);
                }
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
    }, [targetId, loggedInUserId, params.id]);

    // Dispara o carregamento quando muda o ID alvo
    useEffect(() => {
        carregarPerfil();
    }, [carregarPerfil]);


    // Handlers
    const handleAddBookClick = () => setOpenAddModal(true);
    const handleOpenAddBookModal = () => setOpenSearchModal(true);
    const handleSaveSuccess = () => carregarPerfil(); // Recarrega dados após salvar

    // Toast Timer
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast({ show: false, message: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleFollowClick = async () => {
        if (!perfil || !loggedInUserId) return;

        try {
            if (isFollowing) {
                await unfollowUser(targetId);
                setIsFollowing(false);
                setToast({ show: true, message: `Você deixou de seguir ${perfil.nome}.` });
            } else {
                await followUser(targetId);
                setIsFollowing(true);
                setToast({ show: true, message: `Você agora está seguindo ${perfil.nome}!` });
            }
        } catch (error) {
            alert(error.message || "Erro ao alterar status de seguir.");
        }
    };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#fdfbf7' }}>
                <Navbar onAddBookClick={handleAddBookClick}/>
                <div className="spinner-border" style={{color: '#594A47'}}></div>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="text-center pt-5" style={{ minHeight: '100vh', backgroundColor: '#fdfbf7' }}>
                <Navbar onAddBookClick={handleAddBookClick}/>
                <h3 className="mt-5 text-muted">Usuário não encontrado.</h3>
                <button className="btn btn-outline-dark mt-3" onClick={() => navigate('/home')}>Voltar para Home</button>
            </div>
        );
    }

    const followButtonClass = isFollowing ? "btn-success" : "btn-outline-success";
    const followButtonText = isFollowing ? "Seguindo" : "Seguir";
    const followButtonStyle = isFollowing
        ? { backgroundColor: '#387638', borderColor: '#387638', color: 'white' }
        : { borderColor: '#387638', color: '#387638' }; // Ajuste visual para ficar bonito quando não segue

    const userInteresses = perfil.interessesIds
        ? perfil.interessesIds
            .map(id => interessesMap[id])
            .filter(name => name)
        : [];

    const MAX_FAVORITES = 4;
    const canAddFavorite = isMeuPerfil && favoritos.length < MAX_FAVORITES;

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#fdfbf7', paddingBottom: '50px' }}>
            <Navbar onAddBookClick={handleAddBookClick} />

            <div className="container mt-4">
                <div className="row">

                    {/* === COLUNA DA ESQUERDA (Info Principal) === */}
                    <div className="col-lg-8 pe-lg-5">

                        <div className="d-flex align-items-start mb-5 flex-wrap flex-md-nowrap">

                            <img
                                src={perfil.fotoPerfil || "https://placehold.co/150x150?text=User"}
                                alt={`Foto de ${perfil.nome}`}
                                className="me-4 rounded-circle shadow-sm"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #fff' }}
                            />

                            <div className="d-flex flex-column pt-2 w-100">

                                <div className="d-flex align-items-center mb-2 flex-wrap">
                                    <h4 className="mb-0 fw-bold" style={{ fontSize: '2rem', color: '#594A47' }}>
                                        {perfil.nome}
                                    </h4>

                                    {isMeuPerfil ? (
                                        <Link
                                            to="/perfil/editar"
                                            className="btn btn-sm btn-outline-secondary ms-3 rounded-pill px-3"
                                            style={{fontSize: '0.8rem', letterSpacing: '1px'}}
                                        >
                                            EDITAR PERFIL
                                        </Link>
                                    ) : (
                                        loggedInUserId && (
                                            <button
                                                className={`btn btn-sm ms-3 fw-bold rounded-pill px-3`}
                                                style={followButtonStyle}
                                                onClick={handleFollowClick}
                                            >
                                                {followButtonText}
                                            </button>
                                        )
                                    )}
                                </div>

                                <p className="text-muted small mb-3" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
                                    {perfil.bio || "Leitor apaixonado pelo Bookly."}
                                </p>

                                <div className="d-flex mt-2 mb-4 flex-wrap gap-2">
                                    {/* Exibe interesses do objeto completo ou mapeados pelos IDs */}
                                    {perfil.interesses && perfil.interesses.map((interesse, index) => (
                                        <span key={index} className="badge bg-light text-dark border">{interesse.nome || interesse}</span>
                                    ))}

                                    {!perfil.interesses && userInteresses.map(interesseNome => (
                                        <span key={interesseNome} className="badge bg-light text-dark border">
                                            {interesseNome}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Box */}
                            <div className="d-flex gap-4 ms-auto pt-2 text-center bg-white p-3 rounded shadow-sm border">
                                <div>
                                    <h5 className="mb-0 fw-bold fs-4 text-dark">{stats.totalLidos || 0}</h5>
                                    <small className="text-muted text-uppercase" style={{fontSize: '0.7rem'}}>Lidos</small>
                                </div>
                                <div className="border-start mx-2"></div>
                                <div>
                                    <h5 className="mb-0 fw-bold fs-4 text-dark">{stats.totalNaBiblioteca || 0}</h5>
                                    <small className="text-muted text-uppercase" style={{fontSize: '0.7rem'}}>Salvos</small>
                                </div>
                            </div>
                        </div>

                        <h5 className="mb-4 fw-bold text-uppercase" style={{color: '#594A47', letterSpacing: '1px'}}>Favoritos</h5>
                        <div className="row mb-5">
                            {favoritos.length > 0 ? (
                                favoritos.map(livro => (
                                    <div key={livro.id} className="col-6 col-md-3 mb-4 d-flex justify-content-center">
                                        <BookCard item={livro} type="favorite" />
                                    </div>
                                ))
                            ) : (
                                !canAddFavorite && (
                                    <div className="col-12">
                                        <p className="text-muted">Nenhum favorito adicionado.</p>
                                    </div>
                                )
                            )}

                            {/* Slot de adição */}
                            {canAddFavorite && (
                                <AddBookSlot onClick={handleOpenAddBookModal} />
                            )}
                        </div>
                    </div>

                    {/* === SIDEBAR (Direita) === */}
                    <div className="col-lg-4 mt-4 mt-lg-0">
                        <div className="bg-white p-4 rounded shadow-sm border">
                            <h6 className="text-uppercase fw-bold text-muted mb-3 small">Navegação</h6>
                            <div className="d-flex flex-column gap-3">
                                <Link to={`/biblioteca/${targetId}`} className="text-decoration-none text-dark d-flex align-items-center p-2 rounded hover-bg-light">
                                    <i className="bi bi-bookmarks-fill me-3 fs-5" style={{color: '#594A47'}}></i>
                                    <span>{isMeuPerfil ? "Minha Biblioteca" : `Biblioteca de ${perfil.nome}`}</span>
                                </Link>
                                <Link to={`/estante/${targetId}`} className="text-decoration-none text-dark d-flex align-items-center p-2 rounded hover-bg-light">
                                    <i className="bi bi-book-fill me-3 fs-5" style={{color: '#594A47'}}></i>
                                    <span>{isMeuPerfil ? "Minha Estante" : `Estante de ${perfil.nome}`}</span>
                                </Link>
                                <Link to={`/reviews/${targetId}`} className="text-decoration-none text-dark d-flex align-items-center p-2 rounded hover-bg-light">
                                    <i className="bi bi-pencil-square me-3 fs-5" style={{color: '#594A47'}}></i>
                                    <span>{isMeuPerfil ? "Minhas Reviews" : `Reviews de ${perfil.nome}`}</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modais */}
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