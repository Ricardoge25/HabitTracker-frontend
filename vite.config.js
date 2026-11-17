import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Vitest lee esta misma configuración
  test: {
    environment: 'node', // pruebas de funciones puras: no hace falta un navegador simulado.
    include: ['src/**/*.test.js'],
    globalSetup: ['./src/test/global-setup.js'],
  },
})
