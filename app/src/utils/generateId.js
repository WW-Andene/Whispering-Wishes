// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/generateId.js
// Extracted from the former utils/helpers.js grab-bag (2026-08-26 restructuring).
// Unique ID generator (used by ToastProvider, the reducer, and presence tracking).
// ═══════════════════════════════════════════════════════════════════════════════

// P12-FIX: Monotonic counter prevents ID collisions in the crypto.randomUUID fallback path
// (same-millisecond calls to Date.now() would otherwise produce identical IDs) (Step 12 audit — LOW-12n)
let __uniqueIdCounter = 0;
const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch {}
  }
  // 5.3 fix: CSPRNG fallback (crypto.getRandomValues is older/wider than randomUUID)
  try {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return `${Date.now()}-${++__uniqueIdCounter}-${Array.from(arr, b => b.toString(36)).join('')}`;
  } catch {
    return `${Date.now()}-${++__uniqueIdCounter}-${Math.random().toString(36).slice(2)}`;
  }
};

export { generateUniqueId };
