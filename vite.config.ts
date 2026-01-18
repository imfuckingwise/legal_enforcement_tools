import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/legal_enforcement_tools/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
