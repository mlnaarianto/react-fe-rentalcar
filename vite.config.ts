import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Force port 3000
    strictPort: true, // Fail if port 3000 is not available
  }
})