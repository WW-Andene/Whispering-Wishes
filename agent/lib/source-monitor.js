// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Source Monitor
//
// Tracks the health of each web source over time. Detects degradation patterns
// that would otherwise go unnoticed:
//
//   1. CAPTCHA/block detection — scrape returns HTML with challenge keywords
//   2. Content shrinkage — page suddenly returns much less text than usual
//   3. Repeated failures — source consistently returns errors or empty content
//   4. Structure change — content no longer contains expected game data markers
//
// The agent already cross-verifies data from 3 sources. But if ALL sources
// degrade simultaneously (e.g. all return CAPTCHAs), cross-verify passes with
// 0 data points and the agent silently does nothing. This module catches that.
//
// Integration points:
//   - scraper.js calls recordScrapeResult() after every fetch
//   - index.js calls checkSourceHealth() at run start to warn early
//   - cross-verify.js calls shouldTrustSource() before accepting data
//   - run-report.js calls getSourceReport() for the health summary
//
// Data lives in memory.sourceHealth (persisted in .memory.json).
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';

// ─── Constants ───────────────────────────────────────────────────────────────

// Keywords indicating CAPTCHA, bot block, or anti-scrape wall.
// Checked case-insensitively against fetched content.
const BLOCK_INDICATORS = [
  'captcha',
  'cf-challenge',            // Cloudflare challenge
  'challenge-platform',      // Cloudflare turnstile
  'just a moment',           // Cloudflare interstitial
  'ray id',                  // Cloudflare ray ID (only suspicious in short pages)
  'access denied',
  'forbidden',
  'bot detected',
  'please verify you are a human',
  'enable javascript and cookies',
  'checking your browser',
  'ddos protection',
  'sucuri',                  // Sucuri WAF
  'incapsula',               // Imperva/Incapsula WAF
];

// Each source domain must contain SOME of these markers to confirm
// the page actually returned game data, not an error/redirect page.
const GAME_DATA_MARKERS = {
  'game8.co': ['wuthering waves', 'resonator', 'banner', 'convene'],
  'prydwen.gg': ['wuthering waves', 'resonator', 'tier list', 'build'],
  'fandom.com': ['wuthering waves', 'resonator', 'wiki'],
};
const DEFAULT_MARKERS = ['wuthering waves'];

const MAX_HISTORY_PER_DOMAIN = 30;   // Rolling window per domain
const MIN_HEALTHY_CONTENT_LENGTH = 2000; // Below this = likely error page
const SHRINKAGE_THRESHOLD = 0.3;     // < 30% of avg = shrinkage alert
const CONSECUTIVE_FAILURE_LIMIT = 3; // After this many → domain is degraded

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureStructure(memory) {
  if (!memory.sourceHealth) memory.sourceHealth = {};
}

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return 'unknown'; }
}

function getMarkersForDomain(domain) {
  for (const [key, markers] of Object.entries(GAME_DATA_MARKERS)) {
    if (domain.includes(key)) return markers;
  }
  return DEFAULT_MARKERS;
}

function countOccurrences(str, sub) {
  let count = 0, pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) { count++; pos += sub.length; }
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYZE — Detect problems in fetched content
// ═══════════════════════════════════════════════════════════════════════════════

function analyzeContent(domain, result) {
  const content = (result.content || '').toLowerCase();
  const analysis = { blocked: false, blockType: null, hasMarkers: false, markersFound: 0 };

  if (!result.ok || !content) return analysis;

  // 1. CAPTCHA / bot block detection
  //    Only flag as blocked if the page is short (a real article might
  //    coincidentally contain "access denied" in its body text).
  for (const indicator of BLOCK_INDICATORS) {
    if (content.includes(indicator)) {
      if (content.length < 5000 || countOccurrences(content, indicator) > 2) {
        analysis.blocked = true;
        analysis.blockType = `block:${indicator}`;
        break;
      }
    }
  }

  // 2. Game data markers — confirm the page has WuWa content
  const markers = getMarkersForDomain(domain);
  let found = 0;
  for (const marker of markers) {
    if (content.includes(marker.toLowerCase())) found++;
  }
  analysis.markersFound = found;
  analysis.hasMarkers = found >= Math.max(1, Math.floor(markers.length / 2));

  return analysis;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECORD — Called after every fetch
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record the result of a scrape attempt.
 *
 * @param {Object} memory — Agent persistent memory
 * @param {string} url — The URL that was fetched
 * @param {Object} result — { ok: boolean, content: string, error?: string }
 */
export function recordScrapeResult(memory, url, result) {
  ensureStructure(memory);
  const domain = getDomain(url);

  if (!memory.sourceHealth[domain]) {
    memory.sourceHealth[domain] = {
      history: [],
      avgContentLength: 0,
      consecutiveFailures: 0,
      lastSeen: null,
      lastOk: null,
      totalFetches: 0,
      totalOk: 0,
    };
  }

  const entry = memory.sourceHealth[domain];
  const now = new Date().toISOString();
  const contentLength = result.content?.length || 0;
  const analysis = analyzeContent(domain, result);

  const record = {
    timestamp: now,
    url,
    ok: result.ok && !analysis.blocked,
    contentLength,
    blocked: analysis.blocked,
    blockType: analysis.blockType || null,
    hasMarkers: analysis.hasMarkers,
    markersFound: analysis.markersFound,
    error: result.error || null,
  };

  // Rolling history
  entry.history.push(record);
  if (entry.history.length > MAX_HISTORY_PER_DOMAIN) {
    entry.history = entry.history.slice(-MAX_HISTORY_PER_DOMAIN);
  }

  // Counters
  entry.totalFetches++;
  entry.lastSeen = now;

  if (record.ok) {
    entry.totalOk++;
    entry.lastOk = now;
    entry.consecutiveFailures = 0;

    // Rolling average content length (successful fetches only)
    const okHistory = entry.history.filter(h => h.ok && h.contentLength > 0);
    if (okHistory.length > 0) {
      entry.avgContentLength = Math.round(
        okHistory.reduce((sum, h) => sum + h.contentLength, 0) / okHistory.length
      );
    }
  } else {
    entry.consecutiveFailures++;
  }

  // Content shrinkage detection
  if (record.ok && entry.avgContentLength > 0 && contentLength > 0) {
    const ratio = contentLength / entry.avgContentLength;
    if (ratio < SHRINKAGE_THRESHOLD) {
      record.shrinkage = true;
      record.shrinkageRatio = ratio;
      log.warn(
        `Source ${domain}: content shrinkage — ` +
        `${contentLength} chars vs avg ${entry.avgContentLength} ` +
        `(${(ratio * 100).toFixed(0)}%)`
      );
    }
  }

  // Log warnings
  if (analysis.blocked) {
    log.warn(`Source ${domain}: ${analysis.blockType} detected`);
  }
  if (!analysis.hasMarkers && record.ok && contentLength > MIN_HEALTHY_CONTENT_LENGTH) {
    log.warn(`Source ${domain}: no game data markers found — page structure may have changed`);
  }
  if (entry.consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
    log.warn(`Source ${domain}: ${entry.consecutiveFailures} consecutive failures`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST — Should we use data from this source?
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate whether a source domain should be trusted.
 *
 * @param {Object} memory — Agent persistent memory
 * @param {string} domain — Domain to check (e.g. 'game8.co')
 * @returns {{ trusted: boolean, score: number, reason: string, details: Object }}
 */
export function shouldTrustSource(memory, domain) {
  ensureStructure(memory);
  const norm = domain.replace(/^www\./, '');
  const entry = memory.sourceHealth[norm];

  if (!entry || entry.history.length === 0) {
    return { trusted: true, score: 1.0, reason: 'no history — assuming healthy', details: {} };
  }

  let score = 1.0;
  const issues = [];
  const recent = entry.history.slice(-10);

  // Factor 1: Recent success rate
  const recentOk = recent.filter(h => h.ok).length;
  const recentRate = recentOk / recent.length;
  if (recentRate < 0.5) {
    score -= 0.4;
    issues.push(`low success rate: ${(recentRate * 100).toFixed(0)}% (${recentOk}/${recent.length})`);
  } else if (recentRate < 0.8) {
    score -= 0.15;
    issues.push(`degraded success rate: ${(recentRate * 100).toFixed(0)}%`);
  }

  // Factor 2: Consecutive failures right now
  if (entry.consecutiveFailures >= CONSECUTIVE_FAILURE_LIMIT) {
    score -= 0.3;
    issues.push(`${entry.consecutiveFailures} consecutive failures`);
  }

  // Factor 3: Recent blocks (CAPTCHA/WAF)
  const recentBlocks = recent.filter(h => h.blocked).length;
  if (recentBlocks > 0) {
    score -= 0.2 * (recentBlocks / recent.length);
    const types = [...new Set(recent.filter(h => h.blocked).map(h => h.blockType))];
    issues.push(`${recentBlocks}/${recent.length} fetches blocked (${types.join(', ')})`);
  }

  // Factor 4: Missing game data markers (structural change)
  const recentNoMarkers = recent.filter(h => h.ok && !h.hasMarkers).length;
  if (recentNoMarkers > recent.length / 2) {
    score -= 0.25;
    issues.push(`${recentNoMarkers}/${recent.length} fetches missing game data markers`);
  }

  // Factor 5: Content shrinkage
  const recentShrinkage = recent.filter(h => h.shrinkage).length;
  if (recentShrinkage > 0) {
    score -= 0.15 * (recentShrinkage / recent.length);
    issues.push(`${recentShrinkage} fetches had content shrinkage`);
  }

  // Factor 6: Staleness
  if (entry.lastOk) {
    const daysSinceOk = (Date.now() - new Date(entry.lastOk).getTime()) / (24 * 3600000);
    if (daysSinceOk > 14) {
      score -= 0.2;
      issues.push(`last success was ${daysSinceOk.toFixed(0)} days ago`);
    }
  }

  score = Math.max(0, Math.min(1, score));

  return {
    trusted: score >= 0.5,
    score,
    reason: issues.length > 0 ? issues.join('; ') : 'healthy',
    details: { recentRate, consecutiveFailures: entry.consecutiveFailures, recentBlocks, recentNoMarkers, recentShrinkage },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK — Run at start of each agent cycle
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check overall source health across all tracked domains.
 * Call at run start so the agent knows early if sources are degraded.
 *
 * @param {Object} memory
 * @returns {{ healthy: boolean, degraded: string[], dead: string[], summary: string }}
 */
export function checkSourceHealth(memory) {
  ensureStructure(memory);
  const domains = Object.keys(memory.sourceHealth);

  if (domains.length === 0) {
    return { healthy: true, degraded: [], dead: [], summary: 'No source history yet' };
  }

  const healthy = [], degraded = [], dead = [];

  for (const domain of domains) {
    const trust = shouldTrustSource(memory, domain);
    if (trust.score >= 0.8) healthy.push(domain);
    else if (trust.score >= 0.5) {
      degraded.push(domain);
      log.warn(`Source degraded: ${domain} — ${trust.reason}`);
    } else {
      dead.push(domain);
      log.error(`Source DEAD: ${domain} — ${trust.reason}`);
    }
  }

  // Critical: ALL sources down = flying blind
  if (healthy.length === 0 && domains.length > 0) {
    log.error('ALL SOURCES DEGRADED — data extraction unreliable this run');
    addChange('source-health', 'All sources degraded — data extraction unreliable');
  }

  const allHealthy = degraded.length === 0 && dead.length === 0;
  const summary = allHealthy
    ? `All ${domains.length} source(s) healthy`
    : `Sources: ${healthy.length} healthy, ${degraded.length} degraded, ${dead.length} dead`;

  if (!allHealthy) log.info(`Source health: ${summary}`);

  return { healthy: allHealthy, degraded, dead, summary };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT — Markdown summary for run-report.js
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a markdown table of source health for the run report.
 */
export function getSourceReport(memory) {
  ensureStructure(memory);
  const domains = Object.keys(memory.sourceHealth);

  if (domains.length === 0) {
    return '## Source Health\n\n*No source data tracked yet.*\n';
  }

  const lines = ['## Source Health\n'];
  lines.push('| Domain | Status | Success Rate | Avg Size | Consec. Fails | Last OK |');
  lines.push('|--------|--------|-------------|----------|---------------|---------|');

  for (const domain of domains.sort()) {
    const entry = memory.sourceHealth[domain];
    const trust = shouldTrustSource(memory, domain);

    const status = trust.score >= 0.8 ? '✅ Healthy'
      : trust.score >= 0.5 ? '⚠️ Degraded' : '❌ Dead';

    const rate = entry.totalFetches > 0
      ? `${((entry.totalOk / entry.totalFetches) * 100).toFixed(0)}% (${entry.totalOk}/${entry.totalFetches})`
      : 'N/A';

    const avgSize = entry.avgContentLength > 0
      ? `${(entry.avgContentLength / 1024).toFixed(1)}KB` : 'N/A';

    const lastOk = entry.lastOk ? entry.lastOk.slice(0, 10) : 'never';

    lines.push(`| ${domain} | ${status} | ${rate} | ${avgSize} | ${entry.consecutiveFailures} | ${lastOk} |`);
  }

  // Issue details for problem sources
  const problems = domains.filter(d => shouldTrustSource(memory, d).score < 0.8);
  if (problems.length > 0) {
    lines.push('\n### Issues\n');
    for (const d of problems) {
      lines.push(`- **${d}**: ${shouldTrustSource(memory, d).reason}`);
    }
  }

  return lines.join('\n') + '\n';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE ADJUSTMENT — Scale cross-verify confidence by source health
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adjust extraction confidence based on source health.
 * Healthy source → no change. Degraded → proportionally reduced.
 *
 * @param {Object} memory
 * @param {string} url — Source URL
 * @param {number} rawConfidence — Original confidence (0-1)
 * @returns {number} Adjusted confidence (0-1)
 */
export function adjustConfidenceBySourceHealth(memory, url, rawConfidence) {
  const domain = getDomain(url);
  const trust = shouldTrustSource(memory, domain);

  if (trust.score >= 0.8) return rawConfidence;

  // Scale: rawConfidence=0.9, trust=0.6 → 0.54 (drops below auto-apply)
  const adjusted = rawConfidence * trust.score;

  if (adjusted < rawConfidence) {
    log.dim(
      `Confidence ${domain}: ${(rawConfidence * 100).toFixed(0)}% → ` +
      `${(adjusted * 100).toFixed(0)}% (source health: ${(trust.score * 100).toFixed(0)}%)`
    );
  }

  return adjusted;
}
