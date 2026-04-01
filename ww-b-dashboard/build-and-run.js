// Build client then start server — single script, no cd issues
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'client');
const distDir = path.join(clientDir, 'dist');

// Only build if dist doesn't exist yet
if (!existsSync(distDir)) {
  console.log('[WW-B] Installing client dependencies...');
  execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

  console.log('[WW-B] Building client...');
  execSync('npx vite build', { cwd: clientDir, stdio: 'inherit' });
} else {
  console.log('[WW-B] Client already built, skipping.');
}

// Start server
console.log('[WW-B] Starting server...');
await import('./server.js');
