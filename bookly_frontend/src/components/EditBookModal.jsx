// src/components/EditBookModal.jsx
"use client";

import React, { useState, useEffect } from "react";

export default function EditBookModal({ show, onHide, book, onUpdateSuccess }) {
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
    const [message, setMessage] = useState(null);

    // Carregar dados
    useEffect(() => {
        if (show && book) {
            setFormData({
                titulo: book.titulo || "",
                autor: book.autor || "",
                descricao: book.descricao || "",
                urlCapa: book.urlCapa || "",
                ano: book.ano || "",
            });
            // Mapeia interesses existentes
            const currentIds = book.interesses ? book.interesses.map(i => i.id) : [];
            setSelectedInteresses(currentIds);
            setMessage(null);
            fetchInteresses();
        }
    }, [show, book]);

    // Busca generos
    const fetchInteresses = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("http://localhost:8081/api/v1/interesses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableInteresses(data);
            }
        } catch (error) {
            console.error("Erro ao buscar interesses", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInteresseToggle = (id) => {
        setSelectedInteresses(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem("jwtToken");

        const payload = {
            titulo: formData.titulo,
            autor: formData.autor,
            descricao: formData.descricao,
            urlCapa: formData.urlCapa,
            ano: parseInt(formData.ano),
            interessesIds: selectedInteresses
        };

        try {
            const response = await fetch(`http://localhost:8081/api/v1/livros/${book.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const updatedBook = await response.json();
                onUpdateSuccess(updatedBook);
                onHide();
            } else {
                setMessage("Erro ao atualizar. Verifique os dados.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    // Definição das cores base
    const MARROM_ESCURO = '#594A47';
    const BEGE_CLARO = '#f5f4ed';
    const BEGE_ESCURO = '#DED2C2';
    const VERDE_SUCESSO = '#198754';


    return (
        <>
            {/* Backdrop: Opacidade 0.5, Preto */}
            <div className="modal-backdrop show" style={{ opacity: 0.5, backgroundColor: '#000' }}></div>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>

                        {/* Cabeçalho: Marrom Escuro */}
                        <div className="modal-header border-0 text-white" style={{ backgroundColor: MARROM_ESCURO }}>
                            <h5 className="modal-title fw-bold" style={{ fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>
                                <i className="bi bi-pencil-square me-2"></i>EDITAR LIVRO
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
                        </div>

                        {/* Corpo do Modal: Bege Claro */}
                        <div className="modal-body p-4" style={{ backgroundColor: BEGE_CLARO }}>
                            {message && <div className="alert alert-danger">{message}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-8">
                                        <label className="form-label fw-bold text-uppercase small" style={{ color: MARROM_ESCURO }}>Título</label>
                                        <input type="text" name="titulo" className="form-control" value={formData.titulo} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold text-uppercase small" style={{ color: MARROM_ESCURO }}>Ano</label>
                                        <input type="number" name="ano" className="form-control" value={formData.ano} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase small" style={{ color: MARROM_ESCURO }}>Autor</label>
                                    <input type="text" name="autor" className="form-control" value={formData.autor} onChange={handleChange} required />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase small" style={{ color: MARROM_ESCURO }}>URL da Capa</label>
                                    <input type="text" name="urlCapa" className="form-control" value={formData.urlCapa} onChange={handleChange} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase small" style={{ color: MARROM_ESCURO }}>Sinopse</label>
                                    <textarea name="descricao" className="form-control" rows="4" value={formData.descricao} onChange={handleChange} required></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-uppercase small d-block" style={{ color: MARROM_ESCURO }}>Gêneros</label>
                                    {/* Fundo de seleção: Bege Escuro */}
                                    <div className="border p-3 rounded" style={{ backgroundColor: BEGE_ESCURO, borderColor: MARROM_ESCURO }}>
                                        {availableInteresses.map(inter => (
                                            <span
                                                key={inter.id}
                                                onClick={() => handleInteresseToggle(inter.id)}
                                                className="badge rounded-pill me-2 mb-2 p-2 user-select-none"
                                                style={{
                                                    cursor: 'pointer',
                                                    // Selecionado: Marrom Escuro; Não Selecionado: Branco
                                                    backgroundColor: selectedInteresses.includes(inter.id) ? MARROM_ESCURO : 'white',
                                                    color: selectedInteresses.includes(inter.id) ? '#fff' : MARROM_ESCURO,
                                                    border: '1px solid ' + MARROM_ESCURO
                                                }}
                                            >
                                                {inter.nome} {selectedInteresses.includes(inter.id) && <i className="bi bi-check-lg ms-1"></i>}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-end mt-4 pt-3 border-top">
                                    {/* Botão Cancelar: Outline Marrom Escuro */}
                                    <button
                                        type="button"
                                        className="btn me-2 rounded-pill px-4"
                                        onClick={onHide}
                                        style={{ borderColor: MARROM_ESCURO, color: MARROM_ESCURO }}
                                    >
                                        Cancelar
                                    </button>
                                    {/* Botão Salvar: Marrom Escuro */}
                                    <button
                                        type="submit"
                                        className="btn rounded-pill px-4 text-white"
                                        style={{ backgroundColor: MARROM_ESCURO }}
                                        disabled={loading}
                                    >
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}