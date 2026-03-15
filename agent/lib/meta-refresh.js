// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Meta Refresh
//
// The game meta evolves. Characters released 6 months ago may have completely
// different best echoes, weapons, and team comps today. This module:
//
// 1. Rotates through ALL characters over time (not all at once — too expensive)
// 2. Compares current app data against latest Prydwen/Game8 builds
// 3. Updates bestWeapon, bestEchoes, teams when the meta has shifted
// 4. Tracks when each character was last refreshed (via memory)
//
// Schedule: ~5 characters per daily full cycle (full roster in ~9 days)
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';

const CHARS_PER_CYCLE = 5; // Refresh this many characters per run

/**
 * Pick which characters need a meta refresh.
 * Selects the ones least recently checked.
 */
export function selectCharactersForRefresh(allCharNames, memory) {
  const lastRefresh = memory.metaRefresh || {};

  // Sort by last refresh time (oldest first, never-refreshed first)
  const sorted = [...allCharNames].sort((a, b) => {
    const aTime = lastRefresh[a] || 0;
    const bTime = lastRefresh[b] || 0;
    return aTime - bTime;
  });

  const selected = sorted.slice(0, CHARS_PER_CYCLE);
  log.info(`Meta refresh: selected ${selected.join(', ')}`);
  return selected;
}

/**
 * Refresh build data for selected characters.
 * Returns array of updates to apply.
 */
export async function refreshCharacterBuilds(characters, currentSource, askClaudeFn, buildSources) {
  if (!characters.length || !buildSources.length) return [];

  // Extract current data for these characters
  const currentData = {};
  for (const name of characters) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`'${escaped}':\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm');
    const match = currentSource.match(pattern);
    if (match) {
      const bestWeapon = match[1].match(/bestWeapon:\s*'([^']+)'/)?.[1] || '';
      const bestEchoesMatch = match[1].match(/bestEchoes:\s*\[([^\]]+)\]/)?.[1] || '';
      const bestEchoes = [...bestEchoesMatch.matchAll(/'([^']+)'/g)].map(m => m[1]);
      const teamsMatch = match[1].match(/teams:\s*\[([^\]]+)\]/)?.[1] || '';
      const teams = [...teamsMatch.matchAll(/'([^']+)'/g)].map(m => m[1]);
      currentData[name] = { bestWeapon, bestEchoes, teams };
    }
  }

  const prompt = `Compare the current app build data for these Wuthering Waves characters against the latest meta from web sources. Only flag changes where the meta has CLEARLY shifted — not minor preference differences.

CURRENT APP DATA:
${characters.map(name => {
  const d = currentData[name];
  return d ? `${name}: weapon=${d.bestWeapon}, echoes=[${d.bestEchoes.join(', ')}], teams=[${d.teams.join(' | ')}]` : `${name}: (no data)`;
}).join('\n')}

WEB SOURCES (latest builds):
${buildSources.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content.slice(0, 12000)}`).join('\n\n')}

Return JSON:
{
  "updates": [
    {
      "name": "Character Name",
      "field": "bestWeapon" | "bestEchoes" | "teams",
      "oldValue": "current value",
      "newValue": "updated value (string for bestWeapon, array for bestEchoes/teams)",
      "reason": "Why the meta shifted (1 sentence)",
      "confidence": 0.0-1.0
    }
  ]
}

RULES:
- Only include updates where you're confident the meta has genuinely changed
- Don't update just because a source lists a slightly different team order
- bestWeapon changes are rare — only when a new weapon clearly outperforms
- bestEchoes changes happen when new echo sets are added or rebalanced
- team changes happen when new characters enable better synergies

If no updates needed, return {"updates": []}
Return ONLY the JSON.`;

  try {
    const response = await askClaudeFn(
      'You are a Wuthering Waves meta analyst. Compare current build data against latest sources. Only flag genuine meta shifts. Return valid JSON only.',
      prompt,
      { maxTokens: 4096 }
    );
    const parsed = JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    return parsed.updates || [];
  } catch (err) {
    log.warn(`Meta refresh analysis failed: ${err.message}`);
    return [];
  }
}

/**
 * Apply meta refresh updates to the write buffer.
 */
export function applyMetaUpdates(updates, getBufferFn, loadBufferFn, memory, minConfidence = 0.85) {
  let changed = false;

  for (const update of updates) {
    if (update.confidence < minConfidence) continue;

    const buf = getBufferFn();
    const escaped = update.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (update.field === 'bestWeapon' && typeof update.newValue === 'string') {
      const pattern = new RegExp(`('${escaped}':[\\s\\S]*?bestWeapon:\\s*)'[^']*'`);
      const match = buf.match(pattern);
      if (match) {
        loadBufferFn(buf.replace(match[0], `${match[1]}'${update.newValue}'`));
        addChange('meta-refresh', `${update.name} bestWeapon → ${update.newValue}`);
        changed = true;
      }
    }

    if (update.field === 'bestEchoes' && Array.isArray(update.newValue)) {
      const pattern = new RegExp(`('${escaped}':[\\s\\S]*?bestEchoes:\\s*)\\[[^\\]]*\\]`);
      const match = buf.match(pattern);
      if (match) {
        const newArr = `[${update.newValue.map(e => `'${e}'`).join(', ')}]`;
        loadBufferFn(buf.replace(match[0], `${match[1]}${newArr}`));
        addChange('meta-refresh', `${update.name} bestEchoes updated`);
        changed = true;
      }
    }

    if (update.field === 'teams' && Array.isArray(update.newValue)) {
      const pattern = new RegExp(`('${escaped}':[\\s\\S]*?teams:\\s*)\\[[^\\]]*\\]`);
      const match = buf.match(pattern);
      if (match) {
        const newArr = `[${update.newValue.map(t => `'${t}'`).join(', ')}]`;
        loadBufferFn(buf.replace(match[0], `${match[1]}${newArr}`));
        addChange('meta-refresh', `${update.name} teams updated`);
        changed = true;
      }
    }
  }

  return changed;
}

/**
 * Record which characters were refreshed in this cycle.
 */
export function recordRefresh(memory, characters) {
  if (!memory.metaRefresh) memory.metaRefresh = {};
  const now = Date.now();
  for (const name of characters) {
    memory.metaRefresh[name] = now;
  }
}
