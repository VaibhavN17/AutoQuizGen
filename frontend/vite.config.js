import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Your desired frontend port
    proxy: {
      '/api': {
        target: 'http://localhost:8082', // Your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
