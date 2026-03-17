// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Skills Loader
//
// Reads the three custom skill files and extracts their audit frameworks
// so the self-audit engine can follow established patterns.
//
// Skills:
//   app-audit        — 13-part exhaustive app audit (code, security, perf, UX, a11y)
//   design-aesthetic  — 21-dimension visual design audit (color, type, motion, brand)
//   scope-context     — Large-scope awareness + ambiguity resolution
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './config.js';
import { log } from './log.js';

// Skill file locations — check multiple possible paths
const SKILL_PATHS = {
  appAudit: [
    resolve(PATHS.repoRoot, 'app-audit-SKILL (1).md'),
    resolve(PATHS.repoRoot, 'docs/skills/app-audit/SKILL.md'),
  ],
  designAesthetic: [
    resolve(PATHS.repoRoot, 'design-aesthetic-audit-SKILL (1).md'),
    resolve(PATHS.repoRoot, 'docs/skills/design-aesthetic-audit/SKILL.md'),
  ],
  scopeContext: [
    resolve(PATHS.repoRoot, 'AUDIT-AESTHETIC.md'), // Contains the executed audit
  ],
};

/**
 * Load a skill file from the first existing path.
 * Returns the file content or null.
 */
function loadSkillFile(paths) {
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const content = readFileSync(p, 'utf-8');
        log.dim(`Loaded skill: ${p.split('/').pop()} (${(content.length / 1024).toFixed(0)}KB)`);
        return content;
      } catch { continue; }
    }
  }
  return null;
}

/**
 * Extract key audit rules and checklists from a skill file.
 * Returns a condensed version suitable for including in Claude prompts.
 */
function extractAuditRules(content, maxChars = 6000) {
  if (!content) return '';

  // Extract sections that contain rules, checklists, or decision frameworks
  const sections = [];

  // Find Iron Laws / governing rules
  const lawsMatch = content.match(/(?:Iron Laws|Governing Rules|RULES|CRITICAL|NON-NEGOTIABLE)([\s\S]{200,3000}?)(?=\n#|\n---|\n═)/i);
  if (lawsMatch) sections.push('RULES:\n' + lawsMatch[1].trim());

  // Find severity classifications
  const severityMatch = content.match(/(?:Severity|Classification|Priority)([\s\S]{200,2000}?)(?=\n#|\n---|\n═)/i);
  if (severityMatch) sections.push('SEVERITY:\n' + severityMatch[1].trim());

  // Find checklists and decision tables
  const checklistMatches = content.matchAll(/(?:Checklist|Protocol|Procedure|Workflow|Steps)([\s\S]{200,2000}?)(?=\n#|\n---|\n═)/gi);
  for (const m of checklistMatches) {
    sections.push(m[1].trim());
    if (sections.join('\n').length > maxChars * 0.7) break;
  }

  // Find protected elements / non-negotiables
  const protectedMatch = content.match(/(?:PROTECT|Protected|Non-negotiable|Never change|REJECT)([\s\S]{200,1500}?)(?=\n#|\n---|\n═)/i);
  if (protectedMatch) sections.push('PROTECTED:\n' + protectedMatch[1].trim());

  const result = sections.join('\n\n---\n\n');
  return result.slice(0, maxChars);
}

/**
 * Extract the design character brief and token system from the aesthetic audit.
 */
function extractDesignBrief(content, maxChars = 4000) {
  if (!content) return '';

  const sections = [];

  // Character brief
  const briefMatch = content.match(/CHARACTER BRIEF[\s\S]{0,100}?([\s\S]{200,3000}?)(?=━━━|---\n\n#)/);
  if (briefMatch) sections.push('CHARACTER BRIEF:\n' + briefMatch[1].trim());

  // Token architecture
  const tokenMatch = content.match(/CHARACTER TOKEN SET[\s\S]{0,50}?([\s\S]{200,1500}?)(?=\n\n#|\n━)/);
  if (tokenMatch) sections.push('TOKENS:\n' + tokenMatch[1].trim());

  // Protected elements
  const protectMatch = content.match(/PROTECT\n([\s\S]{100,800}?)(?=\n\s*REJECT|\n━)/);
  if (protectMatch) sections.push('PROTECT:\n' + protectMatch[1].trim());

  // Reject patterns
  const rejectMatch = content.match(/REJECT\n([\s\S]{100,500}?)(?=\n━|\n---)/);
  if (rejectMatch) sections.push('REJECT:\n' + rejectMatch[1].trim());

  // Source identity thesis
  const thesisMatch = content.match(/IDENTITY THESIS[\s\S]{0,50}?([\s\S]{200,1000}?)(?=\n━|\n---)/);
  if (thesisMatch) sections.push('IDENTITY:\n' + thesisMatch[1].trim());

  return sections.join('\n\n').slice(0, maxChars);
}

/**
 * Extract scope-awareness rules from the scope-context skill.
 */
function extractScopeRules(content, maxChars = 2000) {
  if (!content) return '';

  const sections = [];

  // Concept scaffold protocol
  const scaffoldMatch = content.match(/Concept Scaffold([\s\S]{200,1500}?)(?=\n#|\n---)/i);
  if (scaffoldMatch) sections.push('SCOPE PROTOCOL:\n' + scaffoldMatch[1].trim());

  // Verification gates
  const gateMatch = content.match(/(?:Verification|Gate|Check)([\s\S]{200,1000}?)(?=\n#|\n---)/i);
  if (gateMatch) sections.push('VERIFICATION:\n' + gateMatch[1].trim());

  return sections.join('\n\n').slice(0, maxChars);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

let _cache = null;

/**
 * Load all skills and return a condensed context object for Claude prompts.
 * Cached — only reads files once per agent run.
 */
export function loadSkills() {
  if (_cache) return _cache;

  log.info('Loading audit skills...');

  const appAuditRaw = loadSkillFile(SKILL_PATHS.appAudit);
  const designRaw = loadSkillFile(SKILL_PATHS.designAesthetic);
  const scopeRaw = loadSkillFile(SKILL_PATHS.scopeContext);
  const aestheticAuditRaw = scopeRaw; // Same file — reuse instead of reading twice

  _cache = {
    available: {
      appAudit: !!appAuditRaw,
      designAesthetic: !!designRaw,
      scopeContext: !!scopeRaw,
    },

    // Condensed extracts for Claude prompts
    appAuditRules: extractAuditRules(appAuditRaw),
    designBrief: extractDesignBrief(aestheticAuditRaw || designRaw),
    scopeRules: extractScopeRules(scopeRaw),

    // Full content (for deep audits that need the complete framework)
    full: {
      appAudit: appAuditRaw,
      designAesthetic: designRaw,
      scopeContext: scopeRaw,
    },
  };

  const loaded = Object.entries(_cache.available).filter(([, v]) => v).map(([k]) => k);
  log.ok(`Skills loaded: ${loaded.length ? loaded.join(', ') : 'none found'}`);

  return _cache;
}

/**
 * Build the skills context block for inclusion in Claude audit prompts.
 * This gives the AI the frameworks it should follow.
 */
export function buildSkillsContext(mode = 'full') {
  const skills = loadSkills();
  const parts = [];

  if (skills.designBrief) {
    parts.push(`═══ DESIGN LANGUAGE (from aesthetic audit) ═══\n${skills.designBrief}`);
  }

  if (mode === 'full' && skills.appAuditRules) {
    parts.push(`═══ APP AUDIT FRAMEWORK (condensed) ═══\n${skills.appAuditRules}`);
  }

  if (skills.scopeRules) {
    parts.push(`═══ SCOPE AWARENESS RULES ═══\n${skills.scopeRules}\n\nWhen modifying "all X" or "every Y", you MUST:\n1. Define what "X" means semantically\n2. Inventory ALL instances across ALL files\n3. Track which ones you've addressed\n4. Never declare "done" without a count match`);
  }

  if (!parts.length) {
    return '(No skill files found in repository — using built-in audit knowledge only)';
  }

  return parts.join('\n\n');
}
