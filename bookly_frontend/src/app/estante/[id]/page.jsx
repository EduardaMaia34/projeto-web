"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importações do App Router
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '../../../components/Navbar.jsx';
import BookCard from '../../../components/BookCard.jsx';
import EstanteSearchBar from '../../../components/EstanteSearchBar.jsx';
import ReviewModal from '../../../components/ReviewModal.jsx';
// Assumindo que essas funções foram atualizadas no booklyApi.js
import { fetchEstanteData, getUserNameById, getLoggedInUserId } from '../../../api/booklyApi.js';

// --- Funções de Ajuda (Helpers) ---

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
    // Exemplo: pathname = /estante/123 -> retorna 123
    const segments = pathname.split('/').filter(Boolean);
    // O ID é o último segmento
    return segments.length > 0 ? segments[segments.length - 1] : null;
};

// --- Componente Principal ---

const EstantePage = () => {
    const router = useRouter();
    const pathname = usePathname();

    // [NOVO] Obtém o ID do pathname ou usa o ID logado como fallback.
    const urlUserId = getUserIdFromPathname(pathname);
    const loggedInUserId = useMemo(() => getLoggedInUserId(), []);
    const userIdToFetch = urlUserId && urlUserId !== 'estante' ? urlUserId : loggedInUserId;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Estante');
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    // [NOVO] Verifica se a página pertence ao usuário logado
    const isOwner = userIdToFetch === loggedInUserId;


    useEffect(() => {
        setIsClient(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);


    const fetchBooks = useCallback(async () => {
        if (!isAuthenticated() || !userIdToFetch) return;

        setLoading(true);
        setError(null);
        try {
            // Usa userIdToFetch para buscar os dados
            const pageData = await fetchEstanteData('estante', userIdToFetch);
            setBooks(pageData.content || []);

            // Define o título da página
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
            if (String(err.message).includes('403') || String(err.message).includes('401')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userData');
                }
                router.push('/login');
                return;
            }
            setError(err.message || 'Falha ao carregar a estante.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userIdToFetch, isOwner, router]);


    useEffect(() => {
        if (isClient && isAuthenticated() && userIdToFetch) {
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

    if (!isClient || !isAuthenticated()) {
        return <div className="text-center p-5">Carregando / Redirecionando...</div>;
    }

    return (
        <>
            <Navbar onAddBookClick={handleAddBookClick} />

            <div className="container" style={{ paddingTop: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 id="pageTitle" style={{ color: '#594A47' }}>{title}</h3>
                    <EstanteSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </div>

                <div id="bookListContainer" className="book-grid">
                    {loading && <p className="text-muted">Carregando livros...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && filteredBooks.length === 0 && (
                        <p className="text-muted" style={{ color: '#594A47' }}>
                            {searchTerm ? `Nenhum livro encontrado para "${searchTerm}".` : "Esta estante está vazia."}
                        </p>
                    )}

                    {!loading && !error && filteredBooks.map(book => (
                        <BookCard key={book.id} item={book} type="estante" isOwner={isOwner} />
                    ))}
                </div>

                <div id="pagination-controls" className="d-flex justify-content-center mt-5">
                    {/* Controles de Paginação/Scroll Infinito */}
                </div>
            </div>

            {/* O modal só é relevante se for o dono da página */}
            {isOwner && (
                <ReviewModal
                    show={openAddModal}
                    onHide={() => setOpenAddModal(false)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </>
    );
};

export default EstantePage;