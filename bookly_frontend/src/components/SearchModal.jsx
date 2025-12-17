import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

// Certifique-se que o hook useDebounce existe nesse caminho.
// Se não tiver, veja o código dele logo abaixo.
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, searchUsersApi } from "../api/booklyApi";

export default function SearchModal({ show, onHide }) {
    // MUDANÇA: useNavigate
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ livros: [], usuarios: [] });
    const [loading, setLoading] = useState(false);

    // Hook para esperar o usuário parar de digitar (500ms)
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults({ livros: [], usuarios: [] });
            return;
        }

        setLoading(true);

        const fetchAllSearchResults = async () => {
            try {
                // Executa as duas buscas em paralelo
                const [livrosResults, usersResults] = await Promise.all([
                    searchLivrosApi(debouncedSearch),
                    searchUsersApi(debouncedSearch)
                ]);

                setSearchResults({
                    livros: Array.isArray(livrosResults) ? livrosResults : [],
                    usuarios: Array.isArray(usersResults) ? usersResults : []
                });

            } catch (error) {
                console.error("Falha ao buscar resultados:", error);
                setSearchResults({ livros: [], usuarios: [] });
            }
            finally {
                setLoading(false);
            }
        };

        fetchAllSearchResults();

    }, [debouncedSearch]);


    const handleSelectBook = (livroId) => {
        onHide();
        // MUDANÇA: Navegação para a rota do React Router
        navigate(`/livros/${livroId}`);
    };

    const handleSelectUser = (userId) => {
        onHide();
        // MUDANÇA: Navegação para a rota do React Router
        navigate(`/perfil/${userId}`);
    };

    // Verifica se tem algum resultado
    const hasResults = (searchResults.livros && searchResults.livros.length > 0) ||
        (searchResults.usuarios && searchResults.usuarios.length > 0);

    const placeholderText = "Digite título do livro, nome do autor ou nome do usuário...";

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Pesquisar Livros e Usuários</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label fw-bold">Buscar</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={placeholderText}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                        autoFocus // Foca no input ao abrir
                    />
                </div>

                {loading && searchTerm && (
                    <div className="text-center my-3">
                        <div className="spinner-border text-secondary spinner-border-sm me-2" role="status"></div>
                        <span className="text-muted">Buscando...</span>
                    </div>
                )}

                {!loading && hasResults && (
                    <>
                        {/* Seção de Resultados de Livros */}
                        {searchResults.livros.length > 0 && (
                            <div className="list-group mb-4">
                                <h6 className="mb-2 fw-bold text-secondary">
                                    <i className="bi bi-book me-2"></i>Livros
                                </h6>
                                {searchResults.livros.map(livro => (
                                    <div
                                        key={`livro-${livro.id}`}
                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                        role="button"
                                        onClick={() => handleSelectBook(livro.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={livro.urlCapa || 'https://placehold.co/40x60'}
                                            style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }}
                                            alt={`Capa de ${livro.titulo}`}
                                            onError={(e) => e.target.src = "https://placehold.co/40x60?text=Capa"}
                                        />
                                        <div>
                                            <h6 className="mb-0 fw-bold">{livro.titulo}</h6>
                                            <small className="text-muted">{livro.autor}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Seção de Resultados de Usuários */}
                        {searchResults.usuarios.length > 0 && (
                            <div className="list-group">
                                <h6 className="mb-2 fw-bold text-secondary">
                                    <i className="bi bi-person-fill me-2"></i>Usuários
                                </h6>
                                {searchResults.usuarios.map(usuario => (
                                    <div
                                        key={`user-${usuario.id}`}
                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                        role="button"
                                        onClick={() => handleSelectUser(usuario.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={usuario.fotoPerfil || 'https://placehold.co/40x40/png'}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', marginRight: '15px' }}
                                            alt={`Foto de ${usuario.nome}`}
                                            onError={(e) => e.target.src = "https://placehold.co/40x40/png?text=User"}
                                        />
                                        <div>
                                            <h6 className="mb-0 fw-bold">{usuario.nome}</h6>
                                            <small className="text-muted">ID: {usuario.id}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!loading && searchTerm && !hasResults && (
                    <div className="text-center py-4">
                        <i className="bi bi-search text-muted" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mt-2">Nenhum resultado encontrado para "{searchTerm}".</p>
                    </div>
                )}

                {!searchTerm && (
                    <p className="text-muted text-center mt-3">
                        <small>Comece a digitar para pesquisar por livros, autores ou usuários.</small>
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fechar</Button>
            </Modal.Footer>
        </Modal>
    );
}