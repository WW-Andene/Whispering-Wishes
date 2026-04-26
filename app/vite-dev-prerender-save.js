// Dev-only Vite middleware that lets the prerender capture page
// (public/dev/prerender.html) write the WebM/MP4 it just recorded straight
// into the repo, instead of forcing a manual download → unzip → copy round
// trip. Wired up in vite.config.js, and only active during `vite dev` —
// never exposed in the production bundle.
//
// POST /api/dev-prerender-save
//   body: { files: { "<relPath>": "<base64>" }, ... }
//
//   <relPath> must be relative to app/public/ and end with one of the
//   allowed extensions (.webm, .mp4). Path traversal ('..') is rejected.
//
// Response: { written: [{ path, bytes }], skipped: [{ path, reason }] }

import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_EXTS = new Set(['.webm', '.mp4']);
const MAX_FILE_BYTES = 200 * 1024 * 1024; // 200 MB safety cap per file

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      // Hard cap on the whole payload — refuse runaway uploads.
      if (total > 1024 * 1024 * 1024) {
        reject(new Error('payload too large (>1 GB)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export function devPrerenderSavePlugin({ publicDir = 'public' } = {}) {
  return {
    name: 'dev-prerender-save',
    apply: 'serve', // dev only — production builds never include this route
    configureServer(server) {
      const root = path.resolve(server.config.root, publicDir);
      server.middlewares.use('/api/dev-prerender-save', async (req, res, next) => {
        if (req.method === 'GET') {
          // Lightweight ping so the dev panel can check whether the endpoint
          // is reachable before the user clicks "Send to repo".
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, root: path.relative(server.config.root, root) }));
          return;
        }
        if (req.method !== 'POST') return next();

        let body;
        try {
          body = await readJsonBody(req);
        } catch (err) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'invalid JSON', detail: String(err.message || err) }));
          return;
        }

        const files = body && typeof body.files === 'object' ? body.files : null;
        if (!files) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'missing files object' }));
          return;
        }

        const written = [];
        const skipped = [];
        for (const [relPath, b64] of Object.entries(files)) {
          if (typeof relPath !== 'string' || typeof b64 !== 'string') {
            skipped.push({ path: String(relPath), reason: 'invalid entry' });
            continue;
          }
          // Reject absolute paths and traversal — every write must stay
          // inside publicDir.
          if (relPath.startsWith('/') || relPath.includes('..') || relPath.includes('\0')) {
            skipped.push({ path: relPath, reason: 'unsafe path' });
            continue;
          }
          const ext = path.extname(relPath).toLowerCase();
          if (!ALLOWED_EXTS.has(ext)) {
            skipped.push({ path: relPath, reason: `disallowed extension ${ext || '(none)'}` });
            continue;
          }

          const target = path.resolve(root, relPath);
          // Belt-and-suspenders: confirm the resolved target is still under root.
          if (!target.startsWith(root + path.sep) && target !== root) {
            skipped.push({ path: relPath, reason: 'escapes publicDir' });
            continue;
          }

          let buf;
          try {
            buf = Buffer.from(b64, 'base64');
          } catch (err) {
            skipped.push({ path: relPath, reason: 'invalid base64' });
            continue;
          }
          if (buf.length === 0) {
            skipped.push({ path: relPath, reason: 'empty payload' });
            continue;
          }
          if (buf.length > MAX_FILE_BYTES) {
            skipped.push({ path: relPath, reason: `exceeds ${MAX_FILE_BYTES} bytes` });
            continue;
          }

          try {
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, buf);
            written.push({ path: relPath, bytes: buf.length });
          } catch (err) {
            skipped.push({ path: relPath, reason: String(err.message || err) });
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ written, skipped, root: path.relative(server.config.root, root) }));
      });
    },
  };
}
