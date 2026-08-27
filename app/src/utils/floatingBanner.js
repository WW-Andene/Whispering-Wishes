// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/floatingBanner.js
// Thin JS wrapper around FloatingBannerPlugin.java / FloatingBannerService.java
// (no separate npm package, same pattern as systemSettings.js) — a draggable
// overlay window, shown over the home screen (or any screen), that plays the
// featured banner's convene animation inline. Native-only, Android-only.
//
// Unlike a real home-screen widget, this needs "Display over other apps"
// (SYSTEM_ALERT_WINDOW) — a permission Android only grants through its own
// Settings screen, never a runtime dialog. requestPermission() opens that
// screen directly; there's no callback for when the user grants it and
// returns, so callers should re-check hasPermission() themselves (e.g. on
// next app foreground) rather than assuming success.
// ═══════════════════════════════════════════════════════════════════════════════

import { registerPlugin } from '@capacitor/core';

const FloatingBanner = registerPlugin('FloatingBanner');

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

export async function hasFloatingBannerPermission() {
  if (!isNativePlatform()) return false;
  try {
    const { granted } = await FloatingBanner.hasOverlayPermission();
    return !!granted;
  } catch (err) {
    console.warn('hasFloatingBannerPermission failed:', err.message);
    return false;
  }
}

export async function requestFloatingBannerPermission() {
  if (!isNativePlatform()) return false;
  try {
    await FloatingBanner.requestOverlayPermission();
    return true;
  } catch (err) {
    console.warn('requestFloatingBannerPermission failed:', err.message);
    return false;
  }
}

export async function startFloatingBanner() {
  if (!isNativePlatform()) return false;
  try {
    await FloatingBanner.start();
    return true;
  } catch (err) {
    console.warn('startFloatingBanner failed:', err.message);
    return false;
  }
}

export async function stopFloatingBanner() {
  if (!isNativePlatform()) return;
  try {
    await FloatingBanner.stop();
  } catch (err) {
    console.warn('stopFloatingBanner failed:', err.message);
  }
}
