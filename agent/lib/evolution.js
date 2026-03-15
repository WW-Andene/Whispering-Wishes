// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Evolution Engine
//
// The agent's self-improvement system. On each full cycle, the agent:
//
// 1. REFLECT — Analyzes its own performance (success rates, failure patterns,
//    coverage gaps, timing efficiency)
//
// 2. DIAGNOSE — Identifies what's missing or broken in its own capabilities
//    (new game features it can't handle, source sites that changed format,
//    data patterns it doesn't extract yet)
//
// 3. EVOLVE — Generates and applies patches to its OWN code:
//    - New data extraction patterns for changed source sites
//    - New source URLs when existing ones go down
//    - Improved prompts for better Claude accuracy
//    - New validation checks for new data types
//    - Configuration tuning (thresholds, timing, rate limits)
//
// 4. GROW — Plans future capabilities it can't build yet but should
//    (logged to evolution-log.md for the next full audit cycle)
//
// Safety: Evolution patches to agent code use the same confidence gating
// (≥85%) and are always committed to a separate PR for review.
// The agent NEVER modifies its own safety systems (validate.js, confidence
// thresholds, or the evolution engine itself).
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './config.js';
import { log, addChange } from './log.js';

const AGENT_DIR = resolve(PATHS.repoRoot, 'agent');
const EVOLUTION_LOG = resolve(AGENT_DIR, 'evolution-log.md');

// Files the evolution engine is ALLOWED to modify
const EVOLVABLE_FILES = [
  'lib/config.js',      // Source URLs, thresholds, timing
  'lib/ai.js',          // Prompts, extraction patterns
  'lib/scraper.js',     // Fetch logic, parsing
  'lib/images.js',      // Image finding patterns
  'lib/banner-images.js', // Banner art sources
  'lib/reader.js',      // Data extraction regex
  'lib/writer.js',      // Write operations
];

// Files the evolution engine must NEVER modify (safety invariants)
const PROTECTED_FILES = [
  'lib/validate.js',    // Integrity checks — never weaken
  'lib/memory.js',      // Memory system — never corrupt
  'lib/evolution.js',   // This file — no self-modifying the self-modifier
  'index.js',           // Orchestrator — only human-approved changes
];

/**
 * Run the evolution cycle.
 * @param {Function} askClaudeFn - Claude API function
 * @param {Object} memory - Persistent memory from memory.js
 * @param {Object} currentState - Current app state
 * @returns {Object} { patches: [], growthPlan: [] }
 */
export async function runEvolution(askClaudeFn, memory, currentState) {
  log.info('Running evolution cycle...');

  // ── 1. REFLECT — Analyze recent performance ────────────────────────────
  const reflection = buildReflection(memory);

  // ── 2. DIAGNOSE — Read own source files ────────────────────────────────
  const agentSources = {};
  for (const file of EVOLVABLE_FILES) {
    const fullPath = resolve(AGENT_DIR, file);
    if (existsSync(fullPath)) {
      agentSources[file] = readFileSync(fullPath, 'utf-8');
    }
  }

  // ── 3. EVOLVE — Ask Claude to improve the agent ───────────────────────
  const prompt = buildEvolutionPrompt(reflection, agentSources, currentState);

  try {
    const response = await askClaudeFn(EVOLUTION_SYSTEM, prompt, { maxTokens: 8192 });
    const result = parseEvolutionResponse(response);

    log.info(`Evolution: ${result.patches.length} patch(es), ${result.growthPlan.length} growth idea(s)`);

    // ── 4. GROW — Log future plans ────────────────────────────────────────
    if (result.growthPlan.length) {
      appendGrowthLog(result.growthPlan);
    }

    return result;
  } catch (err) {
    log.warn(`Evolution cycle failed: ${err.message}`);
    return { patches: [], growthPlan: [] };
  }
}

/**
 * Apply evolution patches to agent code.
 * Returns { applied: [], skipped: [] }
 */
export function applyEvolutionPatches(patches, minConfidence = 0.85) {
  const applied = [];
  const skipped = [];

  for (const patch of patches) {
    // Safety gate: never modify protected files
    if (PROTECTED_FILES.includes(patch.file)) {
      log.warn(`BLOCKED: Cannot evolve protected file ${patch.file}`);
      skipped.push({ ...patch, reason: 'protected file' });
      continue;
    }

    // Safety gate: must be in evolvable list
    if (!EVOLVABLE_FILES.includes(patch.file)) {
      log.warn(`BLOCKED: ${patch.file} is not in the evolvable file list`);
      skipped.push({ ...patch, reason: 'not evolvable' });
      continue;
    }

    if (patch.confidence < minConfidence) {
      skipped.push({ ...patch, reason: 'low confidence' });
      continue;
    }

    const fullPath = resolve(AGENT_DIR, patch.file);
    if (!existsSync(fullPath)) {
      skipped.push({ ...patch, reason: 'file not found' });
      continue;
    }

    try {
      let content = readFileSync(fullPath, 'utf-8');

      if (!content.includes(patch.oldStr)) {
        skipped.push({ ...patch, reason: 'target string not found' });
        continue;
      }

      const count = content.split(patch.oldStr).length - 1;
      if (count > 1) {
        skipped.push({ ...patch, reason: `target appears ${count} times` });
        continue;
      }

      content = content.replace(patch.oldStr, patch.newStr);
      writeFileSync(fullPath, content);

      log.ok(`Evolved: [${patch.category}] ${patch.description}`);
      addChange('evolution', patch.description);
      applied.push(patch);
    } catch (err) {
      log.error(`Evolution patch failed: ${err.message}`);
      skipped.push({ ...patch, reason: err.message });
    }
  }

  log.info(`Evolution: ${applied.length} applied, ${skipped.length} skipped`);
  return { applied, skipped };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFLECTION — Analyze own performance
// ═══════════════════════════════════════════════════════════════════════════════

function buildReflection(memory) {
  const runs = memory.runs || [];
  const failures = memory.failures || [];
  const patches = memory.patches || [];
  const deadUrls = Object.entries(memory.checkedUrls || {}).filter(([, v]) => !v.alive);

  // Calculate success metrics
  const recentRuns = runs.slice(-30);
  const totalChanges = recentRuns.reduce((s, r) => s + (r.changes || 0), 0);
  const avgChangesPerRun = recentRuns.length ? (totalChanges / recentRuns.length).toFixed(1) : 0;
  const avgDuration = recentRuns.length
    ? (recentRuns.reduce((s, r) => s + (r.durationMs || 0), 0) / recentRuns.length / 1000).toFixed(1)
    : 0;

  // Failure pattern analysis
  const failureCounts = {};
  for (const f of failures.slice(-50)) {
    const key = f.category || 'unknown';
    failureCounts[key] = (failureCounts[key] || 0) + 1;
  }

  // Mode distribution
  const modeCounts = {};
  for (const r of recentRuns) {
    modeCounts[r.mode] = (modeCounts[r.mode] || 0) + 1;
  }

  return {
    totalRuns: runs.length,
    recentRuns: recentRuns.length,
    avgChangesPerRun,
    avgDurationSec: avgDuration,
    totalPatches: patches.length,
    failurePatterns: failureCounts,
    deadUrlCount: deadUrls.length,
    modeDistribution: modeCounts,
    lastRun: runs.length ? runs[runs.length - 1] : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

const EVOLUTION_SYSTEM = `You are the self-improvement engine for the Whispering Wishes autonomous update agent. Your job is to analyze the agent's own code and performance, then generate improvements.

THE AGENT: A Node.js tool that runs on GitHub Actions to keep a Wuthering Waves companion app updated. It scrapes game data websites, uses Claude API to extract structured data, and applies code updates.

WHAT YOU CAN IMPROVE:
- Source URLs (add new sources, replace dead ones)
- AI prompts (better extraction accuracy, fewer hallucinations)
- Scraper patterns (handle new page layouts, extract more data)
- Image finding logic (better wiki image selection)
- Reader regex patterns (handle new data formats in appcore-data.js)
- Writer operations (new update types, better string replacement)
- Configuration (thresholds, timing, rate limits)

WHAT YOU MUST NEVER TOUCH:
- validate.js — integrity checks must never be weakened
- memory.js — memory system must never be corrupted
- evolution.js — you cannot modify your own evolution engine
- index.js — orchestrator changes need human approval
- Any safety threshold (autoApplyConfidence must stay ≥ 0.85)
- Any rate limiting (politeness delays, API rate limits)

RESPONSE FORMAT: Return JSON:
{
  "patches": [
    {
      "file": "lib/config.js" (must be from EVOLVABLE_FILES list),
      "category": "source-fix" | "prompt-improvement" | "pattern-upgrade" | "config-tune",
      "description": "What this change does (1 line)",
      "oldStr": "EXACT string to find in the file",
      "newStr": "Replacement string",
      "confidence": 0.0-1.0,
      "reasoning": "Why this improvement matters"
    }
  ],
  "growthPlan": [
    {
      "capability": "Name of capability",
      "description": "What it would do",
      "complexity": "low" | "medium" | "high",
      "value": "low" | "medium" | "high",
      "prerequisite": "What needs to exist first (or null)"
    }
  ]
}

Return ONLY the JSON object.`;

function buildEvolutionPrompt(reflection, agentSources, currentState) {
  const sourceSnippets = Object.entries(agentSources)
    .map(([file, content]) => `--- ${file} (${content.length} chars) ---\n${content.slice(0, 4000)}`)
    .join('\n\n');

  return `Analyze the agent's performance and source code, then suggest improvements.

═══ PERFORMANCE METRICS ═══
Total runs: ${reflection.totalRuns}
Recent runs (last 30): ${reflection.recentRuns}
Avg changes per run: ${reflection.avgChangesPerRun}
Avg duration: ${reflection.avgDurationSec}s
Total patches applied: ${reflection.totalPatches}
Dead image URLs: ${reflection.deadUrlCount}
Mode distribution: ${JSON.stringify(reflection.modeDistribution)}
Failure patterns: ${JSON.stringify(reflection.failurePatterns)}
Last run: ${reflection.lastRun ? `${reflection.lastRun.mode} at ${reflection.lastRun.timestamp} — ${reflection.lastRun.changes} changes` : 'none'}

═══ CURRENT APP STATE ═══
Version: ${currentState.appVersion}
Characters: ${currentState.characterNames.length}
Weapons: ${currentState.weaponNames.length}
Banner: v${currentState.banners?.version} p${currentState.banners?.phase}

═══ AGENT SOURCE CODE ═══
${sourceSnippets}

═══ TASK ═══
1. Identify concrete improvements to the agent's code (source URLs, prompts, patterns)
2. Suggest a growth plan for capabilities the agent should develop

Focus on:
- Are any source URLs likely outdated or returning errors? Suggest replacements.
- Are the AI prompts producing inaccurate extractions? Suggest refinements.
- Are there new Wuthering Waves data patterns the reader/writer can't handle?
- Can any configuration values be better tuned based on the performance metrics?
- What new capabilities would make the agent more autonomous?

Return the JSON object.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROWTH LOG
// ═══════════════════════════════════════════════════════════════════════════════

function appendGrowthLog(growthPlan) {
  const date = new Date().toISOString().split('T')[0];
  const entries = growthPlan.map(g =>
    `- **${g.capability}** [${g.complexity}/${g.value}]: ${g.description}${g.prerequisite ? ` (needs: ${g.prerequisite})` : ''}`
  ).join('\n');

  const section = `\n## ${date}\n\n${entries}\n`;

  let existing = '';
  if (existsSync(EVOLUTION_LOG)) {
    existing = readFileSync(EVOLUTION_LOG, 'utf-8');
  } else {
    existing = '# WW Agent — Evolution Log\n\nFuture capabilities planned by the agent\'s self-improvement system.\n';
  }

  writeFileSync(EVOLUTION_LOG, existing + section);
  log.ok(`Growth plan logged: ${growthPlan.length} idea(s)`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARSING
// ═══════════════════════════════════════════════════════════════════════════════

function parseEvolutionResponse(text) {
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const patches = (parsed.patches || []).filter(p => {
      if (!p.file || !p.oldStr || !p.newStr || !p.description) return false;
      if (PROTECTED_FILES.includes(p.file)) {
        log.warn(`Evolution blocked: attempted to modify protected file ${p.file}`);
        return false;
      }
      if (!EVOLVABLE_FILES.includes(p.file)) {
        log.warn(`Evolution blocked: ${p.file} not in evolvable list`);
        return false;
      }
      if (typeof p.confidence !== 'number') p.confidence = 0.5;
      return true;
    });

    const growthPlan = (parsed.growthPlan || []).filter(g =>
      g.capability && g.description
    );

    return { patches, growthPlan };
  } catch (err) {
    log.error(`Failed to parse evolution response: ${err.message}`);
    return { patches: [], growthPlan: [] };
  }
}
