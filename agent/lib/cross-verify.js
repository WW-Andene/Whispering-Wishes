// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Cross-Verification
//
// Problem: If Game8 has a typo (wrong element, wrong date), the agent copies it.
// Solution: Extract data from each source INDEPENDENTLY, then require agreement.
//
// For each data point, the agent asks Claude to extract from each source
// separately, then compares. A value is accepted only if ≥2 of 3 sources agree.
// Disagreements are logged for review.
// ═══════════════════════════════════════════════════════════════════════════════

import { log } from './log.js';

/**
 * Cross-verify a set of extracted values from multiple sources.
 * 
 * @param {Object[]} extractions — One per source: { source: 'game8', data: {...} }
 * @param {string[]} fields — Which fields to verify (e.g. ['element', 'weapon', 'startDate'])
 * @param {number} quorum — Minimum sources that must agree (default: 2)
 * @returns {{ verified: Object, conflicts: Object[], agreement: number }}
 */
export function crossVerify(extractions, fields, quorum = 2) {
  const verified = {};
  const conflicts = [];
  let agreedCount = 0;
  let totalChecked = 0;

  for (const field of fields) {
    // Collect non-null values for this field from all sources
    const values = extractions
      .map(e => ({ source: e.source, value: getNestedValue(e.data, field) }))
      .filter(v => v.value !== null && v.value !== undefined && v.value !== '');

    if (values.length === 0) continue;
    totalChecked++;

    // Count occurrences of each value
    const counts = new Map();
    for (const { source, value } of values) {
      const key = normalize(value);
      if (!counts.has(key)) counts.set(key, { value, sources: [] });
      counts.get(key).sources.push(source);
    }

    // Find the value with highest agreement
    let bestEntry = null;
    let bestCount = 0;
    for (const [, entry] of counts) {
      if (entry.sources.length > bestCount) {
        bestCount = entry.sources.length;
        bestEntry = entry;
      }
    }

    if (bestCount >= quorum) {
      verified[field] = bestEntry.value;
      agreedCount++;
    } else {
      // Disagreement — log all values
      conflicts.push({
        field,
        values: values.map(v => ({ source: v.source, value: v.value })),
        bestValue: bestEntry?.value,
        bestCount,
        quorumNeeded: quorum,
      });
    }
  }

  const agreement = totalChecked > 0 ? agreedCount / totalChecked : 1;

  if (conflicts.length) {
    log.warn(`Cross-verification: ${agreedCount}/${totalChecked} fields agreed, ${conflicts.length} conflict(s)`);
    for (const c of conflicts) {
      log.dim(`  Conflict on "${c.field}": ${c.values.map(v => `${v.source}="${v.value}"`).join(' vs ')}`);
    }
  } else if (totalChecked > 0) {
    log.ok(`Cross-verification: ${agreedCount}/${totalChecked} fields agreed (${(agreement * 100).toFixed(0)}%)`);
  }

  return { verified, conflicts, agreement };
}

/**
 * Extract data from multiple sources independently using Claude.
 * Returns per-source extraction results.
 * 
 * @param {Object[]} sources — [{ url, content }]
 * @param {string} extractionPrompt — The prompt template. Use {SOURCE_CONTENT} as placeholder.
 * @param {Function} askClaudeFn
 * @returns {Object[]} — [{ source: 'game8.co', data: {...} }]
 */
export async function extractPerSource(sources, extractionPrompt, askClaudeFn) {
  const results = [];

  for (const source of sources) {
    const domain = getDomain(source.url);
    const prompt = extractionPrompt.replace('{SOURCE_CONTENT}', source.content.slice(0, 20000));

    try {
      const response = await askClaudeFn(
        'Extract game data from this single source. Return only valid JSON. If data is unclear or not found, use null.',
        prompt,
        { maxTokens: 2048 }
      );

      let jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const jsonMatch = jsonStr.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      const data = JSON.parse(jsonStr);
      results.push({ source: domain, data, url: source.url });
    } catch (err) {
      log.dim(`Extraction failed for ${domain}: ${err.message}`);
      results.push({ source: domain, data: {}, url: source.url });
    }
  }

  return results;
}

/**
 * Boost confidence based on cross-verification agreement.
 * Higher agreement → higher confidence.
 */
export function adjustConfidence(baseConfidence, agreement, sourceCount) {
  if (sourceCount <= 1) return baseConfidence * 0.8; // Single source penalty
  if (agreement >= 1.0) return Math.min(1.0, baseConfidence * 1.1); // Full agreement bonus
  if (agreement >= 0.66) return baseConfidence; // 2/3 agree — neutral
  return baseConfidence * 0.7; // Majority disagree — penalty
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(value) {
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(normalize).join(',');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function getNestedValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  return current;
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}
