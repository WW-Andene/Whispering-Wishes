import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/test-setup.js'],
    include: ['src/__tests__/**/*.test.{js,jsx}'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    // P14-FIX: HIGH-7 — Removed allowedHosts: true which disabled host header validation,
    // allowing DNS rebinding attacks during development
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
});
