import React, { useState, useEffect } from 'react';
// Certifique-se de que o caminho da API está correto
import { fetchInteresses } from '../api/booklyApi.js';

export default function InteressesSelector({ selectedIds, onSelect }) {
    const [availableInteresses, setAvailableInteresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Efeito para carregar os interesses disponíveis do backend
    useEffect(() => {
        const loadInteresses = async () => {
            try {
                const data = await fetchInteresses();
                // Garante que seja um array para evitar erro no .map
                setAvailableInteresses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Não foi possível carregar a lista de interesses.", error);
                setAvailableInteresses([]);
            } finally {
                setLoading(false);
            }
        };
        loadInteresses();
    }, []);

    const handleToggle = (id) => {
        const isSelected = selectedIds.includes(id);

        if (isSelected) {
            // Se já selecionado, remove
            onSelect(selectedIds.filter(i => i !== id));
        } else {
            // Se não selecionado, verifica o limite de 3
            if (selectedIds.length < 3) {
                onSelect([...selectedIds, id]);
            } else {
                alert("Você pode escolher no máximo 3 interesses.");
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center text-muted">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Carregando interesses...
            </div>
        );
    }

    if (availableInteresses.length === 0) {
        return <p className="text-danger">Nenhum interesse disponível ou erro de conexão.</p>;
    }

    // Cores de fallback caso as variáveis CSS não existam
    const primaryColor = 'var(--color-text-primary, #594A47)';
    const lightColor = 'var(--color-background-light, #ffffff)';

    return (
        <div className="d-flex flex-wrap gap-2">
            {availableInteresses.map(interesse => {
                const isSelected = selectedIds.includes(interesse.id);
                return (
                    <button
                        key={interesse.id}
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'fw-bold shadow-sm' : 'btn-outline-secondary'}`}
                        onClick={() => handleToggle(interesse.id)}
                        style={{
                            backgroundColor: isSelected ? primaryColor : 'transparent',
                            color: isSelected ? lightColor : primaryColor,
                            borderColor: primaryColor,
                            fontFamily: 'Georgia, serif', // Ajustado para combinar com o resto do site
                            transition: 'all 0.2s'
                        }}
                    >
                        {interesse.nome}
                    </button>
                );
            })}
        </div>
    );
}