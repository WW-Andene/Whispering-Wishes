// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Live Command Executor
// Calls Groq REST API directly — no SDK dependency needed.
// ═══════════════════════════════════════════════════════════════════════════════

import { addFinding, createRun, completeRun, completeCommand } from './db.js';

async function callGroq(apiKey, messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.1,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response.';
}

export async function executeCommand(commandId, text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    completeCommand(commandId, 'Error: GROQ_API_KEY not set. Enter your key in the setup screen.');
    return;
  }

  const runId = createRun(commandId, 'command');

  const systemPrompt = `You are WW-B, an audit agent for a Wuthering Waves companion web app called "Whispering Wishes".

You receive instructions from the maintainer and respond clearly and concisely.

If you find issues, list them with severity:
- 🔴 CRITICAL: app-breaking bugs
- 🟠 MAJOR: significant issues
- 🔵 MINOR: small improvements
- ⚪ NIT: cosmetic/minor

Be direct. Give actionable findings. No fluff.`;

  try {
    const content = await callGroq(apiKey, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]);

    addFinding(runId, {
      category: 'command',
      severity: 'minor',
      title: text.slice(0, 100),
      description: content.slice(0, 2000),
      confidence: 0.7,
    });

    completeRun(runId, 'Command processed');
    completeCommand(commandId, content);

  } catch (err) {
    const msg = err.message?.slice(0, 300) || 'Unknown error';
    completeCommand(commandId, `Error: ${msg}`);
    completeRun(runId, `Error: ${msg}`);
  }
}
