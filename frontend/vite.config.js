import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // accessible from any device on same network
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
