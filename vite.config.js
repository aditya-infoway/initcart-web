import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // 👈 fixed port number (stable)
    host: true,        // optional: allow LAN access if needed
  },
})
