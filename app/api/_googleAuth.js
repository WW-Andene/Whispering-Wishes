// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — api/_googleAuth.js
// Mints short-lived Google OAuth2 access tokens from a Firebase service
// account, for the two /api/push/* routes that need to call Firebase Realtime
// Database's REST API and the FCM HTTP v1 API with admin-level access
// (bypassing RTDB security rules, unlike the client's own Firebase Auth ID
// token flow in CloudStorageProvider.jsx).
//
// Deliberately hand-rolled (Node's built-in `crypto` signs the JWT) instead
// of pulling in `google-auth-library`/`firebase-admin` — every other route in
// this api/ folder talks to its upstream via plain fetch with no SDK, and the
// OAuth2 JWT-bearer flow is ~20 lines without one.
// See: https://developers.google.com/identity/protocols/oauth2/service-account
// ═══════════════════════════════════════════════════════════════════════════════

import crypto from 'node:crypto';

let cachedServiceAccount = null;
export function getServiceAccount() {
  if (cachedServiceAccount) return cachedServiceAccount;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');
  try {
    cachedServiceAccount = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
  return cachedServiceAccount;
}

const base64url = (input) => Buffer.from(input).toString('base64url');

// Tokens are cached per scope-set for their ~1h lifetime (minus a safety
// margin) — Vercel serverless instances are reused across invocations while
// warm, so this avoids a full token-mint round trip on every request.
const _tokenCache = new Map(); // scopeKey -> { token, expiresAt }

export async function getGoogleAccessToken(scopes) {
  const scopeKey = scopes.join(' ');
  const cached = _tokenCache.get(scopeKey);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: scopeKey,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${claim}`), sa.private_key);
  const jwt = `${header}.${claim}.${signature.toString('base64url')}`;

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

export function getFirebaseDbUrl() {
  const url = process.env.FIREBASE_DB_URL;
  if (!url) throw new Error('FIREBASE_DB_URL is not set');
  return url.replace(/\/$/, '');
}
