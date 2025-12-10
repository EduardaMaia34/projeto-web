import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../src/components/Navbar.jsx';
import BookCard from '../src/components/BookCard.jsx';
import EstanteSearchBar from '../src/components/EstanteSearchBar.jsx';
import { fetchEstanteData } from '../src/api/booklyApi.js';

const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('jwtToken');

const Estante = () => {
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Minha Estante');

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const userId = urlParams ? urlParams.get('userId') : null;

    useEffect(() => {
        if (typeof window !== 'undefined' && !isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const fetchBooks = useCallback(async () => {
        if (!isAuthenticated()) return;

        setLoading(true);
        setError(null);
        try {
            const pageData = await fetchEstanteData('estante', userId);
            setBooks(pageData.content);
            const userDisplay = userId ? `Estante do Usuário ${userId}` : 'Minha';
            setTitle(`${userDisplay} Estante`);
        } catch (err) {
            setError(err.message);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchBooks();
        }
    }, [fetchBooks]);

    const handleAddBookClick = () => {
        alert('Redirecionaria para o Modal de Review em um app completo.');
    };

    if (!isAuthenticated()) {
        return <div className="text-center p-5">Redirecionando...</div>;
    }

    return (
        <>
            <Navbar onAddBookClick={handleAddBookClick} />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 id="pageTitle">{title}</h3>
                    <EstanteSearchBar />
                </div>

                <div id="bookListContainer" className="book-grid">
                    {loading && <p className="text-muted">Carregando livros...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && books.length === 0 && (
                        <p className="text-muted">Esta estante está vazia.</p>
                    )}

                    {!loading && !error && books.map(book => (
                        <BookCard key={book.id} item={book} type="estante" />
                    ))}
                </div>

                <div id="pagination-controls" className="d-flex justify-content-center mt-5">

                </div>
            </div>
        </>
    );
};

export default Estante;