// src/components/Navbar.jsx
"use client";

import React, { useState, useEffect } from "react";

export default function Navbar({ onAddBookClick, onSearchChange, currentSearchTerm }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState({ name: "", photo: "" });

    useEffect(() => {
        const token = typeof window !== "undefined" && localStorage.getItem("jwtToken");
        setIsLoggedIn(!!token);
        if (token) {
            const user = JSON.parse(localStorage.getItem("userData") || "{}");
            setUserData({
                name: user.nome || user.name || "Usuário",
                photo: user.fotoPerfil || user.photo || user.profilePic || "https://imgur.com/pcf2EUA.png",
            });
        }
    }, []);

    const handleLogin = () => {
        if (typeof window !== "undefined") window.location.href = "/login";
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userData");
            window.location.reload();
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 mb-4">
            <a className="navbar-brand d-flex align-items-center" href="/biblioteca">
                <img src="https://imgur.com/HLvpHYn.png" alt="Bookly" style={{ height: 40, marginRight: 10 }} />
                Bookly
            </a>

            <div className="ms-auto d-flex align-items-center">
                <input
                    type="text"
                    className="form-control me-3"
                    style={{ width: 240 }}
                    placeholder="Pesquisar..."
                    value={currentSearchTerm || ""}
                    onChange={onSearchChange}
                />

                {isLoggedIn ? (
                    <>
                        <a href="/perfil" className="d-flex align-items-center me-3 text-decoration-none text-dark">
                            <img
                                src={userData.photo}
                                alt="perfil"
                                className="rounded-circle"
                                style={{ width: 36, height: 36, objectFit: "cover", marginRight: 8 }}
                            />
                            <span className="fw-bold">{userData.name}</span>
                        </a>

                        <button className="btn btn-outline-secondary me-2" onClick={handleLogout}>
                            Logout
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={() => onAddBookClick && onAddBookClick()}
                        >
                            + Livro
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={handleLogin}>
                        Log in
                    </button>
                )}
            </div>
        </nav>
    );
}
