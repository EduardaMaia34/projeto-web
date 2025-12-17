import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORTAÇÃO DAS PÁGINAS ---
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/Home';
import Perfil from "./pages/perfil/Perfil";
import EditarPerfil from './pages/editar-perfil/EditarPerfil';
import Biblioteca from './pages/Biblioteca';
import Estante from './pages/Estante';
import Livros from './pages/livros/Livros';
import Reviews from './pages/Reviews';
import CadastrarLivro from './pages/admin/CadastrarLivro';
import ModoAdmin from './pages/admin/ModoAdmin';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- Rotas Públicas (Sem Navbar geralmente) --- */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- Rotas da Aplicação --- */}
                <Route path="/home" element={<HomePage />} />

                {/* Perfil: Visualizar o meu ou de outros (via ID) */}
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/perfil/:id" element={<Perfil />} />
                <Route path="/editar-perfil" element={<EditarPerfil />} />

                {/* Bibliotecas e Estantes */}
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/biblioteca/:id" element={<Biblioteca />} />

                <Route path="/estante" element={<Estante />} />
                <Route path="/estante/:id" element={<Estante />} />

                {/* Livros e Reviews */}
                <Route path="/livros/:id" element={<Livros />} />

                <Route path="/reviews" element={<Reviews />} />
                <Route path="/reviews/:id" element={<Reviews />} />

                {/* --- Rotas de Admin --- */}
                {/* DICA: Futuramente, proteja estas rotas para apenas admins acessarem */}
                <Route path="/admin/cadastrar" element={<CadastrarLivro />} />
                <Route path="/admin/painel" element={<ModoAdmin />} />

                {/* Rota Coringa (404) */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;