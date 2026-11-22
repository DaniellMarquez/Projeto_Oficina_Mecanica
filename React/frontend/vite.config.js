import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api -> FastAPI (127.0.0.1:8000).
// O React chama /api/* e o Vite encaminha para o backend.
// Sem proxy, cookies SameSite=Lax entre localhost:5173 e 127.0.0.1:8000
// ficam sujeitos a bloqueio do navegador.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
