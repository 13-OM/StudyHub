import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
// - The dev server proxies every "/api" request to the Express backend,
//   so the frontend never has to worry about CORS or ports.
// - host: true allows the app to be opened from other devices /
//   hosted preview environments.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
