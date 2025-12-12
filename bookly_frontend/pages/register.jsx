// pages/register.jsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { registerUser } from '../src/api/booklyApi.js';
import InteressesSelector from '../src/components/InteressesSelector.jsx';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [bio, setBio] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(''); // Estado para a URL
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
            setError("A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra e um número.");
            setLoading(false);
            return;
        }

        const payload = {
            email,
            senha,
            nome,
            bio: bio.trim() || null,
            fotoPerfil: fotoPerfil.trim() || null, // Envia a URL (ou null)
            interessesIds: interessesIds.length > 0 ? interessesIds : null,
        };

        try {
            // 2. Usando a função de registro JSON
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
        <div style={{ backgroundColor: 'var(--color-background-light)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>

            <div className="login-container">
                <div className="form-box" style={{ padding: 0, width: '100%' }}>

                    <img src="https://imgur.com/HLvpHYn.png" alt="Bookly Logo" className="logo-login" style={{ margin: '0 auto 15px auto', height: '60px' }} />

                    <p className="subtitulo-login" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Crie sua conta Bookly</p>

                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>

                        <label htmlFor="nome_id" className="form-label" style={{ fontWeight: 'bold' }}>Nome de Usuário</label>
                        <input type="text" id="nome_id" name="nome" className="form-control" required placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />

                        <label htmlFor="email_id" className="form-label" style={{ fontWeight: 'bold' }}>E-mail</label>
                        <input type="email" id="email_id" name="email" className="form-control" required placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />

                        <label htmlFor="senha_id" className="form-label" style={{ fontWeight: 'bold' }}>Senha</label>
                        <input type="password" id="senha_id" name="senha" className="form-control" required placeholder="Mínimo 8 caracteres (letra e número)" value={senha} onChange={(e) => setSenha(e.target.value)} />

                        {/* CAMPO DE URL DA FOTO */}
                        <label htmlFor="foto_id" className="form-label" style={{ fontWeight: 'bold' }}>URL da Foto de Perfil (Opcional)</label>
                        <input
                            type="url"
                            id="foto_id"
                            name="fotoPerfil"
                            className="form-control"
                            placeholder="Link da imagem (ex: imgur.com/...)"
                            value={fotoPerfil}
                            onChange={(e) => setFotoPerfil(e.target.value)}
                            style={{ marginBottom: '15px' }}
                        />

                        <label htmlFor="bio_id" className="form-label" style={{ fontWeight: 'bold' }}>Bio (Opcional)</label>
                        <textarea id="bio_id" name="bio" className="form-control" rows="2" placeholder="Ex: 'Gosto de romances e fantasia...'" value={bio} onChange={(e) => setBio(e.target.value)} style={{ marginBottom: '15px' }}/>

                        <label className="form-label" style={{ fontWeight: 'bold' }}>Interesses (Máx. 3)</label>
                        <InteressesSelector selectedIds={interessesIds} onSelect={setInteressesIds} />

                        <button type="submit" className="btn btn-login-primary" disabled={loading} style={{ marginTop: '20px' }}>
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <a href="/login" className="btn-login-secondary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '10px' }}>Voltar ao Login</a>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;