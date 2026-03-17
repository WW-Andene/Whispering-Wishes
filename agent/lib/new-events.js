// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — New Event Detection
//
// The agent updates existing event dates, but until now couldn't detect
// an entirely NEW event Kuro adds (like when Illusive Realm was introduced).
// This module compares the wiki's event list against the app's EVENTS keys
// and creates entries for any genuinely new recurring events.
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';

/**
 * Detect events on web sources that don't exist in the app.
 *
 * @param {Object[]} sourceContents — fetched web pages
 * @param {Object} currentEvents — from reader.extractEvents()
 * @param {Function} askClaudeFn
 * @returns {{ newEvents: Object[] }}
 */
export async function detectNewEvents(sourceContents, currentEvents, askClaudeFn) {
  const existingKeys = Object.keys(currentEvents);
  const existingNames = Object.values(currentEvents).map(e => e.name.toLowerCase());

  const prompt = `Analyze these Wuthering Waves web sources and identify any RECURRING game events or modes that are NOT in the app's current event list.

CURRENT APP EVENTS (already tracked):
${existingKeys.map(k => `  ${k}: "${currentEvents[k].name}" (resets: ${currentEvents[k].resetType})`).join('\n')}

WEB SOURCES:
${sourceContents.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content.slice(0, 12000)}`).join('\n\n')}

RULES:
- Only identify RECURRING events/modes (weekly reset, version reset, periodic rotation)
- Do NOT include one-time limited events (web events, story updates, maintenance notices)
- Do NOT include events that match existing entries (even by different name)
- The event must be a real, currently active game mode
- Must have clear start/end dates or reset cycle

Return JSON:
{
  "newEvents": [
    {
      "key": "camelCaseKey (for EVENTS object, e.g. 'sonarSymphony')",
      "name": "Official Event Name",
      "subtitle": "Short subtitle or description",
      "description": "1-2 sentence description of what the event is",
      "resetType": "e.g. 'Version update', '28 days', 'Weekly (Monday)', 'Bi-weekly'",
      "color": "cyan | pink | orange | purple | yellow | emerald",
      "currentEnd": "ISO UTC date string (when the current cycle ends) or null",
      "rewards": "e.g. '800 Astrite' or primary reward description",
      "confidence": 0.0-1.0
    }
  ]
}

If no new events found, return {"newEvents": []}
Return ONLY the JSON.`;

  try {
    const response = await askClaudeFn(
      'You are a Wuthering Waves event tracker. Only identify genuinely new recurring events not already in the app. No one-time events. Return valid JSON.',
      prompt,
      { maxTokens: 2048 }
    );

    const parsed = JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    const newEvents = (parsed.newEvents || []).filter(e => {
      // Double-check it's not a duplicate by name
      if (existingNames.includes(e.name.toLowerCase())) {
        log.dim(`Skipping "${e.name}" — matches existing event by name`);
        return false;
      }
      // Check the key doesn't exist
      if (existingKeys.includes(e.key)) {
        log.dim(`Skipping "${e.name}" — key "${e.key}" already exists`);
        return false;
      }
      return true;
    });

    if (newEvents.length) {
      log.info(`Detected ${newEvents.length} new event(s): ${newEvents.map(e => e.name).join(', ')}`);
    }

    return { newEvents };
  } catch (err) {
    log.warn(`New event detection failed: ${err.message}`);
    return { newEvents: [] };
  }
}

/**
 * Add a new event to the EVENTS object in appcore-data.js.
 */
export function addNewEvent(eventData, getBufferFn, loadBufferFn) {
  const buf = getBufferFn();

  // Validate event key is a safe identifier
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(eventData.key)) {
    log.warn(`Invalid event key format: ${eventData.key}`);
    return false;
  }

  // Find the EVENTS object's closing brace using balanced brace matching
  const eventsStart = buf.indexOf('const EVENTS = {');
  if (eventsStart === -1) {
    log.warn(`Could not find EVENTS object for new event "${eventData.name}"`);
    return false;
  }

  let depth = 0;
  let closingIndex = -1;
  let inStr = false, strCh = '';
  for (let i = buf.indexOf('{', eventsStart); i < buf.length; i++) {
    const c = buf[i];
    if (inStr) {
      let bs = 0;
      for (let j = i - 1; j >= 0 && buf[j] === '\\'; j--) bs++;
      if (c === strCh && bs % 2 === 0) inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { closingIndex = i; break; }
    }
  }

  if (closingIndex === -1) {
    log.warn(`Could not find EVENTS closing brace for new event "${eventData.name}"`);
    return false;
  }

  const esc = (s) => (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const currentEnd = eventData.currentEnd ? `'${esc(eventData.currentEnd)}'` : 'null';
  const entry = `  ${eventData.key}: {\n    name: '${esc(eventData.name)}', subtitle: '${esc(eventData.subtitle)}',\n    description: '${esc(eventData.description)}',\n    resetType: '${esc(eventData.resetType)}', color: '${esc(eventData.color || 'cyan')}',\n    currentEnd: ${currentEnd},\n    rewards: '${esc(eventData.rewards)}',\n    imageUrl: '' },\n`;

  // Insert before the closing brace of EVENTS
  const newBuf = buf.slice(0, closingIndex) + entry + buf.slice(closingIndex);
  loadBufferFn(newBuf);

  log.ok(`Added new event: ${eventData.key} ("${eventData.name}")`);
  addChange('new-event', `New event: ${eventData.name}`);
  return true;
}
