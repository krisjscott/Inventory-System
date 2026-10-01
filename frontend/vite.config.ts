import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // The order-api ships no CORS config, so the dev server proxies /api to it.
    // The browser only ever talks to :5173, which keeps requests same-origin.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/oauth2': { target: 'http://localhost:8080', changeOrigin: false },
      '/login': { target: 'http://localhost:8080', changeOrigin: false },
    },
  },
})
