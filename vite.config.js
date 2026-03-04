import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // When backend is ready, all /api calls forward to Node server
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})