import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base: works at the root (dev) and under /<repo>/ on GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
})
