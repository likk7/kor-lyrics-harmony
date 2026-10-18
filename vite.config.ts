import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      '/api/lrclib': {
        target: 'https://lrclib.net',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/lrclib/, '/api'),
      },
    },
  },
  preview: {
    proxy: {
      '/api/lrclib': {
        target: 'https://lrclib.net',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/lrclib/, '/api'),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
