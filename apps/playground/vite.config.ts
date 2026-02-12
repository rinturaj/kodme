import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@kodme/core': '../../packages/core/src/index.ts'
    }
  },
  optimizeDeps: {
    include: ['@kodme/core']
  },
  build: {
    commonjsOptions: {
      include: [/@kodme\/core/, /node_modules/]
    }
  }
})
