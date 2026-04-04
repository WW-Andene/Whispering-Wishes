// Vercel/DV serverless function — proxies POST requests to WuWa gacha API to avoid CORS
// Try both oversea and CN API servers
const API_HOSTS = [
  'gmserver-api.aki-game2.net',   // CN / original
  'gmserver-api.aki-game.net',    // Global / oversea
  'gmserver-api.aki-game2.com',   // Alternate TLD
  'gmserver-api.aki-game.com',    // Alternate TLD
];

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
    let body = req.body;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) body = body.toString('utf-8');
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'No body' });
    }
    if (!body.playerId && !body.player_id) {
      return res.status(400).json({ error: 'Missing playerId/player_id' });
    }

    // Client can specify preferred host, or we try all
    const preferredHost = body._apiHost;
    delete body._apiHost; // Don't forward internal field to Kuro API

    const hostsToTry = preferredHost ? [preferredHost, ...API_HOSTS.filter(h => h !== preferredHost)] : API_HOSTS;
    const bodyStr = JSON.stringify(body);

    for (const host of hostsToTry) {
      const targetUrl = `https://${host}/gacha/record/query`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
          },
          signal: controller.signal,
          body: bodyStr,
        });
        clearTimeout(timeout);

        const data = await response.json();
        // If we got a valid response (code=0 or has data), return it
        if (data?.code === 0 || (response.ok && data?.data)) {
          data._usedHost = host; // Tell client which host worked
          return res.status(response.status).json(data);
        }
        // Non-zero code but valid response — might be auth error, try next host
      } catch (err) {
        clearTimeout(timeout);
        // Network/timeout error — try next host
        continue;
      }
    }

    // All hosts failed
    return res.status(502).json({ error: 'All API hosts returned errors', triedHosts: hostsToTry });
  } catch (err) {
    return res.status(502).json({ error: 'Proxy error: ' + err.message });
  }
}
