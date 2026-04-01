// Vercel serverless function — proxies OCR requests to Groq Vision API
// API key stored server-side via GROQ_API_KEY environment variable

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB base64 limit (Groq allows up to 20MB)
const ALLOWED_KEYS = ['player_id', 'record_id', 'svr_id'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Service not configured' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image field (base64)' });
    }

    // Input size validation
    if (image.length > MAX_IMAGE_SIZE) {
      return res.status(413).json({ error: 'Image too large (max 2MB)' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 300,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image}` },
            },
            {
              type: 'text',
              text: `Look at this screenshot carefully. It contains a Wuthering Waves convene history URL with query parameters.

Find these EXACT parameter values from the URL:
- player_id (a 9-digit number like 500012345)
- record_id (an alphanumeric string)
- svr_id (a small number like 76 or 86)

The URL parameters may be named: player_id, playerId, record_id, recordId, svr_id, svrId, or svr_area.

Read each digit/character carefully. Do NOT guess — only extract what you can clearly see.

Respond with ONLY this JSON (no markdown, no explanation):
{"player_id":"VALUE_OR_NULL","record_id":"VALUE_OR_NULL","svr_id":"VALUE_OR_NULL"}`,
            },
          ],
        }],
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({ error: 'OCR service error' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(422).json({ error: 'Could not parse OCR response' });
    }

    // Whitelist response fields — prevent prototype pollution or unexpected data
    const ids = {};
    for (const key of ALLOWED_KEYS) {
      const val = parsed[key];
      ids[key] = (typeof val === 'string' && val !== 'null' && val !== 'NULL') ? val : null;
    }

    return res.status(200).json(ids);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'OCR timeout' });
    }
    return res.status(500).json({ error: 'OCR service error' });
  }
}
