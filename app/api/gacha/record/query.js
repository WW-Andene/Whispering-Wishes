// Vercel/DV serverless function — proxies POST requests to WuWa gacha API to avoid CORS
const ALLOWED_HOST = 'gmserver-api.aki-game2.net';
// F-004: Restrict CORS to app origins only (prevents open relay abuse)
const ALLOWED_ORIGINS = [
  'https://whispering-wishes.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
];
const isAllowedOrigin = (origin) => ALLOWED_ORIGINS.includes(origin) || /^https:\/\/whispering-wishes[a-z0-9-]*\.vercel\.app$/.test(origin);

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

  try {
    let body = req.body;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) body = body.toString('utf-8');
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
    }
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'No body' });
    if (!body.playerId && !body.player_id) return res.status(400).json({ error: 'Missing playerId' });

    const targetUrl = `https://${ALLOWED_HOST}/gacha/record/query`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    clearTimeout(timeout);

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Upstream timeout' });
    return res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
