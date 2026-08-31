// Whispering Wishes — push-notification Worker.
// Routes:
//   POST /register  — device registers its FCM token (called by the app)
//   POST /send       — admin broadcast to all registered devices (manual only)
//
// Ported from app/api/push/{register,send}.js for anyone not running a
// Vercel deployment. See ../README.md for deploy/setup steps.
import { isAllowedOrigin, corsHeaders } from './cors.js';
import { handleRegister } from './register.js';
import { handleSend } from './send.js';

// Best-effort per-IP rate limiting — like the Vercel version's in-memory
// bucket, this resets whenever the isolate recycles rather than being
// perfectly distributed. Fine for this traffic volume (device registration
// fires once per install, /send is a rare manual admin action).
const _buckets = new Map();
function rateLimited(request, key, { max, windowMs }) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  let bucket = _buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    _buckets.set(bucketKey, bucket);
  }
  bucket.count++;
  return bucket.count > max;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (url.pathname === '/register') {
      if (request.method === 'OPTIONS') {
        if (!isAllowedOrigin(origin, env.EXTRA_ALLOWED_ORIGINS)) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: corsHeaders(origin) });
      }
      if (request.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });
      if (!isAllowedOrigin(origin, env.EXTRA_ALLOWED_ORIGINS)) {
        return Response.json({ error: 'Origin not allowed' }, { status: 403 });
      }
      // Generous but real ceiling — fires once per app install/reinstall, not per session.
      if (rateLimited(request, 'push-register', { max: 10, windowMs: 60_000 })) {
        return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
      }
      return handleRegister(request, env, origin);
    }

    if (url.pathname === '/send') {
      if (request.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });
      // This is an admin tool, not public-facing — the limit exists only to
      // stop a leaked/misconfigured secret from hammering FCM in a retry loop.
      if (rateLimited(request, 'push-send', { max: 5, windowMs: 60_000 })) {
        return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
      }
      return handleSend(request, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
