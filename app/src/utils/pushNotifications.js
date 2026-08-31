// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/pushNotifications.js
// Push notifications for the native (Capacitor) build. Native-only: there's
// no push transport on the web build (no service-worker Web Push wired up).
//
// Full round trip: this registers with FCM, then POSTs the resulting token to
// a "/register" endpoint (see pushApiUrl below for which backend), which
// stores it in Firebase RTDB using a service-account-minted admin token — no
// user login required, since push shouldn't be gated behind a Google sign-in.
// The matching "/send" endpoint (admin-only, triggered manually or by a cron
// — not called from this app) reads that same list and broadcasts via FCM
// HTTP v1. Two backends implement this identically: app/api/push/*.js
// (Vercel) and cloudflare-workers/push/ (for anyone not on Vercel) — see
// that folder's README for the Cloudflare setup.
//
// Two things must still exist for a notification to actually arrive:
//   1. android/app/google-services.json from a real Firebase project (see
//      build.gradle's conditional `apply plugin: 'com.google.gms...'` — the
//      APK builds and runs fine without it, FCM registration just fails).
//   2. FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DB_URL, and PUSH_ADMIN_SECRET
//      set as server-side secrets on whichever backend you're using. See
//      CAPACITOR_APP.md (Vercel) or cloudflare-workers/push/README.md.
// Without both, registerTokenWithServer() below fails silently (caught,
// logged) and the app behaves exactly as if this file didn't exist.
// ═══════════════════════════════════════════════════════════════════════════════

import { PushNotifications } from '@capacitor/push-notifications';
import { apiUrl } from './apiBase.js';
import { isFirebaseAvailable } from './systemSettings.js';

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

const TOKEN_STORAGE_KEY = 'ww-push-token';
const OPT_IN_STORAGE_KEY = 'ww-push-optin';

// Push has its own backend from every other /api/* route: it needs a
// server that can mint a Firebase service-account token (admin-level RTDB +
// FCM access), which api/push/*.js provides on Vercel, but which isn't
// wired into self-host/server.js and — per this app's own docs — isn't
// something every deployment runs. VITE_PUSH_API_BASE_URL points at
// whichever one you actually have running (Vercel, or the Cloudflare
// Worker in cloudflare-workers/push/ — see that folder's README). Falls
// back to the same host as apiUrl()'s other routes when unset, so a
// Vercel-only setup (api/push/*.js alongside everything else) keeps
// working with zero extra config.
const PUSH_API_BASE_URL = (import.meta.env.VITE_PUSH_API_BASE_URL || '').replace(/\/$/, '');
const pushApiUrl = (path) => (PUSH_API_BASE_URL ? PUSH_API_BASE_URL + path : apiUrl('/api/push' + path));

export const getStoredPushToken = () => {
  try { return localStorage.getItem(TOKEN_STORAGE_KEY); } catch { return null; }
};

export const hasOptedIntoPush = () => {
  try { return localStorage.getItem(OPT_IN_STORAGE_KEY) === '1'; } catch { return false; }
};

// Best-effort — a failed registration just means this device won't receive
// broadcasts until the next successful call (e.g. next app launch); it never
// blocks the local "push enabled" UX, which only depends on OS permission.
async function registerTokenWithServer(token) {
  try {
    const res = await fetch(pushApiUrl('/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) console.warn('Push token registration with server failed:', res.status);
  } catch (err) {
    console.warn('Push token registration with server failed:', err.message);
  }
}

let listenersAttached = false;
function attachListeners(onToken, onNotification) {
  if (listenersAttached) return;
  listenersAttached = true;

  PushNotifications.addListener('registration', (token) => {
    try { localStorage.setItem(TOKEN_STORAGE_KEY, token.value); } catch {}
    registerTokenWithServer(token.value);
    onToken?.(token.value);
  });

  // Registration fails here whenever google-services.json is missing/invalid
  // — expected on any build that hasn't set up a real Firebase project yet.
  PushNotifications.addListener('registrationError', (err) => {
    console.warn('Push registration failed (google-services.json missing/invalid?):', err?.error || err);
  });

  // Notification arrives while the app is open/foregrounded.
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    onNotification?.(notification, false);
  });

  // User tapped a notification (app was backgrounded/closed).
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    onNotification?.(action.notification, true);
  });
}

// Requests permission, registers with FCM, and wires the listeners above.
// Safe to call multiple times (e.g. on every ProfileTab mount) — Capacitor
// dedupes the underlying native registration; `attachListeners` guards
// against attaching the JS listeners more than once.
export async function initPushNotifications({ onToken, onNotification } = {}) {
  if (!isNativePlatform()) return { supported: false };

  // No android/app/google-services.json at build time means no FirebaseApp ever
  // initializes — calling PushNotifications.register() (or even requestPermissions,
  // which touches the same FirebaseMessaging instance on some plugin versions) in
  // that state throws natively and crashes the whole app rather than rejecting a
  // promise, so this must be checked before touching the plugin at all. See
  // SystemSettingsPlugin.java's isFirebaseAvailable for the full explanation.
  if (!(await isFirebaseAvailable())) {
    try { localStorage.setItem(OPT_IN_STORAGE_KEY, '0'); } catch {}
    return { supported: true, granted: false, unavailable: true };
  }

  attachListeners(onToken, onNotification);

  const perm = await PushNotifications.checkPermissions();
  if (perm.receive !== 'granted') {
    const req = await PushNotifications.requestPermissions();
    if (req.receive !== 'granted') {
      try { localStorage.setItem(OPT_IN_STORAGE_KEY, '0'); } catch {}
      return { supported: true, granted: false };
    }
  }

  try { localStorage.setItem(OPT_IN_STORAGE_KEY, '1'); } catch {}
  await PushNotifications.register();
  return { supported: true, granted: true };
}

export async function disablePushNotifications() {
  try { localStorage.setItem(OPT_IN_STORAGE_KEY, '0'); } catch {}
  if (!isNativePlatform()) return;
  try { await PushNotifications.removeAllDeliveredNotifications(); } catch {}
}
