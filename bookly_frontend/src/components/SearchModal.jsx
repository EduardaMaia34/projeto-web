// src/components/SearchModal.jsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button } from 'react-bootstrap';
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, searchUsersApi } from "../api/booklyApi";


export default function SearchModal({ show, onHide }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ livros: [], usuarios: [] });
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults({ livros: [], usuarios: [] });
            return;
        }

        setLoading(true);

        const fetchAllSearchResults = async () => {
            try {
                const [livrosResults, usersResults] = await Promise.all([
                    searchLivrosApi(debouncedSearch),
                    searchUsersApi(debouncedSearch)
                ]);

                setSearchResults({
                    livros: livrosResults || [],
                    usuarios: usersResults || []
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
        router.push(`/livros/${livroId}`);
    };

    const handleSelectUser = (userId) => {
        onHide();
        router.push(`/perfil/${userId}`);
    };

    const hasResults = searchResults.livros.length > 0 || searchResults.usuarios.length > 0;

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
                    />
                </div>

                {loading && searchTerm && <p className="text-info">Buscando...</p>}

                {!loading && hasResults && (
                    <>
                        {/* Seção de Resultados de Livros */}
                        {searchResults.livros.length > 0 && (
                            <div className="list-group mb-4">
                                <h6>
                                    <i className="bi bi-book"></i> Livros:
                                </h6>
                                {searchResults.livros.map(livro => (
                                    <div
                                        key={`livro-${livro.id}`}
                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                        role="button"
                                        onClick={() => handleSelectBook(livro.id)}
                                    >
                                        <img
                                            src={livro.urlCapa || 'https://placehold.co/40x60'}
                                            style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '10px' }}
                                            alt={`Capa de ${livro.titulo}`}
                                        />
                                        <div>
                                            <h6 className="mb-0">{livro.titulo}</h6>
                                            <small className="text-muted">{livro.autor}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Seção de Resultados de Usuários */}
                        {searchResults.usuarios.length > 0 && (
                            <div className="list-group">
                                <h6>
                                    <i className="bi bi-person-fill"></i> Usuários:
                                </h6>
                                {searchResults.usuarios.map(usuario => (
                                    <div
                                        key={`user-${usuario.id}`}
                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                        role="button"
                                        onClick={() => handleSelectUser(usuario.id)}
                                    >
                                        <img
                                            src={usuario.fotoPerfil || 'https://placehold.co/40x40/png'}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', marginRight: '10px' }}
                                            alt={`Foto de ${usuario.nome}`}
                                        />
                                        <div>
                                            <h6 className="mb-0">{usuario.nome}</h6>
                                            <small className="text-muted">@{usuario.nome || 'Sem username'}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!loading && searchTerm && !hasResults && (
                    <p className="text-muted">Nenhum livro ou usuário encontrado para "{searchTerm}".</p>
                )}

                {!searchTerm && (
                    <p className="text-muted">Comece a digitar para pesquisar por livros, autores e usuários da plataforma.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fechar</Button>
            </Modal.Footer>
        </Modal>
    );
}