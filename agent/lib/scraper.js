// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Web Scraper
// Fetches game data pages with politeness delays, retries, and text extraction
// ═══════════════════════════════════════════════════════════════════════════════

import { SCRAPER } from './config.js';
import { log } from './log.js';

// Track last fetch time per domain for politeness
const lastFetchByDomain = new Map();

const getDomain = (url) => {
  try { return new URL(url).hostname; } catch { return 'unknown'; }
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Fetch a URL with rate limiting, retries, and text extraction.
 * Returns the raw text content of the page, stripped of HTML tags for
 * efficient Claude API consumption.
 */
export async function fetchPage(url, { retries = 2, extractText = true } = {}) {
  const domain = getDomain(url);

  // Politeness delay per domain
  const lastFetch = lastFetchByDomain.get(domain) || 0;
  const elapsed = Date.now() - lastFetch;
  if (elapsed < SCRAPER.politenessDelay) {
    await sleep(SCRAPER.politenessDelay - elapsed);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      log.dim(`Fetching ${url}${attempt > 0 ? ` (retry ${attempt})` : ''}`);
      lastFetchByDomain.set(domain, Date.now());

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SCRAPER.timeout);

      const res = await fetch(url, {
        headers: {
          'User-Agent': SCRAPER.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      let content = await res.text();

      if (extractText) {
        content = htmlToText(content);
      }

      // Trim to max length for Claude consumption
      if (content.length > SCRAPER.maxContentLength) {
        content = content.slice(0, SCRAPER.maxContentLength) + '\n\n[...TRUNCATED...]';
      }

      log.ok(`Fetched ${domain} — ${(content.length / 1024).toFixed(1)}KB`);
      return { ok: true, content, url };

    } catch (err) {
      if (attempt === retries) {
        log.error(`Failed to fetch ${url}: ${err.message}`);
        return { ok: false, content: '', url, error: err.message };
      }
      log.warn(`Fetch attempt ${attempt + 1} failed for ${domain}: ${err.message}`);
      await sleep(2000 * (attempt + 1));
    }
  }
}

/**
 * Fetch multiple URLs concurrently (respecting per-domain politeness).
 * Returns array of results in the same order as input URLs.
 */
export async function fetchAll(urls) {
  // Group by domain so we can fetch different domains in parallel
  // but same-domain sequentially
  const byDomain = new Map();
  urls.forEach((url, i) => {
    const d = getDomain(url);
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d).push({ url, index: i });
  });

  const results = new Array(urls.length);

  // Fetch each domain group in parallel, but URLs within a domain sequentially
  await Promise.all(
    [...byDomain.values()].map(async (group) => {
      for (const { url, index } of group) {
        results[index] = await fetchPage(url);
      }
    })
  );

  return results;
}

/**
 * Extract readable text from HTML — strips tags, scripts, styles,
 * and excessive whitespace. Keeps text structure readable.
 */
function htmlToText(html) {
  let text = html;

  // Remove script and style blocks entirely
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert some structural tags to newlines
  text = text.replace(/<\/?(?:div|p|br|hr|h[1-6]|li|tr|td|th|table|section|article|header|footer|nav|main|blockquote|pre)[^>]*>/gi, '\n');

  // Convert links to text with URL hint
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&#\d+;/g, '');
  text = text.replace(/&\w+;/g, '');

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, ' ');        // Collapse horizontal whitespace
  text = text.replace(/\n[ \t]+/g, '\n');      // Remove leading whitespace on lines
  text = text.replace(/\n{3,}/g, '\n\n');      // Collapse triple+ newlines
  text = text.trim();

  return text;
}
