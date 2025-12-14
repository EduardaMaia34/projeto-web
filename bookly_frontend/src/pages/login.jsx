// src/pages/login.jsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loginUser } from '../api/booklyApi';

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
            // 1. Tenta fazer o login
            // A função loginUser (do booklyApi.js) já salva o token e o userData no localStorage
            await loginUser(email, password);

            // 2. Redireciona para a biblioteca após sucesso
            console.log("✅ Login bem-sucedido! Redirecionando...");
            router.push('/biblioteca');

        } catch (err) {
            console.error("Erro no submit:", err);

            // Limpa dados se houver erro de autenticação
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
        router.push("/register");
    }

    return (
        // Container Fundo Bege Claro (#f5f4ed)
        <div style={{
            backgroundColor: '#f5f4ed',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            {/* Card de Login Marrom Claro (#DED2C2) */}
            <div className="login-container" style={{
                backgroundColor: '#DED2C2',
                padding: '2.5rem',
                borderRadius: '15px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <img
                    src="https://imgur.com/HLvpHYn.png"
                    alt="Bookly Logo"
                    style={{ maxWidth: '180px', marginBottom: '1.5rem' }}
                />

                <p style={{
                    color: '#594A47',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '1.5rem',
                    fontFamily: 'serif'
                }}>
                    Acesse sua conta
                </p>

                {error && (
                    <div className="alert alert-danger" role="alert" style={{ fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Seu E-mail"
                            required
                            style={{ padding: '10px', borderRadius: '5px' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Sua Senha"
                            required
                            style={{ padding: '10px', borderRadius: '5px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 mb-3"
                        disabled={loading}
                        style={{
                            backgroundColor: '#594A47',
                            color: '#fff',
                            fontWeight: 'bold',
                            padding: '10px',
                            border: 'none',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? 'Acessando...' : 'Acessar conta'}
                    </button>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <a href="#" style={{ color: '#594A47', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Esqueci a senha
                        </a>

                        <a
                            href="/register"
                            onClick={handleRegisterClick}
                            style={{ color: '#594A47', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Criar Conta
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;