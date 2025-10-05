import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Vite config for deployment (Render, Netlify, Vercel)
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ ensures relative asset paths (important for static hosting)
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
  },
})
