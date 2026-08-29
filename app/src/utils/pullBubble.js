// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/pullBubble.js
// Thin JS wrapper over the native PullBubble Capacitor plugin (see
// android/.../PullBubblePlugin.java) — lets ProfileTab's PullBubbleCard toggle
// PullBubbleService's persistent floating "chat heads" pull bubble directly,
// with no dependency on placing PulseBannerWidget on the home screen first
// (that widget's own bubble-toggle button, if it still has one, sends the exact
// same underlying intent — this is just the other entry point). Native-only:
// there is no floating-overlay concept at all on the web build.
// ═══════════════════════════════════════════════════════════════════════════════

import { registerPlugin } from '@capacitor/core';

const PullBubble = registerPlugin('PullBubble');

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

export async function isPullBubbleEnabled() {
  if (!isNativePlatform()) return false;
  try {
    const { enabled } = await PullBubble.isEnabled();
    return !!enabled;
  } catch {
    return false;
  }
}

export async function togglePullBubble() {
  if (!isNativePlatform()) return;
  await PullBubble.toggle();
}

export async function canDrawOverlays() {
  if (!isNativePlatform()) return false;
  try {
    const { granted } = await PullBubble.canDrawOverlays();
    return !!granted;
  } catch {
    return false;
  }
}

export async function requestOverlayPermission() {
  if (!isNativePlatform()) return;
  await PullBubble.requestOverlayPermission();
}
