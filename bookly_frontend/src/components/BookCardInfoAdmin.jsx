// src/components/BookCardInfoAdmin.jsx

import React from "react";
import Link from "next/link";


export default function BookCardInfoAdmin({ livro, onDelete }) {

    const handleEditClick = () => {
        if (livro.id) {
            window.location.href = `/livros/editar/${livro.id}`;
        }
    };

    return (
        <div
            className="bookly-card p-3 shadow-sm d-flex align-items-center"
            style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}
        >
            <div className="d-flex w-100">

                {/* 1. Capa do Livro (Esquerda) */}
                <div className="flex-shrink-0 me-3 me-sm-4">
                    <Link href={`/livros/${livro.id}`} passHref>
                        <img
                            src={livro.urlCapa || "https://via.placeholder.com/100x150?text=Sem+Capa"}
                            alt={`Capa de ${livro.titulo}`}
                            className="rounded"
                            style={{
                                width: '70px',
                                height: '100px',
                                objectFit: 'cover',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}
                        />
                    </Link>
                </div>

                {/* 2. Informações do Livro (Alinhadas à Esquerda, ao lado da capa) */}
                <div className="flex-grow-1 me-3 d-flex flex-column justify-content-center">
                    <Link href={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                        <h5 className="mb-1" style={{ color: '#594A47', fontWeight: 'bold' }}>
                            {livro.titulo}
                        </h5>
                    </Link>
                    <p className="mb-1 small text-muted">
                        Autor: <span style={{ color: '#333' }}>{livro.autor}</span>
                    </p>
                    <p className="mb-0 small text-muted">
                        ID: <span style={{ color: '#333' }}>{livro.id}</span> | Ano: <span style={{ color: '#333' }}>{livro.ano}</span>
                    </p>

                    {/* Interesses como Tags */}
                    <div className="mt-1 d-flex flex-wrap">
                        {livro.interesses?.slice(0, 3).map((interesse, index) => (
                            <span
                                key={index}
                                className="badge me-1 mt-1"
                                style={{
                                    backgroundColor: '#eee',
                                    color: '#594A47',
                                    fontWeight: 'normal'
                                }}
                            >
                                {interesse.nome || interesse}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 3. Botões de Ação (Direita) */}
                <div className="flex-shrink-0 d-flex flex-column justify-content-center align-items-end ms-auto">

                    {/* Botão EDITAR (Marrom Escuro) */}
                    <button
                        className="btn btn-sm mb-2"
                        onClick={handleEditClick}
                        title="Editar Livro"
                        style={{
                            backgroundColor: '#594A47', // Marrom Escuro
                            color: 'white',
                            minWidth: '100px'
                        }}
                    >
                        <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>

                    {/* Botão DELETAR (Marrom Escuro) */}
                    <button
                        className="btn btn-sm"
                        onClick={() => onDelete(livro.id, livro.titulo)}
                        title="Excluir Livro do Sistema"
                        style={{
                            backgroundColor: '#A0522D', // Um tom de marrom para contraste
                            color: 'white',
                            minWidth: '100px'
                        }}
                    >
                        <i className="bi bi-trash-fill me-1"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}