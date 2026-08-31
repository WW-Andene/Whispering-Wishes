// Ported from app/api/push/send.js — admin-only broadcast to every
// registered device via FCM HTTP v1. Not called from the app itself:
// trigger it manually (curl/Postman) or hit it from a scheduled job.
//
// Usage:
//   curl -X POST https://your-worker.workers.dev/send \
//     -H "x-admin-secret: $PUSH_ADMIN_SECRET" -H "Content-Type: application/json" \
//     -d '{"title":"Event ending soon","body":"Chord Cleansing ends in 2 hours!"}'
import { getGoogleAccessToken, getFirebaseDbUrl, getServiceAccount } from './googleAuth.js';

// Constant-time compare — Workers don't have node:crypto's timingSafeEqual,
// but the same defense (don't let string length/short-circuit leak via
// timing) is easy enough to hand-roll for two short strings.
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

export async function handleSend(request, env) {
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

    // Sequential, not Promise.all — small-scale admin broadcast, staying
    // under FCM's per-project rate limits matters more than wall-clock time.
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
