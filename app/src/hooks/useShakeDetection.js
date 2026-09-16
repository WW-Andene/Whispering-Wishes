// Detects a device-shake gesture via the standard DeviceMotion API. Android's
// WebView (this app's only native wrapper, via Capacitor) exposes devicemotion
// without a permission prompt - that gate is iOS-only - so no native plugin is
// needed here. Degrades to a no-op wherever devicemotion isn't available
// (desktop browsers, etc.) rather than throwing.

import { useEffect, useRef } from 'react';

const SHAKE_THRESHOLD = 18; // m/s^2 of acceleration change to count as a shake
const SHAKE_COOLDOWN_MS = 1500;

export function useShakeDetection(onShake, enabled = true) {
  const lastAccel = useRef(null);
  const lastShakeAt = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    function handleMotion(event) {
      const a = event.accelerationIncludingGravity || event.acceleration;
      if (!a || a.x == null) return;
      const { x, y, z } = a;
      if (lastAccel.current) {
        const delta = Math.abs(x - lastAccel.current.x) + Math.abs(y - lastAccel.current.y) + Math.abs(z - lastAccel.current.z);
        const now = Date.now();
        if (delta > SHAKE_THRESHOLD && now - lastShakeAt.current > SHAKE_COOLDOWN_MS) {
          lastShakeAt.current = now;
          onShakeRef.current?.();
        }
      }
      lastAccel.current = { x, y, z };
    }

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled]);
}
