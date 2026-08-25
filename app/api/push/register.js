// Vercel serverless function — registers a device's FCM token so
// /api/push/send.js can later reach it. Called from
// src/utils/pushNotifications.js whenever the native app registers with FCM.
//
// Writes with admin-level access (a service-account-minted OAuth2 token, see
// _googleAuth.js) rather than the client's own Firebase Auth flow — an FCM
// token isn't tied to any user account (push works without signing in), so
// there's no ID token to use, and the RTDB security rules for this path can
// stay closed to public writes.
import { isServiceDisabled, rateLimit, isAllowedOrigin } from '../_common.js';
import { getGoogleAccessToken, getFirebaseDbUrl } from '../_googleAuth.js';

// FCM tokens are long opaque strings (~150-200 chars observed in practice);
// this is a generous sanity ceiling against garbage/abuse, not a real spec limit.
const MAX_TOKEN_LENGTH = 4096;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) return res.status(403).end();
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  if (!isAllowedOrigin(origin)) return res.status(403).json({ error: 'Origin not allowed' });
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Cache-Control', 'no-store');

  if (isServiceDisabled(res, 'push')) return;
  // Generous but real ceiling — this fires once per app install/reinstall, not per session.
  if (!rateLimit(req, res, { key: 'push-register', max: 10, windowMs: 60_000 })) return;

  try {
    let body = req.body;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) body = body.toString('utf-8');
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
    }
    const token = body?.token;
    if (!token || typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
      return res.status(400).json({ error: 'Missing or invalid token' });
    }
    // RTDB forbids '.', '#', '$', '[', ']', '/' in keys — reject rather than
    // silently mangle if a token ever contained one (none observed in
    // practice, but this is user-supplied input reaching a DB key).
    if (/[.#$[\]/]/.test(token)) return res.status(400).json({ error: 'Invalid token format' });

    const accessToken = await getGoogleAccessToken(['https://www.googleapis.com/auth/firebase.database']);
    const dbUrl = getFirebaseDbUrl();
    const putRes = await fetch(`${dbUrl}/push-tokens/${encodeURIComponent(token)}.json?access_token=${accessToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registeredAt: Date.now() }),
    });
    if (!putRes.ok) throw new Error(`RTDB write failed: ${putRes.status}`);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('push/register error:', err.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
