import React, { useCallback, useEffect, useMemo, useState } from 'react';
// MUDANÇA 1: Hooks do React Router Dom
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import BookCard from '../components/BookCard.jsx';
import EstanteSearchBar from '../components/EstanteSearchBar.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import { fetchEstanteData, getLoggedInUserId, getUserNameById } from '../api/booklyApi.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const isAuthenticated = () => !!localStorage.getItem('jwtToken');

const cleanString = (str) => {
    if (!str) return '';
    return String(str)
        .normalize("NFKD")
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
};

const BibliotecaPage = () => {
    // MUDANÇA 2: useParams pega o ID direto da rota /biblioteca/:id
    const { id } = useParams();
    const navigate = useNavigate(); // Substituto do useRouter

    const loggedInUserId = useMemo(() => getLoggedInUserId(), []);

    // Lógica: Se tem ID na URL, usa ele. Se não, assume que é o usuário logado.
    const userIdToFetch = id || loggedInUserId;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Biblioteca');
    const [searchTerm, setSearchTerm] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);

    // MUDANÇA 3: Comparação de strings garantida
    const isOwner = !!loggedInUserId && String(userIdToFetch) === String(loggedInUserId);

    useEffect(() => {
        // Se for o dono e não estiver logado, manda pro login
        if (isOwner && !isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate, isOwner]);

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
            const erroString = String(err.message);
            if (isOwner && (erroString.includes('403') || erroString.includes('401'))) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userData');
                navigate('/login');
                return;
            }
            setError(err.message || 'Falha ao carregar a biblioteca.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [userIdToFetch, isOwner, navigate]);

    useEffect(() => {
        if (userIdToFetch) {
            fetchBooks();
        }
    }, [fetchBooks, userIdToFetch]);

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

    return (
        <div style={{ backgroundColor: '#f5f4ed', minHeight: '100vh' }}>
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
            </div>

            {isOwner && (
                <ReviewModal
                    show={openAddModal}
                    onHide={() => setOpenAddModal(false)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
};

export default BibliotecaPage;