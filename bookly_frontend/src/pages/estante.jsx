import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar.jsx';
import BookCard from '../components/BookCard.jsx';
import EstanteSearchBar from '../components/EstanteSearchBar.jsx';
import { fetchEstanteData } from '../api/booklyApi.js';

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

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredBooks = useMemo(() => {
        const s = cleanString(searchTerm);

        if (!s) return books;

        return books.filter(item => { // Alterado de 'book' para 'item' para clareza
            // CORREÇÃO: Acessar titulo e autor via item.livro
            const titulo = cleanString(item.livro?.titulo || "");
            const autor = cleanString(item.livro?.autor || "");

            // NOVO: Incluir o livroId na busca, caso titulo/autor estejam vazios ou o ID seja buscado
            const livroId = cleanString(item.livroId || "");

            return titulo.includes(s) || autor.includes(s) || livroId.includes(s); // Incluído livroId
        });
    }, [books, searchTerm]);

    const handleAddBookClick = () => {
        alert('Redirecionaria para o Modal de Review em um app completo.');
    };

    if (!isAuthenticated()) {
        return <div className="text-center p-5">Redirecionando...</div>;
    }

    return (
        <>
            <Navbar onAddBookClick={handleAddBookClick} onSearchChange={handleSearchChange} currentSearchTerm={searchTerm} />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 id="pageTitle">{title}</h3>
                    <EstanteSearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                </div>

                <div id="bookListContainer" className="book-grid">
                    {loading && <p className="text-muted">Carregando livros...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && filteredBooks.length === 0 && (
                        <p className="text-muted">
                            {searchTerm ? `Nenhum livro encontrado para "${searchTerm}".` : "Esta estante está vazia."}
                        </p>
                    )}

                    {!loading && !error && filteredBooks.map(book => (
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