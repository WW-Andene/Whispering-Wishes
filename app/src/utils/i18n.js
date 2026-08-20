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

// Each locale is split into per-feature JSON modules under locale/<lang>/*.json
// so translators/agents can work on separate files without merge conflicts.
// Modules are merged into a single flat-namespaced object below.
import enApp from '../locale/en/app.json';
import enTabs from '../locale/en/tabs.json';
import enOnboarding from '../locale/en/onboarding.json';
import enTracker from '../locale/en/tracker.json';
import enCalculator from '../locale/en/calculator.json';
import enPlanner from '../locale/en/planner.json';
import enCommon from '../locale/en/common.json';
import enPity from '../locale/en/pity.json';
import enEvents from '../locale/en/events.json';
import enAnalytics from '../locale/en/analytics.json';
import enTeams from '../locale/en/teams.json';
import enCollection from '../locale/en/collection.json';
import enMap from '../locale/en/map.json';
import enProfile from '../locale/en/profile.json';
import enModals from '../locale/en/modals.json';
import enAdmin from '../locale/en/admin.json';
import enApp2 from '../locale/en/app2.json';

import frApp from '../locale/fr/app.json';
import frTabs from '../locale/fr/tabs.json';
import frOnboarding from '../locale/fr/onboarding.json';
import frTracker from '../locale/fr/tracker.json';
import frCalculator from '../locale/fr/calculator.json';
import frPlanner from '../locale/fr/planner.json';
import frCommon from '../locale/fr/common.json';
import frPity from '../locale/fr/pity.json';
import frEvents from '../locale/fr/events.json';
import frAnalytics from '../locale/fr/analytics.json';
import frTeams from '../locale/fr/teams.json';
import frCollection from '../locale/fr/collection.json';
import frMap from '../locale/fr/map.json';
import frProfile from '../locale/fr/profile.json';
import frModals from '../locale/fr/modals.json';
import frAdmin from '../locale/fr/admin.json';
import frApp2 from '../locale/fr/app2.json';

const en = {
  app: { ...enApp, ...enApp2 },
  tabs: enTabs,
  onboarding: enOnboarding,
  tracker: enTracker,
  calculator: enCalculator,
  planner: enPlanner,
  common: enCommon,
  pity: enPity,
  events: enEvents,
  analytics: enAnalytics,
  teams: enTeams,
  collection: enCollection,
  map: enMap,
  profile: enProfile,
  modals: enModals,
  admin: enAdmin,
};

const fr = {
  app: { ...frApp, ...frApp2 },
  tabs: frTabs,
  onboarding: frOnboarding,
  tracker: frTracker,
  calculator: frCalculator,
  planner: frPlanner,
  common: frCommon,
  pity: frPity,
  events: frEvents,
  analytics: frAnalytics,
  teams: frTeams,
  collection: frCollection,
  map: frMap,
  profile: frProfile,
  modals: frModals,
  admin: frAdmin,
};

// RTL locale list (WCAG + Unicode BIDI). When setAppLocale switches to one of
// these, we flip `document.dir` so CSS logical properties can reflow.
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur', 'yi']);

// Registry of available locales. Add new JSON files here as translations land.
const SUPPORTED_LOCALES = { en, fr };

// BCP-47 locale → Intl uses this directly.
// For single-tag locales like 'en' we let Intl pick the regional default.
const LOCALE_OVERRIDES = {
  // Map bare language → preferred BCP-47 tag if we want a specific region.
  // Leave empty to accept browser default; populate when we have translations.
};

const LOCALE_STORAGE_KEY = 'ww_locale';

function _readStoredLocale() {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    return stored && SUPPORTED_LOCALES[stored] ? stored : 'en';
  } catch {
    return 'en';
  }
}

let currentLocale = _readStoredLocale();
let strings = SUPPORTED_LOCALES[currentLocale] || en;
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.lang = currentLocale;
  document.documentElement.dir = RTL_LOCALES.has(currentLocale) ? 'rtl' : 'ltr';
}

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
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch { /* storage unavailable — locale won't persist across reloads */ }
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
