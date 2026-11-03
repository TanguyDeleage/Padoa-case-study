import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Served from https://<user>.github.io/Padoa-case-study/ on GitHub Pages
  base: '/Padoa-case-study/',
  plugins: [react(), tailwindcss()],
})
