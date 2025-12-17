import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/booklyApi.js';
import InteressesSelector from '../components/InteressesSelector.jsx';

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

    const navigate = useNavigate();

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
                navigate('/login');
            }, 1500);

        } catch (err) {
            setError(err.message || 'Ocorreu um erro desconhecido no cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: '#f5f4ed', // Cor de fundo bege claro
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div className="login-container" style={{
                backgroundColor: '#DED2C2', // Bege mais escuro do container
                padding: '2rem',
                borderRadius: '15px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '500px'
            }}>
                <div className="form-box" style={{ padding: 0, width: '100%' }}>

                    <div className="text-center">
                        <img
                            src="https://imgur.com/HLvpHYn.png"
                            alt="Bookly Logo"
                            className="logo-login"
                            style={{ margin: '0 auto 15px auto', height: '60px' }}
                        />

                        <p className="subtitulo-login" style={{
                            fontSize: '1.2rem',
                            marginBottom: '20px',
                            color: '#594A47',
                            fontWeight: 'bold',
                            fontFamily: 'serif'
                        }}>
                            Crie sua conta Bookly
                        </p>
                    </div>

                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <label className="form-label fw-bold" style={{color: '#594A47'}}>Nome de Usuário</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />

                        <label className="form-label fw-bold" style={{color: '#594A47'}}>E-mail</label>
                        <input
                            type="email"
                            className="form-control mb-2"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label className="form-label fw-bold" style={{color: '#594A47'}}>Senha</label>
                        <input
                            type="password"
                            className="form-control mb-2"
                            required
                            placeholder="Mínimo 8 caracteres (letra e número)"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />

                        <label className="form-label fw-bold" style={{color: '#594A47'}}>URL da Foto (Opcional)</label>
                        <input
                            type="url"
                            className="form-control mb-2"
                            value={fotoPerfil}
                            onChange={(e) => setFotoPerfil(e.target.value)}
                        />

                        <label className="form-label fw-bold" style={{color: '#594A47'}}>Bio (Opcional)</label>
                        <textarea
                            className="form-control mb-3"
                            rows="2"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />

                        <label className="form-label fw-bold mb-2" style={{color: '#594A47'}}>Interesses (Máx. 3)</label>
                        <div className="mb-3">
                            <InteressesSelector
                                selectedIds={interessesIds}
                                onSelect={setInteressesIds}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 mt-3"
                            disabled={loading}
                            style={{
                                backgroundColor: '#594A47',
                                color: '#fff',
                                fontWeight: 'bold',
                                padding: '10px',
                                border: 'none'
                            }}
                        >
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/login')}
                        className="btn w-100 mt-2"
                        style={{
                            backgroundColor: 'transparent',
                            color: '#594A47',
                            textDecoration: 'underline',
                            fontWeight: 'bold',
                            border: 'none'
                        }}
                    >
                        Voltar ao Login
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RegisterPage;