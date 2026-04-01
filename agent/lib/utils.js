// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Shared Utilities
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract the domain name from a URL, stripping 'www.' prefix.
 */
export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/**
 * Sleep for the specified milliseconds.
 */
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
