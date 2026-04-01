// ═══════════════════════════════════════════════════════════════════════════════
// WW-B — AI Layer (Groq)
// Pure API wrapper: call LLM, extract JSON, handle retries.
// ═══════════════════════════════════════════════════════════════════════════════

import Groq from 'groq-sdk';
import { AI } from './config.js';
import { log } from './log.js';

let client = null;
let lastCallTime = 0;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required');
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

// ─── Core API Call ──────────────────────────────────────────────────────────

export async function ask(systemPrompt, userPrompt, { maxTokens = AI.maxTokens, retries = AI.maxRetries } = {}) {
  const api = getClient();

  const elapsed = Date.now() - lastCallTime;
  if (elapsed < AI.rateLimitMs) await sleep(AI.rateLimitMs - elapsed);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      lastCallTime = Date.now();
      const response = await api.chat.completions.create({
        model: AI.model,
        max_tokens: maxTokens,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = response.choices?.[0]?.message?.content || '';
      if (!text.trim()) throw new Error('Empty response');
      return text;

    } catch (err) {
      if (attempt === retries) {
        const msg = (err.message || 'Unknown').slice(0, 200);
        log.error(`Groq failed after ${retries + 1} attempts: ${msg}`);
        throw new Error(`Groq API: ${msg}`);
      }
      log.warn(`Groq attempt ${attempt + 1} failed: ${err.message}`);
      await sleep(err.status === 429 ? 10000 * (attempt + 1) : 3000 * (attempt + 1));
    }
  }
}

// ─── JSON Extraction ────────────────────────────────────────────────────────

export function extractJSON(text) {
  if (!text || typeof text !== 'string') throw new Error('extractJSON: empty input');
  if (text.length > 512 * 1024) throw new Error('extractJSON: input too large');

  const trimmed = text.trim();

  // Direct parse
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed); } catch {}
  }

  // Code fence
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch {}
  }

  // Find JSON boundaries
  const start = text.search(/[\[{]/);
  if (start >= 0) {
    const opener = text[start];
    const closer = opener === '{' ? '}' : ']';
    const end = text.lastIndexOf(closer);
    if (end > start) {
      try { return JSON.parse(text.slice(start, end + 1)); } catch {}
    }
  }

  throw new Error('Could not extract valid JSON from response');
}

// ─── JSON with Retries ──────────────────────────────────────────────────────

export async function askJSON(systemPrompt, userPrompt, { maxTokens = AI.maxTokens, jsonRetries = 2 } = {}) {
  for (let attempt = 0; attempt <= jsonRetries; attempt++) {
    const prompt = attempt === 0
      ? userPrompt
      : `${userPrompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a valid JSON object/array. No text before or after.`;

    const response = await ask(systemPrompt, prompt, { maxTokens });
    try {
      return extractJSON(response);
    } catch (err) {
      if (attempt === jsonRetries) throw err;
      log.warn(`JSON parse failed (attempt ${attempt + 1}), retrying...`);
    }
  }
}
