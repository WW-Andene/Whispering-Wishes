// Ported from app/api/push/register.js — registers a device's FCM token so
// send.js can later reach it. Same behavior: admin-level write via a
// service-account token, since an FCM token isn't tied to any user account.
import { getGoogleAccessToken, getFirebaseDbUrl } from './googleAuth.js';
import { corsHeaders } from './cors.js';

const MAX_TOKEN_LENGTH = 4096;

export async function handleRegister(request, env, origin) {
  try {
    const body = await request.json().catch(() => null);
    const token = body?.token;
    if (!token || typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
      return Response.json({ error: 'Missing or invalid token' }, { status: 400, headers: corsHeaders(origin) });
    }
    // RTDB forbids '.', '#', '$', '[', ']', '/' in keys.
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
