// src/api/booklyApi.js

const API_BASE_URL = 'http://localhost:8081/api/v1';

const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiJtYXJpM0BnbWFpbC5jb20iLCJyb2xlcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc2Mjk0NTUyNiwiZXhwIjoxNzYzMDMxOTI2fQ.6oOMHWxH1O3NQ-6m7xkVOvZJhQHXF5p5562mweKyvGo';


const getHeaders = () => {
    const token = localStorage.getItem('jwtToken') || MOCK_JWT_TOKEN;

    if (!token) {
        console.error("Tentativa de requisição autenticada sem token.");
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Credenciais inválidas ou erro no servidor.' }));
            throw new Error(errorData.message || 'Falha na autenticação.');
        }

        // 1. LER O JSON DA RESPOSTA
        const data = await response.json();

        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        } else {
            throw new Error('Autenticação bem-sucedida, mas o token não foi encontrado na resposta do servidor.');
        }

        // 🎯 CORREÇÃO CRÍTICA: SALVAR O OBJETO DO USUÁRIO
        // Verifica se o DTO está em 'data.user' ou se é o próprio 'data'
        const userToSave = data.user || data;

        if (userToSave && (userToSave.nome || userToSave.fotoPerfil)) {
            // 2. Salva o objeto do usuário (ReturnUserDTO) no localStorage
            localStorage.setItem('userData', JSON.stringify(userToSave));
        }

        return data; // Retorna os dados completos ou o token

    } catch (error) {
        console.error('Erro de login:', error);
        throw error;
    }
};

export const fetchEstanteData = async (type, userId = null, page = 0, size = 20) => {
    let url;
    let endpoint = type === 'estante' ? '/biblioteca/estante' : '/biblioteca';

    if (userId) {
        url = `${API_BASE_URL}/biblioteca/users/${userId}?page=${page}&size=${size}`;
    } else {
        url = `${API_BASE_URL}${endpoint}?page=${page}&size=${size}`;
    }

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(`Falha ao carregar a lista: ${response.status} - ${errorData.message}`);
    }

    return response.json();
};


export const fetchReviews = async (userId) => {
    let url;

    if (!userId || userId === 'undefined') {
        url = `${API_BASE_URL}/reviews/me`;
    }
    else {
        url = `${API_BASE_URL}/reviews/usuario/${userId}`;
    }

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(`Falha ao carregar reviews: ${response.status} - ${errorData.message}`);
    }

    return response.json();
};


export const saveReviewApi = async (payload) => {
    const livroId = payload.livroId;
    const response = await fetch(`${API_BASE_URL}/reviews/${livroId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(`Falha ao criar review: ${response.status} - ${errorData.message}`);
    }
    return response.json();
};

export const updateReview = async (reviewId, payload) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(`Falha ao salvar review: ${response.status} - ${errorData.message}`);
    }
};

export const deleteReviewApi = async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (response.status !== 204 && !response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Resposta do servidor inválida.' }));
        throw new Error(`Falha ao deletar review: ${response.status} - ${errorData.message}`);
    }
};

export async function searchLivrosApi(termo) {
    if (!termo || termo.trim() === "") return [];
export async function searchLivrosApi(titulo) {
    if (!titulo || titulo.trim() === "") return [];

    try {
        const response = await fetch(
            `${API_BASE_URL}/livros?titulo=${encodeURIComponent(titulo)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            console.error("Erro na busca:", response.status);
            return [];
        }

        const data = await response.json();

        return Array.isArray(data) ? data : [];

    try {
        const response = await fetch(
            `${API_BASE_URL}/livros?termo=${encodeURIComponent(termo)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return [];
    }
}

// Adicione isso ao final do seu arquivo booklyApi.js e exporte

export const getLivroById = async (id) => {
    // Ajuste a rota se no seu Java for diferente (ex: /livros/{id})
    const response = await fetch(`${API_BASE_URL}/livros/${id}`, {
        method: 'GET',
        headers: getHeaders()
    });

        if (!response.ok) {
            console.error("Erro na busca:", response.status);
            return [];
        }

        const data = await response.json();

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return [];
    if (!response.ok) {
        throw new Error('Livro não encontrado');
    }

    return response.json();
};
}


export { MOCK_JWT_TOKEN };