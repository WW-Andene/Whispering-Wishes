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
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          // Keep shared components/data/core/hooks in the index chunk to prevent
          // race conditions during lazy-loaded tab initialization (e.g. KuroSelect
          // split into its own chunk causes "KuroSelect is not defined" on rapid tab switch)
          if (id.includes('/shared/') || id.includes('/providers/') ||
              id.includes('/data/') || id.includes('/core/') || id.includes('/hooks/') ||
              id.includes('/utils/')) {
            return 'index';
          }
        },
      },
    },
  },
});
