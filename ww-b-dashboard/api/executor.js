// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Live Command Executor
// Processes commands in real-time using Groq.
// ═══════════════════════════════════════════════════════════════════════════════

import { addFinding, createRun, completeRun, completeCommand } from './db.js';

let groq = null;
async function getGroq() {
  if (!groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;
    try {
      const { default: Groq } = await import('groq-sdk');
      groq = new Groq({ apiKey: key });
    } catch {
      return null;
    }
  }
  return groq;
}

export async function executeCommand(commandId, text) {
  const client = await getGroq();
  if (!client) {
    completeCommand(commandId, 'Error: GROQ_API_KEY not set. Add it to your environment variables.');
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
    const response = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    });

    const content = response.choices?.[0]?.message?.content || 'No response from Groq.';

    // Save findings to database for the Review tab
    addFinding(runId, {
      category: 'command',
      severity: 'minor',
      title: text.slice(0, 100),
      description: content.slice(0, 2000),
      confidence: 0.7,
    });

    completeRun(runId, `Command processed`);
    completeCommand(commandId, content);

  } catch (err) {
    const msg = err.message?.slice(0, 300) || 'Unknown error';
    completeCommand(commandId, `Error: ${msg}`);
    completeRun(runId, `Error: ${msg}`);
  }
}
