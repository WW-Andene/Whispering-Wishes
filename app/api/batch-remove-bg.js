// Vercel serverless function — batch background removal for echo images
// Processes one image at a time (call repeatedly from admin panel)
// Usage: POST /api/batch-remove-bg  { "name": "Echo Name", "imageUrl": "https://..." }
// Auth: x-admin-key header must match ADMIN_HASH env var (same hash as admin panel)
// Returns: { "name": "Echo Name", "resultUrl": "data:image/png;base64,..." }

const HF_MODEL = 'briaai/RMBG-2.0';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const MAX_RETRIES = 3;

// F-012: Constant-time string comparison to prevent timing side-channel
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const len = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < len; i++) result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return result === 0;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'HuggingFace API key not configured' });
  }

  // Auth — must match the admin hash stored in Vercel env vars (F-012: constant-time comparison)
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || !safeCompare(adminKey, process.env.ADMIN_HASH || '')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const { name, imageUrl } = req.body;
    if (!name || !imageUrl || !imageUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Missing name or imageUrl' });
    }

    // Download source image
    const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!imgResp.ok) {
      return res.status(502).json({ error: `Download failed: ${imgResp.status}`, name });
    }
    const imgBuffer = Buffer.from(await imgResp.arrayBuffer());

    // Call HuggingFace
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
        const body = await hfResp.json().catch(() => ({}));
        const wait = Math.min(body.estimated_time || 20, 60);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }

      if (hfResp.status === 429) {
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }

      return res.status(502).json({ error: `HF API error: ${hfResp.status}`, name });
    }

    if (!result) {
      return res.status(502).json({ error: 'HF API failed after retries', name });
    }

    // Return as base64 data URL
    const base64 = result.toString('base64');
    return res.status(200).json({
      name,
      resultUrl: `data:image/png;base64,${base64}`,
      size: result.length,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed', name: req.body?.name });
  }
}
