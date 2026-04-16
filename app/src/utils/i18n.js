// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/i18n.js
// Lightweight i18n system + locale-aware Intl format helpers.
//
// Usage:
//        import { t, formatNumber, formatDate, setAppLocale } from '../utils/i18n.js';
//        t('calc.title')                      → "Calculate Your Odds"
//        t('calc.copies', { n: 3 })            → "3 copies"
//        formatNumber(1234)                    → "1,234" (en) / "1 234" (fr) / "١٬٢٣٤" (ar)
//        formatDate(new Date(), { dateStyle: 'medium' })
//        setAppLocale('fr')                    → updates `document.dir` + re-renders via hook
//
// Adding a new language:
// 1. Create src/locale/xx.json with the same key shape as en.json
// 2. Add the language to SUPPORTED_LOCALES below
// 3. Missing keys fall back to English automatically
//
// P9-01 / P13-01..05 audit fixes: replaces scattered `.toLocaleString('en-US')`
// calls + scaffolds CLDR pluralization and RTL direction flipping.
//
// Migration strategy: extract strings incrementally as you touch each component.
// Wrap user-visible text in t('key') and add the key to locale/en.json.
// Hardcoded English strings continue to work — no need to extract all at once.
// ═══════════════════════════════════════════════════════════════════════════════

import { useSyncExternalStore } from 'react';
import en from '../locale/en.json';

// RTL locale list (WCAG + Unicode BIDI). When setAppLocale switches to one of
// these, we flip `document.dir` so CSS logical properties can reflow.
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur', 'yi']);

// Registry of available locales. Add new JSON files here as translations land.
const SUPPORTED_LOCALES = { en };

// BCP-47 locale → Intl uses this directly.
// For single-tag locales like 'en' we let Intl pick the regional default.
const LOCALE_OVERRIDES = {
  // Map bare language → preferred BCP-47 tag if we want a specific region.
  // Leave empty to accept browser default; populate when we have translations.
};

let currentLocale = 'en';
let strings = en;

// External store for React subscribers — re-render on setAppLocale.
const _listeners = new Set();
const _emit = () => { _listeners.forEach(fn => { try { fn(); } catch { /* isolate */ } }); };

/**
 * Get the active locale as a BCP-47 tag (e.g. 'en', 'fr', 'ja-JP').
 * @returns {string}
 */
export const getAppLocale = () => LOCALE_OVERRIDES[currentLocale] || currentLocale;

/**
 * Get the raw language key (without region) — used to look up strings.
 * @returns {string}
 */
export const getLocale = () => currentLocale;

/**
 * Set the active locale. Updates document direction for RTL languages.
 * Falls back silently if the locale has no registered translation.
 * @param {string} locale
 */
export const setAppLocale = (locale) => {
  if (!SUPPORTED_LOCALES[locale]) {
    // Unknown locale — no-op (English fallback remains)
    return;
  }
  currentLocale = locale;
  strings = SUPPORTED_LOCALES[locale];
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  }
  _emit();
};
// Legacy alias for code already calling setLocale
export const setLocale = setAppLocale;

/**
 * Translate a key. Supports dot-notation paths and {{var}} interpolation.
 * Falls back to English, then to the raw key if not found.
 *
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export const t = (key, vars) => {
  let val = _resolve(strings, key) ?? _resolve(en, key) ?? key;
  if (vars && typeof val === 'string') {
    for (const [k, v] of Object.entries(vars)) {
      val = val.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    }
  }
  return val;
};

function _resolve(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

// ── Intl format helpers — all default to the app locale ────────────────────

// Cache formatters per (locale, options-signature) so we don't re-build them
// on every call. Intl formatters are expensive to construct.
const _numberFmtCache = new Map();
const _dateFmtCache = new Map();
const _pluralCache = new Map();
const _relativeTimeCache = new Map();

/**
 * Format a number using the app locale.
 * @param {number} n
 * @param {Intl.NumberFormatOptions} [options]
 * @returns {string}
 */
export function formatNumber(n, options) {
  if (!Number.isFinite(n)) return String(n);
  const locale = getAppLocale();
  const cacheKey = `${locale}|${options ? JSON.stringify(options) : ''}`;
  let fmt = _numberFmtCache.get(cacheKey);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, options);
    _numberFmtCache.set(cacheKey, fmt);
  }
  return fmt.format(n);
}

/**
 * Format a Date using the app locale.
 * @param {Date|number|string} d
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(d, options) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const locale = getAppLocale();
  const cacheKey = `${locale}|${options ? JSON.stringify(options) : ''}`;
  let fmt = _dateFmtCache.get(cacheKey);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options);
    _dateFmtCache.set(cacheKey, fmt);
  }
  return fmt.format(date);
}

/**
 * Return the correct CLDR plural form for `n`. Useful alongside t() for cases
 * where a single translation key has multiple plural forms.
 * Usage:  t(`cart.items.${getPluralForm(count)}`, { n: count })
 *         where en.json has: cart.items.one = "{{n}} item", .other = "{{n}} items"
 * @param {number} n
 * @param {'cardinal' | 'ordinal'} [type]
 * @returns {string}
 */
export function getPluralForm(n, type = 'cardinal') {
  const locale = getAppLocale();
  const cacheKey = `${locale}|${type}`;
  let rules = _pluralCache.get(cacheKey);
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type });
    _pluralCache.set(cacheKey, rules);
  }
  return rules.select(n);
}

/**
 * Format a relative time ("3 days ago", "in 2 hours") in the app locale.
 * @param {number} value
 * @param {Intl.RelativeTimeFormatUnit} unit
 * @returns {string}
 */
export function formatRelativeTime(value, unit) {
  const locale = getAppLocale();
  let fmt = _relativeTimeCache.get(locale);
  if (!fmt) {
    fmt = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    _relativeTimeCache.set(locale, fmt);
  }
  return fmt.format(value, unit);
}

/**
 * React hook that re-renders when the app locale changes.
 * @returns {string} current locale (BCP-47)
 */
export function useAppLocale() {
  return useSyncExternalStore(
    (callback) => { _listeners.add(callback); return () => _listeners.delete(callback); },
    () => getAppLocale(),
    () => 'en',
  );
}

/**
 * Whether the active locale is right-to-left.
 * @returns {boolean}
 */
export function isRTL() {
  return RTL_LOCALES.has(currentLocale);
}
