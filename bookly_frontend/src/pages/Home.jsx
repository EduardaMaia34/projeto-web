import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import { Spinner } from 'react-bootstrap';

export default function Home() {
    const [livros, setLivros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLivros();
    }, []);

    const fetchLivros = async () => {
        try {
            // Ajuste a URL se seu backend estiver em outra porta
            const response = await fetch('http://localhost:8081/api/v1/livros');
            if (!response.ok) {
                throw new Error('Falha ao buscar livros');
            }
            const data = await response.json();
            setLivros(data);
        } catch (err) {
            console.error(err);
            setError("Não foi possível carregar os livros. Verifique se o backend está rodando.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#fdfbf7', minHeight: '100vh' }}>
            {/* Navbar fixa no topo */}
            <Navbar />

            <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>

                {/* Banner de Boas-vindas */}
                <div className="text-center mb-5">
                    <h1 style={{ fontFamily: 'Georgia, serif', color: '#594A47', fontWeight: 'bold' }}>
                        Bem-vindo ao Bookly
                    </h1>
                    <p className="text-muted">Sua rede social de livros favorita.</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status" style={{ color: '#594A47' }}>
                            <span className="visually-hidden">Carregando...</span>
                        </Spinner>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="alert alert-warning text-center" role="alert">
                        {error}
                    </div>
                )}

                {/* Lista de Livros */}
                {!loading && !error && (
                    <>
                        <h4 className="mb-4 pb-2 border-bottom" style={{ color: '#594A47' }}>
                            <i className="bi bi-stars me-2"></i>Destaques
                        </h4>

                        {livros.length > 0 ? (
                            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
                                {livros.map((livro) => (
                                    <div className="col" key={livro.id}>
                                        <BookCard item={livro} type="geral" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted text-center">Nenhum livro encontrado no momento.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}