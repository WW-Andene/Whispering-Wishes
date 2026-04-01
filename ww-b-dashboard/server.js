import express from 'express';
import cors from 'cors';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './api/routes.js';

try { await import('dotenv/config'); } catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api', apiRoutes);

// Serve the dashboard as a single HTML page — no build step needed
const html = readFileSync(path.join(__dirname, 'dashboard.html'), 'utf-8');
app.get('/', (_, res) => res.type('html').send(html));

app.listen(PORT, () => console.log(`\n  WW-B Dashboard → http://localhost:${PORT}\n`));
