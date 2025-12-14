"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import ReviewCard from "../components/ReviewCard";
import {
    fetchPopularesSemana,
    fetchFeedAmigos,
    getLoggedInUserId
} from "../api/booklyApi";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function HomePage() {
    const [populares, setPopulares] = useState([]);
    const [feed, setFeed] = useState([]);
    const [userId, setUserId] = useState(null);
    const [mounted, setMounted] = useState(false);


    const getHeaders = () => {
        if (typeof window === 'undefined') {
            return { 'Content-Type': 'application/json' };
        }

        const token = localStorage.getItem('jwtToken');

        if (!token) {
            return { 'Content-Type': 'application/json' };
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        setMounted(true);
        const id = getLoggedInUserId();
        setUserId(id);
    }, []);

    useEffect(() => {
        fetchPopularesSemana().then((data) => {
            setPopulares(Array.isArray(data) ? data : []);
        });
    }, []);

    useEffect(() => {
        if (userId) {
            fetchFeedAmigos().then((data) => {
                setFeed(Array.isArray(data) ? data : []);
            });
        }
    }, [userId]);

    if (!mounted) return null;

    return (
        <>
            <Navbar />

            <div
                style={{
                    backgroundColor: "#f5f4ed",
                    minHeight: "100vh",
                    paddingBottom: "40px"
                }}
            >
                <div className="container" style={{ paddingTop: "100px" }}>
                    <h4
                        style={{
                            color: "#594A47",
                            fontWeight: "bold",
                            marginBottom: "20px"
                        }}
                    >
                        Populares da Semana
                    </h4>

                    {populares.length === 0 && (
                        <p style={{ color: "#777" }}>
                            Nenhum livro popular nesta semana.
                        </p>
                    )}

                    <div
                        className="d-flex flex-wrap gap-3"
                        style={{ justifyContent: "flex-start" }}
                    >
                        {populares.map((livro) => (
                            <BookCard
                                key={livro.id}
                                item={livro}
                                type="home"
                            />
                        ))}
                    </div>
                </div>

                {userId && (
                    <div className="container pt-5">
                        <h4
                            style={{
                                color: "#594A47",
                                fontWeight: "bold",
                                marginBottom: "20px"
                            }}
                        >
                            Atividades dos Amigos
                        </h4>

                        {feed.length === 0 && (
                            <p style={{ color: "#777" }}>
                                Nenhuma atividade recente.
                            </p>
                        )}

                        {feed.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                isOwner={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
