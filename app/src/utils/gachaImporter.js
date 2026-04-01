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
    const trimmed = raw.trim();
    // WuWa URLs have params after #/record? — extract them from the hash fragment
    let paramStr = '';
    const hashIdx = trimmed.indexOf('#');
    if (hashIdx !== -1) {
      const afterHash = trimmed.slice(hashIdx + 1);
      const qIdx = afterHash.indexOf('?');
      if (qIdx !== -1) paramStr = afterHash.slice(qIdx + 1);
    }
    // Also check normal query string as fallback
    const u = new URL(trimmed);
    const params = new URLSearchParams(paramStr || u.search);
    const get = (...keys) => keys.map((k) => params.get(k)).find(Boolean) ?? null;
    const playerId = get('playerId', 'player_id');
    const recordId = get('recordId', 'record_id');
    const svrId = get('svr_id', 'svrId');
    const svrArea = get('svr_area');
    const resourcesId = get('resources_id');
    const gachaId = get('gacha_id');
    const lang = get('lang') ?? 'en';
    return { playerId, recordId, svrId, svrArea, resourcesId, gachaId, lang, valid: !!(playerId), href: u.href };
  } catch {
    return { valid: false };
  }
}

/**
 * Fetch all pulls for a single card pool type, paginated.
 * WuWa API uses POST with JSON body (not GET with query params).
 * @param {{ playerId: string, serverId: string, lang: string }} params
 * @param {number} cardPoolType - The pool type (1-7)
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Array>} Array of pull records
 */
export async function fetchPoolPulls(params, cardPoolType, signal) {
  const allPulls = [];
  let cursorRecordId = '0';
  let hasMore = true;
  let pages = 0;
  const MAX_PAGES = 100;
  const FETCH_TIMEOUT = 10000;
  let lastRawResponse = null;

  while (hasMore) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (++pages > MAX_PAGES) break;

    const body = {
      playerId: String(params.playerId),
      serverId: params.serverId || '',
      cardPoolType: cardPoolType,
      languageCode: params.lang || 'en',
      recordId: cursorRecordId,
    };

    let res;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      const mergedSignal = signal ? AbortSignal.any?.([signal, controller.signal]) ?? controller.signal : controller.signal;
      res = await fetch('/api/gacha/record/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: mergedSignal,
      });
      clearTimeout(timeout);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      throw new Error('Network error');
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    lastRawResponse = json;
    if (json?.code !== 0) {
      console.error('[fetchPoolPulls] API response:', JSON.stringify(json));
      throw new Error(json?.message || json?.msg || `API error (code ${json?.code})`);
    }

    // API may return data as array directly or nested in data.list
    const list = Array.isArray(json?.data) ? json.data : json?.data?.list;
    if (!list || list.length === 0) {
      hasMore = false;
    } else {
      allPulls.push(...list);
      cursorRecordId = list[list.length - 1].recordId || list[list.length - 1].record_id || '0';
      await sleep(300);
    }
  }
  return { pulls: allPulls, rawResponse: lastRawResponse };
}

/**
 * Build fetch params from parsed URL or manual IDs.
 * @param {string} rawUrl - Original URL (or empty for manual input)
 * @param {string} playerId
 * @param {string} recordId - Not used by API but kept for compatibility
 * @param {string} [svrId]
 * @returns {{ playerId: string, serverId: string, lang: string }}
 */
export function buildFetchParams(rawUrl, playerId, recordId, svrId) {
  if (rawUrl?.trim()) {
    const parsed = parseGachaUrl(rawUrl);
    if (parsed.valid) {
      return {
        playerId: parsed.playerId || playerId,
        serverId: parsed.svrId || svrId || '',
        cardPoolId: parsed.resourcesId || '',
        lang: parsed.lang || 'en',
      };
    }
  }
  return { playerId, serverId: svrId || '', cardPoolId: '', lang: 'en' };
}

/**
 * Fetch all pulls across all pool types.
 * @param {{ playerId: string, serverId: string, lang: string }} params
 * @param {AbortSignal} [signal]
 * @param {function} [onProgress] - Called with (poolType, status, count) for progress updates
 * @returns {Promise<{ pulls: Object, total: number }>}
 */
export async function fetchAllPools(params, signal, onProgress) {
  const allPulls = {};
  let total = 0;
  let debugFirstResponse = null;
  const debugErrors = [];

  for (const poolType of POOLS) {
    if (signal?.aborted) break;
    onProgress?.(poolType, 'fetching', 0);
    try {
      const result = await fetchPoolPulls(params, poolType, signal);
      if (!debugFirstResponse) debugFirstResponse = result.rawResponse;
      if (result.pulls.length > 0) {
        allPulls[POOL_LABELS[poolType]] = result.pulls;
        total += result.pulls.length;
      }
      onProgress?.(poolType, 'done', result.pulls.length);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      debugErrors.push(`Pool ${poolType}: ${err.message}`);
      onProgress?.(poolType, 'error', 0);
    }
  }

  return { pulls: allPulls, total, _debug: { firstResponse: debugFirstResponse, errors: debugErrors, params } };
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
    return out.toDataURL('image/jpeg', 0.7).split(',')[1];
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
  const ALLOWED = ['player_id', 'record_id', 'svr_id', 'resources_id', 'gacha_id', 'lang', 'svr_area'];
  const ids = {};
  for (const key of ALLOWED) {
    const val = raw[key];
    ids[key] = (typeof val === 'string' && val !== 'null' && val !== 'NULL' && val.trim()) ? val.trim() : null;
  }
  if (!ids.player_id) {
    throw new Error('player_id not found. Try a clearer screenshot.');
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

  return JSON.stringify({ pulls: allPulls, uid: fetchResult.playerId || '' });
}
