// Build client then start server — single script, no cd issues
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'client');

console.log('[WW-B] Installing client dependencies...');
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

console.log('[WW-B] Building client...');
execSync('npx vite build', { cwd: clientDir, stdio: 'inherit' });

// Start server
console.log('[WW-B] Starting server...');
await import('./server.js');
