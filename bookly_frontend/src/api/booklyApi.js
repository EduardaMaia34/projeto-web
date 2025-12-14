
const PORTA = 8081;
const API_BASE_URL = `http://localhost:${PORTA}/api/v1`;

const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidXNlcm5hbWUiOiJtYXJpM0BnbWFpbC5jb20iLCJyb2xlcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc2Mjk0NTUyNiwiZXhwIjoxNzYzMDMxOTI2fQ.6oOMHWxH1O3NQ-6m7xkVOvZJhQHXF5p5562mweKyvGo';

// ------------------------------------------------------------------
// HELPERS (Funções Auxiliares)
// ------------------------------------------------------------------

// Decodifica o JWT para extrair ID e expiração sem bibliotecas externas
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return null;
    }
}

// Gera os headers com o Token de Autenticação
const getHeaders = () => {
    // Verifica se window existe (para evitar erro em SSR) e tenta pegar do localStorage, senão usa o MOCK
    const token = (typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null) || MOCK_JWT_TOKEN;

    if (!token) {
        console.warn("Aviso: Requisição feita sem token de autenticação.");
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// ------------------------------------------------------------------
// AUTENTICAÇÃO E USUÁRIO
// ------------------------------------------------------------------

const getLoggedInUserIdFromToken = (token) => {
    try {
        if (!token) return null;
        const decoded = parseJwt(token);
        return decoded?.sub || decoded?.id || decoded?.userId;
    } catch (e) {
        console.error("Falha ao ler ID do token:", e);
        return null;
    }
}

export const getLoggedInUserId = () => {
    if (typeof window === 'undefined') {
        return getLoggedInUserIdFromToken(MOCK_JWT_TOKEN);
    }
    const token = localStorage.getItem('jwtToken');
    return getLoggedInUserIdFromToken(token || MOCK_JWT_TOKEN);
};


export const loginUser = async (email, password) => {
    console.log(`🔵 Conectando em: ${API_BASE_URL}/auth/login`);

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
        if (!data.token) throw new Error('Token não veio do Backend.');

        // 1. Salva Token
        localStorage.setItem('jwtToken', data.token);

        // 2. Extrai ID do Token
        const userId = getLoggedInUserIdFromToken(data.token);
        if (!userId) throw new Error("ID não encontrado dentro do token.");

        console.log("✅ ID Recuperado do Token:", userId);

        // 3. Tenta buscar dados completos do usuário
        try {
            const userResp = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });

            if (userResp.ok) {
                const fullUser = await userResp.json();
                if (!fullUser.id) fullUser.id = userId;
                localStorage.setItem('userData', JSON.stringify(fullUser));
                console.log("✅ Dados completos salvos com sucesso!");
                return data;
            }
        } catch (e) {
            console.warn("⚠️ Falha ao buscar detalhes, salvando usuário básico.");
        }

        // Fallback: Salva básico
        const basicUser = { id: userId, email, nome: "Usuário" };
        localStorage.setItem('userData', JSON.stringify(basicUser));

        return data;

    } catch (error) {
        console.error('❌ Erro Fatal no Login:', error);
        throw error;
    }
};

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

export const getUserById = async (id) => {
    if (!id) throw new Error("ID inválido para busca");

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        console.error(`Erro ao buscar usuário ${id}: ${response.status}`);
        throw new Error('Erro ao buscar usuário');
    }
    return await response.json();
};

export const getUserNameById = async (userId) => {
    try {
        const user = await getUserById(userId);
        return user.nome || `Usuário ID ${userId}`;
    } catch (error) {
        console.error(`Erro ao buscar nome do usuário ${userId}:`, error);
        return `Usuário ID ${userId}`; // Retorno seguro
    }
};

export const updateUser = async (userId, userData) => {
    console.log(`🔵 Tentando atualizar usuário ${userId}`);

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const txt = await response.text();
        const msgErro = txt ? txt : `Erro sem mensagem (Status ${response.status})`;

        if (response.status === 405) throw new Error("Erro 405: Método não permitido (verifique PUT vs PATCH).");
        if (response.status === 403) throw new Error("Erro 403: Sem permissão.");

        throw new Error(`Erro ${response.status}: ${msgErro}`);
    }

    return await response.json();
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

// ------------------------------------------------------------------
// LIVROS E ESTANTE
// ------------------------------------------------------------------

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

export const getLivroById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/livros/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Livro não encontrado' }));
            throw new Error(errorData.message);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar livro por ID:", error);
        throw error;
    }
};

export async function searchLivrosApi(termo) {
    if (!termo || termo.trim() === "") return [];

    try {
        // Unificado para usar 'termo' como argumento, mas passando para o backend
        const response = await fetch(
            `${API_BASE_URL}/livros?titulo=${encodeURIComponent(termo)}`,
            {
                method: "GET",
                headers: getHeaders()
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

export const fetchInteresses = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/interesses`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }, // Interesses geralmente é público
        });

        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];

    } catch (error) {
        return [];
    }
};

// ------------------------------------------------------------------
// REVIEWS
// ------------------------------------------------------------------

export const fetchReviews = async (userId) => {
    let url;
    if (!userId || userId === 'undefined') {
        url = `${API_BASE_URL}/reviews/me`;
    } else {
        url = `${API_BASE_URL}/reviews/usuario/${userId}`;
    }

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao carregar reviews.' }));
        throw new Error(`Falha ao carregar reviews: ${response.status} - ${errorData.message}`);
    }

    return response.json();
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
        const errorData = await response.json().catch(() => ({ message: 'Erro ao deletar.' }));
        throw new Error(`Falha ao deletar review: ${response.status} - ${errorData.message}`);
    }
};

export { MOCK_JWT_TOKEN };