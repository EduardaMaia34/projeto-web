// src/components/Navbar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchModal from "./SearchModal";

export default function Navbar({ onAddBookClick }) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState({ name: "", photo: "" });
    const [userId, setUserId] = useState(null);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        let user;
        let token;

        // Atrasar um pouco para garantir que o localStorage seja resolvido no cliente
        const timer = setTimeout(() => {
            token = typeof window !== "undefined" && localStorage.getItem("jwtToken");
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    // Tenta ler userData
                    user = JSON.parse(localStorage.getItem("userData") || "{}");
                    setUserData({
                        name: user.nome || user.name || "Usuário",
                        photo: user.fotoPerfil || user.photo || "",
                    });

                    if (user.id) {
                        setUserId(user.id);
                    }

                } catch (e) {
                    console.error("Erro ao parsear userData:", e);
                    setUserData({ name: "Usuário", photo: "" });
                    setUserId(null);
                }
            }
            setIsLoadingUser(false);
        }, 50); // Pequeno delay de 50ms

        return () => clearTimeout(timer);
    }, []);

    const handleLogin = () => {
        router.push("/login");
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userData");
            router.push("/");
            window.location.reload();
        }
    };

    const useIconFallback = !userData.photo || userData.photo === "https://imgur.com/pcf2EUA.png";

    if (isLoadingUser) {
        return (
            <nav className="navbar navbar-light header-bar p-3 fixed-top">
                <div className="navbar-brand d-flex align-items-center">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                    Bookly
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="navbar navbar-light header-bar p-3 fixed-top">
                <Link href="/" className="navbar-brand d-flex align-items-center">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                </Link>

                <div className="d-flex align-items-center ms-auto">

                    {/* Botão de lupa para abrir o modal de busca */}
                    <button
                        className="btn btn-link text-dark me-3"
                        onClick={() => setOpenSearchModal(true)}
                        title="Pesquisar Livros, Autores e Usuários"
                    >
                        <i className="bi bi-search" style={{ fontSize: '1.2rem' }}></i>
                    </button>

                    <div id="profileGroupNavbar" className="d-flex align-items-center">
                        {isLoggedIn ? (
                            <>
                                {/* Link do Perfil: Dinâmico usando o componente Link */}
                                <Link
                                    href={userId ? `/perfil/${userId}` : '/perfil'}
                                    className="d-flex align-items-center me-3 text-decoration-none text-dark"
                                    title={userData.name}
                                >
                                    {/* LÓGICA DE FALLBACK */}
                                    {useIconFallback ? (
                                        <i
                                            className="bi bi-person-circle"
                                            style={{ fontSize: 30, color: '#594A47' }}
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

                                <button
                                    className="btn btn-success me-3 d-flex align-items-center"
                                    onClick={() => onAddBookClick && onAddBookClick()}
                                >
                                    <span style={{ fontSize: '1.2rem', lineHeight: 1, marginRight: 4 }}>+</span> Livro
                                </button>

                                <button className="btn btn-link text-dark" onClick={handleLogout} title="Sair">
                                    <i className="bi bi-box-arrow-right"></i>
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-success me-3 d-flex align-items-center" onClick={handleLogin}>
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
        </>
    );
}