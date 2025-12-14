"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '../../../components/Navbar.jsx';
import BookCard from '../../../components/BookCard.jsx';
import EstanteSearchBar from '../../../components/EstanteSearchBar.jsx';
import ReviewModal from '../../../components/ReviewModal.jsx';
import { fetchEstanteData, getUserNameById, getLoggedInUserId } from '../../../api/booklyApi.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('jwtToken');

const cleanString = (str) => {
    if (!str) return '';
    return String(str)
        .normalize("NFKD")
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

const getUserIdFromPathname = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
};

const BibliotecaPage = () => {
    const router = useRouter();
    const pathname = usePathname();

    const loggedInUserId = useMemo(() => getLoggedInUserId(), []);
    const urlUserId = getUserIdFromPathname(pathname);
    const userIdToFetch = urlUserId && urlUserId !== 'biblioteca' ? urlUserId : loggedInUserId;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Biblioteca');
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    // CORREÇÃO AQUI: isOwner é true apenas se houver um usuário logado E o ID for o mesmo.
    const isOwner = !!loggedInUserId && userIdToFetch === loggedInUserId;

    useEffect(() => {
        setIsClient(true);
        if (isOwner && !isAuthenticated()) {
            router.push('/login');
        }
    }, [router, isOwner]);

    const fetchBooks = useCallback(async () => {
        if (!userIdToFetch) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const pageData = await fetchEstanteData('biblioteca', userIdToFetch);
            setBooks(pageData.content || []);

            if (isOwner) {
                setTitle('Minha Biblioteca (Livros para Ler)');
            } else {
                try {
                    const fetchedUserName = await getUserNameById(userIdToFetch);
                    setTitle(`Biblioteca de ${fetchedUserName} (Livros para Ler)`);
                } catch (e) {
                    setTitle(`Biblioteca de Usuário ${userIdToFetch} (Livros para Ler)`);
                }
            }

        } catch (err) {
            if (isOwner && (String(err.message).includes('403') || String(err.message).includes('401'))) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userData');
                }
                router.push('/login');
                return;
            }
            setError(err.message || 'Falha ao carregar a biblioteca.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userIdToFetch, isOwner, router]);

    useEffect(() => {
        if (isClient && userIdToFetch) {
            fetchBooks();
        }
    }, [isClient, fetchBooks, userIdToFetch]);

    const handleAddBookClick = () => {
        setOpenAddModal(true);
    };

    const handleSaveSuccess = () => {
        fetchBooks();
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredBooks = useMemo(() => {
        const s = cleanString(searchTerm);
        if (!s) return books;

        return books.filter(item => {
            const titulo = cleanString(item.livro?.titulo || "");
            const autor = cleanString(item.livro?.autor || "");
            return titulo.includes(s) || autor.includes(s);
        });
    }, [books, searchTerm]);

    if (!isClient) {
        return <div className="text-center p-5">Carregando / Redirecionando...</div>;
    }

    return (
        <>
            <div style={{ backgroundColor: '#f5f4ed', minHeight: '100vh' }}>
                <Navbar onAddBookClick={handleAddBookClick} />

                <div className="container" style={{  paddingTop: '100px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 id="pageTitle" style={{ color: '#594A47' }}>{title}</h3>
                        <EstanteSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                    </div>

                    <div id="bookListContainer" className="book-grid">
                        {loading && <p className="text-muted">Carregando livros...</p>}
                        {error && <p className="text-danger">{error}</p>}

                        {!loading && !error && filteredBooks.length === 0 && (
                            <p className="text-muted" style={{ color: '#594A47' }}>
                                {searchTerm
                                    ? `Nenhum livro encontrado para "${searchTerm}".`
                                    : isOwner ? "Sua Biblioteca está vazia. Adicione livros para ler." : "Esta biblioteca está vazia."
                                }
                            </p>
                        )}

                        {!loading && !error && filteredBooks.map(book => (
                            <BookCard key={book.id} item={book} type="biblioteca" isOwner={isOwner} />
                        ))}
                    </div>

                    <div id="pagination-controls" className="d-flex justify-content-center mt-5">
                        {/* Controles de Paginação/Scroll Infinito */}
                    </div>
                </div>

                {isOwner && (
                    <ReviewModal
                        show={openAddModal}
                        onHide={() => setOpenAddModal(false)}
                        onSaveSuccess={handleSaveSuccess}
                    />
                )}
            </div></>

    );
};

export default BibliotecaPage;