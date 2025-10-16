import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
  base: './',
  build: {
    outDir: 'build',
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  } 
})