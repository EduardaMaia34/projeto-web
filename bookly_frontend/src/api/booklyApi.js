// src/api/booklyApi.js

const API_BASE_URL = 'http://localhost:8081/api/v1';

const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiJtYXJpM0BnbWFpbC5jb20iLCJyb2xlcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc2Mjk0NTUyNiwiZXhwIjoxNzYzMDMxOTI2fQ.6oOMHWxH1O3NQ-6m7xkVOvZJhQHXF5p5562mweKyvGo';


const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : MOCK_JWT_TOKEN;

    if (!token) {
        console.error("Tentativa de requisição autenticada sem token.");
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};


const getLoggedInUserIdFromToken = (token) => {
    try {
        if (!token) return null;

        const payloadBase64 = token.split('.')[1];

        let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        const payloadJson = atob(base64);
        const payload = JSON.parse(payloadJson);

        return payload.sub;
    } catch (e) {
        console.error("Falha ao decodificar token para obter ID do usuário:", e);
        return null;
    }
}

export const getLoggedInUserId = () => {
    if (typeof window === 'undefined') {
        return getLoggedInUserIdFromToken(MOCK_JWT_TOKEN);
    }

    const token = localStorage.getItem('jwtToken');

    if (!token) return getLoggedInUserIdFromToken(MOCK_JWT_TOKEN);

    return getLoggedInUserIdFromToken(token);
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

        const data = await response.json();

        if (!data.token) {
            throw new Error('Autenticação bem-sucedida, mas o token não foi encontrado na resposta do servidor.');
        }

        localStorage.setItem('jwtToken', data.token);

        const decodedUserId = getLoggedInUserIdFromToken(data.token);

        let userToSave = data.user || data;

        if (decodedUserId && !userToSave.id) {
            userToSave.id = decodedUserId;
        }

        if (userToSave && userToSave.id) {
            localStorage.setItem('userData', JSON.stringify(userToSave));
        }

        return {
            token: data.token,
            user: userToSave
        };

    } catch (error) {
        console.error('Erro de login:', error);
        throw error;
    }
};

export const fetchEstanteData = async (type, userId = null, page = 0, size = 20) => {
    let url;

    let baseUrl = `${API_BASE_URL}/biblioteca`;

    if (type === 'estante') {
        if (userId) {
            url = `${baseUrl}/estante/users/${userId}?page=${page}&size=${size}`;
        } else {
            url = `${baseUrl}/estante?page=${page}&size=${size}`;
        }
    } else {
        if (userId) {
            url = `${baseUrl}/users/${userId}?page=${page}&size=${size}`;
        } else {
            url = `${baseUrl}?page=${page}&size=${size}`;
        }
    }


    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(`Falha ao carregar a lista: ${response.status} - ${errorData.message}`);
    }

    return response.json();
};

export const adicionarLivroApi = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/biblioteca`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao adicionar livro à biblioteca.' }));
        throw new Error(errorData.message || 'Erro ao adicionar livro à biblioteca.');
    }
    return response.json();
};

export const removerLivroApi = async (livroId) => {
    const response = await fetch(`${API_BASE_URL}/biblioteca/${livroId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (response.status !== 204 && !response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Resposta do servidor inválida.' }));
        throw new Error(`Falha ao remover livro da biblioteca: ${response.status} - ${errorData.message}`);
    }
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
        const errorData = await response.json().catch(() => ({ message: 'Falha ao carregar reviews.' }));
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
        const errorData = await response.json().catch(() => ({ message: 'Falha ao criar review.' }));
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
        const errorData = await response.json().catch(() => ({ message: 'Falha ao salvar review.' }));
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

export const registerUser = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || "Erro desconhecido no cadastro.";
            throw new Error(errorMessage);
        }

        return data;

    } catch (error) {
        console.error('Erro de registro:', error);
        throw new Error(error.message || 'Falha ao conectar com o servidor para cadastro.');
    }
};

export const fetchInteresses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/interesses`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Erro ao buscar interesses:", response.status);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Erro de conexão ao buscar interesses:", error);
        return [];
    }
};

export async function searchUsersApi(name) {
    if (!name || name.trim() === "") return [];

    try {
        const response = await fetch(
            `${API_BASE_URL}/users?name=${encodeURIComponent(name)}`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        if (!response.ok) {
            console.error("Erro na busca de usuários:", response.status);
            return [];
        }

        const data = await response.json();

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return [];
    }
}

export const getLivroById = async (id) => {
    const url = `${API_BASE_URL}/livros/${id}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Livro não encontrado ou erro desconhecido.' }));
            throw new Error(`Falha ao buscar livro ${id}: ${response.status} - ${errorData.message}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Erro ao buscar livro por ID:", error);
        throw error;
    }
};

export const getUserNameById = async (userId) => {
    const url = `${API_BASE_URL}/users/${userId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            console.error(`Falha ao buscar usuário ${userId}: Status ${response.status}`);
            throw new Error(`User not found or unknown error.`);
        }

        const data = await response.json();

        return data.nome || `Usuário ID ${userId}`;

    } catch (error) {
        console.error(`Erro ao buscar nome do usuário ${userId}:`, error);
        throw new Error(`Erro ao buscar nome do usuário ${userId}.`);
    }
};

export const getReviewsByLivroId = async (livroId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/livro/${livroId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error('Erro ao buscar reviews do livro');
        }

        return await response.json();
    } catch (error) {
        console.error("Erro na API de reviews:", error);
        return [];
    }
};

export const getUserStats = async (userId) => {
    const url = `${API_BASE_URL}/reviews/usuario/${userId}/stats`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            console.error(`Falha ao buscar estatísticas do usuário ${userId}. Status: ${response.status}`);
            return { totalLidos: 0, lidosEsteAno: 0, totalNaBiblioteca: 0 };
        }

        return await response.json();

    } catch (error) {
        console.error(`Erro ao buscar estatísticas do usuário ${userId}:`, error);
        return { totalLidos: 0, lidosEsteAno: 0, totalNaBiblioteca: 0 };
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

// --- FUNÇÕES DE SEGUIR ---

export const getFollowStatus = async (seguidoId) => {
    const seguidorId = getLoggedInUserId();

    if (!seguidorId) return false;

    try {

        const response = await fetch(`${API_BASE_URL}/seguir/${seguidorId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) return false;

        const seguindoList = await response.json();

        return seguindoList.some(user => String(user.id) === String(seguidoId));

    } catch (error) {
        console.error("Erro ao verificar status de seguir:", error);
        return false;
    }
};


export const followUser = async (seguidoId) => {
    const seguidorId = getLoggedInUserId();
    if (!seguidorId) throw new Error("Usuário não logado.");

    const response = await fetch(`${API_BASE_URL}/seguir/${seguidorId}/${seguidoId}`, {
        method: 'POST',
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao seguir.' }));
        throw new Error(errorData.message || 'Erro ao seguir usuário.');
    }
    return response.text();
};

export const unfollowUser = async (seguidoId) => {
    const seguidorId = getLoggedInUserId();
    if (!seguidorId) throw new Error("Usuário não logado.");

    const response = await fetch(`${API_BASE_URL}/seguir/${seguidorId}/${seguidoId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao deixar de seguir.' }));
        throw new Error(errorData.message || 'Erro ao deixar de seguir usuário.');
    }
    return response.text();
};

// --- FUNÇÃO DE BUSCA DE FAVORITOS (NOVA) ---
export const fetchFavoriteBooks = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/favoritos`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Falha ao buscar favoritos.' }));
            throw new Error(errorData.message || 'Erro ao listar livros favoritos.');
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar livros favoritos:", error);
        return []; // Retorna lista vazia em caso de falha de API ou conexão
    }
};

export const adicionarLivroFavoritoApi = async (livroId) => {
    const response = await fetch(`${API_BASE_URL}/users/favoritos/${livroId}`, {
        method: 'POST',
        headers: getHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao adicionar livro aos favoritos.' }));
        throw new Error(errorData.message || 'Erro ao adicionar livro aos favoritos.');
    }
    return response.text();
};

export { MOCK_JWT_TOKEN };

