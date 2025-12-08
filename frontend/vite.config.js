import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,   // və ya 5000, sən harada işlətmək istəyirsənsə
    proxy: {
      '/api': 'http://localhost:8080'
    },
    historyApiFallback: true  // 👈 Əlavə et
  },
  build: {
    outDir: 'build'
  }
})
