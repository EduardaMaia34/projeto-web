import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
    },
    preview: {
        host: true,
        port: 8080,
        allowedHosts: ['bookly.koyeb.app', 'medieval-sophi-eduarda-99a77f98.koyeb.app/', 'all'] // Permite o domínio do Koyeb
    }
})