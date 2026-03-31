// Vercel serverless function — proxies OCR requests to Groq Vision API
// API key stored server-side via GROQ_API_KEY environment variable

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image field (base64)' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image}` },
            },
            {
              type: 'text',
              text: `This is a Wuthering Waves gacha/convene history URL screenshot.
Extract player_id (or playerId), record_id (or recordId), and svr_id (or svrId / svr_area) from the URL.
Respond ONLY with valid JSON — no markdown, no explanation:
{"player_id":"VALUE_OR_NULL","record_id":"VALUE_OR_NULL","svr_id":"VALUE_OR_NULL"}`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `Groq API error ${response.status}`,
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';

    // Parse the JSON from the response
    let ids;
    try {
      ids = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(422).json({ error: 'Could not parse OCR response', raw: text });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(ids);
  } catch (err) {
    return res.status(500).json({ error: 'OCR proxy error', message: err.message });
  }
}
