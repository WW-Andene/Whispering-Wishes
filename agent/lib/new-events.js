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

  // Find the end of the EVENTS object
  const eventsEnd = buf.match(/(\n\};\s*\n\s*\/\/ \[SECTION:)/);
  if (!eventsEnd) {
    // Try alternative pattern
    const alt = buf.match(/(\n\};\s*\n\s*const (?:BANNER_HISTORY|SUBSCRIPTION))/);
    if (!alt) {
      log.warn(`Could not find EVENTS object end marker for new event "${eventData.name}"`);
      return false;
    }
  }

  const marker = (eventsEnd || buf.match(/(\n\};\s*\n\s*const (?:BANNER_HISTORY|SUBSCRIPTION))/))?.[0];
  if (!marker) return false;

  const currentEnd = eventData.currentEnd ? `'${eventData.currentEnd}'` : 'null';
  const entry = `  ${eventData.key}: {
    name: '${eventData.name}', subtitle: '${(eventData.subtitle || '').replace(/'/g, "\\'")}',
    description: '${(eventData.description || '').replace(/'/g, "\\'")}',
    resetType: '${eventData.resetType}', color: '${eventData.color || 'cyan'}',
    currentEnd: ${currentEnd},
    rewards: '${(eventData.rewards || '').replace(/'/g, "\\'")}',
    imageUrl: '' },\n`;

  const newBuf = buf.replace(marker, entry + marker);
  loadBufferFn(newBuf);

  log.ok(`Added new event: ${eventData.key} ("${eventData.name}")`);
  addChange('new-event', `New event: ${eventData.name}`);
  return true;
}
