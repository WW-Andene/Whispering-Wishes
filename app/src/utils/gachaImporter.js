// ═══════════════════════════════════════════════════════════════════════════════
// Gacha Importer — Direct API fetch from WuWa gacha server
// Extracted from WuwaImporter-6.jsx.txt (utility logic only, no UI)
// ═══════════════════════════════════════════════════════════════════════════════

export const POOL_LABELS = {
  1: 'Novice',
  2: 'Featured Weapon',
  3: 'Standard Resonator',
  4: 'Standard Weapon',
  5: 'Featured Resonator',
  6: 'Beginner Resonator',
  7: 'Beginner Weapon',
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
    const gachaType = get('gacha_type');
    const lang = get('lang') ?? 'en';
    return { playerId, recordId, svrId, svrArea, resourcesId, gachaId, gachaType, lang, valid: !!(playerId), href: u.href };
  } catch {
    return { valid: false };
  }
}

/**
 * Fetch a single page from the gacha API.
 * @param {{ playerId: string, serverId: string, recordId: string, cardPoolId: string, lang: string }} params
 * @param {number} cardPoolType
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>} Array of pull records for this page
 */
async function fetchPage(params, cardPoolType, signal) {
  const FETCH_TIMEOUT = 10000;
  const body = {
    playerId: String(params.playerId),
    serverId: params.serverId || '',
    cardPoolType: Number(cardPoolType),
    cardPoolId: params.cardPoolId || '',
    languageCode: params.lang || 'en',
    recordId: params.recordId || '',
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  const mergedSignal = signal ? AbortSignal.any?.([signal, controller.signal]) ?? controller.signal : controller.signal;

  let res;
  try {
    res = await fetch('/api/gacha/record/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: mergedSignal,
    });
    clearTimeout(timeout);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw err;
    throw new Error('Network error');
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error || `HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json?.code !== 0) {
    throw new Error(json?.message || json?.msg || `API error (code ${json?.code})`);
  }

  // Return full response so caller can check for pagination metadata
  return json;
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
        recordId: parsed.recordId || recordId || '',
        cardPoolId: parsed.resourcesId || '',
        gachaType: parsed.gachaType || '',
        lang: parsed.lang || 'en',
      };
    }
  }
  return { playerId, serverId: svrId || '', recordId: recordId || '', cardPoolId: '', gachaType: '', lang: 'en' };
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
  for (const poolType of POOLS) {
    if (signal?.aborted) break;
    onProgress?.(poolType, 'fetching', 0);

    try {
      const poolItems = [];
      let endTime = '';
      let prevOldestKey = '';

      // No arbitrary page limit — paginate until API returns empty
      for (let page = 0; ; page++) {
        if (signal?.aborted) break;

        const body = {
          playerId: String(params.playerId),
          serverId: params.serverId || '',
          cardPoolType: Number(poolType),
          cardPoolId: params.cardPoolId || '',
          languageCode: params.lang || 'en',
          recordId: params.recordId || '',
        };
        if (params.gachaId) body.gachaId = String(params.gachaId);
        if (params.gachaType) body.gachaType = String(params.gachaType);
        if (endTime) body.endTime = endTime;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const mergedSignal = signal ? AbortSignal.any?.([signal, controller.signal]) ?? controller.signal : controller.signal;

        const res = await fetch('/api/gacha/record/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: mergedSignal,
        });
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json?.code !== 0) throw new Error(json?.message || `API error ${json?.code}`);

        const list = Array.isArray(json?.data) ? json.data : json?.data?.list || [];
        if (!list.length) break;

        poolItems.push(...list);
        onProgress?.(poolType, 'fetching', poolItems.length);

        // Find oldest record — use resourceId+time as key to avoid false stuck on same-timestamp batches
        const oldest = list.reduce((min, item) => item.time < min.time ? item : min, list[0]);
        const oldestKey = `${oldest?.resourceId || ''}|${oldest?.time || ''}`;
        if (!oldest?.time || oldestKey === prevOldestKey) break; // Truly stuck — same exact record
        prevOldestKey = oldestKey;
        endTime = oldest.time;

        // Safety cap at 500 pages (~5000 pulls) to prevent infinite loops
        if (page >= 500) break;

        await sleep(150);
      }

      if (poolItems.length > 0) {
        allPulls[POOL_LABELS[poolType]] = poolItems;
        total += poolItems.length;
      }
      onProgress?.(poolType, 'done', poolItems.length);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      onProgress?.(poolType, 'error', 0);
    }

    await sleep(150);
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
  const ALLOWED = ['player_id', 'record_id', 'svr_id', 'resources_id', 'gacha_id', 'gacha_type', 'lang', 'svr_area'];
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
 * Remaps Kuro API pool numbering → WuWaTracker/app numbering.
 *
 * Kuro API:      1=Novice, 2=FeatWeap, 3=StdChar, 4=StdWeap, 5=FeatChar, 6=BegChar, 7=BegWeap
 * App/WuWaTracker: 1=StdChar, 2=StdWeap, 3=FeatChar, 4=FeatWeap, 5=BegChar, 6=BegWeap, 7=Collab
 */
const API_TO_APP_POOL = { 1: 5, 2: 4, 3: 1, 4: 2, 5: 3, 6: 5, 7: 6 };

export function convertToImportFormat(fetchResult) {
  const allPulls = [];

  // Map pool labels back to API cardPoolType numbers
  const labelToApiType = {};
  for (const [type, label] of Object.entries(POOL_LABELS)) {
    labelToApiType[label] = parseInt(type, 10);
  }

  for (const [label, pulls] of Object.entries(fetchResult.pulls)) {
    const apiType = labelToApiType[label] ?? 0;
    // Remap API numbering → app/WuWaTracker numbering
    const cardPoolType = API_TO_APP_POOL[apiType] ?? apiType;
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

  // Dedup overlapping pages: max 10 items per cardPoolType+time combo
  const deduped = [];
  const timeCounts = {};
  for (const pull of allPulls) {
    const key = `${pull.cardPoolType}|${pull.time}`;
    const count = timeCounts[key] || 0;
    if (count < 10) {
      timeCounts[key] = count + 1;
      deduped.push(pull);
    }
  }

  return JSON.stringify({ pulls: deduped, uid: fetchResult.playerId || '' });
}
