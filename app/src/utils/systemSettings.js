// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/systemSettings.js
// Thin JS wrapper around SystemSettingsPlugin.java, a small in-project native
// plugin (not a separate npm package) that opens the OS Sound & Vibration
// settings screen. Native-only.
//
// Why this exists: some OEM skins (MIUI/Xiaomi confirmed) have a hardware
// master vibration switch that silently no-ops vibration for every app —
// including @capacitor/haptics's direct Vibrator.vibrate() calls, which
// bypass the usual "touch feedback" toggle already. There is no Android API
// to detect or override that switch; this just gets the user to the right
// settings screen in one tap instead of having to hunt for it themselves.
// ═══════════════════════════════════════════════════════════════════════════════

import { registerPlugin } from '@capacitor/core';

const SystemSettings = registerPlugin('SystemSettings');

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

export async function openSoundSettings() {
  if (!isNativePlatform()) return false;
  try {
    await SystemSettings.openSoundSettings();
    return true;
  } catch (err) {
    console.warn('openSoundSettings failed:', err.message);
    return false;
  }
}

// Whether a real Firebase project (android/app/google-services.json) was present
// at build time. When it's missing, FirebaseApp never initializes and calling
// @capacitor/push-notifications' register() crashes the app natively instead of
// rejecting the JS promise — see SystemSettingsPlugin.java's isFirebaseAvailable
// for why. pushNotifications.js checks this before ever touching that plugin.
export async function isFirebaseAvailable() {
  if (!isNativePlatform()) return false;
  try {
    const res = await SystemSettings.isFirebaseAvailable();
    return !!res.available;
  } catch (err) {
    console.warn('isFirebaseAvailable check failed:', err.message);
    return false;
  }
}
