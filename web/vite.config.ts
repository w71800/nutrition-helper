import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/<repo>/
// Set VITE_BASE_PATH=/your-repo/ in CI; local dev defaults to /
const base = process.env.VITE_BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
