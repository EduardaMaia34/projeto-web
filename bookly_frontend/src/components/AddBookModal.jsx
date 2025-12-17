import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, adicionarLivroFavoritoApi } from "../api/booklyApi";

export default function AddBookModal({ show, onHide, onBookAdded, currentUserId, currentFavoritesCount, maxFavorites }) {
    // MUDANÇA 2: useNavigate em vez de useRouter
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const canAddMore = currentFavoritesCount < maxFavorites;

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }

        setLoading(true);

        const fetchBookSearchResults = async () => {
            try {
                // Apenas busca livros
                const livrosResults = await searchLivrosApi(debouncedSearch);
                // Garante que seja um array
                setSearchResults(Array.isArray(livrosResults) ? livrosResults : []);

            } catch (error) {
                console.error("Falha ao buscar livros:", error);
                setSearchResults([]);
            }
            finally {
                setLoading(false);
            }
        };

        fetchBookSearchResults();

    }, [debouncedSearch]);


    const handleSelectBook = (livroId) => {
        // Opcional: Fechar o modal ao navegar
        onHide();
        // MUDANÇA 3: navigate
        navigate(`/livros/${livroId}`);
    };


    const handleAddBookToShelf = async (livroId) => {
        if (!currentUserId) {
            alert("Você precisa estar logado para adicionar livros.");
            return;
        }
        if (!canAddMore) {
            alert(`Limite máximo de ${maxFavorites} favoritos atingido.`);
            return;
        }

        setActionLoading(livroId);

        try {
            await adicionarLivroFavoritoApi(livroId);

            if (onBookAdded) {
                onBookAdded();
            }
            onHide();
            alert("Livro adicionado aos seus FAVORITOS com sucesso!");

        } catch (error) {
            console.error("Erro ao adicionar livro:", error);
            alert(`Falha ao adicionar favorito: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };


    const hasResults = searchResults.length > 0;
    const placeholderText = "Digite o título ou autor do livro...";

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Adicionar Favorito (Livros)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label fw-bold">Buscar Livro</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={placeholderText}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                {!canAddMore && (
                    <div className="alert alert-warning">
                        Limite máximo de {maxFavorites} favoritos atingido. Remova um livro para adicionar outro.
                    </div>
                )}

                {loading && searchTerm && (
                    <div className="text-center text-info my-2">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Buscando...
                    </div>
                )}

                {!loading && debouncedSearch && canAddMore && hasResults && (
                    <small className="text-muted d-block mb-3">Clique na capa ou título para ver detalhes.</small>
                )}


                {!loading && hasResults && (
                    <div className="list-group mb-4">
                        {searchResults.map(livro => (
                            <div
                                key={`livro-${livro.id}`}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div
                                    className="d-flex align-items-center flex-grow-1"
                                    role="button"
                                    onClick={() => handleSelectBook(livro.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        src={livro.urlCapa || 'https://placehold.co/40x60'}
                                        style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }}
                                        alt={`Capa de ${livro.titulo}`}
                                        onError={(e) => e.target.src = "https://placehold.co/40x60?text=Capa"}
                                    />
                                    <div>
                                        <h6 className="mb-0 fw-bold">{livro.titulo}</h6>
                                        <small className="text-muted">{livro.autor}</small>
                                    </div>
                                </div>

                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleAddBookToShelf(livro.id)}
                                    disabled={actionLoading === livro.id || !canAddMore}
                                    style={{
                                        backgroundColor: '#387638',
                                        borderColor: '#387638',
                                        color: 'white',
                                        minWidth: '40px'
                                    }}
                                    title="Adicionar aos Favoritos"
                                >
                                    {actionLoading === livro.id ?
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> :
                                        <i className="bi bi-heart-fill"></i>
                                    }
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && searchTerm && !hasResults && (
                    <div className="text-center py-3 text-muted">
                        Nenhum livro encontrado para "{searchTerm}".
                    </div>
                )}

                {!searchTerm && (
                    <p className="text-muted text-center mt-3">
                        Use a busca acima para encontrar livros e adicionar aos seus favoritos.
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fechar</Button>
            </Modal.Footer>
        </Modal>
    );
}