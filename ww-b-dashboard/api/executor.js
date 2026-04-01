// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Live Command Executor
// Calls Groq REST API with real app context — no hallucination.
// ═══════════════════════════════════════════════════════════════════════════════

import { addFinding, createRun, completeRun, completeCommand } from './db.js';
import { buildAppContext } from './context.js';

// Cache context so we don't re-read files every command
let _appContext = null;
function getAppContext() {
  if (!_appContext) _appContext = buildAppContext();
  return _appContext;
}

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
  console.log(`[WW-B] Command #${commandId}: "${text.slice(0, 60)}..."`);

  if (!apiKey) {
    completeCommand(commandId, 'Error: GROQ_API_KEY not set.');
    return;
  }

  const runId = createRun(commandId, 'command');
  const appContext = getAppContext();

  const systemPrompt = `You are WW-B, an audit agent for Whispering Wishes — a Wuthering Waves companion web app.

You have access to the REAL app source code below. Base ALL findings on actual code — never guess or make up issues.

${appContext}

---

RULES:
- Only report issues you can trace to actual code above
- If the code is too large to fully analyze, say what you checked and what you couldn't
- Use severity levels: 🔴 CRITICAL, 🟠 MAJOR, 🔵 MINOR, ⚪ NIT
- Be specific: mention function names, variable names, line patterns
- If asked about something not in the context, say "I don't have that code loaded"`;

  try {
    console.log(`[WW-B] Calling Groq (context: ${(appContext.length / 1024).toFixed(1)}KB)...`);
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

    console.log(`[WW-B] Done: ${content.slice(0, 80)}...`);
    completeRun(runId, 'Command processed');
    completeCommand(commandId, content);

  } catch (err) {
    const msg = err.message?.slice(0, 300) || 'Unknown error';
    console.error(`[WW-B] Error: ${msg}`);
    completeCommand(commandId, `Error: ${msg}`);
    completeRun(runId, `Error: ${msg}`);
  }
}
