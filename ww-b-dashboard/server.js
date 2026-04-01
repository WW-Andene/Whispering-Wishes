import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './api/routes.js';

// Load .env if present (optional — works without it)
try { await import('dotenv/config'); } catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API
app.use('/api', apiRoutes);

// Serve built client (after `npm run build`)
const clientDist = path.join(__dirname, 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (_, res) => res.send('WW-B Dashboard API running. Build client with: cd client && npm run build'));
}

app.listen(PORT, () => {
  console.log(`\n  WW-B Dashboard → http://localhost:${PORT}\n`);
});
