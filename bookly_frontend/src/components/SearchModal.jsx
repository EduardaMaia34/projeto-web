// src/components/SearchModal.jsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Modal, Button } from 'react-bootstrap';
// Certifique-se de que useDebounce e searchLivrosApi estão acessíveis
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi } from "../api/booklyApi";


export default function SearchModal({ show, onHide }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Replicando a lógica de debounce do ReviewModal
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Replicando a lógica de busca do ReviewModal
    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        searchLivrosApi(debouncedSearch)
            .then(results => {
                setSearchResults(results || []);
            })
            .catch(error => {
                console.error("Falha ao buscar livros:", error);
                setSearchResults([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [debouncedSearch]);


    const handleSelectAndNavigate = (livroId) => {
        onHide(); // Fecha o modal
        // Ação: Ao clicar no livro, deve abrir a página do livro
        router.push(`/livro/${livroId}`);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Pesquisar Livros e Autores</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label fw-bold">Buscar livro</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Digite título do livro ou nome do autor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                {loading && searchTerm && <p className="text-info">Buscando...</p>}

                {!loading && searchResults.length > 0 && (
                    <div className="list-group">
                        <h6>Resultados:</h6>
                        {searchResults.map(livro => (
                            <div
                                key={livro.id}
                                className="list-group-item list-group-item-action d-flex align-items-center"
                                role="button"
                                onClick={() => handleSelectAndNavigate(livro.id)}
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

                {!loading && searchTerm && searchResults.length === 0 && (
                    <p className="text-muted">Nenhum resultado encontrado para "{searchTerm}".</p>
                )}

                {!searchTerm && (
                    <p className="text-muted">Comece a digitar para pesquisar em todos os livros da plataforma.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fechar</Button>
            </Modal.Footer>
        </Modal>
    );
}