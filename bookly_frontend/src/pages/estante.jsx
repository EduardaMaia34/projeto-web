import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import Navbar from '@/components/Navbar.jsx';
import BookCard from '@/components/BookCard.jsx';
import EstanteSearchBar from '@/components/EstanteSearchBar.jsx';
import ReviewModal from '@/components/ReviewModal.jsx';
import { fetchEstanteData } from '@/api/booklyApi.js';

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

const Estante = () => {
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Minha Estante');
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);

    // Lógica para pegar o userId da URL
    // Nota: No Next.js Pages Router, você também poderia usar: const { userId } = router.query;
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const userId = urlParams ? urlParams.get('userId') : null;

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
            const pageData = await fetchEstanteData('estante', userId);
            setBooks(pageData.content || []); // Garante que seja um array

            const userDisplay = userId ? `Estante do Usuário ${userId}` : 'Minha';
            setTitle(`${userDisplay} Estante`);

        } catch (err) {
            // Trata erro de token expirado
            if (String(err.message).includes('403') || String(err.message).includes('401')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userData');
                }
                router.push('/login');
                return;
            }
            setError(err.message || "Erro ao carregar livros.");
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userId, router]);

    useEffect(() => {
        if (isClient && isAuthenticated()) {
            fetchBooks();
        }
    }, [isClient, fetchBooks]);

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
            // Verifica se livroId existe antes de limpar
            const livroId = item.livroId ? cleanString(item.livroId) : "";

            return titulo.includes(s) || autor.includes(s) || livroId.includes(s);
        });
    }, [books, searchTerm]);

    if (!isClient || !isAuthenticated()) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar
                onAddBookClick={handleAddBookClick}
                // Removemos onSearchChange daqui pois a Navbar geralmente não controla a busca da estante diretamente,
                // mas se sua Navbar tiver barra de busca global, mantenha.
            />

            <div className="container" style={{ paddingTop: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 id="pageTitle" style={{ color: '#594A47' }}>{title}</h3>
                    <EstanteSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </div>

                <div id="bookListContainer" className="row">
                    {loading && <p className="text-muted">Carregando livros...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && filteredBooks.length === 0 && (
                        <div className="col-12 text-center">
                            <p className="text-muted">
                                {searchTerm ? `Nenhum livro encontrado para "${searchTerm}".` : "Esta estante está vazia."}
                            </p>
                        </div>
                    )}

                    {!loading && !error && filteredBooks.map(book => (
                        <div className="col-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center" key={book.id}>
                            {/* Adicionei as classes de grid do Bootstrap acima para ficar responsivo */}
                            <BookCard item={book} type="estante" />
                        </div>
                    ))}
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

export default Estante;