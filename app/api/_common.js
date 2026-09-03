// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — api/_common.js
// Shared helpers for the Vercel serverless routes (/api/remove-bg,
// /api/batch-remove-bg, /api/gacha/record/query).
// Underscore prefix keeps this file out of Vercel's route table.
// ═══════════════════════════════════════════════════════════════════════════════

// P12-10 audit fix: API kill switch.
// Any handler can prefix with `if (isServiceDisabled(res, 'remove-bg')) return;`
// to return a 503 + user-readable message when operations need to pause an
// upstream integration (HuggingFace outage, abuse spike) without redeploying.
//
// Environment variables (read at request time, not boot — supports live toggle
// on hosts that hot-reload env like Vercel):
//   SERVICE_DISABLED          → disables ALL API routes
//   SERVICE_DISABLED_REMOVE_BG → disables /api/remove-bg + /api/batch-remove-bg
//   SERVICE_DISABLED_GACHA     → disables /api/gacha/record/query
//
// Any of those set to 'true' (case-insensitive) activates the kill switch.
const _isTruthy = (v) => typeof v === 'string' && v.toLowerCase() === 'true';

// Origin allowlist shared by every route (was copy-pasted per-file with a hardcoded Vercel domain +
// a few localhost dev ports — moved here once so a self-hosted deployment doesn't have to touch each
// handler individually). EXTRA_ALLOWED_ORIGINS (comma-separated, e.g.
// "http://localhost:4173,https://your-tunnel.trycloudflare.com") ADDS origins on top of this base
// list — unset (the default on Vercel) leaves behavior identical to before this existed.
const BASE_ALLOWED_ORIGINS = [
  'https://whispering-wishes.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:4173', // Vite's default `vite preview` / self-host/server.js port
  // Fixed, well-known origins Capacitor's WebView sends the Origin header as for the bundled
  // native app (see NATIVE_APP.md) — 'capacitor://localhost' on iOS, 'https://localhost' on
  // Android with the default HTTPS scheme. Not user-specific like a tunnel domain, so these are
  // safe to bake in permanently rather than push onto every self-hoster via EXTRA_ALLOWED_ORIGINS.
  'capacitor://localhost',
  'https://localhost',
];
const _extraOrigins = (process.env.EXTRA_ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const ALL_ALLOWED_ORIGINS = [...BASE_ALLOWED_ORIGINS, ..._extraOrigins];

export function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALL_ALLOWED_ORIGINS.includes(origin) || /^https:\/\/whispering-wishes[a-z0-9-]*\.vercel\.app$/.test(origin);
}

export function isServiceDisabled(res, serviceKey) {
  const global = _isTruthy(process.env.SERVICE_DISABLED);
  const specific = serviceKey && _isTruthy(process.env[`SERVICE_DISABLED_${serviceKey.toUpperCase()}`]);
  if (!global && !specific) return false;
  // Human-readable message — game-lore tone to match app voice
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Retry-After', '3600');
  res.status(503).json({
    error: 'Service temporarily unavailable',
    message: 'This feature is briefly paused for maintenance. Try again in a little while.',
  });
  return true;
}

// P3-05 audit fix: in-memory per-IP token-bucket rate limiter.
// Not distributed (Vercel serverless may spawn multiple instances), but
// provides real protection against single-instance abuse spikes and scales
// naturally to KV/Redis if the app ever adds it.
//
// Usage:
//   if (!rateLimit(req, res, { key: 'remove-bg', max: 10, windowMs: 60_000 })) return;
//
// Returns true when the request is allowed; returns false after writing a
// 429 response and setting Retry-After header.
const _buckets = new Map(); // key = `${routeKey}:${clientId}`, value = { tokens, resetAt }

function _getClientId(req) {
  // Vercel populates x-forwarded-for with the real client IP.
  const fwd = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export function rateLimit(req, res, { key, max = 10, windowMs = 60_000 } = {}) {
  const id = _getClientId(req);
  const bucketKey = `${key}:${id}`;
  const now = Date.now();
  const bucket = _buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    _buckets.set(bucketKey, { tokens: max - 1, resetAt: now + windowMs });
    // Best-effort GC: opportunistically drop stale buckets when writing.
    // At 10 routes × typical traffic, map stays small (< 10k entries) even without this.
    if (_buckets.size > 10_000) {
      for (const [k, v] of _buckets) {
        if (v.resetAt <= now) _buckets.delete(k);
      }
    }
    return true;
  }
  if (bucket.tokens <= 0) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    res.status(429).json({
      error: 'Too many requests',
      message: `Slow down — try again in ${retryAfterSec}s.`,
    });
    return false;
  }
  bucket.tokens -= 1;
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(bucket.tokens));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
  return true;
}
