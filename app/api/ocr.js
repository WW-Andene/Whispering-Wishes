// Vercel serverless function — proxies OCR requests to Groq Vision API
// API key stored server-side via GROQ_API_KEY environment variable

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB base64 limit (Groq allows up to 20MB)
const ALLOWED_KEYS = ['player_id', 'record_id', 'svr_id', 'resources_id', 'gacha_id', 'lang', 'svr_area'];

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
              text: `This screenshot shows a Wuthering Waves convene history URL. Extract ALL query parameters.

The URL format is:
https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?svr_id=HEX32&player_id=NUMBER&lang=XX&gacha_id=NUMBER&gacha_type=NUMBER&svr_area=TEXT&record_id=HEX32&resources_id=HEX32&platform=TEXT

Extract these values:
- svr_id (32-char hex)
- player_id (9-digit number)
- record_id (32-char hex)
- resources_id (32-char hex)
- gacha_id (number like 100057)
- lang (2-letter code like en, fr)
- svr_area (like "global")

Read every hex character carefully. Do NOT guess.

Respond with ONLY JSON (no markdown):
{"player_id":"VALUE","record_id":"VALUE","svr_id":"VALUE","resources_id":"VALUE","gacha_id":"VALUE","lang":"VALUE","svr_area":"VALUE"}`,
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
