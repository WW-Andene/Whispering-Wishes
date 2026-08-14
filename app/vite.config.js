import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, readFileSync } from 'fs';
import { devPrerenderSavePlugin } from './vite-dev-prerender-save.js';

// P8-22 + P12-01 audit fixes:
//   P8-22: the original stampSW plugin rewrote public/sw.js with a wall-clock
//          timestamp on every build (and every vitest run), creating noisy
//          working-tree diffs that forced a sw.js commit after every local
//          test run.
//   P12-01: APP_VERSION was duplicated across constants.js + package.json + the
//          sw.js fallback literal — risk of drift on release bumps.
// New behavior: plugin reads the SINGLE source of truth (package.json.version)
// and stamps sw.js with it only when it's actually changed. Running tests
// without a version bump produces a no-op. The client still sends SET_VERSION
// via postMessage on SW registration, which keeps the cache names aligned
// with the running app version at runtime.
const stampSW = () => ({
  name: 'stamp-sw',
  buildStart() {
    const swPath = 'public/sw.js';
    const pkgPath = 'package.json';
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const version = pkg.version || '0.0.0';
      let sw = readFileSync(swPath, 'utf8');
      // Replace existing BUILD: line OR append one
      const nextStamp = `// BUILD: v${version}`;
      const existing = sw.match(/\/\/ BUILD:.*/);
      if (existing && existing[0] === nextStamp) return; // no-op — same version, don't touch file
      sw = sw.replace(/\/\/ BUILD:.*/, '').trimEnd();
      sw += `\n${nextStamp}\n`;
      writeFileSync(swPath, sw);
    } catch (err) {
      // Non-fatal — if package.json can't be read (shouldn't happen), leave sw.js alone.
      // eslint-disable-next-line no-console
      console.warn('[stampSW] failed to stamp:', err.message);
    }
  },
});

export default defineConfig({
  // Relative base so built asset URLs resolve correctly regardless of the
  // subpath the app is served from (e.g. preview deployments served under
  // /preview/<org>/<repo>/<branch>--app/ instead of site root).
  base: './',
  plugins: [react(), stampSW(), devPrerenderSavePlugin()],
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
