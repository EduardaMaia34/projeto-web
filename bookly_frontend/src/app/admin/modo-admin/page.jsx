"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EditBookModal from "@/components/EditBookModal";
import DeleteBookModal from "@/components/DeleteBookModal"; // <--- 1. IMPORTAÇÃO DO DELETE MODAL

export default function ModoAdmin() {
    const router = useRouter();

    // --- ESTADOS DE DADOS ---
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");

    // --- ESTADOS DO MODAL DE EDIÇÃO ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    // --- ESTADOS DO MODAL DE DELEÇÃO (NOVO) ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- VERIFICAÇÃO INICIAL ---
    useEffect(() => {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        const isAdmin = userData.role === 'ROLE_ADMIN' || (userData.roles && userData.roles.includes('ROLE_ADMIN'));

        if (!storedToken || !isAdmin) {
            router.push("/login");
            return;
        }

        setToken(storedToken);
        fetchBooks(storedToken);
    }, [router]);

    // --- BUSCAR LIVROS ---
    const fetchBooks = async (authToken) => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8081/api/v1/livros", {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                const lista = Array.isArray(data) ? data : (data.content || []);
                setBooks(lista);
                setFilteredBooks(lista);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTRO ---
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const results = books.filter(book =>
            book.titulo.toLowerCase().includes(term) ||
            book.autor.toLowerCase().includes(term)
        );
        setFilteredBooks(results);
    }, [searchTerm, books]);


    // --- LÓGICA DE EXCLUSÃO (ATUALIZADA) ---

    // 1. Apenas abre o modal
    const handleDeleteClick = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    // 2. Executa a exclusão quando o usuário confirma no modal
    const confirmDelete = async () => {
        if (!bookToDelete) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`http://localhost:8081/api/v1/livros/${bookToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                // Remove da lista visualmente
                setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
                setShowDeleteModal(false); // Fecha modal
                setBookToDelete(null);     // Limpa seleção
            } else {
                alert("Erro ao excluir. O livro pode ter vínculos com reviews ou usuários.");
            }
        } catch (error) {
            console.error("Erro de conexão", error);
            alert("Erro de conexão ao tentar excluir.");
        } finally {
            setIsDeleting(false);
        }
    };


    // --- LÓGICA DE EDIÇÃO ---
    const handleEditClick = (book) => {
        setEditingBook(book);
        setShowEditModal(true);
    };

    const handleUpdateSuccess = (updatedBook) => {
        const updatedList = books.map(b => b.id === updatedBook.id ? updatedBook : b);
        setBooks(updatedList);
        setFilteredBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
        alert("Livro atualizado com sucesso!");
    };

    return (
        <div style={{ backgroundColor: "#f4f1ea", minHeight: "100vh" }}>
            <Navbar />

            <style jsx>{`
                .admin-title { font-family: 'Georgia', serif; color: #594A47; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .search-container { position: relative; }
                .search-input { width: 100%; padding: 12px 20px; padding-right: 40px; border-radius: 30px; border: 2px solid #ddd; outline: none; transition: border-color 0.3s; }
                .search-input:focus { border-color: #003366; }
                .search-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #888; }
                .btn-navy { background-color: #003366; color: white; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; transition: background 0.3s; border: none; }
                .btn-navy:hover { background-color: #002244; color: white; }
                .book-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #eee; transition: transform 0.2s; width: 100%; }
                .book-card:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.05); }
                .book-cover { width: 80px; height: 120px; object-fit: cover; border-radius: 4px; background-color: #ddd; }
                .book-info h4 { font-family: 'Georgia', serif; color: #333; margin-bottom: 5px; font-size: 1.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .book-meta { color: #666; font-size: 0.9rem; margin-bottom: 8px; }
                .tag-pill { background-color: #f0f0f0; color: #555; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; margin-right: 5px; display: inline-block; margin-bottom: 4px; }
                .action-btn { border: none; background: none; cursor: pointer; font-size: 1.3rem; margin-left: 15px; transition: transform 0.2s; }
                .action-btn:hover { transform: scale(1.1); }
                .btn-edit { color: #ffc107; }
                .btn-delete { color: #dc3545; }
            `}</style>

            <div className="container" style={{ paddingTop: "120px", paddingBottom: "60px" }}>

                <div className="row align-items-center mb-5">
                    <div className="col-md-4">
                        <h2 className="admin-title m-0">Modo Admin</h2>
                        <small className="text-muted">Gerenciamento de Biblioteca</small>
                    </div>

                    <div className="col-md-5 my-3 my-md-0">
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Pesquisar por título ou autor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <i className="bi bi-search search-icon"></i>
                        </div>
                    </div>

                    <div className="col-md-3 text-md-end">
                        <Link href="/admin/cadastrar-livro" className="btn-navy shadow-sm">
                            <i className="bi bi-plus-lg me-2"></i> Adicionar Livro
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                        <p className="mt-2 text-muted">Carregando acervo...</p>
                    </div>
                ) : (
                    <div className="row">
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                                <div key={book.id} className="col-12">
                                    <div className="book-card d-flex align-items-center">

                                        <img
                                            src={book.urlCapa || "https://via.placeholder.com/150"}
                                            alt={book.titulo}
                                            className="book-cover flex-shrink-0"
                                            onError={(e) => e.target.src = "https://via.placeholder.com/150?text=Sem+Capa"}
                                        />

                                        <div className="book-info ms-4 flex-grow-1" style={{ minWidth: 0 }}>
                                            <h4>{book.titulo}</h4>

                                            <div className="book-meta">
                                                <i className="bi bi-person-fill me-1"></i> {book.autor}
                                                <span className="mx-2 text-muted">|</span>
                                                <i className="bi bi-calendar-event me-1"></i> {book.ano}
                                            </div>

                                            <p className="text-muted small mb-2 d-none d-md-block" style={{
                                                lineHeight: '1.4',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {book.descricao}
                                            </p>

                                            <div className="mt-2">
                                                {book.interesses && book.interesses.map((tag, index) => (
                                                    <span key={tag.id || index} className="tag-pill">{tag.nome}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="d-flex ms-3 align-items-center">
                                            <button
                                                className="action-btn btn-edit"
                                                onClick={() => handleEditClick(book)}
                                                title="Editar"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            {/* AQUI: Botão chama o Modal em vez de deletar direto */}
                                            <button
                                                className="action-btn btn-delete"
                                                title="Excluir"
                                                onClick={() => handleDeleteClick(book)}
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5 opacity-50">
                                <i className="bi bi-emoji-frown fs-1 mb-3 d-block"></i>
                                <h5>Nenhum livro encontrado.</h5>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL DE EDIÇÃO */}
            <EditBookModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                book={editingBook}
                onUpdateSuccess={handleUpdateSuccess}
            />

            {/* MODAL DE EXCLUSÃO (NOVO) */}
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