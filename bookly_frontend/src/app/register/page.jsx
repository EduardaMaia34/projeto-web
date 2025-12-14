'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../api/booklyApi.js';
import InteressesSelector from '../../components/InteressesSelector.jsx';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [bio, setBio] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [interessesIds, setInteressesIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const router = useRouter();

    const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!PASSWORD_REGEX.test(senha)) {
            setError('A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra e um número.');
            setLoading(false);
            return;
        }

        const payload = {
            email,
            senha,
            nome,
            bio: bio.trim() || null,
            fotoPerfil: fotoPerfil.trim() || null,
            interessesIds: interessesIds.length > 0 ? interessesIds : null,
        };

        try {
            await registerUser(payload);

            setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');

            setTimeout(() => {
                router.push('/login');
            }, 1500);

        } catch (err) {
            setError(err.message || 'Ocorreu um erro desconhecido no cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-background-light)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div className="login-container">
                <div className="form-box" style={{ padding: 0, width: '100%' }}>

                    <img
                        src="https://imgur.com/HLvpHYn.png"
                        alt="Bookly Logo"
                        className="logo-login"
                        style={{ margin: '0 auto 15px auto', height: '60px' }}
                    />

                    <p className="subtitulo-login" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                        Crie sua conta Bookly
                    </p>

                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <label className="form-label fw-bold">Nome de Usuário</label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />

                        <label className="form-label fw-bold mt-2">E-mail</label>
                        <input
                            type="email"
                            className="form-control"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label className="form-label fw-bold mt-2">Senha</label>
                        <input
                            type="password"
                            className="form-control"
                            required
                            placeholder="Mínimo 8 caracteres (letra e número)"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />

                        <label className="form-label fw-bold mt-2">URL da Foto de Perfil (Opcional)</label>
                        <input
                            type="url"
                            className="form-control"
                            value={fotoPerfil}
                            onChange={(e) => setFotoPerfil(e.target.value)}
                        />

                        <label className="form-label fw-bold mt-2">Bio (Opcional)</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />

                        <label className="form-label fw-bold mt-3">Interesses (Máx. 3)</label>
                        <InteressesSelector
                            selectedIds={interessesIds}
                            onSelect={setInteressesIds}
                        />

                        <button
                            type="submit"
                            className="btn btn-login-primary mt-3"
                            disabled={loading}
                        >
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <button
                        onClick={() => router.push('/login')}
                        className="btn-login-secondary mt-2"
                        style={{ width: '100%' }}
                    >
                        Voltar ao Login
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
