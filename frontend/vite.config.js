import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Solo para `vite dev`: reenvía /api al backend Node local sin necesitar un .env.
    // No afecta `vite build` ni el despliegue en Cloudflare Worker (que sirve /api en el mismo origen).
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
