// ═══════════════════════════════════════════════════════════════════════════════
// Gacha Importer — Direct API fetch from WuWa gacha server
// Extracted from WuwaImporter-6.jsx.txt (utility logic only, no UI)
// ═══════════════════════════════════════════════════════════════════════════════

export const POOL_LABELS = {
  1: 'Standard',
  2: 'Novice',
  3: 'Featured Resonator',
  4: 'Featured Weapon',
  5: 'Resonator (Alt)',
  6: 'Weapon (Alt)',
  7: 'Collab',
};
export const POOLS = [1, 2, 3, 4, 5, 6, 7];
export const FALLBACK_API_BASE = 'https://gmserver-api.aki-game2.net/gacha/record/query';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Parse a WuWa gacha URL to extract playerId, recordId, svrId.
 * @param {string} raw - The raw URL string
 * @returns {{ playerId: string|null, recordId: string|null, svrId: string|null, lang: string, valid: boolean, href?: string }}
 */
export function parseGachaUrl(raw) {
  try {
    const u = new URL(raw.trim());
    const get = (...keys) => keys.map((k) => u.searchParams.get(k)).find(Boolean) ?? null;
    const playerId = get('playerId', 'player_id');
    const recordId = get('recordId', 'record_id');
    const svrId = get('svr_id', 'svrId', 'svr_area');
    const lang = get('lang') ?? 'en';
    return { playerId, recordId, svrId, lang, valid: !!(playerId && recordId), href: u.href };
  } catch {
    return { valid: false };
  }
}

/**
 * Build a proxy URL to avoid CORS when fetching from the gacha API.
 * @param {string} originalUrl
 * @returns {string|null}
 */
export function toProxyUrl(originalUrl) {
  try {
    const u = new URL(originalUrl);
    const strippedPath = u.pathname.replace(/^\/gacha/, '');
    return `/api/gacha${strippedPath}${u.search}`;
  } catch {
    return null;
  }
}

/**
 * Fetch all pulls for a single card pool type, paginated.
 * @param {string} baseUrl - The base gacha API URL with playerId/recordId params
 * @param {number} cardPoolType - The pool type (1-7)
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Array>} Array of pull records
 */
export async function fetchPoolPulls(baseUrl, cardPoolType, signal) {
  const allPulls = [];
  let lastRecordId = '0';
  let hasMore = true;
  let pages = 0;
  const MAX_PAGES = 100;
  const FETCH_TIMEOUT = 10000;

  while (hasMore) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (++pages > MAX_PAGES) break;

    const u = new URL(baseUrl);
    u.searchParams.set('cardPoolType', String(cardPoolType));
    u.searchParams.set('recordId', lastRecordId);

    const proxyUrl = toProxyUrl(u.toString());
    if (!proxyUrl) throw new Error('Invalid URL.');

    let res;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      const mergedSignal = signal ? AbortSignal.any?.([signal, controller.signal]) ?? controller.signal : controller.signal;
      res = await fetch(proxyUrl, { signal: mergedSignal });
      clearTimeout(timeout);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      throw new Error('Network error');
    }

    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);

    const json = await res.json();
    if (json?.code !== 0)
      throw new Error(json?.message || `API error (code ${json?.code})`);

    const list = json?.data?.list;
    if (!list || list.length === 0) {
      hasMore = false;
    } else {
      allPulls.push(...list);
      lastRecordId = list[list.length - 1].recordId;
      await sleep(300);
    }
  }
  return allPulls;
}

/**
 * Build the base API URL from parsed IDs.
 * @param {string} rawUrl - Original URL (or empty for fallback)
 * @param {string} playerId
 * @param {string} recordId
 * @param {string} [svrId]
 * @returns {string}
 */
export function buildBaseUrl(rawUrl, playerId, recordId, svrId) {
  const usingFallback = !rawUrl.trim();
  const src = usingFallback ? FALLBACK_API_BASE : rawUrl.trim();
  const u = new URL(src);
  if (usingFallback) {
    u.searchParams.set('player_id', playerId);
    u.searchParams.set('record_id', recordId);
    if (svrId?.trim()) u.searchParams.set('svr_id', svrId.trim());
  } else {
    u.searchParams.set('playerId', playerId);
    u.searchParams.set('recordId', recordId);
    if (svrId?.trim()) u.searchParams.set('svr_id', svrId.trim());
  }
  return u.toString();
}

/**
 * Fetch all pulls across all pool types.
 * @param {string} baseUrl
 * @param {AbortSignal} [signal]
 * @param {function} [onProgress] - Called with (poolType, status, count) for progress updates
 * @returns {Promise<{ pulls: Object, total: number }>}
 */
export async function fetchAllPools(baseUrl, signal, onProgress) {
  const allPulls = {};
  let total = 0;

  for (const poolType of POOLS) {
    if (signal?.aborted) break;
    onProgress?.(poolType, 'fetching', 0);
    try {
      const pulls = await fetchPoolPulls(baseUrl, poolType, signal);
      if (pulls.length > 0) {
        allPulls[POOL_LABELS[poolType]] = pulls;
        total += pulls.length;
      }
      onProgress?.(poolType, 'done', pulls.length);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      onProgress?.(poolType, 'error', 0);
    }
  }

  return { pulls: allPulls, total };
}

/**
 * Compress an image (File/Blob) for OCR, returns base64 string.
 * @param {File|Blob|HTMLCanvasElement} source
 * @returns {Promise<string>} base64-encoded JPEG
 */
export function compressImage(source) {
  const MAX = 1200;

  function scaleCanvas(srcCanvas) {
    let { width, height } = srcCanvas;
    if (width > MAX || height > MAX) {
      const r = Math.min(MAX / width, MAX / height);
      width = Math.round(width * r);
      height = Math.round(height * r);
    }
    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    out.getContext('2d').drawImage(srcCanvas, 0, 0, width, height);
    return out.toDataURL('image/jpeg', 0.85).split(',')[1];
  }

  if (source instanceof HTMLCanvasElement) {
    return Promise.resolve(scaleCanvas(source));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(source);
    img.onload = () => {
      const tmp = document.createElement('canvas');
      tmp.width = img.width;
      tmp.height = img.height;
      tmp.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(objUrl);
      resolve(scaleCanvas(tmp));
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Failed to load image.')); };
    img.src = objUrl;
  });
}

/**
 * Extract player_id, record_id, svr_id from a screenshot via server-side Groq Vision OCR.
 * @param {string} base64Image - base64-encoded JPEG image
 * @returns {Promise<{ player_id: string|null, record_id: string|null, svr_id: string|null }>}
 */
export async function extractIdsFromImage(base64Image) {
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `OCR failed (${res.status})`);
  }

  const raw = await res.json();
  // Validate response — only accept expected string fields
  const ids = {
    player_id: typeof raw.player_id === 'string' ? raw.player_id : null,
    record_id: typeof raw.record_id === 'string' ? raw.record_id : null,
    svr_id: typeof raw.svr_id === 'string' ? raw.svr_id : null,
  };
  if (!ids.player_id && !ids.record_id) {
    throw new Error('IDs not found — try a clearer screenshot.');
  }
  return ids;
}

/**
 * Convert raw API pull data to the format processImportData expects.
 * Maps WuWa API pool types to the app's banner categories.
 * @param {{ pulls: Object, total: number, playerId: string }} fetchResult
 * @returns {string} JSON string compatible with processImportData
 */
export function convertToImportFormat(fetchResult) {
  const allPulls = [];

  // Map pool labels back to cardPoolType numbers
  const labelToType = {};
  for (const [type, label] of Object.entries(POOL_LABELS)) {
    labelToType[label] = parseInt(type, 10);
  }

  for (const [label, pulls] of Object.entries(fetchResult.pulls)) {
    const cardPoolType = labelToType[label] ?? 0;
    for (const pull of pulls) {
      // Whitelist fields — don't spread untrusted API data
      allPulls.push({
        cardPoolType,
        qualityLevel: parseInt(pull.qualityLevel ?? pull.rarity ?? 3, 10),
        name: String(pull.name || pull.resourceName || 'Unknown'),
        time: String(pull.time || pull.createdAt || new Date().toISOString()),
        resourceId: pull.resourceId ? String(pull.resourceId) : undefined,
        resourceType: pull.resourceType ? String(pull.resourceType) : undefined,
      });
    }
  }

  // Sort by time ascending
  allPulls.sort((a, b) => new Date(a.time) - new Date(b.time));

  return JSON.stringify(allPulls);
}
