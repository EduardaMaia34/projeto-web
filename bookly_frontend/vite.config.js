import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    //root: './frontend',
    server: {
        host: true,
        port: 5173,
    },
    preview: {
        host: true,
        port: 8080,
        allowedHosts: ['bookly.koyeb.app', 'medieval-sophi-eduarda-99a77f98.koyeb.app/', 'all'] // Permite o domínio do Koyeb
    },

    // =======================================================
    // NOVO BLOCO DE CONFIGURAÇÃO DE BUILD
    // =======================================================
    build: {
        // Redireciona a saída do build (dist) para a pasta padrão de recursos estáticos do Spring Boot.
        // O caminho '../src/main/resources/static' assume que a pasta 'bookly_frontend'
        // está na raiz do projeto e o 'src' está na raiz do Backend.
        outDir: '../src/main/resources/static',
        emptyOutDir: true,
    }
})