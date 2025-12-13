// src/pages/login.jsx (MANTIDO NA PASTA /pages)

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loginUser, getLoggedInUserId } from '../api/booklyApi.js';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await loginUser(email, password);

            const userId = getLoggedInUserId();

            if (userId) {
                router.push(`/biblioteca/${userId}`);
            } else {
                router.push('/biblioteca');
            }

        } catch (err) {
            // Se o erro for 401/403 (Token Expirado/Inválido)
            if (String(err.message).includes('403') || String(err.message).includes('401')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userData');
                }
            }
            setError(err.message || 'Credenciais inválidas ou erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        // Redireciona usando o router da Pages Router
        router.push("/register");
    }

    return (
        // Usando a cor de fundo e flexbox para centralização vertical/horizontal
        <div style={{ backgroundColor: 'var(--color-background-light)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>

            {/* Aplica a classe login-container que já define o fundo DED2C2 e o box-shadow */}
            <div className="login-container">

                <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" className="logo-login" />

                <p className="subtitulo-login">Acesse sua conta</p>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="username"
                        className="form-control"
                        placeholder="Seu E-mail"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Sua Senha"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="btn btn-login-primary"
                        disabled={loading}>
                        {loading ? 'Acessando...' : 'Acessar conta'}
                    </button>

                    <a href="#" className="link-esqueci">Esqueci a senha</a>

                    {/* Usamos o evento onClick para garantir que o Pages Router faça a transição */}
                    <a href="/register" className="btn-login-secondary" onClick={handleRegisterClick}>Criar Conta</a>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;