import { fileURLToPath } from 'url'
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// 使用 ESM 方式獲取 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}) 