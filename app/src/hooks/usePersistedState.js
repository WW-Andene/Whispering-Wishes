// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — hooks/usePersistedState.js
// useState + localStorage sync, generalized from the load-on-init/save-on-change
// pair duplicated across several feature files. Defaults to JSON for
// serialize/deserialize; pass overrides for non-JSON-native values (e.g. a Set).
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

export function usePersistedState(key, defaultValue, { serialize = JSON.stringify, deserialize = JSON.parse } = {}) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return deserialize(raw);
    } catch { return defaultValue; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, serialize(value)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue];
}
