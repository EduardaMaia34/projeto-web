// src/components/InteressesSelector.jsx

import React, { useState, useEffect } from 'react';
import { fetchInteresses } from '../api/booklyApi.js'; // Importa a nova função de API

export default function InteressesSelector({ selectedIds, onSelect }) {
    const [availableInteresses, setAvailableInteresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Efeito para carregar os interesses disponíveis do backend
    useEffect(() => {
        const loadInteresses = async () => {
            try {
                const data = await fetchInteresses();
                setAvailableInteresses(data);
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
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id) // Remove se já estiver selecionado
            : [...selectedIds, id]; // Adiciona se não estiver

        if (newIds.length <= 3) {
            onSelect(newIds);
        } else {
            alert("Você pode escolher no máximo 3 interesses.");
        }
    };

    if (loading) {
        return <p className="text-muted">Carregando interesses...</p>;
    }

    if (availableInteresses.length === 0) {
        return <p className="text-danger">Nenhum interesse disponível.</p>;
    }

    return (
        <div className="d-flex flex-wrap gap-2">
            {availableInteresses.map(interesse => (
                <button
                    key={interesse.id}
                    type="button"
                    className={`btn btn-sm ${selectedIds.includes(interesse.id) ? 'btn-selected-interesse' : 'btn-outline-secondary'}`}
                    onClick={() => handleToggle(interesse.id)}
                    style={{
                        // ESTILOS INVERTIDOS: Marrom Fundo, Texto Bege Claro
                        backgroundColor: selectedIds.includes(interesse.id) ? 'var(--color-text-primary)' : 'transparent',
                        color: selectedIds.includes(interesse.id) ? 'var(--color-background-light)' : 'var(--color-text-primary)',
                        borderColor: 'var(--color-text-primary)',
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    {interesse.nome}
                </button>
            ))}
        </div>
    );
}