// src/components/Navbar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchModal from "./SearchModal";

export default function Navbar({ onAddBookClick }) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState({ name: "", photo: "" });
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true); // NOVO: Controla o estado de carregamento do usuário

    useEffect(() => {
        let user;
        let token;

        const timer = setTimeout(() => {
            token = typeof window !== "undefined" && localStorage.getItem("jwtToken");
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    user = JSON.parse(localStorage.getItem("userData") || "{}");
                    setUserData({
                        name: user.nome || user.name || "Usuário",
                        photo: user.fotoPerfil || user.photo || "",
                    });
                } catch (e) {
                    console.error("Erro ao parsear userData:", e);
                    setUserData({ name: "Usuário", photo: "" });
                }
            }
            setIsLoadingUser(false);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const handleLogin = () => {
        router.push("/login");
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userData");
            router.push("/login");
        }
    };

    const useIconFallback = !userData.photo || userData.photo === "https://imgur.com/pcf2EUA.png";

    if (isLoadingUser) {
        return (
            <nav className="navbar navbar-light header-bar p-3 mb-4">
                <a className="navbar-brand d-flex align-items-center" href="/biblioteca">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                    Bookly
                </a>
            </nav>
        );
    }

    return (
        <>
            <nav className="navbar navbar-light header-bar p-3 mb-4">
                <a className="navbar-brand d-flex align-items-center" href="/biblioteca">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                </a>

                <div className="d-flex align-items-center ms-auto">

                    {/* Botão de lupa para abrir o novo modal de busca */}
                    <button
                        className="btn btn-link text-dark me-3"
                        onClick={() => setOpenSearchModal(true)}
                        title="Pesquisar Livros e Autores"
                    >
                        <i className="bi bi-search" style={{ fontSize: '1.2rem' }}></i>
                    </button>

                    <div id="profileGroupNavbar" className="d-flex align-items-center">
                        {isLoggedIn ? (
                            <>
                                {/* Link do Perfil: Apenas ícone/foto */}
                                <a
                                    href="/perfil"
                                    className="d-flex align-items-center me-3 text-decoration-none text-dark"
                                    title={userData.name} // Nome no tooltip
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
                                </a>

                                <button
                                    className="btn btn-success me-3 d-flex align-items-center"
                                    onClick={() => onAddBookClick && onAddBookClick()}
                                >
                                    <span style={{ fontSize: '1.2rem', lineHeight: 1, marginRight: 4 }}>+</span> Livro
                                </button>

                                <button className="btn btn-link text-dark" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right"></i>
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary" onClick={handleLogin}>
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