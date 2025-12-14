"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import InteressesSelector from './InteressesSelector';
//import { updateUserProfile } from '../api/booklyApi';

export default function InteressesModal({ show, onHide, currentInteressesIds, onSaveSuccess, userId }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentInteressesIds) {
            setSelectedIds(currentInteressesIds);
        }
    }, [currentInteressesIds]);

    const handleSave = async () => {
        if (!userId) {
            setError("ID do usuário não fornecido.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                interessesIds: selectedIds
            };

            await updateUserProfile(userId, payload);

            onSaveSuccess(selectedIds);
            onHide();

        } catch (err) {
            console.error("Erro ao salvar interesses:", err);
            setError(err.message || "Falha ao salvar interesses. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Interesses</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted small">Escolha seus 3 principais interesses de leitura. (Máximo de 3)</p>

                {error && <div className="alert alert-danger">{error}</div>}

                <InteressesSelector
                    selectedIds={selectedIds}
                    onSelect={setSelectedIds}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading || selectedIds.length === 0}
                    style={{
                        backgroundColor: '#387638',
                        borderColor: '#387638',
                        color: 'white'
                    }}
                >
                    {loading ? 'Salvando...' : `Salvar (${selectedIds.length}/3)`}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}