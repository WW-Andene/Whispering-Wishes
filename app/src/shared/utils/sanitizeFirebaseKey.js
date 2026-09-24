// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/sanitizeFirebaseKey.js (extracted from
// AnalyticsTab.jsx, where it was inline — needed a second call site to compute
// the same leaderboard/community-pulls Firebase key for deletion on Reset All
// Data, in ProfileTab.jsx).
// Firebase Realtime Database keys can't contain '.', '#', '$', '[', ']', '/' —
// this is the same "effective leaderboard id" derivation submitToLeaderboard
// already uses: the in-game UID, sanitized, when known.
// ═══════════════════════════════════════════════════════════════════════════════

export const sanitizeFirebaseKey = (key) => key ? key.replace(/[^a-zA-Z0-9_-]/g, '_') : key;
