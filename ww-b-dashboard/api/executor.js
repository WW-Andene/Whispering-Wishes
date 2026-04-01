// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Live Command Executor
// Processes commands in real-time using Groq. Streams progress via SSE.
// ═══════════════════════════════════════════════════════════════════════════════

import Groq from 'groq-sdk';
import { addFinding, createRun, completeRun, completeCommand } from './db.js';

let groq = null;
function getGroq() {
  if (!groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;
    groq = new Groq({ apiKey: key });
  }
  return groq;
}

// SSE clients waiting for command results
const listeners = new Map(); // commandId -> Set<res>

export function subscribeCommand(commandId, res) {
  if (!listeners.has(commandId)) listeners.set(commandId, new Set());
  listeners.get(commandId).add(res);
  res.on('close', () => listeners.get(commandId)?.delete(res));
}

function emit(commandId, event) {
  const clients = listeners.get(commandId);
  if (!clients) return;
  const msg = `data: ${JSON.stringify(event)}\n\n`;
  for (const c of clients) c.write(msg);
}

function emitDone(commandId) {
  const clients = listeners.get(commandId);
  if (!clients) return;
  for (const c of clients) { c.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`); c.end(); }
  listeners.delete(commandId);
}

// ─── Execute a command live ─────────────────────────────────────────────────

export async function executeCommand(commandId, text) {
  const client = getGroq();
  if (!client) {
    emit(commandId, { type: 'error', text: 'GROQ_API_KEY not set. Add it to your environment.' });
    completeCommand(commandId, 'Error: GROQ_API_KEY not set');
    emitDone(commandId);
    return;
  }

  emit(commandId, { type: 'status', text: 'Processing...' });

  // Create a run for this command's findings
  const runId = createRun(commandId, 'command');

  const systemPrompt = `You are WW-B, an audit agent for a Wuthering Waves companion web app called "Whispering Wishes".

You receive instructions from the maintainer and respond with actionable findings.

For each issue or observation, output a JSON object on its own line:
{"type":"finding","category":"string","severity":"critical|major|minor|nit","title":"string","description":"string"}

For progress updates, output:
{"type":"log","text":"what you're doing"}

When done, output:
{"type":"summary","text":"brief summary of what you found"}

Always output valid JSON lines. No markdown. No prose between JSON lines.`;

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

    const content = response.choices?.[0]?.message?.content || '';
    const lines = content.split('\n').filter(l => l.trim());
    let summary = '';
    let findingCount = 0;

    for (const line of lines) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(line.trim());

        if (parsed.type === 'finding') {
          addFinding(runId, {
            category: parsed.category || 'general',
            severity: parsed.severity || 'minor',
            title: parsed.title || '',
            description: parsed.description || '',
            confidence: 0.7,
          });
          findingCount++;
          emit(commandId, { type: 'finding', data: parsed });
        } else if (parsed.type === 'log') {
          emit(commandId, { type: 'log', text: parsed.text });
        } else if (parsed.type === 'summary') {
          summary = parsed.text;
          emit(commandId, { type: 'log', text: `Summary: ${parsed.text}` });
        }
      } catch {
        // Not JSON — treat as plain text log
        if (line.trim()) {
          emit(commandId, { type: 'log', text: line.trim() });
          summary += (summary ? '\n' : '') + line.trim();
        }
      }
    }

    // If Groq returned prose instead of JSON lines, try to extract findings from it
    if (findingCount === 0 && content.trim()) {
      // Store the whole response as a single finding for review
      addFinding(runId, {
        category: 'analysis',
        severity: 'minor',
        title: text.slice(0, 80),
        description: content.slice(0, 1000),
        confidence: 0.5,
      });
      findingCount = 1;
      emit(commandId, { type: 'log', text: content.slice(0, 500) });
    }

    const result = findingCount > 0
      ? `${findingCount} finding(s). ${summary}`
      : summary || 'No issues found.';

    completeRun(runId, result);
    completeCommand(commandId, result);
    emit(commandId, { type: 'result', text: result, findings: findingCount });

  } catch (err) {
    const msg = err.message?.slice(0, 200) || 'Unknown error';
    emit(commandId, { type: 'error', text: msg });
    completeCommand(commandId, `Error: ${msg}`);
    completeRun(runId, `Error: ${msg}`);
  }

  emitDone(commandId);
}
