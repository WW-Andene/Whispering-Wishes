// ═══════════════════════════════════════════════════════════════════════════════
// Gacha Importer — Direct API fetch from WuWa gacha server
// Extracted from WuwaImporter-6.jsx.txt (utility logic only, no UI)
// ═══════════════════════════════════════════════════════════════════════════════

import { apiUrl } from './apiBase.js';

// Name normalization: maps game API / tracker names to internal names used in this app
export const IMPORT_NAME_ALIASES = {
  'The Shorekeeper': 'Shorekeeper',
  'Rover (Spectro)': 'Rover: Spectro', 'Rover (Havoc)': 'Rover: Havoc', 'Rover (Aero)': 'Rover: Aero', 'Rover (Electro)': 'Rover: Electro',
  'Rover-Spectro': 'Rover: Spectro', 'Rover-Havoc': 'Rover: Havoc', 'Rover-Aero': 'Rover: Aero', 'Rover-Electro': 'Rover: Electro',
  'Rover: Spectro (Female)': 'Rover: Spectro', 'Rover: Spectro (Male)': 'Rover: Spectro',
  'Rover: Havoc (Female)': 'Rover: Havoc', 'Rover: Havoc (Male)': 'Rover: Havoc',
  'Rover: Aero (Female)': 'Rover: Aero', 'Rover: Aero (Male)': 'Rover: Aero',
  'Rover: Electro (Female)': 'Rover: Electro', 'Rover: Electro (Male)': 'Rover: Electro',

  // French client convene-history import aliases: official French weapon names -> internal English
  // WEAPON_DATA keys. File/JSON imports (WuwaTracker exports etc.) do NOT force English like the
  // direct API fetch above does, so a French-client export carries p.name/p.resourceName as the
  // official French localized weapon name and needs to be mapped back to the internal key. Sourced
  // from WuwaTracker's own French (fr) locale name table (wuwatracker.com/fr/weapons/*), which is
  // the exact translation the pull-history exports this app imports use. Weapons whose French name
  // is identical to English (untranslated in-game, e.g. most "signature"/one-word/proper-noun names)
  // are omitted since no alias is needed. 'Skull Thrasher' is also untranslated in French.
  'Sommet verdoyant': 'Verdant Summit', 'Lame lustrée': 'Lustrous Razor', 'Émeraude éternelle': 'Emerald of Genesis',
  'Brouillard stable': 'Static Mist', "Flux de l'Abîme": 'Abyss Surges', 'Ondes cosmiques': 'Cosmic Ripples',
  'Main du marionnettiste': 'Stringmaster', 'Cycles de saisons': 'Ages of Harvest', 'Flamme rayonnée': 'Blazing Brilliance',
  'Germe de glacier': 'Rime-Draped Sprouts', 'Symphonie stellaire': 'Stellar Symphony', 'Printemps acéré': 'Red Spring',
  'La Dernière Danse': 'The Last Dance', 'Tragi-comédie': 'Tragicomedy', 'Hymne Lumineux': 'Luminous Hymn',
  'Courage Impérissable': 'Unflickering Valor', 'Murmures des Sirènes': 'Whispers of Sirens', 'Discorde': 'Discord',
  'Variation fantastique': 'Variation', 'Tailleur lunaire': 'Lunar Cutter', 'Tonnerre': 'Thunderbolt',
  'Le Fendeur': 'Overture', 'Valse en Masque': 'Waltz in Masquerade', 'Légende du Héros Ivre': 'Legend of Drunken Hero',
  'Amour en Adieu': 'Romance in Farewell', 'Fables de Sagesse': 'Fables of Wisdom', 'Méditations sur la Grâce': 'Meditations on Mercy',
  'Appel du Vide': 'Call of the Abyss', 'Ancre de Somnoire': 'Somnoire Anchor', 'Accrétion de fusion': 'Fusion Accretion',
  'Spirale céleste': 'Celestial Spiral', 'Jets relativistes': 'Relativistic Jet', 'Effondrement éternel': 'Endless Collapse',
  'Spectre en déclin': 'Waning Redshift', 'Lumineux': 'Lumingloss', 'Commando de la Conviction': 'Commando of Conviction',
  'Gardien de Jinzhou': 'Jinzhou Keeper', 'Comète éclatant': 'Comet Flare', 'Dévoisant': 'Augment',
  'Mirage creux': 'Hollow Mirage', "Main d'or": 'Stonard', "Accord d'Amity": 'Amity Accord',
  'Éclat de Nova': 'Novaburst', 'Flamme divine': 'Undying Flame', "Tailleur d'Hélios": 'Helios Cleaver',
  'Intrépide éternel': 'Dauntless Evernight', "Trace d'automne": 'Autumntrace', 'Épée #41': 'Broadblade#41',
  'Épée #18': 'Sword#18', 'Gantelets #21D': 'Gauntlets#21D', 'Amplificateur #25': 'Rectifier#25',
  'Pistolets #26': 'Pistols#26', 'Épée du Gardien': 'Guardian Sword', 'Pistolets du Gardien': 'Guardian Pistols',
  'Gantelets du Gardien': 'Guardian Gauntlets', 'Amplificateur du Gardien': 'Guardian Rectifier', 'Sabre du Gardien': 'Guardian Broadblade',
  'Épée du Voyageur': 'Sword of Voyager', 'Pistolets du Voyageur': 'Pistols of Voyager', 'Gantelets du Voyageur': 'Gauntlets of Voyager',
  'Amplificateur du Voyageur': 'Rectifier of Voyager', 'Sabre du Voyageur': 'Broadblade of Voyager', 'Épée de Nuit': 'Sword of Night',
  'Pistolets de Nuit': 'Pistols of Night', 'Gantelets de Nuit': 'Gauntlets of Night', 'Amplificateur de Nuit': 'Rectifier of Night',
  'Sabre de nuit': 'Broadblade of Night', 'Voix céleste': 'Beguiling Melody', 'Sabre Tyro': 'Tyro Sword',
  'Amplificateur Tyro': 'Tyro Rectifier', 'Gantelets Tyro': 'Tyro Gauntlets', 'Pistolets Tyro': 'Tyro Pistols',
  'Epée Tyro': 'Tyro Broadblade', 'Sabre Novice': 'Training Sword', 'Amplificateur Novice': 'Training Rectifier',
  'Gantelets Novices': 'Training Gauntlets', 'Pistolets Novices': 'Training Pistols', 'Epée Novice': 'Training Broadblade',
};

export const POOL_LABELS = {
  1: 'Featured Resonator',     // Temps limité personnages
  2: 'Featured Weapon',        // Temps limité armes
  3: 'Permanent Resonator',    // Permanent personnages
  4: 'Permanent Weapon',       // Permanent armes
  5: 'Novice',                 // Débutant
  6: 'Beginners Choice',       // Au choix des débutants
  7: 'New Start Weapon 1',     // Arme du nouveau départ 1
  8: 'New Start Weapon 2',     // Armes du nouveau départ 2
};
export const POOLS = [1, 2, 3, 4, 5, 6, 7, 8];
export const FALLBACK_API_BASE = 'https://gmserver-api.aki-game2.net/gacha/record/query';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Parse a WuWa gacha URL to extract playerId, recordId, svrId.
 * @param {string} raw - The raw URL string
 * @returns {{ playerId: string|null, recordId: string|null, svrId: string|null, lang: string, valid: boolean, href?: string }}
 */
// Rather than chase every individual glyph confusion OCR happens to produce (=/: , _/./-, etc —
// confirmed real examples of both), this recognizes each known param NAME by its distinctive
// word-parts alone and treats ANY short run of symbol noise around them as the separator/
// operator OCR mangled — then just forces the canonical 'key=' regardless of what was actually
// there. Tesseract's own output is whitelist-confined (see URL_CHAR_WHITELIST above), so
// whatever a misread character turns into, it's still one of that same small symbol set: this
// covers all of them at once instead of enumerating each. '&' is excluded from the noise class
// since it's the real param delimiter — swallowing it would eat into the NEXT param's key.
// Case-insensitive since OCR also sometimes miscapitalizes. Scoped tightly to right after one of
// these specific multi-part names, so it can't touch the scheme's own 'https://' or the
// '#/record?' fragment marker.
const OCR_PARAM_KEY_PARTS = {
  player_id: ['player', 'id'],
  svr_id: ['svr', 'id'],
  svr_area: ['svr', 'area'],
  resources_id: ['resources', 'id'],
  gacha_id: ['gacha', 'id'],
  gacha_type: ['gacha', 'type'],
  record_id: ['record', 'id'],
  lang: ['lang'],
};
// `loose` additionally tolerates the trailing "id" losing its "d" entirely (and the "=" right
// after it along with it) — e.g. "svr_i6eb2a" instead of "svr_id=6eb2a". That's scoped to only
// run on the already-isolated param string (after the hash/record split below), never on the
// full raw OCR text: a bare "i" is common enough elsewhere (e.g. "gacha/index" in the URL path)
// that matching it loosely against the whole text produces false positives.
function repairOcrParamKeys(text, { loose = false } = {}) {
  let out = text;
  for (const [canon, parts] of Object.entries(OCR_PARAM_KEY_PARTS)) {
    const fuzzyParts = loose ? parts.map((p) => (p === 'id' ? 'i[^0-9a-zA-Z&]{0,1}d?' : p)) : parts;
    // When the "d" of "id" was dropped, the "=" right after it is frequently swallowed too (the
    // whole "d=" reads as nothing), leaving the key run straight into the value with zero
    // separator chars — so under `loose` the trailing separator has to tolerate 0, not just 1-3.
    const re = new RegExp(fuzzyParts.join('[^0-9a-zA-Z&]{0,2}') + `[^0-9a-zA-Z&]{${loose ? 0 : 1},3}`, 'gi');
    out = out.replace(re, `${canon}=`);
  }
  return out;
}

export function parseGachaUrl(raw) {
  try {
    let trimmed = repairOcrParamKeys(raw.trim());
    // OCR from a live camera frame routinely picks up unrelated on-screen UI text (breadcrumbs,
    // menu labels, etc.) *before* the actual URL — strip anything before the first "http(s)://"
    // so that garbage prefix can't derail parsing below, same as a human eye would just skip it.
    const httpIdx = trimmed.search(/https?:\/\//i);
    if (httpIdx > 0) trimmed = trimmed.slice(httpIdx);
    // WuWa URLs have params after #/record? — extract them from the hash fragment. Also tolerate
    // OCR dropping the "?" entirely (e.g. "record" running straight into "svr_id=...") by falling
    // back to whatever comes after "record" once a known param key shows up.
    let paramStr = '';
    const hashIdx = trimmed.indexOf('#');
    if (hashIdx !== -1) {
      const afterHash = trimmed.slice(hashIdx + 1);
      const qIdx = afterHash.indexOf('?');
      // OCR sometimes drops the "?" itself too, leaving "record" glued straight onto the first
      // param key (e.g. "/recordsvr_id=..."). Strip a leading (optionally slash-prefixed)
      // "record" word in that case so the literal fragment marker text doesn't get treated as
      // part of the param string.
      paramStr = qIdx !== -1 ? afterHash.slice(qIdx + 1) : afterHash.replace(/^\/?record/i, '');
      // Now that the param string is isolated from the rest of the URL, it's safe to also repair
      // keys whose trailing "id" lost its "d" entirely — see repairOcrParamKeys' `loose` comment.
      paramStr = repairOcrParamKeys(paramStr, { loose: true });
    }
    // Also check normal query string as fallback
    let href = trimmed;
    try {
      href = new URL(trimmed).href;
    } catch {
      // The prefix up to the params may still be malformed (missing "?", stray chars from OCR) —
      // that's fine, we don't need a valid URL object, only the param string parsed below.
    }
    const params = new URLSearchParams(paramStr);
    const get = (...keys) => keys.map((k) => params.get(k)).find(Boolean) ?? null;
    const playerId = get('playerId', 'player_id');
    const recordId = get('recordId', 'record_id');
    const svrId = get('svr_id', 'svrId');
    const svrArea = get('svr_area');
    const resourcesId = get('resources_id');
    const gachaId = get('gacha_id');
    const gachaType = get('gacha_type');
    const lang = get('lang') ?? 'en';
    return { playerId, recordId, svrId, svrArea, resourcesId, gachaId, gachaType, lang, valid: !!(playerId), href };
  } catch {
    return { valid: false };
  }
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
async function fetchOnePage(params, poolType, signal) {
  const body = {
    playerId: String(params.playerId),
    serverId: params.serverId || '',
    cardPoolType: Number(poolType),
    cardPoolId: params.cardPoolId || '',
    // Always request English from Kuro's API, regardless of the player's own client language
    // (params.lang, taken straight from whatever the pasted Convene-history URL encodes — a French/
    // German/Chinese/etc. client sends lang=fr/de/zh/... and the API happily returns pull.name/
    // resourceName localized in that language). Every internal name-keyed lookup this app does
    // (collectionImages portraits, ALL_CHARACTERS/STANDARD_5STAR_CHARACTERS owned/50-50 checks,
    // CHARACTER_DATA/WEAPON_DATA itself) is keyed in English — IMPORT_NAME_ALIASES only normalizes
    // two English-name variants (Rover forms, "The Shorekeeper"), not real translations, so a
    // non-English import silently missed portraits AND silently broke owned-character/50-50
    // detection for every pull. Requesting English directly from the source is far more robust than
    // trying to build and maintain full name tables for every supported client language.
    languageCode: 'en',
    recordId: params.recordId || '',
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const mergedSignal = signal ? AbortSignal.any?.([signal, controller.signal]) ?? controller.signal : controller.signal;

  try {
    const res = await fetch(apiUrl('/api/gacha/record/query'), {
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
 * Fetch one pool type's full history. A single request, not a paginated loop: Kuro's
 * gacha/record/query endpoint (unlike miHoYo-style APIs) has no cursor/pagination
 * parameter and returns that pool's complete history in one response.
 */
async function fetchPool(params, poolType, signal, onProgress) {
  const fetchLog = [];

  const { list, error, rawJson } = await fetchOnePage(params, poolType, signal);

  if (error || !list.length) {
    fetchLog.push(`${error || 'empty'} (code=${rawJson?.code})`);
    return { items: [], fetchLog };
  }

  const newest = list[0]?.time || '?';
  const oldest = list[list.length - 1]?.time || '?';
  fetchLog.push(`${list.length} items (${newest} → ${oldest})`);
  onProgress?.(poolType, 'fetching', list.length);

  return { items: list, fetchLog };
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
      const { items, fetchLog } = await fetchPool(params, poolType, signal, onProgress);

      const label = POOL_LABELS[poolType] || `Pool ${poolType}`;
      if (items.length > 0) {
        allPulls[label] = items;
        total += items.length;
      }

      const fiveStars = items.filter(i => parseInt(i.qualityLevel, 10) === 5).map(i => i.name);
      debug.push({ poolType, label, count: items.length, fiveStars, fetchLog });
      onProgress?.(poolType, 'done', items.length);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      debug.push({ poolType, label: POOL_LABELS[poolType] || `Pool ${poolType}`, count: 0, error: err.message });
      onProgress?.(poolType, 'error', 0);
    }

    await sleep(150);
  }

  return { pulls: allPulls, total, debug, params };
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

// All three assets Tesseract needs (worker script, wasm core, trained data)
// are vendored under public/vendor/tesseract/ instead of the library's CDN
// defaults, so this works in the Capacitor APK with no network at all —
// same reasoning as public/vendor/tmf/ elsewhere in this app.
//
// corePath points at the plain (non-SIMD) core file directly, rather than at
// the vendor directory: passing a directory makes tesseract.js run an async
// SIMD/relaxed-SIMD feature probe inside the worker before picking a file,
// and that probe was hanging indefinitely on Android's WebView with no
// timeout anywhere in the chain — the exact "endless loading, never
// succeeds" symptom. Pointing at a specific *.wasm.js file (ends in "js")
// skips that detection path entirely; see tesseract.js's getCore.js.
const TESSERACT_VENDOR_PATH = '/vendor/tesseract';
// Worker init has to download all ~7MB of vendored assets (2.9MB traineddata + 3.9MB core +
// worker script) before it can resolve — 20s required >350KB/s sustained just to fit inside the
// window, which a slow/cellular connection routinely misses even with nothing actually broken.
// Raised so a real device on a weak connection gets a fair shot instead of always tripping the
// timeout during download.
const OCR_INIT_TIMEOUT_MS = 45000;
const OCR_RECOGNIZE_TIMEOUT_MS = 30000;

/**
 * Fire-and-forget prefetch of the vendored OCR assets. The service worker caches
 * /vendor/tesseract/* cache-first (own persistent bucket, see sw.js's OCR_CACHE), so calling
 * this as soon as the import screen mounts — well before the user taps "scan" — lets the ~7MB
 * download happen in the background with no timeout pressure, instead of racing it against
 * getOcrWorker's init timeout at the moment OCR is actually needed.
 */
export function prefetchOcrAssets() {
  ['worker.min.js', 'tesseract-core-lstm.wasm.js', 'eng.traineddata.gz'].forEach(f => {
    fetch(`${TESSERACT_VENDOR_PATH}/${f}`).catch(() => {});
  });
}

// `message` may be a function so the timeout text can include whatever's actually known at the
// moment it fires (e.g. the last progress stage reached) instead of only what was known when
// withTimeout was first called.
function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(typeof message === 'function' ? message() : message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// This scan only ever needs to read ONE thing — the Convene History URL — never free-form
// prose, so the recognizer is whitelisted down to exactly the characters that can legally
// appear in it: the scheme/host/path (letters, digits, ':', '/', '.', '-', '_', '#'), the query
// string's own structure ('?', '=', '&'), and '%' for percent-encoded octets. Every ID this app
// actually needs (svr_id, player_id, gacha_id, resources_id — record_id/lang/svr_area/gacha_type
// are read too but are secondary) is a bare 'key=value' segment that always ends at the next
// '&' or end of string, per parseGachaUrl's own param-splitting — so a whitelist this tight has
// no legitimate character to exclude, only ambiguous glyphs (quotes, spaces, CJK UI text
// elsewhere in the screenshot) it can now no longer mis-recognize a real ID character as.
const URL_CHAR_WHITELIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/?=&.#-_%';

// Lazily-created, reused Tesseract worker — avoids paying the ~10MB wasm +
// trained-data load cost more than once per session. Terminated only on
// page unload (there's no good "done forever" signal from the UI side).
// Reset to null on failure so a transient/first-run glitch doesn't
// permanently poison every retry with the same rejected promise.
// The English OCR trained-data file, base64-embedded directly into the JS bundle
// (src/data/generated/engTrainedDataBase64.js) — NOT fetched at all, not even from a
// local/bundled URL. tesseract.js's own internal langPath fetch (worker-script/index.js) is a
// bare `await fetch(fetchUrl)` with no timeout of its own, and even OUR OWN pre-fetch of it
// (fetch() against the vendored file's local URL) was still going through the same fetch/Cache
// Storage machinery already proven to hang in this environment (see sw.js's OCR_CACHE fix and
// this file's cacheMethod:'none' fix — neither alone was enough). Decoding a same-bundle base64
// string is synchronous and touches no network/storage/worker-fetch API at all, so there is
// nothing left in this step that can hang.
// Dynamically imported (not a static top-level import) so its ~3.9MB base64 string only loads
// as its own chunk when OCR actually runs, instead of bloating the bundle every visitor to the
// import screen pays for just parsing URLs.
async function getEmbeddedTrainedDataBase64() {
  const { ENG_TRAINEDDATA_GZ_BASE64 } = await import('../data/generated/engTrainedDataBase64.js');
  return ENG_TRAINEDDATA_GZ_BASE64;
}

// Builds a small bootstrap worker script (as a blob: URL) that:
//  1. Shims self.fetch so a request for eng.traineddata.gz resolves instantly, from the
//     base64 embedded in THIS bundle, with zero real network/fetch I/O.
//  2. importScripts()s the real vendored worker.min.js, completely unmodified, after that.
//
// Why not just pass langs as [{code:'eng', data: bytes}] to createWorker (the "official" way
// to hand tesseract.js pre-fetched data)? Confirmed a real bug in tesseract.js v7's own
// worker-script/index.js: its `initialize()` step rebuilds a langs string for the final
// api.Init() call via `_langs.map(l => typeof l==='string' ? l : l.data).join('+')` — for a
// {code,data} entry this uses `.data` (the raw Uint8Array) instead of `.code`, and Array.join()
// stringifies it via its default toString(), producing a garbage multi-megabyte
// comma-separated-byte-values string passed straight into the native Init() call. That's what
// was hanging at "initializing api (100%)" — language data itself loaded fully (confirmed via
// the stage tracker), but the C++/WASM init call was fed nonsense.
// Shimming fetch instead lets the worker run its completely normal, unmodified, well-tested
// code path — langs stays the plain string 'eng' the whole way through (correct for both the
// load step AND the init step) — while still never touching the network for it.
async function buildOcrWorkerScriptUrl() {
  const base64 = await getEmbeddedTrainedDataBase64();
  const bootstrap = `
self.__ENG_TRAINEDDATA_GZ_BASE64 = ${JSON.stringify(base64)};
(function () {
  var realFetch = self.fetch.bind(self);
  self.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('eng.traineddata.gz') !== -1) {
      var binary = atob(self.__ENG_TRAINEDDATA_GZ_BASE64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return Promise.resolve(new Response(bytes, { status: 200, headers: { 'Content-Type': 'application/gzip' } }));
    }
    return realFetch(input, init);
  };
})();
importScripts(${JSON.stringify(new URL(`${TESSERACT_VENDOR_PATH}/worker.min.js`, window.location.href).href)});
`;
  const blob = new Blob([bootstrap], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

let _ocrWorkerPromise = null;
async function getOcrWorker() {
  if (!_ocrWorkerPromise) {
    // Tracked so the ON-SCREEN timeout message itself can say which stage it got stuck at
    // (never started / fetching core / loading language / initializing) — devtools aren't
    // always available to read the console.log below, but the toast/error text always is.
    let lastStage = 'never started';
    _ocrWorkerPromise = withTimeout(
      (async () => {
        lastStage = 'building worker bootstrap';
        const bootstrapUrl = await buildOcrWorkerScriptUrl();
        const { createWorker } = await import('tesseract.js');
        // langs stays the plain string 'eng' — see buildOcrWorkerScriptUrl's own comment for
        // why the {code,data} object form is NOT used here despite avoiding it being the whole
        // point of the fetch shim: it triggers a real bug in tesseract.js v7's initialize().
        return createWorker('eng', undefined, {
          workerPath: bootstrapUrl,
          workerBlobURL: false, // our own bootstrap IS already the worker script; don't double-wrap it
          corePath: `${TESSERACT_VENDOR_PATH}/tesseract-core-lstm.wasm.js`,
          langPath: TESSERACT_VENDOR_PATH,
          cacheMethod: 'none',
          // tesseract.js's own init chain swallows real errors on failure (see the comment
          // below), so this progress callback is otherwise the only visibility into which stage
          // a hang actually happens at.
          logger: (m) => {
            lastStage = `${m.status} (${Math.round((m.progress || 0) * 100)}%)`;
          },
        });
      })(),
      OCR_INIT_TIMEOUT_MS,
      () => `OCR engine failed to start (timed out after ${OCR_INIT_TIMEOUT_MS / 1000}s, stuck at: ${lastStage}). Try again, or paste the URL manually.`
    ).catch(err => {
      _ocrWorkerPromise = null;
      // Logged here (not just thrown) so the real failure reason — timeout vs. an actual
      // createWorker rejection (missing/blocked asset, worker spawn failure, etc.) — is visible
      // in the console even when the caller's own catch only surfaces err.message in a toast.
      console.error('[OCR] Worker init failed:', err);
      throw err;
    });
  }
  const worker = await _ocrWorkerPromise;
  // Character whitelist applied AFTER the worker is confirmed ready, and deliberately NOT
  // awaited/allowed to block or fail worker readiness: tesseract.js's own createWorker() chain
  // has a bare `.catch(() => {})` on its internal load/init promise (see its source), which
  // silently swallows real errors and leaves the returned promise hanging forever instead of
  // rejecting — exactly the "always times out, every attempt, every platform" symptom this was
  // causing when setParameters() was awaited in that same chain. If it fails now, OCR still
  // runs (just without the whitelist) instead of never starting at all.
  worker.setParameters({
    tessedit_char_whitelist: URL_CHAR_WHITELIST,
    // SPARSE_TEXT: the screenshot is a full browser view (address bar + page content, keyboard,
    // etc.), not a tight crop of just the URL — default full-page layout analysis (AUTO) can
    // misjudge which region is actually the target line among all that other UI. SPARSE_TEXT
    // looks for text wherever it is, in no particular layout, which fits a screenshot better
    // than assuming one structured document/page.
    // SPARSE_TEXT ('11') has no guaranteed reading order, which let unrelated on-screen UI text
    // (breadcrumbs, menu labels) get interleaved with or placed before the actual URL — AUTO ('3')
    // treats the frame as one block and reads it in visual order, so the URL comes out contiguous.
    tessedit_pageseg_mode: '3',
  }).catch(err => {
    console.error('[OCR] setParameters failed (continuing without whitelist):', err);
  });
  return worker;
}

/**
 * Extract player_id, record_id, svr_id (and friends) from a screenshot of the
 * in-game Convene History URL, entirely on-device via Tesseract.js (classical
 * OCR — no AI/LLM, no network call with the image). The recognized text is
 * fed straight into parseGachaUrl(), the same regex-based parser used for a
 * manually-pasted URL, so accuracy depends only on Tesseract reading the
 * on-screen text correctly, not on any model "understanding" the screenshot.
 * @param {string} base64Image - base64-encoded JPEG image (no data: prefix)
 * @returns {Promise<{ player_id: string|null, record_id: string|null, svr_id: string|null, resources_id: string|null, gacha_id: string|null, gacha_type: string|null, lang: string|null, svr_area: string|null }>}
 */
export async function extractIdsFromImage(base64Image) {
  const worker = await getOcrWorker();
  const { data: { text } } = await withTimeout(
    worker.recognize(`data:image/jpeg;base64,${base64Image}`),
    OCR_RECOGNIZE_TIMEOUT_MS,
    'OCR timed out. Try again, or paste the URL manually.'
  );
  // Tesseract commonly inserts stray whitespace/newlines inside long
  // alphanumeric URLs — strip it all before handing off to the URL parser,
  // since a real Convene History URL never contains whitespace.
  const cleaned = text.replace(/\s+/g, '');
  const parsed = parseGachaUrl(cleaned);
  if (!parsed.valid || !parsed.playerId) {
    // Include what OCR actually read (truncated) in the error itself — without this, a bad
    // recognition is undiagnosable without devtools access, since the only other signal is
    // this exact same generic message no matter what went wrong.
    const preview = cleaned.length > 200 ? cleaned.slice(0, 200) + '…' : cleaned;
    throw new Error(`player_id not found. OCR read: "${preview || '(nothing)'}"`);
  }
  return {
    player_id: parsed.playerId,
    record_id: parsed.recordId,
    svr_id: parsed.svrId,
    resources_id: parsed.resourcesId,
    gacha_id: parsed.gachaId,
    gacha_type: parsed.gachaType,
    lang: parsed.lang,
    svr_area: parsed.svrArea,
  };
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

  const fetchLogs = (fetchResult.debug || [])
    .map(d => `\n── Pool ${d.poolType} (${d.label}) ──\n${(d.fetchLog || []).join('\n')}`)
    .join('\n');

  // Log the exact params we sent so user can verify OCR accuracy
  const paramDump = fetchResult.params ? `\n=== PARAMS SENT ===\nplayerId: ${fetchResult.params.playerId || '(empty)'}\nrecordId: ${fetchResult.params.recordId || '(empty)'}\nserverId: ${fetchResult.params.serverId || '(empty)'}\ncardPoolId: ${fetchResult.params.cardPoolId || '(empty)'}\nlang: ${fetchResult.params.lang || '(empty)'}` : '';

  return JSON.stringify({
    pulls: allPulls,
    uid: fetchResult.playerId || '',
    _diagnostic: `Total: ${allPulls.length} pulls\n${poolSummary}\n\n=== FETCH LOG ===${fetchLogs}${paramDump}`,
    _source: 'api',
  });
}
