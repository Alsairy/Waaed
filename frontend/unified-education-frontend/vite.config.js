import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'unified-education-platform-tunnel-wgthbzto.devinapps.com',
      '.devinapps.com'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
