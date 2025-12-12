// src/components/SearchModal.jsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Modal, Button } from 'react-bootstrap';
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi, searchUsersApi } from "../api/booklyApi";


export default function SearchModal({ show, onHide }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [bookResults, setBookResults] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (!debouncedSearch) {
            setBookResults([]);
            setUserResults([]);
            return;
        }

        setLoading(true);

        Promise.all([
            searchLivrosApi(debouncedSearch),
            searchUsersApi(debouncedSearch)
        ])
            .then(([livros, usuarios]) => {
                setBookResults(livros || []);
                setUserResults(usuarios || []);
            })
            .catch(error => {
                console.error("Falha na busca combinada:", error);
                setBookResults([]);
                setUserResults([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [debouncedSearch]);


    const handleSelectAndNavigateBook = (livroId) => {
        onHide();
        router.push(`/livro/${livroId}`);
    };

    const handleSelectAndNavigateUser = (userId) => {
        onHide();
        router.push(`/perfil?userId=${userId}`); // Navega para a página de perfil
    };

    const hasResults = bookResults.length > 0 || userResults.length > 0;

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Pesquisar Livros, Autores e Usuários</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label fw-bold">Buscar</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Digite título, autor ou nome do usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                {loading && searchTerm && <p className="text-info">Buscando...</p>}

                {/* -------------------- RESULTADOS DE USUÁRIOS -------------------- */}
                {!loading && userResults.length > 0 && (
                    <div className="list-group mb-4">
                        <h6><i className="bi bi-person-fill me-2"></i> Usuários:</h6>
                        {userResults.map(user => (
                            <div
                                key={user.id}
                                className="list-group-item list-group-item-action d-flex align-items-center"
                                role="button"
                                onClick={() => handleSelectAndNavigateUser(user.id)}
                            >
                                {/* Implementação de Imagem com Fallback de Erro */}
                                {user.fotoPerfil ? (
                                    <img
                                        src={user.fotoPerfil}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                        className="rounded-circle"
                                        alt={`Perfil de ${user.nome}`}

                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.querySelector('.fallback-icon-user').style.display = 'inline-block';
                                        }}
                                    />
                                ) : null}

                                <i
                                    className="bi bi-person-circle text-muted me-2 fallback-icon-user"
                                    style={{
                                        fontSize: '1.8rem',
                                        marginRight: '10px',
                                        // Esconde o ícone se a fotoPerfil existe (e pode carregar)
                                        display: user.fotoPerfil ? 'none' : 'inline-block'
                                    }}
                                ></i>

                                <div>
                                    <h6 className="mb-0 text-primary">{user.nome}</h6>
                                    <small className="text-muted">{user.bio || "Usuário Bookly"}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* -------------------- RESULTADOS DE LIVROS/AUTORES -------------------- */}
                {!loading && bookResults.length > 0 && (
                    <div className="list-group">
                        <h6><i className="bi bi-book me-2"></i> Livros e Autores:</h6>
                        {bookResults.map(livro => (
                            <div
                                key={livro.id}
                                className="list-group-item list-group-item-action d-flex align-items-center"
                                role="button"
                                onClick={() => handleSelectAndNavigateBook(livro.id)}
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

                {!loading && searchTerm && !hasResults && (
                    <p className="text-muted">Nenhum resultado encontrado para "{searchTerm}".</p>
                )}

                {!searchTerm && (
                    <p className="text-muted">Comece a digitar para pesquisar livros, autores e usuários.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fechar</Button>
            </Modal.Footer>
        </Modal>
    );
}