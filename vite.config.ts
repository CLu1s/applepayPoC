import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certificates/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './certificates/cert.pem')),
    },
    host: 'localhost',
    proxy: {
      // Proxy todas las peticiones que comiencen con /api
      '/api': {
        target: 'https://payment-2.dev.deuna.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // También puedes configurar una ruta específica
      '/wallet': {
        target: 'https://payment-2.dev.deuna.io/api/v1/wallet',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wallet/, '')
      }
    }
  }
})
