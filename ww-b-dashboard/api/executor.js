// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Live Command Executor
// Loads relevant source files per command. No hallucination.
// ═══════════════════════════════════════════════════════════════════════════════

import { addFinding, createRun, completeRun, completeCommand } from './db.js';
import { buildContext } from './context.js';

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

  // Build context from actual source files relevant to this command
  const appContext = buildContext(text);

  const systemPrompt = `You are WW-B, an expert code auditor for Whispering Wishes (a Wuthering Waves companion web app).

You have the REAL source code loaded below. Base ALL findings on actual code you can see.

RULES:
- Reference specific code: function names, variable names, line patterns, actual logic
- If you find a bug, quote the problematic code
- If a file was truncated, say which parts you couldn't check
- Never invent issues — only report what you can verify in the code
- Severity: 🔴 CRITICAL (crashes/data loss), 🟠 MAJOR (wrong behavior), 🔵 MINOR (improvements), ⚪ NIT (cosmetic)

${appContext}`;

  try {
    console.log(`[WW-B] Calling Groq (${(appContext.length / 1024).toFixed(0)}KB context)...`);
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

    console.log(`[WW-B] Done (${content.length} chars)`);
    completeRun(runId, 'Processed');
    completeCommand(commandId, content);

  } catch (err) {
    const msg = err.message?.slice(0, 300) || 'Unknown error';
    console.error(`[WW-B] Error: ${msg}`);
    completeCommand(commandId, `Error: ${msg}`);
    completeRun(runId, `Error: ${msg}`);
  }
}
