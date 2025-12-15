"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import AddBookModal from '../../components/AddBookModal.jsx'; // Importa o modal fornecido
import {
    getUserById,
    updateUser,
    fetchInteresses,
    fetchFavoriteBooks,
    removerLivroFavoritoApi
} from '../../api/booklyApi';
import './editar.css';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function EditarPerfilPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null);

    const [interessesDisponiveis, setInteressesDisponiveis] = useState([]);
    const [interessesSelecionados, setInteressesSelecionados] = useState([]);

    // Estados para Livros Favoritos
    const [livrosFavoritos, setLivrosFavoritos] = useState([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const MAX_FAVORITES = 4;

    const [formData, setFormData] = useState({
        nome: '',
        bio: '',
        fotoPerfil: '',
        generoPreferido: ''
    });

    // Função unificada para carregar favoritos
    const carregarFavoritos = useCallback(async (id) => {
        if (!id) return;
        try {
            const dadosFavoritos = await fetchFavoriteBooks(id);
            setLivrosFavoritos(dadosFavoritos);
        } catch (error) {
            console.error("Erro ao carregar favoritos:", error);
            setLivrosFavoritos([]);
        }
    }, []);

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    const carregarDadosIniciais = async () => {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userLocal = JSON.parse(storedUser);
        const currentUserId = userLocal.id;
        setUserId(currentUserId);

        try {
            const [listaInteresses, dadosUsuario] = await Promise.all([
                fetchInteresses(),
                getUserById(currentUserId)
            ]);

            setInteressesDisponiveis(listaInteresses);

            setFormData({
                nome: dadosUsuario.nome || '',
                bio: dadosUsuario.bio || '',
                fotoPerfil: dadosUsuario.fotoPerfil || '',
                generoPreferido: dadosUsuario.generoPreferido || ''
            });

            if (dadosUsuario.interesses && Array.isArray(dadosUsuario.interesses)) {
                const ids = dadosUsuario.interesses.map(i => i.id);
                setInteressesSelecionados(ids);
            }

            // Carrega os Livros Favoritos
            await carregarFavoritos(currentUserId);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro ao carregar seus dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleInteresse = (id) => {
        setInteressesSelecionados(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                if (prev.length >= 5) {
                    alert("Você só pode selecionar até 5 interesses.");
                    return prev;
                }
                return [...prev, id];
            }
        });
    };

    // Função de callback para recarregar a lista após o modal adicionar um livro
    const handleBookAddedSuccess = async () => {
        await carregarFavoritos(userId);
    };

    // Lógica para remover Livro Favorito
    const handleRemoveFavorite = async (livroId, livroTitulo) => {
        if (confirm(`Tem certeza que deseja remover "${livroTitulo}" dos seus favoritos?`)) {
            try {
                await removerLivroFavoritoApi(livroId);
                await carregarFavoritos(userId);
                alert(`${livroTitulo} removido dos favoritos.`);
            } catch (error) {
                console.error("Erro ao remover favorito:", error);
                alert("Erro ao remover livro dos favoritos: " + (error.message || "Tente novamente."));
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                interessesIds: interessesSelecionados
            };

            const usuarioAtualizado = await updateUser(userId, payload);

            const oldData = JSON.parse(localStorage.getItem('userData'));
            const newData = { ...oldData, ...usuarioAtualizado };
            localStorage.setItem('userData', JSON.stringify(newData));

            alert("Perfil atualizado com sucesso!");
            router.push(`/perfil/${userId}`);

        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar perfil: " + (error.message || "Tente novamente."));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Carregando...</div>;

    const renderInteresseTags = (items, selectedIds, toggleFunction) => {
        return (
            <div className="d-flex flex-wrap gap-2 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                {items.length > 0 ? (
                    items.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                            <span
                                key={item.id}
                                onClick={() => toggleFunction(item.id)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    backgroundColor: isSelected ? '#594A47' : '#fff',
                                    color: isSelected ? '#fff' : '#594A47',
                                    border: '1px solid #594A47',
                                    fontWeight: isSelected ? '600' : '400',
                                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {item.nome}
                                {isSelected && <i className="bi bi-check ms-1"></i>}
                            </span>
                        );
                    })
                ) : (
                    <span className="text-muted small">Carregando interesses...</span>
                )}
            </div>
        );
    };

    // Auxiliar para renderizar Livros Favoritos (Centralizado e com botão de remover)
    const renderFavoriteBooks = () => {
        return (
            <div className="d-flex justify-content-center gap-3 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                {livrosFavoritos.map(livro => (
                    <div key={livro.id} className="text-center position-relative d-flex flex-column align-items-center" style={{ width: '80px' }}>
                        <img
                            src={livro.urlCapa}
                            alt={livro.titulo}
                            style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                            className="shadow-sm"
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-circle position-absolute"
                            aria-label="Remover"
                            onClick={() => handleRemoveFavorite(livro.id, livro.titulo)}
                            style={{ width: '24px', height: '24px', padding: 0, lineHeight: 1, fontSize: '0.8rem', top: '-10px', right: '-10px' }}
                        >
                            X
                        </button>
                        <small className="d-block text-truncate mt-1" style={{ fontSize: '0.75rem' }}>{livro.titulo}</small>
                    </div>
                ))}

                {/* Slot para adicionar novo favorito */}
                {livrosFavoritos.length < MAX_FAVORITES && (
                    <div className="text-center d-flex justify-content-center align-items-center" style={{ width: '80px', height: '120px', border: '2px dashed #ccc', borderRadius: '4px', cursor: 'pointer' }}
                         onClick={() => setIsSearchModalOpen(true)}>
                        <i className="bi bi-plus-lg text-muted" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="edit-page-container">
            <Navbar />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">

                        <div className="edit-card">
                            <h3 className="mb-4 text-center fw-bold" style={{ color: '#594A47' }}>Editar Perfil</h3>

                            <form onSubmit={handleSave}>

                                {/* FOTO DE PERFIL */}
                                <div className="text-center mb-4">
                                    <img
                                        src={formData.fotoPerfil || "https://i.imgur.com/i4m4D7y.png"}
                                        alt="Preview"
                                        className="preview-img"
                                    />
                                    <div className="mt-2">
                                        <label className="form-label-custom">URL da Foto</label>
                                        <input
                                            type="text"
                                            name="fotoPerfil"
                                            className="form-control-custom"
                                            placeholder="Link da imagem (ex: Imgur)"
                                            value={formData.fotoPerfil}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* NOME */}
                                <div>
                                    <label className="form-label-custom">Nome</label>
                                    <input
                                        type="text"
                                        name="nome"
                                        required
                                        className="form-control-custom"
                                        value={formData.nome}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* BIO */}
                                <div>
                                    <label className="form-label-custom">Biografia</label>
                                    <textarea
                                        name="bio"
                                        rows="3"
                                        className="form-control-custom"
                                        placeholder="Conte sobre você..."
                                        value={formData.bio}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                {/* 7. UI DE INTERESSES (TAGS) */}
                                <div className="mt-4">
                                    <label className="form-label-custom mb-2">
                                        Seus Interesses <small className="text-muted">(Máximo 5)</small>
                                    </label>
                                    {renderInteresseTags(interessesDisponiveis, interessesSelecionados, toggleInteresse)}
                                </div>

                                {/* UI DE LIVROS FAVORITOS */}
                                <div className="mt-4">
                                    <label className="form-label-custom mb-2">
                                        Livros Favoritos <small className="text-muted">(Máximo {MAX_FAVORITES})</small>
                                    </label>
                                    {renderFavoriteBooks()}
                                </div>


                                {/* BOTÕES */}
                                <div className="d-flex justify-content-end mt-4">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => router.back()}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-save"
                                        disabled={saving}
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </div>

            {/* O MODAL DE BUSCA AGORA USA O COMPONENTE AddBookModal.jsx FORNECIDO */}
            <AddBookModal
                show={isSearchModalOpen}
                onHide={() => setIsSearchModalOpen(false)}
                onBookAdded={handleBookAddedSuccess}
                currentUserId={userId}
                currentFavoritesCount={livrosFavoritos.length}
                maxFavorites={MAX_FAVORITES}
            />
        </div>
    );
}