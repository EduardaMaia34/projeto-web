import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';

import SearchModal from "./SearchModal";
import ReviewModal from "./ReviewModal";


const LOGO_BG_COLOR = '#F5F4ED';
const HEADER_BORDER_COLOR = '#DED2C2';
const PRIMARY_TEXT_COLOR = '#594A47';

export default function Navbar({ onAddBookClick }) {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState({ name: "", photo: "" });
    const [userId, setUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [openReviewModal, setOpenReviewModal] = useState(false);

    useEffect(() => {
        let user;
        let token;

        const timer = setTimeout(() => {
            token = localStorage.getItem("jwtToken");
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    const userStr = localStorage.getItem("userData");
                    user = JSON.parse(userStr || "{}");

                    setUserData({
                        name: user.nome || user.name || "Usuário",
                        photo: user.fotoPerfil || user.photo || "",
                    });

                    if (user.id) {
                        setUserId(user.id);
                    }

                    const role = user.role || user.perfil || user.roles;
                    const isAdminCheck = role === 'ROLE_ADMIN' || (Array.isArray(role) && role.includes('ROLE_ADMIN'));

                    setIsAdmin(isAdminCheck);

                } catch (e) {
                    console.error("Erro ao parsear userData:", e);
                    setUserData({ name: "Usuário", photo: "" });
                    setUserId(null);
                    setIsAdmin(false);
                }
            }
            setIsLoadingUser(false);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
        setIsAdmin(false);
        navigate("/");
    };

    const handleReviewSuccess = () => {
        window.location.reload();
    };

    const useIconFallback = !userData.photo || userData.photo === "https://imgur.com/pcf2EUA.png";

    if (isLoadingUser) {
        return (
            <nav
                className="navbar navbar-light header-bar p-3 fixed-top"
                style={{
                    backgroundColor: LOGO_BG_COLOR, // APLICANDO A COR
                    borderBottom: `1px solid ${HEADER_BORDER_COLOR}`,
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' // Sombra para destaque
                }}
            >
                <div className="navbar-brand d-flex align-items-center">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: PRIMARY_TEXT_COLOR }}>Bookly</span>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav
                className="navbar navbar-light header-bar p-3 fixed-top"
                style={{
                    backgroundColor: LOGO_BG_COLOR, // APLICANDO A COR
                    borderBottom: `1px solid ${HEADER_BORDER_COLOR}`,
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' // Sombra para destaque
                }}
            >
                <Link to="/home" className="navbar-brand d-flex align-items-center">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: PRIMARY_TEXT_COLOR }}>Bookly</span>
                </Link>

                <div className="d-flex align-items-center ms-auto">
                    <button
                        className="btn btn-link me-3"
                        onClick={() => setOpenSearchModal(true)}
                        title="Pesquisar Livros, Autores e Usuários"
                        style={{ color: PRIMARY_TEXT_COLOR }} // Cor do ícone
                    >
                        <i className="bi bi-search" style={{ fontSize: '1.2rem' }}></i>
                    </button>

                    <div id="profileGroupNavbar" className="d-flex align-items-center">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    to={userId ? ('/perfil/' + userId) : '/perfil'}
                                    className="d-flex align-items-center me-3 text-decoration-none"
                                    title={userData.name}
                                >
                                    {useIconFallback ? (
                                        <i
                                            className="bi bi-person-circle"
                                            style={{ fontSize: 30, color: PRIMARY_TEXT_COLOR }} // Cor do ícone
                                        ></i>
                                    ) : (
                                        <img
                                            src={userData.photo}
                                            alt={`Perfil de ${userData.name}`}
                                            className="rounded-circle"
                                            style={{ width: 30, height: 30, objectFit: "cover" }}
                                        />
                                    )}
                                </Link>

                                {isAdmin && (
                                    <Link
                                        to="/admin/painel"
                                        className="btn me-3 fw-bold"
                                        style={{ backgroundColor: "#003366", color: "#fff", borderColor: "#003366" }}
                                        title="Área Administrativa"
                                    >
                                        Modo Admin
                                    </Link>
                                )}

                                <button
                                    className="btn btn-success me-3 d-flex align-items-center"
                                    onClick={() => setOpenReviewModal(true)}
                                    style={{ backgroundColor: '#198754', border: 'none' }}
                                >
                                    <span style={{ fontSize: '1.2rem', lineHeight: 1, marginRight: 4 }}>+</span> Livro
                                </button>

                                <button className="btn btn-link" onClick={handleLogout} title="Sair" style={{ color: PRIMARY_TEXT_COLOR }}>
                                    <i className="bi bi-box-arrow-right" style={{ fontSize: '1.2rem' }}></i>
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn me-3 d-flex align-items-center"
                                onClick={handleLogin}
                                style={{ backgroundColor: PRIMARY_TEXT_COLOR, color: '#fff', border: 'none' }}
                            >
                                Log in
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <SearchModal
                show={openSearchModal}
                onHide={() => setOpenSearchModal(false)}
            />

            <ReviewModal
                show={openReviewModal}
                onHide={() => setOpenReviewModal(false)}
                onSaveSuccess={handleReviewSuccess}
            />
        </>
    );
}