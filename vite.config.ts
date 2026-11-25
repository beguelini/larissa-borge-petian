import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        familyFinance: fileURLToPath(new URL('./gestaofinanceirafamiliar.html', import.meta.url)),
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        ritmoEssencial: fileURLToPath(new URL('./ritmo-essencial.html', import.meta.url)),
      },
    },
  },
})
