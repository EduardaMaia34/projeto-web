//components/ReviewModal.jsx

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDebounce } from '../hooks/useDebounce.js';
import { searchLivrosApi, saveReviewApi } from '../api/booklyApi.js';


const StarRatingInput = ({ currentRating, onRate }) => {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (starValue, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;
        let newRating;

        if (x < width / 2) {
            newRating = starValue - 0.5;
        } else {
            newRating = starValue;
        }

        if (currentRating === newRating) {
            newRating = newRating - 0.5;
        }
        if (newRating < 0) newRating = 0;

        onRate(newRating);
    };

    const renderStars = () => {
        return stars.map((starValue, index) => {
            let iconClass;
            if (starValue <= currentRating) {
                iconClass = 'bi-star-fill';
            } else if (starValue - 0.5 <= currentRating) {
                iconClass = 'bi-star-half';
            } else {
                iconClass = 'bi-star';
            }
            return (
                <i
                    key={index}
                    className={`bi ${iconClass}`}
                    onClick={(e) => handleClick(starValue, e)}
                    style={{ cursor: 'pointer', color: 'gold', fontSize: '1.5rem', margin: '0 2px' }}
                />
            );
        });
    };

    return <div className="star-rating">{renderStars()}</div>;
};


const ReviewModalContent = ({ onSaveSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLivro, setSelectedLivro] = useState(null);
    const [nota, setNota] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [finishedDate, setFinishedDate] = useState(new Date().toLocaleDateString('pt-BR'));

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const handleSearch = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await searchLivrosApi(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Erro na pesquisa de livros:', error);
            setSearchResults([]);
        }
    };

    useEffect(() => {
        handleSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const handleSelectBook = (livro) => {
        setSelectedLivro(livro);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSaveReview = async () => {
        if (!selectedLivro || nota === 0) {
            alert('Por favor, selecione um livro e atribua uma nota.');
            return;
        }

        const payload = {
            livroId: selectedLivro.id,
            nota: parseFloat(nota),
            review: reviewText.trim(),
            status: 'LIDO'
        };

        try {
            await saveReviewApi(payload);
            alert('Review salva com sucesso!');

            // Oculta o modal
            if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
                const modalElement = document.getElementById('reviewModal');
                window.bootstrap.Modal.getInstance(modalElement).hide();
            }

            // Reseta o estado do modal
            setSelectedLivro(null);
            setNota(0);
            setReviewText('');
            setFinishedDate(new Date().toLocaleDateString('pt-BR'));

            onSaveSuccess();

        } catch (error) {
            alert(`Erro ao salvar review: ${error.message}`);
        }
    };

    // Função para fechar o modal e resetar o estado se ele for fechado manualmente
    useEffect(() => {
        const modalElement = document.getElementById('reviewModal');
        if (modalElement && typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
            modalElement.addEventListener('hidden.bs.modal', () => {
                setSelectedLivro(null);
                setNota(0);
                setReviewText('');
                setSearchTerm('');
                setSearchResults([]);
                setFinishedDate(new Date().toLocaleDateString('pt-BR'));
            });
        }
    }, []);


    return (
        <div className="modal fade" id="reviewModal" tabIndex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content custom-modal-content">
                    <div className="modal-header custom-modal-header">
                        <h5 className="modal-title" id="reviewModalLabel">Adicionar Livro e Review</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <div className="modal-body">
                        <div className="row mb-3">
                            {/* Busca de Livro */}
                            <div className="col-12">
                                <label htmlFor="modalSearchInput" className="form-label">Buscar Livro</label>
                                <input
                                    type="text"
                                    id="modalSearchInput"
                                    className="form-control"
                                    placeholder="Nome do livro ou autor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {/* Lista de Resultados da Busca */}
                                {searchResults.length > 0 && (
                                    <div id="searchResultList" className="list-group mt-2">
                                        {searchResults.map(livro => (
                                            <a
                                                key={livro.id}
                                                href="#"
                                                className="list-group-item list-group-item-action d-flex align-items-center"
                                                onClick={() => handleSelectBook(livro)}
                                            >
                                                <img src={livro.urlCapa || 'https://placehold.co/40x60'} alt="Capa" style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '10px' }} />
                                                <div>
                                                    <h6 className="mb-0">{livro.titulo}</h6>
                                                    <small className="text-muted">{livro.autor.nome}</small>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detalhes do Livro Selecionado e Review */}
                        <div className="row">
                            <div className="col-4 text-center">
                                <h6 className="mt-2 text-primary">{selectedLivro ? selectedLivro.titulo : 'Nenhum Livro Selecionado'}</h6>
                                <img
                                    src={selectedLivro?.urlCapa || 'https://placehold.co/150x225/A0A0A0/FFFFFF?text=Selecione'}
                                    className="img-fluid rounded shadow-sm mb-3"
                                    alt="Capa do Livro"
                                    style={{ width: '150px', height: '225px', objectFit: 'cover' }}
                                />
                                <StarRatingInput currentRating={nota} onRate={setNota} />
                                <input type="hidden" id="modalRatingValue" value={nota} />
                                <input type="hidden" id="modalLivroId" value={selectedLivro?.id || '0'} />
                            </div>

                            <div className="col-8">
                                <p className="text-muted small mb-1">Finalizado em: <span id="modalFinishedDate">{finishedDate}</span></p>
                                <textarea
                                    id="modalReviewText"
                                    className="form-control"
                                    rows="8"
                                    placeholder="Adicionar review..."
                                    style={{ resize: 'none', backgroundColor: 'white', border: '1px solid #DED2C2' }}
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}>
                                </textarea>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer modal-footer-custom border-0">
                        <button type="button" className="btn btn-success fw-bold" onClick={handleSaveReview}>Salvar</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Desabilita o SSR
const ReviewModal = dynamic(() => Promise.resolve(ReviewModalContent), {
    ssr: false,
});

export default ReviewModal;