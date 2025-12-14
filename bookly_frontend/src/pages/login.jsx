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
            // A função loginUser já salva o token e os dados no localStorage
            const response = await loginUser(email, password);

            // Tenta identificar o ID do usuário para redirecionar para a estante correta
            // Verifica estrutura { user: { id: ... } } ou { id: ... } dependendo do retorno da API
            const userId = response.user?.id || response.id;

            if (userId) {
                console.log(`✅ Login bem-sucedido! Redirecionando para /biblioteca/${userId}`);
                // Ajuste a rota conforme suas rotas do Next.js.
                // Se a rota for dinâmica [id].js, use assim:
                router.push(`/biblioteca/${userId}`);
            } else {
                console.warn("⚠️ ID de usuário não encontrado, redirecionando para a raiz da biblioteca.");
                router.push('/biblioteca');
            }

        } catch (err) {
            console.error("Erro no submit:", err);
            setError(err.message || 'Credenciais inválidas ou erro de conexão.');

            // Se for erro de autenticação, garante que o storage esteja limpo
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userData');
            }
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
                    <div className="alert alert-danger" role="alert" style={{
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        color: '#721c24',
                        backgroundColor: '#f8d7da',
                        borderColor: '#f5c6cb',
                        padding: '.75rem 1.25rem',
                        borderRadius: '.25rem'
                    }}>
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
                            style={{ padding: '10px', borderRadius: '5px', width: '100%', marginBottom: '10px', border: '1px solid #ccc' }}
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
                            style={{ padding: '10px', borderRadius: '5px', width: '100%', marginBottom: '10px', border: '1px solid #ccc' }}
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
                            borderRadius: '5px',
                            width: '100%',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? 'Acessando...' : 'Acessar conta'}
                    </button>

                    <div className="d-flex justify-content-between align-items-center mt-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
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