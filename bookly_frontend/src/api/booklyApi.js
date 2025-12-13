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

export async function searchLivrosApi(titulo) {
    if (!titulo || titulo.trim() === "") return [];

    try {
        const response = await fetch(
            `${API_BASE_URL}/livros?titulo=${encodeURIComponent(titulo)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Se a busca precisar de token, troque as headers acima por: getHeaders()
                },
            }
        );

        if (!response.ok) {
            console.error("Erro na busca:", response.status);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Erro ao buscar livros:", error);
        return [];
    }
}

export const getLivroById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/livros/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Livro não encontrado');
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar livro por ID:", error);
        throw error;
    }
};

export const getReviewsByLivroId = async (livroId) => {
    try {
        // Ajuste a URL conforme a rota do seu Backend Spring Boot
        // Geralmente é algo como /reviews/livro/{id} ou /livros/{id}/reviews
        const response = await fetch(`${API_BASE_URL}/reviews/livro/${livroId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            // Se der 404 (sem reviews), retorna array vazio para não quebrar a tela
            if (response.status === 404) return [];
            throw new Error('Erro ao buscar reviews do livro');
        }

        return await response.json();
    } catch (error) {
        console.error("Erro na API de reviews:", error);
        return []; // Retorna lista vazia em caso de erro
    }
};

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export const loginUser = async (email, password) => {
    console.log("🔵 1. Iniciando login...");

    try {
        // 1. Faz o Login para pegar o Token
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Falha na autenticação');

        const data = await response.json();

        if (!data.token) throw new Error('O Backend não retornou um token.');

        // 2. Salva o Token
        localStorage.setItem('jwtToken', data.token);
        console.log("✅ Token salvo.");

        // 3. EXTRAI O ID DE DENTRO DO TOKEN
        const decodedToken = parseJwt(data.token);
        console.log("🔓 Token decodificado:", decodedToken);

        // O ID geralmente está no campo 'sub' ou 'id' dentro do token
        const userId = decodedToken.sub || decodedToken.id || decodedToken.userId;

        if (!userId) {
            throw new Error("Não foi possível encontrar o ID do usuário dentro do token.");
        }

        console.log("🆔 ID encontrado no Token:", userId);

        // 4. AGORA BUSCAMOS OS DADOS COMPLETOS DO USUÁRIO USANDO O ID
        // (Reutilizando a função getUserById que já criamos ou fazendo fetch direto)
        const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.token}`, // Envia o token
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            console.warn("⚠️ Não foi possível baixar detalhes do usuário. Salvando apenas o ID.");
            // Se falhar, salva pelo menos o ID para o redirecionamento funcionar
            const basicUser = { id: userId, email: email, nome: decodedToken.username || "Usuário" };
            localStorage.setItem('userData', JSON.stringify(basicUser));
            return data;
        }

        const fullUserData = await userResponse.json();

        // Garante que o ID esteja no objeto (caso o backend não mande no corpo do user)
        if (!fullUserData.id) fullUserData.id = userId;

        // 5. Salva os dados completos no LocalStorage
        localStorage.setItem('userData', JSON.stringify(fullUserData));
        console.log("✅ Dados completos do usuário salvos:", fullUserData);

        return data;

    } catch (error) {
        console.error('❌ Erro no fluxo de login:', error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Usuário não encontrado');
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        throw error;
    }
};
export { MOCK_JWT_TOKEN };