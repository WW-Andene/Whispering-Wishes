// ═══════════════════════════════════════════════════════════════════════════════
// Gacha Importer — Direct API fetch from WuWa gacha server
// Extracted from WuwaImporter-6.jsx.txt (utility logic only, no UI)
// ═══════════════════════════════════════════════════════════════════════════════

export const POOL_LABELS = {
  1: 'Standard Resonator',
  2: 'Standard Weapon',
  3: 'Featured Resonator',
  4: 'Featured Weapon',
  5: 'Beginner Resonator',
  6: 'Beginner Weapon',
  7: 'Beginner Collab',
  8: 'Pool 8',
  9: 'Pool 9',
  10: 'Pool 10',
};
// Scan wider range — some pool types may have been added or renumbered
export const POOLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
        gachaId: parsed.gachaId || '',
        gachaType: parsed.gachaType || '',
        svrArea: parsed.svrArea || '',
        lang: parsed.lang || 'en',
      };
    }
  }
  return { playerId, serverId: svrId || '', recordId: recordId || '', cardPoolId: '', gachaId: '', gachaType: '', svrArea: '', lang: 'en' };
}

/**
 * Fetch one page from the API. Returns { list, rawJson }.
 */
async function fetchOnePage(params, poolType, endTime, signal) {
  // cardPoolId (from URL resources_id) is required for API auth/scope
  // Do NOT send gachaId/gachaType — those restrict results to one banner
  const body = {
    playerId: String(params.playerId),
    serverId: params.serverId || '',
    cardPoolType: Number(poolType),
    cardPoolId: params.cardPoolId || '',
    languageCode: params.lang || 'en',
    recordId: params.recordId || '',
  };
  if (endTime) body.endTime = endTime;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const mergedSignal = signal ? AbortSignal.any?.([signal, controller.signal]) ?? controller.signal : controller.signal;

  try {
    const res = await fetch('/api/gacha/record/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: mergedSignal,
    });
    clearTimeout(timeout);
    if (!res.ok) return { list: [], error: `HTTP ${res.status}` };
    const json = await res.json();
    if (json?.code !== 0) return { list: [], error: json?.message || `code ${json?.code}` };
    const list = Array.isArray(json?.data) ? json.data : json?.data?.list || [];
    return { list, rawJson: json };
  } catch (err) {
    clearTimeout(timeout);
    return { list: [], error: err.message };
  }
}

/**
 * Paginate a single pool type until exhausted.
 */
const MAX_PER_POOL = 2000;

async function fetchPoolFull(params, poolType, signal, onProgress) {
  const allItems = [];
  const seen = new Set();
  const pageLog = [];

  const addItems = (list) => {
    for (const item of list) {
      // Track by position-aware key to avoid losing multi-copy pulls
      const key = `${item.time}|${item.name}|${item.qualityLevel}|${allItems.length}`;
      allItems.push(item);
    }
  };

  // Phase 1: Fetch with no endTime (current window)
  const { list: firstList, error: firstErr, rawJson } = await fetchOnePage(params, poolType, '', signal);
  if (firstErr || !firstList.length) {
    pageLog.push(`p0: ${firstErr || 'empty'} (code=${rawJson?.code})`);
    return { items: [], pageLog };
  }

  addItems(firstList);
  const newest = firstList[0]?.time || '?';
  const oldest = firstList[firstList.length - 1]?.time || '?';
  pageLog.push(`p0: ${firstList.length} items (${newest} → ${oldest})`);
  onProgress?.(poolType, 'fetching', allItems.length);

  // Phase 2: Paginate backward from the oldest record using endTime
  let endTime = oldest;
  for (let page = 1; page < 100; page++) {
    if (signal?.aborted || allItems.length >= MAX_PER_POOL) break;
    await sleep(150);

    const { list, error } = await fetchOnePage(params, poolType, endTime, signal);
    if (error || !list.length) {
      pageLog.push(`p${page}: ${error || 'empty'} at endTime=${endTime}`);
      break;
    }

    // Check if we got new data (different oldest time)
    const pageOldest = list[list.length - 1]?.time || '';
    const prevCount = allItems.length;
    addItems(list);
    pageLog.push(`p${page}: +${list.length} (total: ${allItems.length}, oldest: ${pageOldest})`);
    onProgress?.(poolType, 'fetching', allItems.length);

    if (pageOldest === endTime) break; // Stuck
    endTime = pageOldest;
  }

  // Phase 3: Force backward — jump month by month from oldest into the past
  // This tries to reach data beyond the default API window
  if (allItems.length < MAX_PER_POOL) {
    const baseDate = new Date(oldest.replace(' ', 'T') + '+00:00');
    if (!isNaN(baseDate.getTime())) {
      for (let monthsBack = 1; monthsBack <= 30; monthsBack++) {
        if (signal?.aborted || allItems.length >= MAX_PER_POOL) break;
        const jumpDate = new Date(baseDate);
        jumpDate.setMonth(jumpDate.getMonth() - monthsBack);
        const jumpTime = jumpDate.toISOString().replace('T', ' ').slice(0, 19);
        await sleep(150);

        const { list, error } = await fetchOnePage(params, poolType, jumpTime, signal);
        if (error) continue; // Skip errors, try older
        if (!list.length) continue; // Empty month, try older

        addItems(list);
        const mo = jumpDate.toISOString().slice(0, 7);
        pageLog.push(`jump ${mo}: +${list.length} (total: ${allItems.length})`);
        onProgress?.(poolType, 'fetching', allItems.length);

        // If we got data, also paginate within this time window
        let subEnd = list[list.length - 1]?.time || '';
        for (let sub = 0; sub < 20; sub++) {
          if (signal?.aborted || allItems.length >= MAX_PER_POOL) break;
          if (!subEnd) break;
          await sleep(150);
          const { list: subList } = await fetchOnePage(params, poolType, subEnd, signal);
          if (!subList.length) break;
          const subOldest = subList[subList.length - 1]?.time || '';
          if (subOldest === subEnd) break;
          addItems(subList);
          pageLog.push(`  sub: +${subList.length} (total: ${allItems.length}, oldest: ${subOldest})`);
          onProgress?.(poolType, 'fetching', allItems.length);
          subEnd = subOldest;
        }
      }
    }
  }

  // Final dedup: remove exact duplicates but keep multi-copy pulls
  // Use a counting map: same name+time can appear up to 10 times (10-pull batch)
  const dedupMap = new Map();
  const uniqueItems = [];
  for (const item of allItems) {
    const key = `${item.resourceId || item.name}|${item.time}|${item.qualityLevel}`;
    const count = dedupMap.get(key) || 0;
    // In a 10-pull, max 10 items can share the same timestamp
    // But same resourceId+time+quality is a true page overlap duplicate
    // Allow up to 10 copies of the same key (generous to avoid losing real pulls)
    if (count < 10) {
      dedupMap.set(key, count + 1);
      uniqueItems.push(item);
    }
  }

  pageLog.push(`TOTAL: ${allItems.length} raw → ${uniqueItems.length} deduped`);
  return { items: uniqueItems, pageLog };
}

/**
 * Fetch all pulls across all pool types.
 * @param {{ playerId: string, serverId: string, lang: string }} params
 * @param {AbortSignal} [signal]
 * @param {function} [onProgress] - Called with (poolType, status, count) for progress updates
 * @returns {Promise<{ pulls: Object, total: number, debug: Array }>}
 */
export async function fetchAllPools(params, signal, onProgress) {
  const allPulls = {};
  const debug = [];
  let total = 0;

  for (const poolType of POOLS) {
    if (signal?.aborted) break;
    onProgress?.(poolType, 'fetching', 0);

    try {
      const { items, pageLog } = await fetchPoolFull(params, poolType, signal, onProgress);

      const label = POOL_LABELS[poolType] || `Pool ${poolType}`;
      if (items.length > 0) {
        allPulls[label] = items;
        total += items.length;
      }

      const fiveStars = items.filter(i => parseInt(i.qualityLevel, 10) === 5).map(i => i.name);
      debug.push({ poolType, label, count: items.length, fiveStars, pageLog });
      onProgress?.(poolType, 'done', items.length);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      debug.push({ poolType, label: POOL_LABELS[poolType] || `Pool ${poolType}`, count: 0, error: err.message });
      onProgress?.(poolType, 'error', 0);
    }

    await sleep(150);
  }

  // Log diagnostic summary to console
  console.group('[Convene Import] Pool scan results');
  for (const d of debug) {
    console.log(`Pool ${d.poolType} (${d.label}): ${d.count} pulls${d.error ? ` — ERROR: ${d.error}` : ''}${d.fiveStars?.length ? ` — 5★: ${d.fiveStars.join(', ')}` : ''}`);
  }
  console.log(`Total: ${total}`);
  console.groupEnd();

  return { pulls: allPulls, total, debug };
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
 * Preserves the original API cardPoolType — processImportData handles the mapping.
 */
export function convertToImportFormat(fetchResult) {
  const allPulls = [];

  // Map pool labels back to API cardPoolType numbers
  const labelToApiType = {};
  for (const [type, label] of Object.entries(POOL_LABELS)) {
    labelToApiType[label] = parseInt(type, 10);
  }

  for (const [label, pulls] of Object.entries(fetchResult.pulls)) {
    const cardPoolType = labelToApiType[label] ?? 0;
    for (const pull of pulls) {
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

  // No dedup here — multi-copy pulls share resourceId+time and are legitimate
  // The reducer's deduplicateMerge handles dedup when merging with existing history

  // Build diagnostic log for admin panel — include page-level detail
  const diagByPool = {};
  for (const p of allPulls) {
    const pt = p.cardPoolType;
    if (!diagByPool[pt]) diagByPool[pt] = { count: 0, fiveStars: [] };
    diagByPool[pt].count++;
    if (p.qualityLevel === 5) diagByPool[pt].fiveStars.push(p.name);
  }
  const poolSummary = Object.entries(diagByPool)
    .sort(([a], [b]) => a - b)
    .map(([pt, d]) => `Pool ${pt} (${POOL_LABELS[pt] || '?'}): ${d.count} pulls${d.fiveStars.length ? ' — 5★: ' + d.fiveStars.join(', ') : ''}`)
    .join('\n');

  const pageLogs = (fetchResult.debug || [])
    .map(d => `\n── Pool ${d.poolType} (${d.label}) ──\n${(d.pageLog || []).join('\n')}`)
    .join('\n');

  return JSON.stringify({
    pulls: allPulls,
    uid: fetchResult.playerId || '',
    _diagnostic: `Total: ${allPulls.length} pulls\n${poolSummary}\n\n=== PAGE LOGS ===${pageLogs}`,
    _source: 'api',
  });
}
