// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Lightweight i18n system
// Usage: import { t } from '../utils/i18n.js';
//        t('calc.title')  →  "Calculate Your Odds"
//        t('calc.copies', { n: 3 })  →  "3 copies"
//
// Adding a new language:
// 1. Create locale/xx.json with the same keys as locale/en.json
// 2. Add the language to SUPPORTED_LOCALES
// 3. Strings not yet translated fall back to English automatically
//
// Migration strategy: extract strings incrementally as you touch each component.
// Wrap user-visible text in t('key') and add the key to locale/en.json.
// Hardcoded English strings continue to work — no need to extract all at once.
// ═══════════════════════════════════════════════════════════════════════════════

import en from '../locale/en.json';

const SUPPORTED_LOCALES = { en };

let currentLocale = 'en';
let strings = en;

/**
 * Set the active locale. Falls back to English for missing keys.
 * @param {string} locale - Language code (e.g., 'en', 'ja', 'zh')
 */
export const setLocale = (locale) => {
  if (SUPPORTED_LOCALES[locale]) {
    currentLocale = locale;
    strings = SUPPORTED_LOCALES[locale];
  }
};

export const getLocale = () => currentLocale;

/**
 * Translate a key. Supports dot-notation and simple {{var}} interpolation.
 * Falls back to English, then to the raw key if not found.
 *
 * @param {string} key - Dot-notation key (e.g., 'tracker.empty.resonator')
 * @param {Object} [vars] - Interpolation variables (e.g., { n: 5 })
 * @returns {string}
 */
export const t = (key, vars) => {
  let val = resolve(strings, key) ?? resolve(en, key) ?? key;
  if (vars && typeof val === 'string') {
    for (const [k, v] of Object.entries(vars)) {
      val = val.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    }
  }
  return val;
};

function resolve(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}
