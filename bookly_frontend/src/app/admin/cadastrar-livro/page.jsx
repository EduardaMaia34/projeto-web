"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function CadastrarLivro() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        titulo: "",
        autor: "",
        descricao: "",
        urlCapa: "",
        ano: "",
    });

    const [availableInteresses, setAvailableInteresses] = useState([]);
    const [selectedInteresses, setSelectedInteresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // 1. Ao carregar, verifica Auth e busca Interesses
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        if (!token) { // Adicione a verificação de role se necessário (userData.role !== "ROLE_ADMIN")
            router.push("/login");
            return;
        }

        fetchInteresses(token);
    }, [router]);

    const fetchInteresses = async (token) => {
        try {

            const response = await fetch("http://localhost:8081/api/v1/interesses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableInteresses(data);
            }
        } catch (error) {
            console.error("Erro ao buscar interesses", error);
        }
    };

    // 2. Manipula inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 3. Manipula seleção de Interesses (Agora com estilo de TAGS)
    const handleInteresseToggle = (interesseId) => {
        setSelectedInteresses((prev) => {
            if (prev.includes(interesseId)) {
                return prev.filter((id) => id !== interesseId);
            } else {
                return [...prev, interesseId];
            }
        });
    };

    // 4. Envia o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const token = localStorage.getItem("jwtToken");

        const payload = {
            titulo: formData.titulo,
            autor: formData.autor,
            descricao: formData.descricao,
            urlCapa: formData.urlCapa,
            ano: parseInt(formData.ano),
            interessesIds: selectedInteresses // Mantendo sua correção de lógica
        };

        try {
            const response = await fetch("http://localhost:8081/api/v1/livros", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Livro cadastrado com sucesso!" });
                setTimeout(() => router.push("/admin/modo-admin"), 2000);
            } else {
                let errorMsg = "Falha ao cadastrar";
                try {
                    const errorJson = await response.json();
                    if(errorJson.errors) errorMsg = Object.values(errorJson.errors)[0];
                    else if(errorJson.message) errorMsg = errorJson.message;
                } catch(e) {
                    errorMsg = await response.text();
                }
                setMessage({ type: "error", text: `Erro: ${errorMsg}` });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erro de conexão com o servidor." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "#f4f1ea", minHeight: "100vh" }}>
            <Navbar />

            {/* --- CSS CUSTOMIZADO PARA ESTILO BOOKLY --- */}
            <style jsx>{`
                .bookly-label {
                    font-family: 'Georgia', 'Times New Roman', serif;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 0.85rem;
                    color: #594A47;
                    font-weight: bold;
                    margin-bottom: 8px;
                    display: block;
                }
                .bookly-input {
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 12px;
                    width: 100%;
                    outline: none;
                    transition: border-color 0.3s;
                    font-family: sans-serif;
                }
                .bookly-input:focus {
                    border-color: #594A47;
                    box-shadow: 0 0 0 2px rgba(89, 74, 71, 0.1);
                }
                .bookly-card {
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02); 
                }
                .bookly-btn {
                    background-color: #198754; 
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 0.9rem;
                    transition: opacity 0.3s;
                }
                .bookly-btn:hover {
                    opacity: 0.9;
                }
                .bookly-btn-outline {
                    background: transparent;
                    border: 1px solid #999;
                    color: #666;
                    padding: 12px 24px;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }
                .bookly-btn-outline:hover {
                    background-color: #f0f0f0;
                    color: #333;
                }
                .tag-badge {
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid #ddd;
                    background: #fff;
                    color: #555;
                    display: inline-block;
                    margin: 0 8px 8px 0;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    user-select: none;
                }
                .tag-badge:hover {
                    border-color: #aaa;
                }
                .tag-badge.selected {
                    background-color: #594A47;
                    color: white;
                    border-color: #594A47;
                }
            `}</style>

            <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
                <div className="row justify-content-center">
                    <div className="col-md-8">

                        <h2 className="text-center mb-5" style={{
                            fontFamily: "'Georgia', serif",
                            color: "#594A47",
                            fontWeight: "bold"
                        }}>
                            CADASTRAR NOVO LIVRO
                        </h2>

                        <div className="bookly-card">

                            {message.text && (
                                <div className={`alert alert-${message.type === "success" ? "success" : "danger"} mb-4 text-center`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Linha 1: Título e Autor */}
                                <div className="row mb-4">
                                    <div className="col-md-12 mb-4">
                                        <label className="bookly-label">Título do Livro</label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            className="bookly-input"
                                            value={formData.titulo}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-8 mb-4">
                                        <label className="bookly-label">Autor</label>
                                        <input
                                            type="text"
                                            name="autor"
                                            className="bookly-input"
                                            value={formData.autor}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4 mb-4">
                                        <label className="bookly-label">Ano</label>
                                        <input
                                            type="number"
                                            name="ano"
                                            className="bookly-input"
                                            value={formData.ano}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* URL da Capa */}
                                <div className="mb-4">
                                    <label className="bookly-label">URL da Capa (Imagem)</label>
                                    <input
                                        type="text"
                                        name="urlCapa"
                                        className="bookly-input"
                                        placeholder="https://..."
                                        value={formData.urlCapa}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Preview da Capa */}
                                {formData.urlCapa && (
                                    <div className="mb-4 text-center">
                                        <div style={{
                                            width: "140px",
                                            height: "210px",
                                            margin: "0 auto",
                                            backgroundColor: "#eee",
                                            borderRadius: "4px",
                                            overflow: "hidden",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                        }}>
                                            <img
                                                src={formData.urlCapa}
                                                alt="Preview"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                        <small className="text-muted mt-2 d-block">Pré-visualização</small>
                                    </div>
                                )}

                                {/* Descrição */}
                                <div className="mb-4">
                                    <label className="bookly-label">Sinopse / Descrição</label>
                                    <textarea
                                        name="descricao"
                                        className="bookly-input"
                                        rows="5"
                                        maxLength="1024"
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    <div className="text-end text-muted small mt-1">{formData.descricao.length}/1024</div>
                                </div>

                                {/* Seleção de Interesses (Visual de Tags) */}
                                <div className="mb-5">
                                    <label className="bookly-label mb-3">Gêneros / Categorias</label>
                                    <div className="p-2">
                                        {availableInteresses.length > 0 ? (
                                            availableInteresses.map((interesse) => (
                                                <div
                                                    key={interesse.id}
                                                    className={`tag-badge ${selectedInteresses.includes(interesse.id) ? 'selected' : ''}`}
                                                    onClick={() => handleInteresseToggle(interesse.id)}
                                                >
                                                    {interesse.nome}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted small">Carregando gêneros...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="d-flex justify-content-between align-items-center mt-5">
                                    <button
                                        type="button"
                                        className="bookly-btn-outline"
                                        onClick={() => router.back()}
                                    >
                                        Cancelar
                                    </button>

                                    <button type="submit" className="bookly-btn" disabled={loading} style={{ minWidth: "160px" }}>
                                        {loading ? "Salvando..." : "Salvar Livro"}
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