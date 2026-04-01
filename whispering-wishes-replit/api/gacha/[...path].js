// Vercel serverless function — proxies requests to WuWa gacha API to avoid CORS
const ALLOWED_HOST = 'gmserver-api.aki-game2.net';
const ALLOWED_PATH_PREFIX = 'record/query';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — restrict to app origin
  const origin = req.headers.origin || req.headers.referer || '';
  if (ALLOWED_ORIGIN && !origin.includes(ALLOWED_ORIGIN)) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  } else {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET');
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

    const query = new URLSearchParams(req.query);
    query.delete('path');

    const targetUrl = `https://${ALLOWED_HOST}/gacha/${path}?${query.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      signal: controller.signal,
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
