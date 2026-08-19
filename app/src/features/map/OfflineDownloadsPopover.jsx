// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/OfflineDownloadsPopover.jsx (extracted from MapTab.jsx)
// Header-anchored "Offline maps" panel — lets the user download/purge each
// downloadable's tiles for offline use. Pure UI; all state and download
// logic live in useOfflineTiles.js.
// ═══════════════════════════════════════════════════════════════════════════════

import { Download, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

export function OfflineDownloadsPopover({
  panelRef,
  top,
  maxHeight,
  downloadables,
  overlayOffline,
  onDownloadAll,
  onDownloadItem,
  onPurgeItem,
  onClose,
}) {
  const anyDownloading = downloadables.some(it => overlayOffline[it.id]?.downloading);
  const allCached = downloadables.every(it => {
    const o = overlayOffline[it.id];
    return o && o.total > 0 && o.cached >= o.total;
  });

  return (
    <div
      ref={panelRef}
      className="map-downloads-popover"
      role="dialog"
      aria-label="Offline map downloads"
      onClick={(e) => e.stopPropagation()}
      style={{ top: `${top}px`, maxHeight }}
    >
      <Card>
        <CardHeader
          action={
            <button
              type="button"
              className="kuro-btn kuro-btn-sm kuro-btn-icon"
              onClick={onClose}
              aria-label="Close"
            >✕</button>
          }
        >
          Offline maps
        </CardHeader>
        <CardBody className="map-downloads-body">
          <button
            type="button"
            className="kuro-btn kuro-btn-sm map-downloads-all"
            onClick={onDownloadAll}
            disabled={anyDownloading || allCached}
          >
            <Download size={14} />
            {allCached ? 'All maps already offline' : anyDownloading ? 'Downloading…' : `Download all ${downloadables.length} maps`}
          </button>
          <div className="map-downloads-list">
            {downloadables.map(item => {
              const off = overlayOffline[item.id] || {};
              const total = off.total || 0;
              const cached = off.cached || 0;
              const downloading = !!off.downloading;
              const full = total > 0 && cached >= total;
              const pct = total > 0 ? Math.round((off.done || cached) / total * 100) : 0;
              return (
                <div key={item.id} className="map-downloads-row">
                  <div className="map-downloads-meta">
                    <div className="name">{item.name}</div>
                    <div className="hint">
                      {downloading
                        ? `${pct}% · ${off.done || 0}/${total}`
                        : total > 0 ? `${cached}/${total} tiles` : '—'}
                    </div>
                  </div>
                  {full ? (
                    <button
                      type="button"
                      className="kuro-btn kuro-btn-sm kuro-btn-icon"
                      onClick={() => onPurgeItem(item)}
                      disabled={downloading}
                      title={`Remove ${item.name} from offline cache`}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="kuro-btn kuro-btn-sm kuro-btn-icon"
                      onClick={() => onDownloadItem(item)}
                      disabled={downloading}
                      title={`Download ${item.name} for offline`}
                      aria-label={`Download ${item.name}`}
                    >
                      <Download size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
