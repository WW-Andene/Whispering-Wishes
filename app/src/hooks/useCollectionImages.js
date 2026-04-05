// ═══════════════════════════════════════════════════════════════════════════════
// useCollectionImages — Custom character/weapon image overrides with persistence
// Manages: customCollectionImages state, URL validation, debounced localStorage save
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo } from 'react';
import { DEFAULT_COLLECTION_IMAGES } from '../data/banners.js';
import { storageAvailable } from '../core/storage.js';
import { ALLOWED_IMAGE_HOSTS } from '../shared/constants/appConstants.js';

const DEBOUNCE_MS = 300;
const COLLECTION_IMAGES_KEY = 'whispering-wishes-collection-images';

export { COLLECTION_IMAGES_KEY };

export function useCollectionImages() {
  const [customCollectionImages, setCustomCollectionImages] = useState(() => {
    if (!storageAvailable) return {};
    try {
      const saved = localStorage.getItem(COLLECTION_IMAGES_KEY);
      if (!saved) return {};
      const raw = JSON.parse(saved);
      const safe = {};
      for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'string' && /^https:\/\//i.test(v)) {
          try {
            const host = new URL(v).hostname;
            if (ALLOWED_IMAGE_HOSTS.some(d => host === d || host.endsWith('.' + d))) safe[k] = v;
          } catch { /* invalid URL, skip */ }
        }
      }
      return safe;
    } catch { return {}; }
  });

  const collectionImages = useMemo(
    () => ({ ...DEFAULT_COLLECTION_IMAGES, ...customCollectionImages }),
    [customCollectionImages]
  );

  const saveCollectionImagesDebounced = useRef(null);
  const saveCollectionImages = (newImages) => {
    setCustomCollectionImages(newImages);
    if (!storageAvailable) return;
    clearTimeout(saveCollectionImagesDebounced.current);
    saveCollectionImagesDebounced.current = setTimeout(() => {
      try { localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(newImages)); } catch {}
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => { if (saveCollectionImagesDebounced.current) clearTimeout(saveCollectionImagesDebounced.current); };
  }, []);

  return { customCollectionImages, setCustomCollectionImages, collectionImages, saveCollectionImages };
}
