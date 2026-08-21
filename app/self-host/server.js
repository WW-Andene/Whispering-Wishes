// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — self-host/server.js
// Standalone Express server for running the app on your own machine instead of
// Vercel. Serves the production build (dist/, from `npm run build`) as static
// files with SPA fallback, and mounts the same /api/* handlers Vercel uses —
// they're plain (req, res) Node functions, so no rewrite was needed, just a
// thin Express adapter. This file is purely additive: it doesn't touch
// vercel.json or anything Vercel reads, so the Vercel deployment keeps working
// unchanged alongside this.
//
// Usage:
//   cd app
//   npm install
//   npm run build
//   cp self-host/.env.example self-host/.env   # fill in your API keys
//   npm run selfhost
//
// See SELF_HOSTING.md at the repo root for the full walkthrough (env vars,
// exposing this to the internet via a tunnel, running it as a background
// service).
// ═══════════════════════════════════════════════════════════════════════════════

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(APP_ROOT, 'dist');

// ── Tiny zero-dependency .env loader ──────────────────────────────────────────
// Deliberately hand-rolled instead of pulling in the `dotenv` package — this is
// the only thing this file needs env-file support for, and it keeps the
// self-host setup to exactly one new dependency (express) on top of what the
// app already has. Existing process.env values always win (so `PORT=1234 npm
// run selfhost` still overrides whatever's in the file).
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(path.join(__dirname, '.env'));

if (!fs.existsSync(DIST_DIR)) {
  console.error('\ndist/ not found — run `npm run build` first (from the app/ directory).\n');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Mirrors the security headers vercel.json applies in production, so a
// self-hosted instance isn't meaningfully weaker — HSTS is skipped when
// running plain HTTP (it would just be ignored by the browser anyway, and
// setting it over HTTP on a LAN/dev box can cause confusing lockout if you
// later reuse the hostname without HTTPS).
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// ── /api/* routes — thin adapter over the existing Vercel handlers ───────────
// Each handler already speaks plain (req, res) with res.status()/json()/send()/
// setHeader(), which Express's req/res are a superset of, so these mount with
// zero changes to the handler files themselves.
const { default: removeBg } = await import('../api/remove-bg.js');
const { default: batchRemoveBg } = await import('../api/batch-remove-bg.js');
const { default: gachaQuery } = await import('../api/gacha/record/query.js');

app.post('/api/remove-bg', removeBg);
app.post('/api/batch-remove-bg', batchRemoveBg);
app.options('/api/gacha/record/query', gachaQuery); // the handler itself replies to OPTIONS
app.post('/api/gacha/record/query', gachaQuery);

// ── Static build + SPA fallback ───────────────────────────────────────────────
// Matches vercel.json's rewrite rule: everything except /spine/* falls back to
// index.html so client-side routing survives a hard refresh/deep link.
app.use('/spine', express.static(path.join(DIST_DIR, 'spine')));
app.use(express.static(DIST_DIR));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`\nWhispering Wishes running at http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') console.log(`Also reachable on your LAN at http://<this machine's IP>:${PORT}`);
  const missing = ['HF_API_KEY'].filter(k => !process.env[k]);
  if (missing.length) console.log(`Note: ${missing.join(', ')} not set — background-removal features will return a config error until self-host/.env has them.`);
});
