import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, readFileSync } from 'fs';

// Stamp sw.js with build time so the browser detects a new service worker each deploy
const stampSW = () => ({
  name: 'stamp-sw',
  buildStart() {
    const swPath = 'public/sw.js';
    let sw = readFileSync(swPath, 'utf8');
    sw = sw.replace(/\/\/ BUILD:.*/, '').trimEnd();
    sw += `\n// BUILD: ${new Date().toISOString()}\n`;
    writeFileSync(swPath, sw);
  },
});

export default defineConfig({
  plugins: [react(), stampSW()],
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
