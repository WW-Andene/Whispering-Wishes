// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — WallpaperCard
// Lets the user set one of the app's own theme background images (the same
// artwork used by the "Backgrounds" picker above — CHARACTER_THEMES,
// VERSION_SPLASH_SCREENS, OTHER_BACKGROUNDS, and ANIMATED_BACKGROUNDS' static
// poster frames) as their phone's home/lock screen wallpaper. Native (Capacitor)
// only — renders nothing on the web build.
//
// Deliberately separate from Collection's character/weapon art: this picks from
// the app's curated THEME imagery, not from every owned/unowned collection item.
// Picking a thumbnail here only stages it as a preview; applying it to the phone
// is a distinct, explicit action (Home/Lock/Both), since WallpaperManager.
// setBitmap is a one-shot native call, not app state to keep in sync with.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Image as ImageIcon, Check } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { CHARACTER_THEMES, VERSION_SPLASH_SCREENS, OTHER_BACKGROUNDS, ANIMATED_BACKGROUNDS } from '../../data/banners.js';
import { isNativePlatform, setWallpaper } from '../../utils/wallpaper.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { haptic } from '../../utils/haptics.js';
import { t } from '../../utils/i18n.js';

const CATEGORIES = ['resonators', 'version', 'others', 'animated'];

export default function WallpaperCard({ toast }) {
  const [native] = useState(isNativePlatform());
  const [category, setCategory] = useState('resonators');
  const [selected, setSelected] = useState(null); // { id, url, label }
  const [busy, setBusy] = useState(false);

  if (!native) return null;

  const items = category === 'resonators' ? CHARACTER_THEMES.map(c => ({ id: c.id, url: c.bannerArt, label: c.name }))
    : category === 'version' ? VERSION_SPLASH_SCREENS.map(v => ({ id: v.id, url: v.art, label: `v${v.version}` }))
    : category === 'others' ? OTHER_BACKGROUNDS.map(o => ({ id: o.id, url: o.art, label: o.name }))
    // Animated backgrounds can't BE a wallpaper (a phone wallpaper is a static image) — their
    // poster frame is a real static jpg though, so it's offered here as a still.
    : ANIMATED_BACKGROUNDS.map(a => ({ id: a.id, url: a.poster, label: a.name }));

  const apply = async (target) => {
    if (!selected) return;
    haptic.light();
    setBusy(true);
    try {
      const res = await setWallpaper(selected.url, target);
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

        <div className="flex gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setSelected(null); }} className={`kuro-btn flex-1 text-sm ${category === c ? 'active-cyan' : ''}`}>
              {t(`profile.display.category${c === 'resonators' ? 'Resonators' : c === 'version' ? 'Version' : c === 'others' ? 'Others' : 'Animated'}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              className={`relative rounded-lg overflow-hidden border transition-all ${selected?.id === item.id ? 'ring-1 border-cyan-400 kuro-shadow-selected-gold' : 'border-[var(--border-medium)] hover:border-gray-500'}`}
              style={{ aspectRatio: '16/9' }}
            >
              <img src={item.url} alt={item.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={hideOnError} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-0.5 left-1 text-white text-sm font-medium drop-shadow-lg">{item.label}</span>
              {selected?.id === item.id && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center"><Check size={12} className="text-black" /></div>}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => apply('home')} disabled={busy} className="kuro-btn kuro-btn-sm disabled:opacity-40">{t('profile.wallpaper.setHome')}</button>
            <button onClick={() => apply('lock')} disabled={busy} className="kuro-btn kuro-btn-sm disabled:opacity-40">{t('profile.wallpaper.setLock')}</button>
            <button onClick={() => apply('both')} disabled={busy} className="kuro-btn kuro-btn-sm active-cyan disabled:opacity-40">{t('profile.wallpaper.setBoth')}</button>
          </div>
        ) : (
          <p className="text-gray-500 text-2xs">{t('profile.wallpaper.hint')}</p>
        )}
      </CardBody>
    </Card>
  );
}
