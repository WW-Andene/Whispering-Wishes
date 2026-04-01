import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './api/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api', apiRoutes);

// Serve built client with injected API base URL
const dist = path.join(__dirname, 'client', 'dist');
if (existsSync(dist)) {
  const indexPath = path.join(dist, 'index.html');

  // Serve index.html with API_BASE injected
  app.get('/', (req, res) => {
    let html = readFileSync(indexPath, 'utf-8');
    const apiBase = `http://${req.hostname}:${PORT}`;
    html = html.replace('<head>', `<head><script>window.__API_BASE="${apiBase}"</script>`);
    res.type('html').send(html);
  });

  app.use(express.static(dist));

  // SPA fallback
  app.get('*', (req, res) => {
    let html = readFileSync(indexPath, 'utf-8');
    const apiBase = `http://${req.hostname}:${PORT}`;
    html = html.replace('<head>', `<head><script>window.__API_BASE="${apiBase}"</script>`);
    res.type('html').send(html);
  });
}

app.listen(PORT, () => console.log(`\n  WW-B Dashboard → http://localhost:${PORT}\n`));
