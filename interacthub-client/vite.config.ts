import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function isUploadPath(url?: string): boolean {
  if (!url) {
    return false
  }

  return url.includes('/api/uploads')
}

function nowIso(): string {
  return new Date().toISOString()
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5191',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (!isUploadPath(req.url)) {
              return
            }

            console.log(
              `[${nowIso()}] [VITE_PROXY][UPLOAD_REQ] ${req.method ?? 'UNKNOWN'} ${req.url ?? ''} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`,
            )
          })

          proxy.on('proxyRes', (proxyRes, req) => {
            if (!isUploadPath(req.url)) {
              return
            }

            console.log(
              `[${nowIso()}] [VITE_PROXY][UPLOAD_RES] ${req.method ?? 'UNKNOWN'} ${req.url ?? ''} <- HTTP ${proxyRes.statusCode ?? 'unknown'}`,
            )
          })

          proxy.on('error', (error, req) => {
            if (!isUploadPath(req.url)) {
              return
            }

            console.error(
              `[${nowIso()}] [VITE_PROXY][UPLOAD_ERR] ${req.method ?? 'UNKNOWN'} ${req.url ?? ''} :: ${error.message}`,
            )
          })
        },
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
