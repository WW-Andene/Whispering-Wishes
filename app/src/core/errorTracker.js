// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/errorTracker.js
// Opt-in external error tracker (P12-05 audit fix).
//
// The app ships today with only browser-console + in-UI error boundaries.
// This module provides the hook point for an external tracker (Sentry,
// Rollbar, Bugsnag, self-hosted GlitchTip, etc.) without committing to a
// specific vendor or forcing a dep install.
//
// Activation is two-step:
//   1. Install the vendor SDK in the host project (e.g. `npm i @sentry/browser`)
//   2. Wire it via the `installErrorTracker` adapter in main.jsx
//
// Without those steps, this module is a no-op — captureError / captureMessage
// calls return without doing anything. Safe to sprinkle through the codebase.
//
// Privacy: call setUser({ id }) ONLY with a hashed/pseudonymous identifier.
// The app currently hashes UIDs via hashUidForStorage in App.jsx before any
// external write; follow the same pattern here.
// ═══════════════════════════════════════════════════════════════════════════════

import { isFlagOn } from './featureFlags.js';

// Populated by installErrorTracker() when a vendor adapter is wired.
let _impl = null;

/**
 * Wire a vendor SDK. Idempotent — call once at app boot.
 *
 * @param {{
 *   captureException?: (err: Error, ctx?: object) => void,
 *   captureMessage?: (msg: string, level?: string) => void,
 *   setUser?: (user: { id?: string, role?: string }) => void,
 * }} adapter
 *
 * Example with @sentry/browser:
 *   import * as Sentry from '@sentry/browser';
 *   Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE });
 *   installErrorTracker({
 *     captureException: (err, ctx) => Sentry.captureException(err, { extra: ctx }),
 *     captureMessage: (msg, level) => Sentry.captureMessage(msg, level),
 *     setUser: (u) => Sentry.setUser(u),
 *   });
 */
export function installErrorTracker(adapter) {
  _impl = adapter || null;
}

/**
 * Report a caught exception. No-op when no tracker is installed.
 * Gated on the ERROR_TRACKING feature flag (default OFF) so the tracker can
 * be disabled at runtime without redeploying.
 */
export function captureError(err, ctx) {
  if (!isFlagOn('ERROR_TRACKING', true)) return;
  if (!_impl || typeof _impl.captureException !== 'function') return;
  try { _impl.captureException(err, ctx); }
  catch { /* tracker failure must never crash the app */ }
}

/**
 * Report a diagnostic message (not a thrown error).
 */
export function captureMessage(msg, level = 'info') {
  if (!isFlagOn('ERROR_TRACKING', true)) return;
  if (!_impl || typeof _impl.captureMessage !== 'function') return;
  try { _impl.captureMessage(msg, level); }
  catch { /* isolate */ }
}

/**
 * Associate subsequent events with a (pseudonymous) user identity.
 * Use a hashed UID, never a raw game UID.
 */
export function setUser(user) {
  if (!_impl || typeof _impl.setUser !== 'function') return;
  try { _impl.setUser(user); }
  catch { /* isolate */ }
}

/**
 * Test-only: reset the installed adapter so each test starts clean.
 */
export function _resetForTests() {
  _impl = null;
}
