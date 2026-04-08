// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — ImageFramingProvider
// Context provider wrapping useImageFraming hook for cross-component access.
// Eliminates prop drilling of framing state through App → Tab → Grid chains.
// ═══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useMemo } from 'react';
import { useImageFraming } from '../hooks/useImageFraming.js';
import { storageAvailable } from '../core/storage.js';

const ImageFramingContext = createContext(null);

export function ImageFramingProvider({ children }) {
  const framing = useImageFraming(storageAvailable);

  // Stable context value — only changes when framing internals change
  const value = useMemo(() => framing, [
    framing.imageFraming,
    framing.editingImage,
    framing.framingMode,
    framing.miniPanelPosition,
    framing.saveImageFraming,
    framing.getImageFraming,
    framing.updateEditingFraming,
    framing.resetEditingFraming,
  ]);

  return (
    <ImageFramingContext.Provider value={value}>
      {children}
    </ImageFramingContext.Provider>
  );
}

export function useImageFramingContext() {
  const ctx = useContext(ImageFramingContext);
  if (!ctx) throw new Error('useImageFramingContext must be used within ImageFramingProvider');
  return ctx;
}

export { ImageFramingContext };
