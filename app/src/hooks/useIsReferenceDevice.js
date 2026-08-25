// ═══════════════════════════════════════════════════════════════════════════════
// useIsReferenceDevice / useUiScale — multi-format UI recalculation.
//
// The reference device (Xiaomi 13T, 439px CSS width) always renders through
// the exact same, untouched code path: on that device --ui-scale is pinned
// to the literal value 1, identical to before any of this existed. Every
// other width gets --ui-scale = innerWidth / 439 written onto <html>, which
// the design tokens in kuro.css/index.css (--font-*, --space-*, --height-*,
// --size-*, --radius-*, --blur-*, --card/btn/input-padding) multiply
// themselves by via calc(Npx * var(--ui-scale, 1)) — a real recalculation of
// the values themselves, not a visual transform, so position:fixed/scroll
// behavior is completely unaffected.
//
// This only rescales what's expressed through those centralized tokens.
// Hardcoded arbitrary values elsewhere (text-[8px], w-[48px], inline
// style={{padding:8}}, required by CLAUDE.md's PerfectSuite rule) are not
// covered and stay literal.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

const REFERENCE_WIDTH = 439;
const TOLERANCE = 2;

function computeIsReference() {
  if (typeof window === 'undefined') return true;
  return Math.abs(window.innerWidth - REFERENCE_WIDTH) <= TOLERANCE;
}

function computeScale() {
  if (typeof window === 'undefined') return 1;
  return computeIsReference() ? 1 : window.innerWidth / REFERENCE_WIDTH;
}

function useIsReferenceDevice() {
  const [isReference, setIsReference] = useState(computeIsReference);

  useEffect(() => {
    const update = () => setIsReference(computeIsReference());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return isReference;
}

// Writes --ui-scale onto <html> and keeps it in sync on resize/rotation.
// Returns the current scale value (1 on the reference device).
function useUiScale() {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const update = () => {
      const next = computeScale();
      setScale(next);
      document.documentElement.style.setProperty('--ui-scale', String(next));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return scale;
}

export { useIsReferenceDevice, useUiScale, REFERENCE_WIDTH };
