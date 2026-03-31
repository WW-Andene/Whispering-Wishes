// Vercel serverless function — proxies requests to WuWa gacha API to avoid CORS
const ALLOWED_HOST = 'gmserver-api.aki-game2.net';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Build target URL from path segments + query params
    const pathSegments = req.query.path;
    const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments || '';
    const query = new URLSearchParams(req.query);
    query.delete('path'); // Remove the Vercel catch-all param

    const targetUrl = `https://${ALLOWED_HOST}/gacha/${path}?${query.toString()}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'no-store');

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Proxy error', message: err.message });
  }
}
