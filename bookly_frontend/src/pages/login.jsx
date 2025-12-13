"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../api/booklyApi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Impede recarregar a página
        setLoading(true);
        setError(null);


        try {
            // Chama a API
            const respostaLogin = await loginUser(email, password);

            // --- DEBUG CRÍTICO ---
            console.log("📦 RESPOSTA COMPLETA DA API:", respostaLogin);

            // Verifica o que foi salvo
            const userDataString = localStorage.getItem('userData');
            const userObj = JSON.parse(userDataString || "{}");

            console.log("👤 USUÁRIO SALVO NO LOCALSTORAGE:", userObj);

            if (!userObj.id) {
                // Se não tem ID, vamos tentar achar com outros nomes comuns
                alert(`ATENÇÃO: O usuário foi salvo sem ID!\n\nVerifique o Console (F12) para ver os campos disponíveis.\n\nCampos encontrados: ${Object.keys(userObj).join(", ")}`);

                // Não redireciona se não tiver ID, para você poder ver o erro
                setLoading(false);
                return;
            }

            // Se chegou aqui, tem ID!
            console.log("✅ ID encontrado:", userObj.id);
            router.push('/biblioteca');

        } catch (err) {
            console.error("Erro no submit:", err);
            setError(err.message || 'Credenciais inválidas ou erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Container Fundo Bege Claro (#f5f4ed)
        <div style={{ backgroundColor: '#f5f4ed', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>

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

                <p style={{ color: '#594A47', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', fontFamily: 'serif' }}>
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

                        <a href="/register" style={{ color: '#594A47', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'underline' }}>
                            Criar Conta
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;