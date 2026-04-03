// ═══════════════════════════════════════════════════════════════════════════════
// Constant-time string comparison — prevents timing side-channel attacks.
// XOR lengths instead of early return to avoid leaking password length.
// ═══════════════════════════════════════════════════════════════════════════════

const constantTimeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const len = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return result === 0;
};

export { constantTimeCompare };
