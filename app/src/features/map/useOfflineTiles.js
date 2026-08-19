// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/useOfflineTiles.js (extracted from MapTab.jsx)
// Offline tile cache state + download/purge handlers for the "Offline maps"
// popover and the Sub-maps editor's per-overlay download controls.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState, useCallback } from 'react';
import { OVERLAY_CATALOG } from '../../data/mapOverlays.js';
import { downloadTiles, purgeTiles, queryTiles, tileUrlsForOverlay, tileUrlsForBaseMap, serviceWorkerAvailable } from '../../core/tileSW.js';

export function useOfflineTiles(showToast) {
  const [overlayOffline, setOverlayOffline] = useState({});

  // Downloadables = base world map (Solaris_3) + every tileable overlay
  // (imageUrl ending in .webp). The base map sits at the top so users see
  // it first; overlays follow in catalog order.
  const downloadables = useMemo(() => {
    const items = [
      { id: 'solaris_3', name: 'World Map', urls: tileUrlsForBaseMap() },
    ];
    for (const cat of OVERLAY_CATALOG) {
      if (!cat.imageUrl?.endsWith?.('.webp')) continue;
      items.push({ id: cat.id, name: cat.name, urls: tileUrlsForOverlay(cat) });
    }
    return items;
  }, []);

  // Query the service-worker tile cache on mount so the gear-icon downloads
  // panel has accurate "X/N cached" labels without any user action.
  useEffect(() => {
    if (!serviceWorkerAvailable()) return;
    let cancelled = false;
    (async () => {
      for (const item of downloadables) {
        try {
          const { cached, total } = await queryTiles(item);
          if (cancelled) return;
          setOverlayOffline(prev => ({ ...prev, [item.id]: { ...(prev[item.id] || {}), cached, total } }));
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, [downloadables]);

  const handleDownloadItem = useCallback(async (item) => {
    if (!serviceWorkerAvailable()) {
      showToast('Service worker not active — reload and try again');
      return;
    }
    setOverlayOffline(prev => ({
      ...prev,
      [item.id]: { ...(prev[item.id] || {}), downloading: true, done: 0, total: prev[item.id]?.total || item.urls.length },
    }));
    try {
      const { failed } = await downloadTiles(item, (done, total) => {
        setOverlayOffline(prev => ({ ...prev, [item.id]: { cached: done, total, downloading: true, done } }));
      });
      const { cached, total } = await queryTiles(item);
      setOverlayOffline(prev => ({ ...prev, [item.id]: { cached, total, downloading: false, done: cached } }));
      if (failed > 0) {
        showToast(`Saved ${item.name} — ${cached}/${total} tiles (${failed} failed, retry to catch them)`, 3200);
      } else {
        showToast(`Saved ${item.name} for offline (${total} tiles)`);
      }
    } catch (err) {
      // Refresh state from the SW so the UI reflects what was actually cached
      // before the stall/error (partial progress).
      try {
        const { cached, total } = await queryTiles(item);
        setOverlayOffline(prev => ({ ...prev, [item.id]: { cached, total, downloading: false, done: cached } }));
      } catch {
        setOverlayOffline(prev => ({ ...prev, [item.id]: { ...(prev[item.id] || {}), downloading: false } }));
      }
      const msg = err?.message === 'service-worker-stalled'
        ? 'Download stalled — browser may have paused the service worker. Retry to resume.'
        : 'Download failed: ' + (err?.message || err);
      showToast(msg, 3500);
    }
  }, [showToast]);

  const handleDownloadAll = useCallback(async () => {
    for (const item of downloadables) {
      // Await sequentially so the SW isn't hammered and we don't spawn
      // concurrent progress streams that'd overwrite each other.
      await handleDownloadItem(item);
    }
  }, [downloadables, handleDownloadItem]);

  const handlePurgeItem = useCallback(async (item) => {
    if (!serviceWorkerAvailable()) return;
    try {
      await purgeTiles(item);
      const { cached, total } = await queryTiles(item);
      setOverlayOffline(prev => ({ ...prev, [item.id]: { cached, total, downloading: false, done: 0 } }));
      showToast(`Removed ${item.name} offline copy`);
    } catch (err) {
      showToast('Remove failed: ' + (err?.message || err));
    }
  }, [showToast]);

  // Editor-side per-overlay handlers — wrap the generic ones so the existing
  // Sub-maps editor row keeps working with a `cat` argument.
  const handleDownloadOverlay = useCallback((cat) => {
    return handleDownloadItem({ id: cat.id, name: cat.name, urls: tileUrlsForOverlay(cat) });
  }, [handleDownloadItem]);
  const handlePurgeOverlay = useCallback((cat) => {
    return handlePurgeItem({ id: cat.id, name: cat.name, urls: tileUrlsForOverlay(cat) });
  }, [handlePurgeItem]);

  return {
    overlayOffline,
    downloadables,
    handleDownloadItem,
    handleDownloadAll,
    handlePurgeItem,
    handleDownloadOverlay,
    handlePurgeOverlay,
  };
}
