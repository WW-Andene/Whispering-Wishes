// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/backgrounds/TabBackground.jsx
// Simple dark gradient background used by all feature tabs.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

const TabBackground = ({ id, glowColor = 'neutral' }) => {
  return (
    <>
      {/* Dark deep blue base */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'linear-gradient(180deg, #010204 0%, #020408 30%, #030610 60%, #020408 100%)' }} />
      {/* Subtle edge vignette */}
      <div style={{ position:'fixed', inset:0, zIndex:4, pointerEvents:'none', background:'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(2,3,6,0.5) 100%)' }} />
    </>
  );
};

export { TabBackground };
