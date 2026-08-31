// ═══════════════════════════════════════════════════════════════════════════════
// Whispering Wishes — push-notification Worker, single-file bundle.
//
// This is the exact same code as src/index.js + src/cors.js + src/googleAuth.js
// + src/register.js + src/send.js, concatenated into one file so it can be
// pasted directly into the Cloudflare dashboard's Quick Edit editor (no CLI,
// no wrangler, no local machine needed) — see README.md's "No CLI?" section.
// If you ever do get to a machine with the CLI, prefer deploying the real
// src/ folder with `wrangler deploy` instead and delete this duplicate.
// ═══════════════════════════════════════════════════════════════════════════════

// ── cors.js ─────────────────────────────────────────────────────────────────
const BASE_ALLOWED_ORIGINS = [
  'https://whispering-wishes.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:4173',
  'capacitor://localhost',
  'https://localhost',
];

function isAllowedOrigin(origin, extraOriginsCsv) {
  if (!origin) return false;
  const extra = (extraOriginsCsv || '').split(',').map(s => s.trim()).filter(Boolean);
  if ([...BASE_ALLOWED_ORIGINS, ...extra].includes(origin)) return true;
  return /^https:\/\/whispering-wishes[a-z0-9-]*\.vercel\.app$/.test(origin);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  };
}

// ── googleAuth.js ───────────────────────────────────────────────────────────
function base64url(bytes) {
  const bin = typeof bytes === 'string' ? bytes : String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

let cachedServiceAccount = null;
function getServiceAccount(env) {
  if (cachedServiceAccount) return cachedServiceAccount;
  const raw = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');
  try {
    cachedServiceAccount = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
  return cachedServiceAccount;
}

const _tokenCache = new Map();

async function getGoogleAccessToken(env, scopes) {
  const scopeKey = scopes.join(' ');
  const cached = _tokenCache.get(scopeKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const sa = getServiceAccount(env);
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: scopeKey,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  _tokenCache.set(scopeKey, { token: data.access_token, expiresAt: now * 1000 + data.expires_in * 1000 });
  return data.access_token;
}

function getFirebaseDbUrl(env) {
  const url = env.FIREBASE_DB_URL;
  if (!url) throw new Error('FIREBASE_DB_URL is not set');
  return url.replace(/\/$/, '');
}

// ── register.js ─────────────────────────────────────────────────────────────
const MAX_TOKEN_LENGTH = 4096;

async function handleRegister(request, env, origin) {
  try {
    const body = await request.json().catch(() => null);
    const token = body?.token;
    if (!token || typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
      return Response.json({ error: 'Missing or invalid token' }, { status: 400, headers: corsHeaders(origin) });
    }
    if (/[.#$[\]/]/.test(token)) {
      return Response.json({ error: 'Invalid token format' }, { status: 400, headers: corsHeaders(origin) });
    }

    const accessToken = await getGoogleAccessToken(env, ['https://www.googleapis.com/auth/firebase.database']);
    const dbUrl = getFirebaseDbUrl(env);
    const putRes = await fetch(`${dbUrl}/push-tokens/${encodeURIComponent(token)}.json?access_token=${accessToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registeredAt: Date.now() }),
    });
    if (!putRes.ok) throw new Error(`RTDB write failed: ${putRes.status}`);

    return Response.json({ ok: true }, { headers: corsHeaders(origin) });
  } catch (err) {
    console.error('push/register error:', err.message);
    return Response.json({ error: 'Registration failed' }, { status: 500, headers: corsHeaders(origin) });
  }
}

// ── send.js ─────────────────────────────────────────────────────────────────
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isValidSecret(provided, expected) {
  if (!expected || !provided) return false;
  return timingSafeEqual(provided, expected);
}

async function handleSend(request, env) {
  const provided = request.headers.get('x-admin-secret') || '';
  if (!isValidSecret(provided, env.PUSH_ADMIN_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const body = await request.json().catch(() => null);
    const title = body?.title;
    const text = body?.body;
    if (!title || !text || typeof title !== 'string' || typeof text !== 'string') {
      return Response.json({ error: 'title and body are required strings' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const dbUrl = getFirebaseDbUrl(env);
    const dbToken = await getGoogleAccessToken(env, ['https://www.googleapis.com/auth/firebase.database']);
    const listRes = await fetch(`${dbUrl}/push-tokens.json?access_token=${dbToken}&shallow=true`);
    if (!listRes.ok) throw new Error(`RTDB read failed: ${listRes.status}`);
    const tokenMap = (await listRes.json()) || {};
    const tokens = Object.keys(tokenMap);

    if (tokens.length === 0) {
      return Response.json({ sent: 0, failed: 0, removed: 0, message: 'No registered devices' }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const projectId = getServiceAccount(env).project_id;
    const fcmToken = await getGoogleAccessToken(env, ['https://www.googleapis.com/auth/firebase.messaging']);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    let sent = 0, failed = 0;
    const staleTokens = [];

    for (const token of tokens) {
      const sendRes = await fetch(fcmUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${fcmToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { token, notification: { title, body: text } } }),
      });
      if (sendRes.ok) {
        sent++;
      } else {
        failed++;
        const errBody = await sendRes.json().catch(() => null);
        const errStatus = errBody?.error?.status;
        if (sendRes.status === 404 || errStatus === 'UNREGISTERED' || errStatus === 'NOT_FOUND') {
          staleTokens.push(token);
        }
      }
    }

    for (const token of staleTokens) {
      await fetch(`${dbUrl}/push-tokens/${encodeURIComponent(token)}.json?access_token=${dbToken}`, { method: 'DELETE' }).catch(() => {});
    }

    return Response.json({ sent, failed, removed: staleTokens.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('push/send error:', err.message);
    return Response.json({ error: 'Send failed: ' + err.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

// ── index.js (entry point) ───────────────────────────────────────────────────
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
      if (rateLimited(request, 'push-register', { max: 10, windowMs: 60_000 })) {
        return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
      }
      return handleRegister(request, env, origin);
    }

    if (url.pathname === '/send') {
      if (request.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });
      if (rateLimited(request, 'push-send', { max: 5, windowMs: 60_000 })) {
        return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
      }
      return handleSend(request, env);
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
