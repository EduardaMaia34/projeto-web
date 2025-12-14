"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Navbar from '@/components/Navbar.jsx';
import BookCard from '@/components/BookCard.jsx';
import EstanteSearchBar from '@/components/EstanteSearchBar.jsx';
import ReviewModal from '@/components/ReviewModal.jsx';
import { fetchEstanteData, getUserNameById, getLoggedInUserId } from '@/api/booklyApi.js';

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
    if (!pathname) return null;
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
};


const EstantePage = () => {
    const router = useRouter();
    const pathname = usePathname();

    const urlUserId = getUserIdFromPathname(pathname);
    const loggedInUserId = useMemo(() => getLoggedInUserId(), []);
    const userIdToFetch = (urlUserId && urlUserId !== 'estante') ? urlUserId : loggedInUserId;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Estante');
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    // CORREÇÃO: isOwner só é true se estiver logado E os IDs coincidirem.
    const isOwner = !!loggedInUserId && String(userIdToFetch) === String(loggedInUserId);

    useEffect(() => {
        setIsClient(true);
        // Redireciona APENAS se for a página do dono E não estiver autenticado.
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
            const pageData = await fetchEstanteData('estante', userIdToFetch);
            setBooks(pageData.content || []);

            if (isOwner) {
                setTitle('Minha Estante');
            } else {
                try {
                    const fetchedUserName = await getUserNameById(userIdToFetch);
                    setTitle(`Estante de ${fetchedUserName}`);
                } catch (e) {
                    setTitle(`Estante de Usuário ${userIdToFetch}`);
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
            setError('Falha ao carregar a estante.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userIdToFetch, isOwner, router]);

    useEffect(() => {
        if (isClient && userIdToFetch) {
            // Verifica a autenticação apenas para a busca, não para o redirecionamento inicial.
            if (!isOwner || isAuthenticated()) {
                fetchBooks();
            }
        }
    }, [isClient, fetchBooks, userIdToFetch, isOwner]);

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
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={{ backgroundColor: '#f5f4ed', minHeight: '100vh' }}>
                <Navbar onAddBookClick={handleAddBookClick} />

                <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                        <h3 id="pageTitle" style={{ color: '#594A47', fontWeight: 'bold' }}>{title}</h3>
                        <div style={{ minWidth: '300px' }}>
                            <EstanteSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                        </div>
                    </div>

                    <div id="bookListContainer" className="row">
                        {loading && <p className="text-muted text-center">Carregando livros...</p>}
                        {error && <p className="text-danger text-center">{error}</p>}

                        {!loading && !error && filteredBooks.length === 0 && (
                            <div className="col-12 text-center mt-5">
                                <p className="text-muted fs-5" style={{ color: '#594A47' }}>
                                    {searchTerm ? `Nenhum livro encontrado para "${searchTerm}".` : "Esta estante está vazia."}
                                </p>
                            </div>
                        )}

                        {!loading && !error && filteredBooks.map(book => (
                            <div className="col-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center" key={book.id}>
                                <BookCard item={book} type="estante" isOwner={isOwner} />
                            </div>
                        ))}
                    </div>
                </div>

                {isOwner && (
                    <ReviewModal
                        show={openAddModal}
                        onHide={() => setOpenAddModal(false)}
                        onSaveSuccess={handleSaveSuccess}
                    />
                )}
            </div> </>
    );
};

export default EstantePage;