// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Run Report
//
// Generates a markdown report after each run showing:
// - API calls made, estimated tokens/cost
// - Duration
// - Changes applied
// - Health status (dead URLs, missing images)
// - Evolution activity
//
// Committed to agent/run-report.md — always shows the latest run.
// Historical data is in memory.
// ═══════════════════════════════════════════════════════════════════════════════

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './config.js';
import { getChangeLog } from './log.js';

const REPORT_FILE = resolve(PATHS.repoRoot, 'agent/run-report.md');

// Sonnet pricing per million tokens (as of early 2026)
const SONNET_INPUT_COST = 3.0;   // $/M tokens
const SONNET_OUTPUT_COST = 15.0; // $/M tokens

// Track API calls during the run
let apiCallLog = [];

/**
 * Record an API call for the report.
 */
export function recordApiCall(type, inputChars, outputChars) {
  apiCallLog.push({
    type,
    inputTokens: Math.ceil(inputChars / 4), // ~4 chars per token
    outputTokens: Math.ceil(outputChars / 4),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Generate and write the run report.
 */
export function generateReport(mode, durationMs, memory) {
  const changes = getChangeLog();
  const now = new Date();

  // Calculate costs
  const totalInputTokens = apiCallLog.reduce((s, c) => s + c.inputTokens, 0);
  const totalOutputTokens = apiCallLog.reduce((s, c) => s + c.outputTokens, 0);
  const inputCost = (totalInputTokens / 1_000_000) * SONNET_INPUT_COST;
  const outputCost = (totalOutputTokens / 1_000_000) * SONNET_OUTPUT_COST;
  const totalCost = inputCost + outputCost;

  // Historical cost tracking
  const runs = memory?.runs || [];
  const last30 = runs.slice(-30);
  const monthlyEstimate = last30.length > 0
    ? (totalCost * 30 / Math.max(1, last30.length)).toFixed(2)
    : 'N/A';

  const report = `# WW Agent — Run Report

*Generated: ${now.toISOString()}*

## Run Summary

| Metric | Value |
|--------|-------|
| Mode | **${mode.toUpperCase()}** |
| Duration | ${(durationMs / 1000).toFixed(1)}s |
| Changes applied | ${changes.length} |
| API calls | ${apiCallLog.length} |

## Cost Breakdown

| Metric | Value |
|--------|-------|
| Input tokens | ${totalInputTokens.toLocaleString()} |
| Output tokens | ${totalOutputTokens.toLocaleString()} |
| Input cost | $${inputCost.toFixed(4)} |
| Output cost | $${outputCost.toFixed(4)} |
| **This run total** | **$${totalCost.toFixed(4)}** |
| Est. monthly (30-day) | ~$${monthlyEstimate} |

### API Calls Detail

| # | Type | Input tokens | Output tokens | Est. cost |
|---|------|-------------|--------------|-----------|
${apiCallLog.map((c, i) => {
  const cost = (c.inputTokens / 1e6 * SONNET_INPUT_COST + c.outputTokens / 1e6 * SONNET_OUTPUT_COST);
  return `| ${i + 1} | ${c.type} | ${c.inputTokens.toLocaleString()} | ${c.outputTokens.toLocaleString()} | $${cost.toFixed(4)} |`;
}).join('\n')}

## Changes Applied

${changes.length ? changes.map(c => `- **[${c.category}]** ${c.description}`).join('\n') : '*No changes this run.*'}

## Health

| Metric | Value |
|--------|-------|
| Total runs | ${(memory?.runs?.length || 0) + 1} |
| Dead URLs | ${Object.values(memory?.checkedUrls || {}).filter(v => !v.alive).length} |
| Evolution patches (lifetime) | ${memory?.evolutionHistory?.length || 0} |
| Known-good commit | ${memory?.knownGoodCommit?.slice(0, 8) || 'N/A'} |

---
*Whispering Wishes Update Agent — [source](https://github.com/WW-Andene/Whispering-Wishes/tree/main/agent)*
`;

  try {
    writeFileSync(REPORT_FILE, report);
  } catch {
    // Non-critical — don't fail the run over a report
  }

  // Reset for next run
  apiCallLog.length = 0;

  return { totalCost, totalInputTokens, totalOutputTokens };
}

/**
 * Reset the call log (for testing).
 */
export function resetCallLog() {
  apiCallLog.length = 0;
}
