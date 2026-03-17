// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Multi-Pass Audit Engine
//
// Problem: The app is ~200K tokens across 5+ files. A single Claude API call
// can only see ~30K tokens. The old audit.js sends truncated snippets,
// missing most of the codebase. Findings are shallow and incomplete.
//
// Solution: Split the codebase into semantic chunks, run each through a
// focused audit pass with a cross-file context header, then aggregate
// all findings into a single deduplicated report.
//
// Architecture:
//   1. INVENTORY  — scan all app source files, measure token sizes
//   2. CHUNK      — group by semantic domain, split large files by section
//   3. CONTEXT    — generate lightweight cross-file summaries per chunk
//   4. EXECUTE    — run each chunk through Claude (respecting rate limits)
//   5. AGGREGATE  — merge findings, deduplicate, rank by severity
//   6. REPORT     — generate a comprehensive markdown audit report
//
// Usage:
//   node index.js --mode=audit --deep    (triggers multi-pass instead of single)
//
// Or programmatically:
//   import { runMultiPassAudit } from './lib/multi-pass-audit.js';
//   const report = await runMultiPassAudit(askClaude, memory);
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { resolve, extname } from 'path';
import { PATHS, AI } from './config.js';
import { log, addChange } from './log.js';
import { buildSkillsContext } from './skills.js';
import { recordApiCall } from './run-report.js';

// ─── Constants ───────────────────────────────────────────────────────────────

// Approximate chars-per-token ratio for code (conservative estimate).
// Real ratio is ~3.5 for English prose, ~2.8 for code. We use 3.0.
const CHARS_PER_TOKEN = 3.0;

// Maximum tokens we'll send in a single API call (code + prompt + context).
// Leave headroom for the system prompt and response.
const MAX_CHUNK_TOKENS = 22000;
const MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN; // ~66K chars

// Context header budget — how much space to allocate for cross-file summaries.
const CONTEXT_HEADER_CHARS = 4000;

// Effective budget for actual code per chunk.
const CODE_BUDGET_CHARS = MAX_CHUNK_CHARS - CONTEXT_HEADER_CHARS - 6000; // 6K for prompts

// Rate limiting between API calls (ms). Respects the 30K tokens/min budget.
const INTER_CALL_DELAY_MS = Math.max(AI.rateLimitMs, 15000); // At least 15s between calls

// Maximum passes before we stop (safety valve).
const MAX_PASSES = 12;

// Output file for the aggregated report.
const REPORT_FILE = resolve(PATHS.repoRoot, 'agent/deep-audit-report.md');

// Checkpoint file for resumption after crashes.
const CHECKPOINT_FILE = resolve(PATHS.repoRoot, 'agent/.audit-checkpoint.json');

// ─── File Discovery ──────────────────────────────────────────────────────────

/**
 * Scan the app source directory and return an inventory of all files
 * with their content and token estimates.
 *
 * @returns {Array<{ path: string, name: string, content: string, chars: number, tokens: number }>}
 */
function inventoryFiles() {
  const files = [];
  const srcDir = PATHS.appSrc;

  // Primary app files (ordered by importance)
  const primaryFiles = [
    'appcore-data.js',
    'appcore-engine.js',
    'appcore-providers.jsx',
    'appcore-components.jsx',
    'App.jsx',
    'AppCore.jsx',
  ];

  for (const name of primaryFiles) {
    const fullPath = resolve(srcDir, name);
    if (!existsSync(fullPath)) continue;

    const content = readFileSync(fullPath, 'utf-8');
    files.push({
      path: fullPath,
      name,
      content,
      chars: content.length,
      tokens: Math.ceil(content.length / CHARS_PER_TOKEN),
    });
  }

  // Also check for any other .js/.jsx/.ts/.tsx files we missed
  try {
    for (const entry of readdirSync(srcDir)) {
      const ext = extname(entry);
      if (['.js', '.jsx', '.ts', '.tsx', '.css'].includes(ext) && !primaryFiles.includes(entry)) {
        const fullPath = resolve(srcDir, entry);
        const content = readFileSync(fullPath, 'utf-8');
        if (content.length > 100) { // Skip trivial files
          files.push({
            path: fullPath,
            name: entry,
            content,
            chars: content.length,
            tokens: Math.ceil(content.length / CHARS_PER_TOKEN),
          });
        }
      }
    }
  } catch { /* srcDir might not be listable */ }

  return files;
}

// ─── Section Splitter ────────────────────────────────────────────────────────

/**
 * Split a large file into named sections based on comment markers.
 * Looks for patterns like:
 *   // [SECTION:NAME]
 *   // ═══ SECTION NAME ═══
 *   // --- section name ---
 *
 * Falls back to splitting by line count if no markers found.
 *
 * @param {string} content — File content
 * @param {string} fileName — For labeling
 * @param {number} maxChars — Maximum chars per section
 * @returns {Array<{ label: string, content: string, startLine: number }>}
 */
function splitIntoSections(content, fileName, maxChars) {
  const lines = content.split('\n');
  const sections = [];

  // Try to find section markers
  const sectionStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match common section comment patterns
    const sectionMatch = line.match(
      /\/\/\s*\[SECTION:([^\]]+)\]|\/\/\s*═{3,}\s*(.+?)\s*═{3,}|\/\/\s*-{3,}\s*(.+?)\s*-{3,}/i
    );
    if (sectionMatch) {
      const label = (sectionMatch[1] || sectionMatch[2] || sectionMatch[3]).trim();
      sectionStarts.push({ line: i, label });
    }
  }

  // If we found section markers, use them
  if (sectionStarts.length >= 2) {
    for (let i = 0; i < sectionStarts.length; i++) {
      const start = sectionStarts[i].line;
      const end = i + 1 < sectionStarts.length ? sectionStarts[i + 1].line : lines.length;
      const sectionContent = lines.slice(start, end).join('\n');

      // If this section is still too large, sub-split by line count
      if (sectionContent.length > maxChars) {
        const subSections = splitByLineCount(sectionContent, `${fileName}:${sectionStarts[i].label}`, maxChars);
        sections.push(...subSections);
      } else {
        sections.push({
          label: `${fileName}:${sectionStarts[i].label}`,
          content: sectionContent,
          startLine: start + 1,
        });
      }
    }
    return sections;
  }

  // No markers found — split by line count
  return splitByLineCount(content, fileName, maxChars);
}

/**
 * Split content into chunks of approximately maxChars, breaking at
 * natural boundaries (empty lines, function boundaries).
 */
function splitByLineCount(content, label, maxChars) {
  const lines = content.split('\n');
  const sections = [];
  let currentLines = [];
  let currentChars = 0;
  let partNum = 1;
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentLines.push(line);
    currentChars += line.length + 1; // +1 for newline

    // Check if we've exceeded the budget and we're at a natural break
    if (currentChars >= maxChars) {
      // Try to find a natural break point (empty line or closing brace)
      let breakPoint = currentLines.length - 1;
      for (let j = currentLines.length - 1; j >= Math.max(0, currentLines.length - 20); j--) {
        if (currentLines[j].trim() === '' || currentLines[j].trim() === '}' || currentLines[j].trim() === '};') {
          breakPoint = j + 1;
          break;
        }
      }

      sections.push({
        label: `${label}:part${partNum}`,
        content: currentLines.slice(0, breakPoint).join('\n'),
        startLine,
      });

      // Carry over remaining lines
      const remaining = currentLines.slice(breakPoint);
      startLine += breakPoint;
      currentLines = remaining;
      currentChars = remaining.join('\n').length;
      partNum++;
    }
  }

  // Flush remaining
  if (currentLines.length > 0 && currentChars > 50) {
    sections.push({
      label: `${label}:part${partNum}`,
      content: currentLines.join('\n'),
      startLine,
    });
  }

  return sections;
}

// ─── Chunk Builder ───────────────────────────────────────────────────────────

/**
 * Build audit chunks from the file inventory.
 * Groups small files together; splits large files into sections.
 *
 * @param {Array} files — From inventoryFiles()
 * @returns {Array<{ id: number, label: string, files: string[], content: string, chars: number }>}
 */
function buildChunks(files) {
  const chunks = [];
  let chunkId = 1;

  // Separate files into "fits in one chunk" and "needs splitting"
  const small = [];
  const large = [];

  for (const file of files) {
    if (file.chars <= CODE_BUDGET_CHARS) {
      small.push(file);
    } else {
      large.push(file);
    }
  }

  // Split large files into section-based chunks
  for (const file of large) {
    const sections = splitIntoSections(file.content, file.name, CODE_BUDGET_CHARS);

    for (const section of sections) {
      chunks.push({
        id: chunkId++,
        label: section.label,
        files: [file.name],
        content: section.content,
        chars: section.content.length,
        startLine: section.startLine,
      });
    }
  }

  // Pack small files into combined chunks (bin packing)
  let currentChunk = { files: [], content: '', chars: 0 };

  for (const file of small) {
    const fileBlock = `\n// ════ FILE: ${file.name} ════\n${file.content}\n`;

    if (currentChunk.chars + fileBlock.length > CODE_BUDGET_CHARS && currentChunk.chars > 0) {
      // Flush current chunk
      chunks.push({
        id: chunkId++,
        label: currentChunk.files.join(' + '),
        files: [...currentChunk.files],
        content: currentChunk.content,
        chars: currentChunk.chars,
      });
      currentChunk = { files: [], content: '', chars: 0 };
    }

    currentChunk.files.push(file.name);
    currentChunk.content += fileBlock;
    currentChunk.chars += fileBlock.length;
  }

  // Flush remaining
  if (currentChunk.chars > 0) {
    chunks.push({
      id: chunkId++,
      label: currentChunk.files.join(' + '),
      files: [...currentChunk.files],
      content: currentChunk.content,
      chars: currentChunk.chars,
    });
  }

  return chunks;
}

// ─── Context Header Generator ────────────────────────────────────────────────

/**
 * Generate a cross-file context header for a chunk.
 * Tells the auditor what exists in OTHER files it can't currently see.
 *
 * @param {Array} allFiles — Full file inventory
 * @param {Array} chunkFileNames — Files included in this chunk
 * @returns {string} Context header text
 */
function buildContextHeader(allFiles, chunkFileNames) {
  const lines = ['═══ CROSS-FILE CONTEXT (other files not shown in this chunk) ═══\n'];
  const chunkSet = new Set(chunkFileNames);

  for (const file of allFiles) {
    if (chunkSet.has(file.name)) continue;

    // Extract exports
    const exports = [];
    const exportMatches = file.content.matchAll(/export\s+(?:const|function|class|let)\s+(\w+)/g);
    for (const m of exportMatches) exports.push(m[1]);

    // Extract named export block
    const namedExport = file.content.match(/export\s*\{([^}]+)\}/);
    if (namedExport) {
      const names = namedExport[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop().trim()).filter(Boolean);
      exports.push(...names);
    }

    // Extract key constants/shapes (first few lines of objects/arrays)
    const keyPatterns = [];
    const constMatches = file.content.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*(\{|\[|'[^']*'|"[^"]*"|\d+)/g);
    for (const m of constMatches) {
      if (m[1].length > 2 && m[1] === m[1].toUpperCase()) {
        keyPatterns.push(`${m[1]} = ${m[2].slice(0, 30)}...`);
      }
    }

    lines.push(`FILE: ${file.name} (${file.tokens} tokens)`);
    if (exports.length > 0) {
      lines.push(`  Exports: ${exports.slice(0, 20).join(', ')}${exports.length > 20 ? ` (+${exports.length - 20} more)` : ''}`);
    }
    if (keyPatterns.length > 0) {
      lines.push(`  Key constants: ${keyPatterns.slice(0, 8).join(', ')}`);
    }
    lines.push('');
  }

  // Truncate to budget
  let header = lines.join('\n');
  if (header.length > CONTEXT_HEADER_CHARS) {
    header = header.slice(0, CONTEXT_HEADER_CHARS - 20) + '\n[...truncated]';
  }

  return header;
}

// ─── Audit Prompt Builder ────────────────────────────────────────────────────

/**
 * Build the system prompt for a single audit pass.
 */
function buildSystemPrompt() {
  return `You are an expert code auditor performing a MULTI-PASS deep audit of a React gacha companion app (Wuthering Waves).

This is ONE CHUNK of a larger codebase. You are seeing a portion of the code plus a cross-file context header describing what exists in files you cannot see.

Your job: Find real, actionable issues in the code shown. Focus on:
- Bugs (logic errors, race conditions, off-by-one, NaN propagation)
- Security (XSS, prototype pollution, data leaks)
- Data integrity (state corruption, stale caches, missing validation)
- Performance (unnecessary re-renders, main thread blocking, memory leaks)
- UX (broken flows, missing error states, accessibility)
- Domain accuracy (wrong game constants, incorrect calculations)

RULES:
1. Only report issues you can SEE in the code shown. Do not speculate about code in other chunks.
2. Reference exact line numbers or variable names so findings can be located.
3. Rate each finding: CRITICAL / HIGH / MEDIUM / LOW
4. Rate your confidence: CONFIRMED (traced the code path) / LIKELY / THEORETICAL
5. For each finding, provide a concrete fix (code snippet or description).
6. Return ONLY a JSON array of findings. No commentary outside the JSON.

GAME TERMINOLOGY:
- "Resonators" not "characters", "Convenes" not "pulls", "Astrite" not "currency"
- Elements: Fusion, Electro, Aero, Glacio, Havoc, Spectro
- Hard Pity: 80, Soft Pity Start: 65, Base 5★ Rate: 0.8%

OUTPUT FORMAT:
[
  {
    "id": "CHUNK-N-001",
    "severity": "CRITICAL|HIGH|MEDIUM|LOW",
    "confidence": "CONFIRMED|LIKELY|THEORETICAL",
    "category": "bug|security|performance|ux|data|accessibility|code-quality",
    "file": "filename.jsx",
    "location": "line ~123 or functionName()",
    "title": "Short title",
    "description": "What's wrong and why it matters",
    "fix": "Concrete fix (code or description)",
    "impact": "What breaks if unfixed"
  }
]`;
}

/**
 * Build the user prompt for a single chunk.
 */
function buildChunkPrompt(chunk, contextHeader, chunkIndex, totalChunks, skillsContext) {
  return `AUDIT PASS ${chunkIndex}/${totalChunks} — Chunk: "${chunk.label}"
Files in this chunk: ${chunk.files.join(', ')}
${chunk.startLine ? `Starting at line ~${chunk.startLine}` : ''}

${contextHeader}

${skillsContext ? `═══ AUDIT FRAMEWORK (condensed) ═══\n${skillsContext.slice(0, 3000)}\n` : ''}

═══ CODE TO AUDIT ═══
${chunk.content}

Return the JSON array of findings. If no issues found, return [].`;
}

// ─── Finding Deduplication ───────────────────────────────────────────────────

/**
 * Deduplicate findings from multiple passes.
 * Two findings are considered duplicates if they reference the same
 * file + similar location + similar title.
 */
function deduplicateFindings(allFindings) {
  const unique = [];
  const seen = new Set();

  // Sort by severity (CRITICAL first) so we keep the highest-severity version
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  allFindings.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  for (const finding of allFindings) {
    // Build a dedup key from file + normalized title
    const normalizedTitle = (finding.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .slice(0, 60);
    const key = `${finding.file || ''}::${normalizedTitle}`;

    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(finding);
  }

  return unique;
}

// ─── Response Parser ─────────────────────────────────────────────────────────

function parseAuditFindings(text, chunkId) {
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

    // Find the JSON array
    const startBracket = cleaned.indexOf('[');
    const endBracket = cleaned.lastIndexOf(']');
    if (startBracket === -1 || endBracket === -1) return [];

    const parsed = JSON.parse(cleaned.slice(startBracket, endBracket + 1));
    if (!Array.isArray(parsed)) return [];

    // Validate and normalize each finding
    return parsed.filter(f => f.title && f.description).map((f, i) => ({
      id: f.id || `C${chunkId}-${String(i + 1).padStart(3, '0')}`,
      severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(f.severity) ? f.severity : 'MEDIUM',
      confidence: ['CONFIRMED', 'LIKELY', 'THEORETICAL'].includes(f.confidence) ? f.confidence : 'LIKELY',
      category: f.category || 'code-quality',
      file: f.file || 'unknown',
      location: f.location || '',
      title: f.title,
      description: f.description,
      fix: f.fix || '',
      impact: f.impact || '',
      chunkId,
    }));
  } catch (err) {
    log.warn(`Failed to parse findings from chunk ${chunkId}: ${err.message}`);
    return [];
  }
}

// ─── Checkpoint (crash recovery) ─────────────────────────────────────────────

function saveCheckpoint(state) {
  try {
    writeFileSync(CHECKPOINT_FILE, JSON.stringify(state, null, 2));
  } catch { /* non-critical */ }
}

function loadCheckpoint() {
  try {
    if (existsSync(CHECKPOINT_FILE)) {
      return JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
    }
  } catch { /* corrupted — start fresh */ }
  return null;
}

function clearAuditCheckpoint() {
  try {
    if (existsSync(CHECKPOINT_FILE)) unlinkSync(CHECKPOINT_FILE);
  } catch { /* non-critical */ }
}

// ─── Report Generator ────────────────────────────────────────────────────────

function generateAuditReport(findings, chunks, startTime) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const now = new Date().toISOString();

  const bySeverity = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
  for (const f of findings) {
    (bySeverity[f.severity] || bySeverity.LOW).push(f);
  }

  const byCategory = {};
  for (const f of findings) {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  }

  const lines = [
    `# Deep Audit Report — Whispering Wishes`,
    ``,
    `*Generated: ${now} | Duration: ${duration}s | Chunks: ${chunks.length} | Findings: ${findings.length}*`,
    ``,
    `## Summary`,
    ``,
    `| Severity | Count |`,
    `|----------|-------|`,
    `| CRITICAL | ${bySeverity.CRITICAL.length} |`,
    `| HIGH | ${bySeverity.HIGH.length} |`,
    `| MEDIUM | ${bySeverity.MEDIUM.length} |`,
    `| LOW | ${bySeverity.LOW.length} |`,
    ``,
    `| Category | Count |`,
    `|----------|-------|`,
    ...Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)
      .map(([cat, items]) => `| ${cat} | ${items.length} |`),
    ``,
    `## Chunks Audited`,
    ``,
    `| # | Label | Files | Size |`,
    `|---|-------|-------|------|`,
    ...chunks.map(c => `| ${c.id} | ${c.label} | ${c.files.join(', ')} | ${(c.chars / 1024).toFixed(1)}KB |`),
    ``,
  ];

  // Findings by severity (CRITICAL and HIGH first, with full detail)
  for (const severity of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
    const items = bySeverity[severity];
    if (items.length === 0) continue;

    lines.push(`## ${severity} (${items.length})`);
    lines.push('');

    for (const f of items) {
      lines.push(`### ${f.id}: ${f.title}`);
      lines.push('');
      lines.push(`- **File:** ${f.file} ${f.location ? `(${f.location})` : ''}`);
      lines.push(`- **Category:** ${f.category} | **Confidence:** ${f.confidence}`);
      lines.push(`- **Description:** ${f.description}`);
      if (f.fix) lines.push(`- **Fix:** ${f.fix}`);
      if (f.impact) lines.push(`- **Impact:** ${f.impact}`);
      lines.push('');
    }
  }

  lines.push(`---`);
  lines.push(`*Generated by WW Update Agent — Multi-Pass Audit Engine*`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Run a multi-pass deep audit of the entire app codebase.
 *
 * @param {Function} askClaudeFn — The Claude API wrapper from ai.js
 * @param {Object} memory — Agent persistent memory
 * @param {Object} [options]
 * @param {boolean} [options.resume=true] — Resume from checkpoint if available
 * @returns {{ findings: Array, report: string, chunks: number, passes: number }}
 */
export async function runMultiPassAudit(askClaudeFn, memory, { resume = true } = {}) {
  const startTime = Date.now();
  log.section('MULTI-PASS DEEP AUDIT');

  // 1. Inventory
  log.info('Scanning app source files...');
  const files = inventoryFiles();
  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);
  log.info(`Found ${files.length} files, ~${totalTokens.toLocaleString()} tokens total`);

  for (const f of files) {
    log.dim(`  ${f.name}: ${f.tokens.toLocaleString()} tokens (${(f.chars / 1024).toFixed(1)}KB)`);
  }

  // 2. Build chunks
  const chunks = buildChunks(files);
  log.info(`Split into ${chunks.length} audit chunks (budget: ${(CODE_BUDGET_CHARS / 1024).toFixed(0)}KB each)`);

  for (const c of chunks) {
    log.dim(`  Chunk ${c.id}: ${c.label} (${(c.chars / 1024).toFixed(1)}KB)`);
  }

  if (chunks.length > MAX_PASSES) {
    log.warn(`${chunks.length} chunks exceeds max ${MAX_PASSES} — will audit first ${MAX_PASSES}`);
  }

  // 3. Check for resumption
  let completedChunks = new Set();
  let allFindings = [];
  const checkpoint = resume ? loadCheckpoint() : null;

  if (checkpoint && checkpoint.completedChunks?.length > 0) {
    completedChunks = new Set(checkpoint.completedChunks);
    allFindings = checkpoint.findings || [];
    log.info(`Resuming from checkpoint: ${completedChunks.size}/${chunks.length} chunks already done`);
  }

  // 4. Load skills context (once)
  const skillsContext = buildSkillsContext('full');

  // 5. Execute each chunk
  const systemPrompt = buildSystemPrompt();
  const passesToRun = Math.min(chunks.length, MAX_PASSES);

  for (let i = 0; i < passesToRun; i++) {
    const chunk = chunks[i];

    // Skip if already completed (resumption)
    if (completedChunks.has(chunk.id)) {
      log.dim(`  Chunk ${chunk.id} already audited — skipping`);
      continue;
    }

    log.info(`Auditing chunk ${chunk.id}/${passesToRun}: ${chunk.label}...`);

    // Build context header (what's in OTHER chunks)
    const contextHeader = buildContextHeader(files, chunk.files);

    // Build the prompt
    const userPrompt = buildChunkPrompt(chunk, contextHeader, chunk.id, passesToRun, skillsContext);

    try {
      const response = await askClaudeFn(systemPrompt, userPrompt, { maxTokens: 8192 });

      // Parse findings
      const findings = parseAuditFindings(response, chunk.id);
      allFindings.push(...findings);

      log.ok(`  Chunk ${chunk.id}: ${findings.length} finding(s)`);

      // Record API call for cost tracking
      try {
        recordApiCall('multi-pass-audit', userPrompt.length / CHARS_PER_TOKEN, response.length / CHARS_PER_TOKEN);
      } catch { /* non-critical */ }

      // Update checkpoint
      completedChunks.add(chunk.id);
      saveCheckpoint({ completedChunks: [...completedChunks], findings: allFindings });

    } catch (err) {
      log.error(`  Chunk ${chunk.id} failed: ${err.message}`);
      // Save checkpoint so we can resume
      saveCheckpoint({ completedChunks: [...completedChunks], findings: allFindings });
    }

    // Rate limit delay (skip after last chunk)
    if (i < passesToRun - 1) {
      log.dim(`  Waiting ${(INTER_CALL_DELAY_MS / 1000).toFixed(0)}s (rate limit)...`);
      await sleep(INTER_CALL_DELAY_MS);
    }
  }

  // 6. Deduplicate and rank
  log.info(`Aggregating ${allFindings.length} raw findings...`);
  const deduplicated = deduplicateFindings(allFindings);
  log.ok(`Deduplicated: ${allFindings.length} → ${deduplicated.length} unique findings`);

  // 7. Generate report
  const report = generateAuditReport(deduplicated, chunks, startTime);

  try {
    writeFileSync(REPORT_FILE, report);
    log.ok(`Report written to ${REPORT_FILE}`);
  } catch (err) {
    log.warn(`Could not write report: ${err.message}`);
  }

  // Clean up checkpoint on success
  clearAuditCheckpoint();

  // Record in memory
  if (memory) {
    if (!memory.deepAudits) memory.deepAudits = [];
    memory.deepAudits.push({
      timestamp: new Date().toISOString(),
      chunks: chunks.length,
      passes: completedChunks.size,
      rawFindings: allFindings.length,
      uniqueFindings: deduplicated.length,
      critical: deduplicated.filter(f => f.severity === 'CRITICAL').length,
      high: deduplicated.filter(f => f.severity === 'HIGH').length,
      durationMs: Date.now() - startTime,
    });
    // Keep last 10
    if (memory.deepAudits.length > 10) {
      memory.deepAudits = memory.deepAudits.slice(-10);
    }
  }

  addChange('deep-audit', `Multi-pass audit: ${deduplicated.length} findings (${deduplicated.filter(f => f.severity === 'CRITICAL').length} critical)`);

  log.section('AUDIT COMPLETE');
  log.ok(`${deduplicated.length} findings: ${deduplicated.filter(f => f.severity === 'CRITICAL').length} critical, ${deduplicated.filter(f => f.severity === 'HIGH').length} high`);

  return {
    findings: deduplicated,
    report,
    chunks: chunks.length,
    passes: completedChunks.size,
  };
}
