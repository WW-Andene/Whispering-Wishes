// ═══════════════════════════════════════════════════════════════════════════════
// useBackgroundFraming — Background image position editing and persistence
// Manages: edit mode, target selection, custom bg positions, position adjustments
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

export function useBackgroundFraming(visualSettings, saveVisualSettings) {
  const [bgFramingMode, setBgFramingMode] = useState(false);
  const [editingBgTarget, setEditingBgTarget] = useState(null); // 'header' | 'nav' | 'bg'

  // Custom bg positions — persisted separately so they survive image re-selection
  const [customBgPositions, setCustomBgPositions] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('ww-bg-positions') || '{}');
      let cleaned = false;
      for (const k in raw) {
        if (typeof raw[k] !== 'string') { delete raw[k]; cleaned = true; }
      }
      if (cleaned) try { localStorage.setItem('ww-bg-positions', JSON.stringify(raw)); } catch {}
      return raw;
    } catch { return {}; }
  });

  const saveBgPosition = useCallback((target, imageId, pos) => {
    const posKey = `${target}-${imageId}`;
    setCustomBgPositions(prev => {
      const next = { ...prev, [posKey]: pos };
      try { localStorage.setItem('ww-bg-positions', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getCustomBgPosition = useCallback((target, imageId) => {
    return customBgPositions[`${target}-${imageId}`] || null;
  }, [customBgPositions]);

  const updateBgPosition = useCallback((dx, dy) => {
    if (!editingBgTarget) return;
    const key = editingBgTarget === 'header' ? 'headerBg' : editingBgTarget === 'nav' ? 'navBg' : 'appBg';
    const current = visualSettings[key];
    if (!current) return;
    const rawPos = current.objectPosition;
    const pos = typeof rawPos === 'string' ? rawPos : 'center center';
    const parts = pos.split(' ');
    let x = parseFloat(parts[0]) || 50;
    let y = parseFloat(parts[1]) || 50;
    x = Math.max(0, Math.min(100, x + dx));
    y = Math.max(0, Math.min(100, y + dy));
    const newPos = `${Math.round(x)}% ${Math.round(y)}%`;
    saveVisualSettings({ ...visualSettings, [key]: { ...current, objectPosition: newPos } });
    saveBgPosition(editingBgTarget === 'header' ? 'header' : editingBgTarget === 'nav' ? 'nav' : 'bg', current.id, newPos);
  }, [editingBgTarget, visualSettings, saveVisualSettings, saveBgPosition]);

  const getBgPositionLabel = useCallback(() => {
    if (!editingBgTarget) return '';
    const key = editingBgTarget === 'header' ? 'headerBg' : editingBgTarget === 'nav' ? 'navBg' : 'appBg';
    const pos = visualSettings[key]?.objectPosition;
    return typeof pos === 'string' ? pos : 'center center';
  }, [editingBgTarget, visualSettings]);

  const exportBgPositions = useCallback(() => {
    return JSON.stringify(customBgPositions, null, 2);
  }, [customBgPositions]);

  return {
    bgFramingMode, setBgFramingMode,
    editingBgTarget, setEditingBgTarget,
    customBgPositions,
    saveBgPosition, getCustomBgPosition, updateBgPosition,
    getBgPositionLabel, exportBgPositions,
  };
}
