"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
// 1. IMPORTANTE: Adicione fetchInteresses aqui
import { getUserById, updateUser, fetchInteresses } from '../../api/booklyApi';
import './editar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EditarPerfilPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null);

    // 2. NOVOS ESTADOS para os interesses
    const [interessesDisponiveis, setInteressesDisponiveis] = useState([]);
    const [interessesSelecionados, setInteressesSelecionados] = useState([]);

    const [formData, setFormData] = useState({
        nome: '',
        bio: '',
        fotoPerfil: '',
        generoPreferido: ''
    });

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
        setUserId(userLocal.id);

        try {
            // 3. Carrega Usuário E Lista de Interesses ao mesmo tempo
            const [listaInteresses, dadosUsuario] = await Promise.all([
                fetchInteresses(),
                getUserById(userLocal.id)
            ]);

            setInteressesDisponiveis(listaInteresses);

            setFormData({
                nome: dadosUsuario.nome || '',
                bio: dadosUsuario.bio || '',
                fotoPerfil: dadosUsuario.fotoPerfil || '',
                generoPreferido: dadosUsuario.generoPreferido || ''
            });

            // 4. Preenche os interesses que o usuário já tem
            // O backend agora retorna objetos {id, nome}, precisamos extrair apenas os IDs
            if (dadosUsuario.interesses && Array.isArray(dadosUsuario.interesses)) {
                const ids = dadosUsuario.interesses.map(i => i.id);
                setInteressesSelecionados(ids);
            }

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

    // 5. Lógica para selecionar/deselecionar com LIMITE DE 5
    const toggleInteresse = (id) => {
        setInteressesSelecionados(prev => {
            if (prev.includes(id)) {
                // Se já tem, remove
                return prev.filter(item => item !== id);
            } else {
                // Se não tem, verifica o limite
                if (prev.length >= 5) {
                    alert("Você só pode selecionar até 5 interesses.");
                    return prev;
                }
                // Adiciona
                return [...prev, id];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 6. Monta o payload incluindo a lista de IDs
            const payload = {
                ...formData,
                interessesIds: interessesSelecionados // Envia [1, 5, 8...]
            };

            const usuarioAtualizado = await updateUser(userId, payload);

            // Atualiza LocalStorage
            const oldData = JSON.parse(localStorage.getItem('userData'));
            // Atualiza os dados mantendo o token
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

                                    <div className="d-flex flex-wrap gap-2 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                                        {interessesDisponiveis.length > 0 ? (
                                            interessesDisponiveis.map((interesse) => {
                                                const isSelected = interessesSelecionados.includes(interesse.id);
                                                return (
                                                    <span
                                                        key={interesse.id}
                                                        onClick={() => toggleInteresse(interesse.id)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            padding: '6px 14px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.9rem',
                                                            transition: 'all 0.2s',
                                                            // Lógica visual: Marrom se selecionado, Branco se não
                                                            backgroundColor: isSelected ? '#594A47' : '#fff',
                                                            color: isSelected ? '#fff' : '#594A47',
                                                            border: '1px solid #594A47',
                                                            fontWeight: isSelected ? '600' : '400',
                                                            boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                        }}
                                                    >
                                                        {interesse.nome}
                                                        {isSelected && <i className="bi bi-check ms-1"></i>}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-muted small">Carregando interesses...</span>
                                        )}
                                    </div>
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
        </div>
    );
}