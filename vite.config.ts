import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This explicitly binds to all network interfaces
    port: 3000, // Changed to a different port
    strictPort: true,
    open: 'http://localhost:3000' // This will open localhost specifically
  }
})
