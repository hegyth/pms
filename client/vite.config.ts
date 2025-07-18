import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    watch: {
      usePolling: true
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5175
  }
})
