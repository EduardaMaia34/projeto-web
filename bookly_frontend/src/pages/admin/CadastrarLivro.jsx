import React, { useState, useEffect } from "react";
// MUDANÇA 1: useNavigate do React Router Dom
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

// MUDANÇA 2: Importar o CSS criado acima
import "./cadastrarLivro.css";

export default function CadastrarLivro() {
    // MUDANÇA 3: Hook de navegação
    const navigate = useNavigate();

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

        if (!token) {
            navigate("/login");
            return;
        }

        fetchInteresses(token);
    }, [navigate]);

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

    // 3. Manipula seleção de Interesses
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
            interessesIds: selectedInteresses
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
                // MUDANÇA 4: Redireciona para a rota definida no App.jsx (/admin/painel)
                setTimeout(() => navigate("/admin/painel"), 2000);
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
                                        onClick={() => navigate(-1)} // Volta 1 página
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