"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EditBookModal from "@/components/EditBookModal";
import DeleteBookModal from "@/components/DeleteBookModal";
import "../../layout.jsx"; // Assumindo o caminho do CSS global

export default function ModoAdmin() {
    const router = useRouter();

    // --- ESTADOS DE DADOS ---
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");

    // --- ESTADO PARA PESQUISA TOGGLE ---
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // --- ESTADOS DO MODAL DE EDIÇÃO ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    // --- ESTADOS DO MODAL DE DELEÇÃO ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- VERIFICAÇÃO INICIAL ---
    useEffect(() => {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        const role = userData.role || userData.perfil || userData.roles;
        const isAdmin = role === 'ROLE_ADMIN' || (Array.isArray(role) && role.includes('ROLE_ADMIN'));

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
            const url = `http://localhost:8081/api/v1/livros`;

            const response = await fetch(url, {
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
            book.autor.toLowerCase().includes(term) ||
            String(book.id).includes(term)
        );
        setFilteredBooks(results);
    }, [searchTerm, books]);


    // --- LÓGICA DE EXCLUSÃO ---
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
                setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
                setShowDeleteModal(false);
                setBookToDelete(null);
            } else if (response.status === 403) {
                alert("Acesso negado. Você não tem permissão de ADMIN para deletar.");
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

            <div className="container" style={{ paddingTop: "120px", paddingBottom: "60px" }}>

                {/* --- CABEÇALHO E BOTÕES --- */}
                <div className="row align-items-center mb-4">
                    <div className="col-md-6">
                        <h2 className="admin-title m-0">Modo Admin</h2>
                        <small className="text-muted">Gerenciamento de {books.length} Livros</small>
                    </div>

                    <div className="col-md-6 text-md-end d-flex justify-content-end align-items-center">

                        {/* Botão de Pesquisa (Toggle) */}
                        <button
                            className="btn btn-link text-dark me-3"
                            onClick={() => setIsSearchVisible(!isSearchVisible)}
                            title="Alternar Barra de Pesquisa"
                        >
                            <i className="bi bi-search" style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}></i>
                        </button>

                        {/* Botão ADICIONAR LIVRO (Verde) */}
                        <Link href="/admin/cadastrar-livro" className="btn-green-bookly shadow-sm">
                            <i className="bi bi-plus-lg me-2"></i> Adicionar Livro
                        </Link>
                    </div>
                </div>

                {/* --- BARRA DE PESQUISA TOGGLE --- */}
                <div className={`search-toggle-wrapper mb-4 ${isSearchVisible ? 'visible' : ''}`}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Pesquisar por título, autor ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                    <div className="book-card-admin d-flex align-items-center">

                                        {/* LAYOUT: Capa e Info Lado a Lado (Esquerda) */}
                                        <img
                                            src={book.urlCapa || "https://via.placeholder.com/150"}
                                            alt={book.titulo}
                                            className="book-cover flex-shrink-0"
                                            onError={(e) => e.target.src = "https://via.placeholder.com/80x120?text=Sem+Capa"}
                                        />

                                        <div className="book-info ms-4 flex-grow-1" style={{ minWidth: 0 }}>
                                            <h4>{book.titulo}</h4>

                                            <div className="book-meta">
                                                <i className="bi bi-person-fill me-1"></i> {book.autor}
                                                <span className="mx-2 text-muted">|</span>
                                                <i className="bi bi-calendar-event me-1"></i> {book.ano}
                                                <span className="mx-2 text-muted">|</span>
                                                <i className="bi bi-hash me-1"></i> ID: {book.id}
                                            </div>

                                            <p className="text-muted small mb-2 d-none d-md-block" style={{
                                                lineHeight: '1.4',
                                                maxHeight: '2.8em',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {book.descricao}
                                            </p>

                                            <div className="mt-2">
                                                {book.interesses && Array.isArray(book.interesses) && book.interesses.map((tag, index) => (
                                                    <span key={tag.id || index} className="tag-pill">{tag.nome || tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* BOTÕES DE AÇÃO (Direita) */}
                                        <div className="d-flex ms-3 align-items-center flex-shrink-0">

                                            {/* Botão EDITAR (Marrom Escuro) */}
                                            <button
                                                className="action-btn btn-edit"
                                                onClick={() => handleEditClick(book)}
                                                title="Editar"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            {/* Botão DELETAR (Marrom Escuro) */}
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

            {/* MODAL DE EXCLUSÃO */}
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