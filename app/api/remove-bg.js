// Vercel serverless function — removes image background via HuggingFace Inference API
// API key stored server-side via HF_API_KEY environment variable
// Usage: POST /api/remove-bg  { "imageUrl": "https://i.ibb.co/..." }
// Returns: PNG image with transparent background

import { isServiceDisabled, rateLimit, isAllowedOrigin } from './_common.js';

const HF_MODEL = 'briaai/RMBG-2.0';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const MAX_RETRIES = 3;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// F-006: Restrict server-side fetches to known image hosts (prevents SSRF)
const ALLOWED_IMAGE_HOSTS = ['i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com', 'cdn.discordapp.com', 'media.discordapp.net', 'pbs.twimg.com', 'raw.githubusercontent.com', 'i.postimg.cc', 'wuwa.gg', 'wuwatracker.com', 'static.wikia.nocookie.net'];
const isAllowedImageHost = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_IMAGE_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host));
  } catch { return false; }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // F-005: Origin check
  const origin = req.headers.origin || '';
  if (!isAllowedOrigin(origin)) return res.status(403).json({ error: 'Origin not allowed' });

  // P12-10 kill switch (both single + batch share the REMOVE_BG service key)
  if (isServiceDisabled(res, 'remove_bg')) return;
  // P3-05 rate limit — bg removal is expensive upstream; conservative cap
  if (!rateLimit(req, res, { key: 'remove_bg', max: 20, windowMs: 60_000 })) return;

  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'HuggingFace API key not configured' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Missing or invalid imageUrl (HTTPS required)' });
    }

    // F-006: Validate against image host allowlist (prevents SSRF)
    if (!isAllowedImageHost(imageUrl)) {
      return res.status(400).json({ error: 'Image host not allowed' });
    }

    // Download the source image
    const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!imgResp.ok) {
      return res.status(502).json({ error: `Failed to download image: ${imgResp.status}` });
    }

    const imgBuffer = Buffer.from(await imgResp.arrayBuffer());
    if (imgBuffer.length > MAX_IMAGE_SIZE) {
      return res.status(413).json({ error: 'Image too large (max 10MB)' });
    }

    // Call HuggingFace with retries (model may need to warm up)
    let result;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const hfResp = await fetch(HF_API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: imgBuffer,
        signal: AbortSignal.timeout(60000),
      });

      if (hfResp.ok) {
        result = Buffer.from(await hfResp.arrayBuffer());
        break;
      }

      if (hfResp.status === 503) {
        // Model loading — wait and retry
        const body = await hfResp.json().catch(() => ({}));
        const wait = Math.min(body.estimated_time || 20, 60);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }

      if (hfResp.status === 429) {
        // Rate limited — wait 10s
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }

      return res.status(502).json({ error: `HuggingFace API error: ${hfResp.status}` });
    }

    if (!result) {
      return res.status(502).json({ error: 'HuggingFace API failed after retries' });
    }

    // Return PNG with transparent background
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', result.length);
    return res.status(200).send(result);

  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Request timeout' });
    }
    return res.status(500).json({ error: 'Background removal failed' });
  }
}
