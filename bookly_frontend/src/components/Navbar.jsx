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
    const [isAdmin, setIsAdmin] = useState(false);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        let user;
        let token;

        const timer = setTimeout(() => {
            token = typeof window !== "undefined" && localStorage.getItem("jwtToken");
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

                    // Verificação Robusta
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
        router.push("/login");
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userData");
            setIsLoggedIn(false);
            setIsAdmin(false);
            router.push("/login");
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
                <Link href="/biblioteca" className="navbar-brand d-flex align-items-center">
                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" style={{ height: 50, marginRight: 10 }} />
                </Link>

                <div className="d-flex align-items-center ms-auto">
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
                                <Link
                                    href={userId ? `/perfil/${userId}` : '/perfil'}
                                    className="d-flex align-items-center me-3 text-decoration-none text-dark"
                                    title={userData.name}
                                >
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

                                {/* Botão visível APENAS para ROLE_ADMIN */}
                                {isAdmin && (
                                    <Link
                                        href="/admin/cadastrar-livro"
                                        /* Usamos apenas 'btn' e aplicamos o estilo manual para o azul escuro */
                                        className="btn me-3 fw-bold"
                                        style={{ backgroundColor: "#003366", color: "#fff", borderColor: "#003366" }}
                                        title="Área Administrativa"
                                    >
                                        Cadastrar Livros
                                    </Link>
                                )}

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