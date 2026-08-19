// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/useToast.js (extracted from MapTab.jsx)
// Transient status-message toast shown over the map.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState('');

  const showToast = (msg, ms = 1800) => {
    setToast(msg);
    setTimeout(() => setToast(''), ms);
  };

  return [toast, showToast];
}
