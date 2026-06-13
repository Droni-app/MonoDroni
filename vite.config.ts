import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    Pages({ dirs: 'src/pages' }),
  ],
  optimizeDeps: {
    exclude: ['monaco-editor'],
  },
})
