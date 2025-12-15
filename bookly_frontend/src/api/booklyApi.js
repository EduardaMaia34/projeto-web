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
    if (typeof window === 'undefined') {
        return { 'Content-Type': 'application/json' };
    }

    const token = localStorage.getItem('jwtToken');

    if (!token) {
        return { 'Content-Type': 'application/json' };
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
        // Tenta pegar o 'sub' (padrão JWT) ou 'id' ou 'userId' dependendo de como o backend gera
        return decoded?.sub || decoded?.id || decoded?.userId;
    } catch (e) {
        console.error("Falha ao ler ID do token:", e);
        return null;
    }
}

export const getLoggedInUserId = () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    return getLoggedInUserIdFromToken(token);
};


export const loginUser = async (email, password) => {
    console.log(`🔵 Conectando em: ${API_BASE_URL}/auth/login`);

    try {
        // 1. Faz o Login
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
            throw new Error('Autenticação bem-sucedida, mas o token não foi encontrado na resposta.');
        }

        // 2. Salva Token
        localStorage.setItem('jwtToken', data.token);
        console.log("✅ Token salvo.");

        // 3. Extrai ID do Token
        const userId = getLoggedInUserIdFromToken(data.token);
        if (!userId) throw new Error("ID não encontrado dentro do token.");

        console.log("✅ ID Recuperado do Token:", userId);

        let userToSave = data.user || { id: userId, email: email };

        // 4. Tenta buscar dados completos do usuário (Backend call)
        try {
            const userResp = await fetch(`${API_BASE_URL}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });

            if (userResp.ok) {
                const fullUser = await userResp.json();
                userToSave = { ...userToSave, ...fullUser }; // Merge dos dados
                console.log("✅ Dados completos do usuário recuperados.");
            }
        } catch (e) {
            console.warn("⚠️ Falha ao buscar detalhes completos do usuário, usando dados básicos.", e);
        }

        // 5. Salva dados do usuário no LocalStorage
        localStorage.setItem('userData', JSON.stringify(userToSave));

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
        return `Usuário ID ${userId}`;
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
    // Ajuste aqui se sua API usa /biblioteca/estante ou apenas /biblioteca
    let endpoint = type === 'estante' ? '/biblioteca/estante' : '/biblioteca';

    if (type === 'estante' && userId) {
        // Se for estante de um usuário específico
        url = `${API_BASE_URL}/biblioteca/estante/users/${userId}?page=${page}&size=${size}`;
    } else if (userId) {
        // Se for biblioteca geral de um usuário (caso exista essa distinção)
        url = `${API_BASE_URL}/biblioteca/users/${userId}?page=${page}&size=${size}`;
    } else {
        // Padrão (usuário logado ou todos)
        url = `${API_BASE_URL}${endpoint}?page=${page}&size=${size}`;
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
        const response = await fetch(
            // Nota: Verifique se seu backend espera 'termo' ou 'titulo'
            `${API_BASE_URL}/livros?termo=${encodeURIComponent(termo)}`,
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
            headers: { "Content-Type": "application/json" },
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

// ------------------------------------------------------------------
// SEGUIR
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// FAVORITOS
// ------------------------------------------------------------------

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
        return [];
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


export const fetchPopularesSemana = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/home`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar populares da semana: ${response.status}`);
        }

        const data = await response.json();
        return data.top_reviewed_livros_semana || [];
    } catch (error) {
        console.error("Erro ao buscar populares da semana:", error);
        return [];
    }
};


export const fetchFeedAmigos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/feed`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) return [];
            throw new Error(`Erro ao buscar feed dos amigos: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar feed dos amigos:", error);
        return [];
    }
};

export async function fetchLivroStatus(livroId) {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const response = await fetch(
        `http://localhost:8081/api/v1/biblioteca/${livroId}/status`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Erro ao buscar status do livro");
    }

    const data = await response.json();
    return data.status;
}


export const removerLivroFavoritoApi = async (livroId) => {
    const response = await fetch(`${API_BASE_URL}/users/favoritos/${livroId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });

    if (response.status !== 204 && !response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao remover livro dos favoritos.' }));
        throw new Error(errorData.message || 'Erro ao remover livro dos favoritos.');
    }
    return response.text();
};

export { MOCK_JWT_TOKEN };