// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — OfflineAssetsCard
// "Download for offline" for every downloadable resource category
// (ASSET_CATEGORY_LABELS in assetSW.js): character animations
// (portraits/, spine/), banner videos (animated-bg/), and convene
// animations (convene-animations/) — the directories the native
// (Capacitor) app build actually excludes from its bundle to stay a
// reasonable size (see NATIVE_APP.md, capacitor-build/build.mjs's
// EXCLUDED_DIRS) — plus every other locally-shipped icon/art directory
// (characters/, banners/, echoes/, materials/, misc-assets/,
// achievements/, ui-icons/), which already ship inside the native bundle
// but were still fetched over the network at runtime rather than served
// from the bundle, plus whatever character/weapon/echo/skill icons are
// still hotlinked from third-party hosts rather than shipped locally at
// all (see build-asset-manifest.mjs).
//
// Native-only (see the isNativePlatform gate in ProfileTab.jsx) — the web
// build has no use for a manual bulk-download step here, so this card is
// hidden there entirely rather than just left inert.
//
// Map tiles have their own dedicated download UI already (MapTab.jsx) — not
// duplicated here.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, HardDriveDownload, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { loadAssetManifest, downloadAssets, purgeAssets, queryAssets, ASSET_CATEGORY_LABELS, serviceWorkerAvailable } from '../../core/assetSW.js';
import { haptic } from '../../utils/haptics.js';
const CATEGORIES = Object.keys(ASSET_CATEGORY_LABELS);

// Icons are hotlinked from third-party hosts (see build-asset-manifest.mjs)
// so their size isn't known ahead of download — totalBytes is always 0 for
// that category even though it's a real, non-empty set of files.
function fmtMB(bytes, fileCount) {
  if (!bytes) return fileCount > 0 ? 'size unknown' : '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

export default function OfflineAssetsCard({ toast }) {
  const [manifest, setManifest] = useState(null);
  const [manifestError, setManifestError] = useState(false);
  // Per-category state: { cached, total, progress: {done,total}|null, busy }
  const [status, setStatus] = useState({});
  const swReady = serviceWorkerAvailable();
  // Closed by default — a bulk-download list of every asset category isn't
  // something most visits to Profile need to see open.
  const [collapsed, setCollapsed] = useState(true);

  const refreshCounts = useCallback(async () => {
    for (const cat of CATEGORIES) {
      try {
        const { cached, total } = await queryAssets(cat);
        setStatus(s => ({ ...s, [cat]: { ...(s[cat] || {}), cached, total } }));
      } catch { /* SW not ready yet — leave as unknown, retried on next mount/interaction */ }
    }
  }, []);

  useEffect(() => {
    loadAssetManifest().then(setManifest).catch(() => setManifestError(true));
    if (swReady) refreshCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swReady]);

  const runDownload = async (cat) => {
    setStatus(s => ({ ...s, [cat]: { ...(s[cat] || {}), busy: true, progress: { done: 0, total: 1 } } }));
    haptic.light();
    try {
      const { failed } = await downloadAssets(cat, (done, total) => {
        setStatus(s => ({ ...s, [cat]: { ...(s[cat] || {}), progress: { done, total } } }));
      });
      await refreshCounts();
      if (failed > 0) toast?.addToast?.(`Downloaded with ${failed} file(s) failing — try again to retry just those.`, 'warning');
      else { toast?.addToast?.('Downloaded for offline use.', 'success'); haptic.success(); }
    } catch (err) {
      toast?.addToast?.(`Download failed: ${err.message}`, 'error');
    } finally {
      setStatus(s => ({ ...s, [cat]: { ...(s[cat] || {}), busy: false, progress: null } }));
    }
  };

  const runPurge = async (cat) => {
    setStatus(s => ({ ...s, [cat]: { ...(s[cat] || {}), busy: true } }));
    try {
      await purgeAssets(cat);
      await refreshCounts();
      toast?.addToast?.('Removed from offline storage.', 'info');
      haptic.light();
    } catch (err) {
      toast?.addToast?.(`Remove failed: ${err.message}`, 'error');
    } finally {
      setStatus(s => ({ ...s, [cat]: { ...(s[cat] || {}), busy: false } }));
    }
  };

  const runDownloadAll = async () => {
    for (const cat of CATEGORIES) await runDownload(cat);
  };

  if (!swReady) {
    return (
      <Card>
        <CardHeader><HardDriveDownload size={14} className="text-cyan-400" /> Download for Offline</CardHeader>
        <CardBody>
          <p className="text-gray-400 text-sm">Not available yet — reload the app once to activate offline support, then come back here.</p>
        </CardBody>
      </Card>
    );
  }

  const totalBytes = manifest ? Object.values(manifest.categories).reduce((s, c) => s + c.totalBytes, 0) : 0;
  const anyBusy = Object.values(status).some(s => s?.busy);

  return (
    <Card>
      <CardHeader action={!collapsed && (
        <button
          onClick={runDownloadAll}
          disabled={anyBusy || !manifest}
          className="kuro-btn kuro-btn-sm flex items-center gap-1 disabled:opacity-40"
        >
          <Download size={12} /> Download All{manifest ? ` (${fmtMB(totalBytes)})` : ''}
        </button>
      )}>
        <button type="button" onClick={() => setCollapsed(c => !c)} className="flex items-center gap-2 w-full text-left" aria-expanded={!collapsed}>
          <HardDriveDownload size={14} className="text-cyan-400 flex-shrink-0" /> Download for Offline
          <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ml-auto ${collapsed ? '-rotate-90' : ''}`} />
        </button>
      </CardHeader>
      {!collapsed && (
      <CardBody className="space-y-2">
        <p className="text-gray-400 text-sm mb-1">
          Character animations and banner backgrounds normally load as you browse. Download them ahead of time to use the app with no connection at all — handy on the native app (these are the assets kept off the app's own download to stay small) or before a flight on the web version.
        </p>
        {manifestError && <p className="text-red-400 text-sm">Couldn't load the asset list — check your connection and reopen this tab.</p>}
        {CATEGORIES.map(cat => {
          const cat_ = status[cat] || {};
          const manifestCat = manifest?.categories?.[cat];
          const isCached = manifestCat && cat_.cached === manifestCat.fileCount && manifestCat.fileCount > 0;
          return (
            <div key={cat} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-stat)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-gray-200 text-sm">{ASSET_CATEGORY_LABELS[cat]}</div>
                <div className="text-gray-500 text-2xs">
                  {manifestCat ? `${manifestCat.fileCount} files, ${fmtMB(manifestCat.totalBytes, manifestCat.fileCount)}` : '…'}
                  {typeof cat_.cached === 'number' && !cat_.progress && ` — ${cat_.cached}/${cat_.total} cached`}
                  {cat_.progress && ` — downloading ${cat_.progress.done}/${cat_.progress.total}…`}
                </div>
              </div>
              {isCached ? (
                <button onClick={() => runPurge(cat)} disabled={cat_.busy} className="kuro-btn kuro-btn-sm kuro-btn-icon text-red-400 disabled:opacity-40" aria-label={`Remove downloaded ${ASSET_CATEGORY_LABELS[cat]}`}>
                  <Trash2 size={14} />
                </button>
              ) : (
                <button onClick={() => runDownload(cat)} disabled={cat_.busy || !manifestCat} className="kuro-btn kuro-btn-sm kuro-btn-icon disabled:opacity-40" aria-label={`Download ${ASSET_CATEGORY_LABELS[cat]} for offline`}>
                  <Download size={14} />
                </button>
              )}
            </div>
          );
        })}
      </CardBody>
      )}
    </Card>
  );
}
