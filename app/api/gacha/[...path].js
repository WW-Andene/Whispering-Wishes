// Vercel/DV serverless function — proxies POST requests to WuWa gacha API to avoid CORS
const ALLOWED_HOST = 'gmserver-api.aki-game2.net';
const ALLOWED_PATH_PREFIX = 'record/query';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed — use POST' });
  }

  const origin = req.headers.origin || req.headers.referer || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const pathSegments = req.query.path;
    const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments || '';

    // Validate path — block traversal and restrict to allowed prefix
    if (path.includes('..') || path.includes('%2e') || path.includes('%2E')) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    if (!path.startsWith(ALLOWED_PATH_PREFIX)) {
      return res.status(400).json({ error: 'Invalid endpoint' });
    }

    // Validate body has expected fields
    const body = req.body;
    if (!body || typeof body !== 'object' || !body.playerId) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const targetUrl = `https://${ALLOWED_HOST}/gacha/${path}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    clearTimeout(timeout);

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Upstream timeout' });
    }
    return res.status(502).json({ error: 'Proxy error' });
  }
}
