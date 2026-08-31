// Ported from app/api/_googleAuth.js — same JWT-bearer service-account flow,
// but signed with the Workers runtime's native Web Crypto (SubtleCrypto)
// instead of Node's `node:crypto`, since Workers don't have the latter
// without opting into nodejs_compat (and this needs nothing else from it).

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
export function getServiceAccount(env) {
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

// Cached per-isolate for the token's ~1h lifetime (minus a safety margin) —
// a warm Worker isolate can serve many requests, same reasoning as the
// Vercel version's module-scope cache.
const _tokenCache = new Map(); // scopeKey -> { token, expiresAt }

export async function getGoogleAccessToken(env, scopes) {
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

export function getFirebaseDbUrl(env) {
  const url = env.FIREBASE_DB_URL;
  if (!url) throw new Error('FIREBASE_DB_URL is not set');
  return url.replace(/\/$/, '');
}
