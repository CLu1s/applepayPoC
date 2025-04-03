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
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
