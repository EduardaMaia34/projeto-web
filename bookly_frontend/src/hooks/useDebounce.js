// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

// Hook customizado para atrasar a execução de uma função
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: cancela o timeout se o valor mudar ou o componente for desmontado
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}