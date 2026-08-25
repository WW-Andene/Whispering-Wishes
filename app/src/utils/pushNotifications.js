// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/pushNotifications.js
// Push notifications for the native (Capacitor) build. Native-only: there's
// no push transport on the web build (no service-worker Web Push wired up).
//
// IMPORTANT — this wires the full client side (permission, FCM registration,
// token, foreground/tap listeners) but there is currently NO SERVER that
// sends anything to that token: `api/` has no push-sending endpoint, and the
// leaderboard/backup features talk to Firebase's REST/Auth APIs directly
// (see CloudStorageProvider.jsx) rather than the Firebase Admin SDK a real
// sender would need. Two things are required before a notification can
// actually arrive on a device, neither of which this file can provide:
//   1. android/app/google-services.json from a real Firebase project (see
//      build.gradle's conditional `apply plugin: 'com.google.gms...'` — the
//      APK builds and runs fine without it, push registration just fails).
//   2. Something that calls the FCM HTTP v1 API with a target token/topic —
//      a Firebase Cloud Function, a Vercel serverless function using the
//      Admin SDK, or manual sends from the Firebase Console for testing.
// Until both exist, getPushToken() below will resolve to null (registration
// error swallowed) and the app behaves exactly as if this file didn't exist.
// ═══════════════════════════════════════════════════════════════════════════════

import { PushNotifications } from '@capacitor/push-notifications';

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

const TOKEN_STORAGE_KEY = 'ww-push-token';
const OPT_IN_STORAGE_KEY = 'ww-push-optin';

export const getStoredPushToken = () => {
  try { return localStorage.getItem(TOKEN_STORAGE_KEY); } catch { return null; }
};

export const hasOptedIntoPush = () => {
  try { return localStorage.getItem(OPT_IN_STORAGE_KEY) === '1'; } catch { return false; }
};

let listenersAttached = false;
function attachListeners(onToken, onNotification) {
  if (listenersAttached) return;
  listenersAttached = true;

  PushNotifications.addListener('registration', (token) => {
    try { localStorage.setItem(TOKEN_STORAGE_KEY, token.value); } catch {}
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
