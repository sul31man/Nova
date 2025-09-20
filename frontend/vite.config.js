import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    allowedHosts: ['58ffe8f7447f.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true
      }
    }
  }
})

