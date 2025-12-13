"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { getUserById, updateUser } from '../../api/booklyApi';
import './editar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EditarPerfilPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null);

    // Estado do Formulário
    const [formData, setFormData] = useState({
        nome: '',
        bio: '',
        fotoPerfil: '', // URL da imagem
        generoPreferido: '' // Exemplo de campo extra
    });

    useEffect(() => {
        carregarDadosUsuario();
    }, []);

    const carregarDadosUsuario = async () => {
        // 1. Pega o ID do LocalStorage (já que é o PERFIL DO USUÁRIO LOGADO)
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        setUserId(user.id);

        try {
            // 2. Busca os dados mais recentes da API
            const dadosAtualizados = await getUserById(user.id);

            // 3. Preenche o formulário
            setFormData({
                nome: dadosAtualizados.nome || '',
                bio: dadosAtualizados.bio || '',
                fotoPerfil: dadosAtualizados.fotoPerfil || '',
                generoPreferido: dadosAtualizados.generoPreferido || ''
            });
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

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Envia para o Backend
            const usuarioAtualizado = await updateUser(userId, formData);

            // 2. Atualiza o LocalStorage (para o Navbar atualizar o nome/foto na hora)
            // Mantemos o ID e o Token, atualizamos o resto
            const oldData = JSON.parse(localStorage.getItem('userData'));
            const newData = { ...oldData, ...usuarioAtualizado };
            localStorage.setItem('userData', JSON.stringify(newData));

            alert("Perfil atualizado com sucesso!");

            // 3. Volta para a página de perfil
            router.push(`/perfil/${userId}`);

        } catch (error) {
            alert("Erro ao atualizar perfil. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Carregando...</div>;

    return (
        <div className="edit-page-container">
            <Navbar />

            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">

                        <div className="edit-card">
                            <h3 className="mb-4 text-center fw-bold" style={{ color: '#594A47' }}>Editar Perfil</h3>

                            <form onSubmit={handleSave}>

                                {/* FOTO DE PERFIL (URL) */}
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
                                            placeholder="Cole o link da sua imagem aqui..."
                                            value={formData.fotoPerfil}
                                            onChange={handleChange}
                                        />
                                        <small className="text-muted d-block" style={{marginTop: '-10px', marginBottom: '15px'}}>
                                            Dica: Use links do Imgur ou similar.
                                        </small>
                                    </div>
                                </div>

                                {/* NOME */}
                                <div>
                                    <label className="form-label-custom">Nome de Exibição</label>
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
                                        placeholder="Conte um pouco sobre você e seus livros favoritos..."
                                        value={formData.bio}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                {/* BOTÕES */}
                                <div className="d-flex justify-content-end mt-4">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => router.back()} // Volta para a página anterior
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
        </div>
    );
}