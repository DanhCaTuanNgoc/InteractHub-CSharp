import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5191',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:5191',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
