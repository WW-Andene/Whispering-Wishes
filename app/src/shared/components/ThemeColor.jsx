// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ThemeColor.jsx
// Single source of truth for the <meta name="theme-color"> tag. Previously this
// was set in three different places (index.html's static tag, PWAProvider.jsx's
// meta-tag injector, and a separate effect in useVisualSettings.js) that drifted
// out of sync with each other over time (navy vs. a slightly different navy vs.
// brand gold) — this component replaces all three so there's exactly one place
// that can ever set it.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';

function ThemeColor() {
  useEffect(() => {
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = 'transparent';
  }, []);

  return null;
}

export { ThemeColor };
