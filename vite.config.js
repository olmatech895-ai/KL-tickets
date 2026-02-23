import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Запросы к API посещаемости/камер идут через прокси — без CORS (как в face-control)
      // Бэкенд Kosta Legal (отчёт посещений с устройства) — порт 1234
      '/api-attendance': {
        target: 'http://localhost:1234',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-attendance/, ''),
      },
    },
  },
})

