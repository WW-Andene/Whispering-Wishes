// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/haptics.js
// Extracted from the former utils/helpers.js grab-bag (2026-08-26 restructuring):
// this file owns the app's single haptic-feedback bridge. Previously
// features/profile/HapticLabCard.jsx (a Profile settings card for testing
// haptic patterns, since removed) independently called
// registerPlugin('GlassHaptics') a second time — a duplicate bridge to the
// same native plugin — instead of importing this one; that duplication was
// fixed by having it import `haptic`/GlassHaptics from here, before the
// card itself was removed entirely.
// ═══════════════════════════════════════════════════════════════════════════════

import { registerPlugin } from '@capacitor/core';

// GlassHapticsPlugin.java (in-project, Android only) replaces
// @capacitor/haptics: that plugin's impact/notification styles are all
// VibrationEffect.createWaveform() — a raw amplitude ramp held for
// 43-60ms — which reads as a dull, soft "buzz" on most actuators, not a
// sharp tap. GlassHaptics instead uses VibrationEffect.Composition's short
// OS/OEM-tuned primitives (PRIMITIVE_TICK/PRIMITIVE_CLICK/PRIMITIVE_LOW_TICK)
// — the same category of API that makes stock Android UI taps feel crisp
// rather than buzzy, closer to a quick tap on thin glass than a motor buzz.
// No iOS build exists yet (see NATIVE_APP.md) — if one gets added,
// @capacitor/haptics' iOS side (Apple's Taptic Engine via UIFeedbackGenerator)
// is already good and would need its own branch here instead of this plugin.
const GlassHaptics = registerPlugin('GlassHaptics');

const isNative = () => typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

// useVisualSettings.js already toggles a 'no-animations' class on <html>
// whenever animationsEnabled === 'off' (see its sync-to-<html> effect) — this
// reuses that same signal rather than plumbing the setting through every
// haptic call site, so haptics only ever fire when animations are 'on' or
// 'full'. Checked at call time (not cached) since the class can flip at any
// point from the Settings tab.
const hapticsAllowed = () => typeof document !== 'undefined' && !document.documentElement.classList.contains('no-animations');

// Experimental: window.AndroidHaptics.tap() is a raw addJavascriptInterface
// bridge (see MainActivity.java) instead of Capacitor's plugin bridge (JSON
// message + promise round trip) — meaningfully lower JS-to-native latency,
// to test whether Xiaomi's haptic renderer is timing-sensitive about how
// soon after touch performHapticFeedback() gets called. Only wired for
// "light" since that's the one fired on every button press via
// glassTouch.js (the case where the timing gap is largest relative to the
// user's actual finger-down moment); success/warning/error aren't
// touch-synchronous the same way, so they stay on the plugin path.
const hasNativeTapBridge = () => typeof window !== 'undefined' && typeof window.AndroidHaptics?.tap === 'function';

// Web/PWA fallback via navigator.vibrate() — no composition-primitive
// equivalent exists on the web, so there's nothing to "tune" beyond duration.
// vibrate(1) is the shortest possible non-zero duration the API accepts
// (0 cancels rather than fires) — used unconditionally here since shorter
// durations read as more of a "tick" than a "buzz" on Chrome Android, and
// there's no shorter alternative to fall back to. Also worth noting: the
// Vibration API has no effect at all on iOS Safari/PWA (Apple has never
// implemented it) — on iOS this silently no-ops, which isn't fixable from web
// code; only a native iOS build (not planned yet) could address that.
const haptic = {
  light: () => {
    if (!hapticsAllowed()) return;
    if (hasNativeTapBridge()) { window.AndroidHaptics.tap(); return; }
    isNative() ? GlassHaptics.light().catch(() => {}) : navigator?.vibrate?.(1);
  },
  medium: () => { if (!hapticsAllowed()) return; isNative() ? GlassHaptics.medium().catch(() => {}) : navigator?.vibrate?.(1); },
  heavy: () => { if (!hapticsAllowed()) return; isNative() ? GlassHaptics.heavy().catch(() => {}) : navigator?.vibrate?.(1); },
  success: () => { if (!hapticsAllowed()) return; isNative() ? GlassHaptics.success().catch(() => {}) : navigator?.vibrate?.([20, 60, 20]); },
  warning: () => { if (!hapticsAllowed()) return; isNative() ? GlassHaptics.warning().catch(() => {}) : navigator?.vibrate?.([35, 40, 35]); },
  error: () => { if (!hapticsAllowed()) return; isNative() ? GlassHaptics.error().catch(() => {}) : navigator?.vibrate?.([60, 50, 90]); },
};

export { haptic, GlassHaptics, isNative as isNativePlatform };
