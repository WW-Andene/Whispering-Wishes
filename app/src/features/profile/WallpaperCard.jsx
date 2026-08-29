// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — WallpaperCard
// Applies a collection asset (picked via CollectionGrid's own small image-icon
// button, next to the profile-pic crown) as the phone's home/lock screen
// wallpaper, on the native (Capacitor) app build. Native-only.
//
// Selecting an asset in Collection only remembers WHICH one (state.profile.
// wallpaperAsset) — applying it is a deliberate, explicit action here, since
// setting the wallpaper is a one-shot native call (WallpaperManager.setBitmap),
// not something to keep in sync automatically every time the selection changes.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { isNativePlatform, setWallpaper } from '../../utils/wallpaper.js';
import { haptic } from '../../utils/haptics.js';
import { t } from '../../utils/i18n.js';

export default function WallpaperCard({ assetName, assetUrl, onClear, toast }) {
  const [native] = useState(isNativePlatform());
  const [busy, setBusy] = useState(false);

  if (!native) return null;

  const apply = async (target) => {
    if (!assetUrl) return;
    haptic.light();
    setBusy(true);
    try {
      const res = await setWallpaper(assetUrl, target);
      if (res.ok) {
        toast?.addToast?.(t('profile.wallpaper.applied'), 'success');
        haptic.success();
      } else {
        toast?.addToast?.(t('profile.wallpaper.error', { error: res.error }), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><ImageIcon size={14} className="text-cyan-400 inline-block mr-1.5 -mt-0.5" />{t('profile.wallpaper.title')}</CardHeader>
      <CardBody className="space-y-2">
        <p className="text-gray-400 text-sm">{t('profile.wallpaper.description')}</p>
        {assetName ? (
          <>
            <div className="flex items-center gap-2 bg-black/25 rounded-lg p-2">
              <div className="w-10 h-10 rounded-md overflow-hidden bg-black/25 flex-shrink-0">
                {assetUrl && <img src={assetUrl} alt={assetName} className="w-full h-full object-contain" />}
              </div>
              <span className="text-gray-200 text-sm truncate flex-1">{assetName}</span>
              <button onClick={onClear} className="p-1.5 text-gray-500 hover:text-gray-300" aria-label={t('profile.wallpaper.clearAria')}>
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => apply('home')} disabled={busy} className="kuro-btn kuro-btn-sm disabled:opacity-40">{t('profile.wallpaper.setHome')}</button>
              <button onClick={() => apply('lock')} disabled={busy} className="kuro-btn kuro-btn-sm disabled:opacity-40">{t('profile.wallpaper.setLock')}</button>
              <button onClick={() => apply('both')} disabled={busy} className="kuro-btn kuro-btn-sm active-cyan disabled:opacity-40">{t('profile.wallpaper.setBoth')}</button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-2xs">{t('profile.wallpaper.hint')}</p>
        )}
      </CardBody>
    </Card>
  );
}
