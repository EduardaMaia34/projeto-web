// ARQUIVO: src/components/ReviewSearchModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap"; // <--- O IMPORT DO MODAL ESTÁ AQUI
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi } from "../api/booklyApi";
import ReviewSearchBar from "./ReviewSearchBar"; // Importa a sua barra

export default function ReviewSearchModal({ show, onHide, onSelectBook }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Efeito de busca na API
    useEffect(() => {
        if (!debouncedSearch) {
            setResults([]);
            return;
        }

        setLoading(true);
        searchLivrosApi(debouncedSearch)
            .then(data => setResults(data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [debouncedSearch]);

    // Limpa a busca ao fechar a janela
    useEffect(() => {
        if (!show) {
            setSearchTerm("");
            setResults([]);
        }
    }, [show]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            // --- AQUI ESTÁ A CORREÇÃO DO Z-INDEX PARA APARECER NA FRENTE ---
            style={{ zIndex: 1060 }}
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fs-5 fw-bold" style={{ color: '#594A47' }}>
                    Selecionar Livro
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Aqui usamos o seu componente ReviewSearchBar */}
                <div className="mb-4">
                    <ReviewSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Digite o nome do livro ou autor..."
                    />
                </div>

                {/* Lista de Resultados */}
                {loading && <p className="text-muted text-center">Buscando...</p>}

                {!loading && results.length > 0 && (
                    <div className="list-group">
                        {results.map(livro => (
                            <button
                                key={livro.id}
                                type="button"
                                className="list-group-item list-group-item-action d-flex align-items-center p-3 border-0 mb-2 shadow-sm rounded"
                                onClick={() => onSelectBook(livro)} // Devolve o livro ao clicar
                                style={{ backgroundColor: '#f9f9f9' }}
                            >
                                <img
                                    src={livro.urlCapa || "https://via.placeholder.com/40x60"}
                                    alt={livro.titulo}
                                    style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }}
                                />
                                <div>
                                    <h6 className="mb-0 fw-bold" style={{ color: '#594A47' }}>{livro.titulo}</h6>
                                    <small className="text-muted">{livro.autor}</small>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!loading && searchTerm && results.length === 0 && (
                    <div className="text-center text-muted mt-3">
                        Nenhum livro encontrado.
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}