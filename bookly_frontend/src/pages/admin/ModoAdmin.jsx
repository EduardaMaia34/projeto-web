import React, { useState, useEffect } from "react";
// MUDANÇA 1: Hooks e Link do React Router Dom
import { useNavigate, Link } from "react-router-dom";

// MUDANÇA 2: Caminhos relativos
import Navbar from "../../components/Navbar";
// Certifique-se que esses modais existem na pasta components, senão o código quebra
import EditBookModal from "../../components/EditBookModal";
import DeleteBookModal from "../../components/DeleteBookModal";

// MUDANÇA 3: Removemos o layout.jsx (estilos globais devem estar no main.jsx/index.css)

export default function ModoAdmin() {
    // MUDANÇA 4: useNavigate em vez de useRouter
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Verificação de Admin e Token
    useEffect(() => {
        const storedToken = localStorage.getItem("jwtToken");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        // Verifica permissões de forma mais flexível
        const role = userData.role || userData.perfil || userData.roles;

        const isAdmin = role && (
            role === 'ROLE_ADMIN' ||
            (Array.isArray(role) && role.includes('ROLE_ADMIN'))
        );

        if (!storedToken || !isAdmin) {
            console.warn("Acesso negado: Usuário não é admin ou sem token.");
            // MUDANÇA 5: navigate
            navigate("/login");
            return;
        }

        setToken(storedToken);
        fetchBooks(storedToken);
    }, [navigate]);

    // 2. Busca de Livros
    const fetchBooks = async (authToken) => {
        setLoading(true);
        try {
            const url = `http://localhost:8081/api/v1/livros`;
            console.log("Buscando livros em:", url);

            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Dados recebidos da API:", data);

                let lista = [];
                if (Array.isArray(data)) {
                    lista = data;
                } else if (data.content && Array.isArray(data.content)) {
                    lista = data.content;
                }

                setBooks(lista);
                setFilteredBooks(lista);
            } else {
                console.error("Erro na resposta da API:", response.status);
            }
        } catch (err) {
            console.error("Erro ao buscar livros:", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Filtro de Pesquisa
    useEffect(() => {
        if (!books) return;

        const term = searchTerm.toLowerCase();

        const results = books.filter(book => {
            const titulo = (book.titulo || "").toLowerCase();
            const autor = (book.autor || "").toLowerCase();
            const id = String(book.id || "");

            return titulo.includes(term) || autor.includes(term) || id.includes(term);
        });

        setFilteredBooks(results);
    }, [searchTerm, books]);

    // --- FUNÇÕES DE AÇÃO (Deletar/Editar) ---
    const handleDeleteClick = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!bookToDelete) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`http://localhost:8081/api/v1/livros/${bookToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 204 || response.ok) {
                const novaLista = books.filter(b => b.id !== bookToDelete.id);
                setBooks(novaLista);
                // O useEffect do filtro atualizará o filteredBooks automaticamente

                setShowDeleteModal(false);
                setBookToDelete(null);
            } else {
                alert("Erro ao excluir. Verifique se o livro possui vínculos.");
            }
        } catch (error) {
            console.error("Erro ao excluir", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClick = (book) => {
        setEditingBook(book);
        setShowEditModal(true);
    };

    const handleUpdateSuccess = (updatedBook) => {
        // Atualiza a lista local com o livro editado
        const updatedList = books.map(b => b.id === updatedBook.id ? updatedBook : b);
        setBooks(updatedList);
        setFilteredBooks(updatedList);
        alert("Livro atualizado com sucesso!");
        setShowEditModal(false);
    };

    return (
        <div style={{ backgroundColor: "#f4f1ea", minHeight: "100vh" }}>
            <Navbar />

            <div className="container" style={{ paddingTop: "120px", paddingBottom: "60px" }}>

                <div className="row align-items-center mb-4">
                    <div className="col-md-6">
                        <h2 className="m-0" style={{ fontFamily: "'Georgia', serif", color: "#594A47", fontWeight: "bold" }}>
                            Modo Admin
                        </h2>
                        <small className="text-muted">Gerenciamento de {books.length} Livros</small>
                    </div>

                    <div className="col-md-6 text-md-end d-flex justify-content-end align-items-center">
                        <button
                            className="btn btn-link text-dark me-3"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            title="Alternar Pesquisa"
                        >
                            <i className="bi bi-search" style={{ fontSize: '1.2rem' }}></i>
                        </button>

                        {/* MUDANÇA 6: Link com 'to' em vez de 'href' e rota correta */}
                        <Link to="/admin/cadastrar" className="btn btn-success shadow-sm" style={{ backgroundColor: "#198754", border: "none" }}>
                            <i className="bi bi-plus-lg me-2"></i> Adicionar Livro
                        </Link>
                    </div>
                </div>

                {isSearchVisible && (
                    <div className="mb-4">
                        <input
                            type="text"
                            className="form-control p-3"
                            placeholder="Pesquisar por título, autor ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                        <p className="mt-2 text-muted">Carregando acervo...</p>
                    </div>
                ) : (
                    <div className="row">
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                                <div key={book.id} className="col-12 mb-3">
                                    <div className="card shadow-sm border-0">
                                        <div className="card-body d-flex align-items-center p-3">

                                            {/* Imagem */}
                                            <div style={{ width: "60px", height: "90px", backgroundColor: "#eee", flexShrink: 0, overflow: "hidden", borderRadius: "4px" }}>
                                                <img
                                                    src={book.urlCapa || ""}
                                                    alt={book.titulo}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    onError={(e) => e.target.style.display = "none"}
                                                />
                                            </div>

                                            {/* Informações */}
                                            <div className="ms-3 flex-grow-1">
                                                <h5 className="mb-1" style={{ color: "#594A47", fontWeight: "bold" }}>
                                                    {book.titulo}
                                                </h5>
                                                <p className="mb-1 text-muted small">
                                                    {book.autor} • {book.ano} • ID: {book.id}
                                                </p>
                                                {/* Tags */}
                                                <div>
                                                    {book.interesses && Array.isArray(book.interesses) && book.interesses.map((tag, idx) => (
                                                        <span key={idx} className="badge bg-light text-dark border me-1 fw-normal">
                                                            {tag.nome || tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Botões */}
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handleEditClick(book)}
                                                    title="Editar"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDeleteClick(book)}
                                                    title="Excluir"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <i className="bi bi-journal-x fs-1 text-muted mb-3 d-block"></i>
                                <h5 className="text-muted">Nenhum livro encontrado.</h5>
                                {searchTerm && <p className="small text-muted">Tente buscar por outro termo.</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Certifique-se que estes componentes existem e aceitam estas props */}
            <EditBookModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                book={editingBook}
                onUpdateSuccess={handleUpdateSuccess}
            />

            <DeleteBookModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                book={bookToDelete}
                onConfirm={confirmDelete}
                loading={isDeleting}
            />
        </div>
    );
}