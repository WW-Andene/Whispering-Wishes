// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Health Checker
//
// Verifies external image URLs (ibb.co, etc.) are still alive.
// REPORT ONLY — logs broken links for human review.
//
// IMPORTANT: Dead URLs are NEVER auto-replaced. All 267+ existing images
// are human-curated. If an image goes dead, the human creator needs to
// re-upload their original artwork. The agent cannot recreate custom art.
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Extract all external image URLs from appcore-data.js source.
 */
export function extractImageUrls(source) {
  const urls = new Set();
  const matches = source.matchAll(/https?:\/\/[^'"\s,;)]+\.(?:webp|png|jpg|jpeg|avif|gif)(?:\?[^'"\s)]*)?/gi);
  for (const m of matches) {
    let url = m[0].replace(/[,;]+$/, '');
    urls.add(url);
  }
  return [...urls];
}

/**
 * Check if a URL is alive (returns 200 with HEAD request).
 * Returns { url, alive, status, error? }
 */
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'WhisperingWishes-HealthCheck/1.0' },
      redirect: 'follow',
    });

    clearTimeout(timeout);
    return { url, alive: res.ok, status: res.status };
  } catch (err) {
    return { url, alive: false, status: 0, error: err.message };
  }
}

/**
 * Check a batch of URLs with rate limiting.
 * @param {string[]} urls - URLs to check
 * @param {number} concurrency - Max parallel checks
 * @returns {{ alive: string[], dead: { url, status, error? }[] }}
 */
export async function checkUrls(urls, concurrency = 5) {
  if (!urls.length) return { alive: [], dead: [] };

  log.info(`Checking ${urls.length} image URL(s)...`);
  const alive = [];
  const dead = [];

  // Process in batches
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(checkUrl));

    for (const r of results) {
      if (r.alive) {
        alive.push(r.url);
      } else {
        dead.push(r);
        log.warn(`Dead URL: ${r.url} (${r.status || r.error})`);
      }
    }

    // Brief pause between batches
    if (i + concurrency < urls.length) await sleep(500);
  }

  log.ok(`URL health: ${alive.length} alive, ${dead.length} dead out of ${urls.length}`);
  if (dead.length) {
    addChange('health', `Found ${dead.length} broken image URL(s)`);
  }

  return { alive, dead };
}

/**
 * Find which variable/entry each dead URL belongs to in appcore-data.js.
 * Returns [{ url, context, name }]
 */
export function identifyDeadUrlOwners(source, deadUrls) {
  const owners = [];

  for (const { url, status } of deadUrls) {
    // Find the line containing this URL
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lineMatch = source.match(new RegExp(`['"]([^'"]+)['"]:\\s*'${escapedUrl}'`));

    if (lineMatch) {
      owners.push({
        url,
        status,
        name: lineMatch[1],
        context: 'DEFAULT_COLLECTION_IMAGES or similar',
      });
    } else {
      // Check if it's a banner image
      const bannerMatch = source.match(new RegExp(`(\\w+Image):\\s*'${escapedUrl}'`));
      if (bannerMatch) {
        owners.push({ url, status, name: bannerMatch[1], context: 'CURRENT_BANNERS' });
      } else {
        owners.push({ url, status, name: 'unknown', context: 'unidentified' });
      }
    }
  }

  return owners;
}
