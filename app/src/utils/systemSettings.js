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
