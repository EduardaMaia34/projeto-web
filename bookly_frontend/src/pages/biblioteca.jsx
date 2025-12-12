import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar.jsx';
import BookCard from '../components/BookCard.jsx';
import EstanteSearchBar from '../components/EstanteSearchBar.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import { fetchEstanteData, getUserNameById } from '../api/booklyApi.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const getLoggedUserName = () => {
    if (typeof window === 'undefined') return 'Usuário';
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        return userData?.nome || userData?.name || 'Usuário';
    } catch (e) {
        return 'Usuário';
    }
};

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

const Biblioteca = () => {
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Minha Biblioteca (Livros para Ler)');
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    const [ownerName, setOwnerName] = useState('');

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const userId = urlParams ? urlParams.get('userId') : null;

    const loggedUserName = getLoggedUserName();

    useEffect(() => {
        setIsClient(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const fetchBooks = useCallback(async () => {
        if (!isAuthenticated()) return;

        setLoading(true);
        setError(null);
        try {
            const pageData = await fetchEstanteData('biblioteca', userId);
            setBooks(pageData.content);

            let displayPrefix;

            if (userId) {
                const loggedUser = JSON.parse(localStorage.getItem('userData') || '{}');
                const isViewingOwnShelf = String(loggedUser?.id) === userId || String(loggedUser?.userId) === userId;

                if (isViewingOwnShelf) {
                    setOwnerName(loggedUserName);
                    displayPrefix = 'Minha Biblioteca';
                } else {
                    try {
                        const fetchedUserName = await getUserNameById(userId);
                        setOwnerName(fetchedUserName);
                        displayPrefix = `Biblioteca de ${fetchedUserName}`;
                    } catch (e) {
                        const fallbackName = `Usuário ${userId}`;
                        setOwnerName(fallbackName);
                        displayPrefix = `Biblioteca de ${fallbackName}`;
                    }
                }
            } else {
                setOwnerName(loggedUserName);
                displayPrefix = 'Minha Biblioteca';
            }

            setTitle(`${displayPrefix} (Livros para Ler)`);

        } catch (err) {
            if (err.message.includes('403') || err.message.includes('401')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jwtToken');
                }
                router.push('/login');
                return;
            }
            setError(err.message);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userId, router, loggedUserName]);

    useEffect(() => {
        if (isClient && isAuthenticated()) {
            if (!userId) {
                setOwnerName(loggedUserName);
            }
            fetchBooks();
        }
    }, [isClient, fetchBooks, userId, loggedUserName]);

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
            const livroId = cleanString(item.livroId || "");

            return titulo.includes(s) || autor.includes(s) || livroId.includes(s);
        });
    }, [books, searchTerm]);

    if (!isClient || !isAuthenticated()) {
        return <div className="text-center p-5">Carregando / Redirecionando...</div>;
    }

    const urlTitle = title;


    return (
        <>
            <Navbar
                onAddBookClick={handleAddBookClick}
                onSearchChange={handleSearchChange}
                currentSearchTerm={searchTerm}
            />

            <div className="container" style={{ paddingTop: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 id="pageTitle">{urlTitle}</h3>
                    <EstanteSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </div>

                <div id="bookListContainer" className="book-grid">
                    {loading && <p className="text-muted">Carregando livros...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && filteredBooks.length === 0 && (
                        <p className="text-muted">
                            {searchTerm ? `Nenhum livro encontrado para "${searchTerm}".` : "Sua Biblioteca está vazia. Adicione livros para ler."}
                        </p>
                    )}

                    {!loading && !error && filteredBooks.map(book => (
                        <BookCard key={book.id} item={book} type="biblioteca" />
                    ))}
                </div>

                <div id="pagination-controls" className="d-flex justify-content-center mt-5">

                </div>
            </div>

            <ReviewModal
                show={openAddModal}
                onHide={() => setOpenAddModal(false)}
                onSaveSuccess={handleSaveSuccess}
            />
        </>
    );
};

export default Biblioteca;