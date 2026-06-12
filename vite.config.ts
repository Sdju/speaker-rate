import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/speaker-rate/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        host: resolve(__dirname, 'src/embed/host/entry.ts'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'host' ? 'host.js' : 'assets/[name]-[hash].js'),
      },
    },
  },
})
