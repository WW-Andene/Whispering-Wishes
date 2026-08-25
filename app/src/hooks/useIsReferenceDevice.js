// ═══════════════════════════════════════════════════════════════════════════════
// useIsReferenceDevice — detects whether the current viewport matches the
// app's reference device (Xiaomi 13T, 439px CSS width). Used to gate any
// multi-format UI recalculation so the reference device always renders
// through the exact same, untouched code path — only other widths take the
// recalculated path.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

const REFERENCE_WIDTH = 439;
const TOLERANCE = 2;

function computeIsReference() {
  if (typeof window === 'undefined') return true;
  return Math.abs(window.innerWidth - REFERENCE_WIDTH) <= TOLERANCE;
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

export { useIsReferenceDevice, REFERENCE_WIDTH };
