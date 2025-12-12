// pages/login.jsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loginUser } from '../src/api/booklyApi.js';

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
            // loginUser agora salva o userData
            await loginUser(email, password);
            router.push('/biblioteca' );
        } catch (err) {
            setError(err.message || 'Credenciais inválidas ou erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

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

                    <a href="/register" className="btn-login-secondary">Criar Conta</a>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;