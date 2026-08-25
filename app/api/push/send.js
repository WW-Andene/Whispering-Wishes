// Vercel serverless function — admin-only broadcast to every registered
// device via FCM HTTP v1. Not called from the app itself: trigger it
// manually (curl/Postman) or wire a Vercel Cron entry to POST here with a
// title/body computed from an upcoming event end, a version update, etc.
//
// Auth: a shared secret header, not the app-origin CORS check every other
// route uses — this endpoint has no legitimate caller inside the app, and
// PUSH_ADMIN_SECRET is meant to live only in your own tooling/cron config.
//
// Usage:
//   curl -X POST https://your-app.vercel.app/api/push/send \
//     -H "x-admin-secret: $PUSH_ADMIN_SECRET" -H "Content-Type: application/json" \
//     -d '{"title":"Event ending soon","body":"Chord Cleansing ends in 2 hours!"}'
import crypto from 'node:crypto';
import { rateLimit } from '../_common.js';
import { getGoogleAccessToken, getFirebaseDbUrl, getServiceAccount } from '../_googleAuth.js';

function isValidSecret(provided) {
  const expected = process.env.PUSH_ADMIN_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch rather than returning false
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  res.setHeader('Cache-Control', 'no-store');

  if (!isValidSecret(req.headers['x-admin-secret'])) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // This is an admin tool, not public-facing — the limit exists only to stop
  // a leaked/misconfigured secret from hammering FCM in a retry loop.
  if (!rateLimit(req, res, { key: 'push-send', max: 5, windowMs: 60_000 })) return;

  try {
    let body = req.body;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) body = body.toString('utf-8');
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
    }
    const title = body?.title;
    const text = body?.body;
    if (!title || !text || typeof title !== 'string' || typeof text !== 'string') {
      return res.status(400).json({ error: 'title and body are required strings' });
    }

    const dbUrl = getFirebaseDbUrl();
    const dbToken = await getGoogleAccessToken(['https://www.googleapis.com/auth/firebase.database']);
    const listRes = await fetch(`${dbUrl}/push-tokens.json?access_token=${dbToken}&shallow=true`);
    if (!listRes.ok) throw new Error(`RTDB read failed: ${listRes.status}`);
    const tokenMap = (await listRes.json()) || {};
    const tokens = Object.keys(tokenMap);

    if (tokens.length === 0) return res.status(200).json({ sent: 0, failed: 0, removed: 0, message: 'No registered devices' });

    const projectId = getServiceAccount().project_id;
    const fcmToken = await getGoogleAccessToken(['https://www.googleapis.com/auth/firebase.messaging']);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    let sent = 0, failed = 0;
    const staleTokens = [];

    // Sequential, not Promise.all — this is a small-scale admin broadcast
    // (expect dozens-hundreds of devices, not millions), and staying under
    // FCM's per-project rate limits matters more than wall-clock time here.
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
        // 404/NOT_FOUND (deleted app) or 400/UNREGISTERED (stale token) —
        // clean these out of RTDB so future sends don't keep failing on them.
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

    return res.status(200).json({ sent, failed, removed: staleTokens.length });
  } catch (err) {
    console.error('push/send error:', err.message);
    return res.status(500).json({ error: 'Send failed: ' + err.message });
  }
}
