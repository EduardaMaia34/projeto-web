import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDebounce } from "../hooks/useDebounce";
import { searchLivrosApi } from "../api/booklyApi";
import ReviewSearchBar from "./ReviewSearchBar";

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
            .then(data => setResults(Array.isArray(data) ? data : [])) // Garante que é array
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
            // Z-Index alto para garantir que apareça sobre o modal de criar review
            style={{ zIndex: 1060 }}
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fs-5 fw-bold" style={{ color: '#594A47' }}>
                    Selecionar Livro
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <ReviewSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Digite o nome do livro ou autor..."
                    />
                </div>

                {loading && (
                    <div className="text-center text-muted my-3">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Buscando...
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="list-group">
                        {results.map(livro => (
                            <button
                                key={livro.id}
                                type="button"
                                className="list-group-item list-group-item-action d-flex align-items-center p-3 border-0 mb-2 shadow-sm rounded"
                                onClick={() => onSelectBook(livro)}
                                style={{ backgroundColor: '#f9f9f9', cursor: 'pointer' }}
                            >
                                <img
                                    src={livro.urlCapa || "https://placehold.co/40x60?text=Capa"}
                                    alt={livro.titulo}
                                    style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }}
                                    onError={(e) => e.target.src = "https://placehold.co/40x60?text=Erro"}
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
                        Nenhum livro encontrado para "{searchTerm}".
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}