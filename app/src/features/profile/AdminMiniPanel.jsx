// ═══════════════════════════════════════════════════════════════════════════════
// AdminMiniPanel — Portaled floating mini window for image framing, BG positioning,
// and compact visual settings sliders
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getPortalRoot } from '../../shared/scaling/canvasScale.js';
import { ClipboardList, Settings, X } from 'lucide-react';
import { APP_VERSION } from '../../data/constants.js';
import { CHARACTER_DATA, RELEASE_ORDER } from '../../data/characters.js';
import { Card, CardBody } from '../../shared/components/Card.jsx';
import { VisualSliderGroup, VISUAL_SLIDER_CONFIGS } from '../../shared/components/VisualSlider.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { SPINE_CHARACTERS } from '../../shared/components/SpinePlayer.jsx';
import { useSpineTuning, getAllSpineTuning } from '../../hooks/useSpineTuning.js';
import { getSpineBudgetSnapshot } from '../../hooks/useSpineBudget.js';
import { PRERENDERED_IDLE } from '../../shared/spinePrerenderManifest.js';
import { t } from '../../utils/i18n.js';

// Each tuning slot corresponds to a rendering surface on the app. The tuning
// key SpinePlayer uses is `${characterId}#${context}` (the `card` context is
// special-cased to the bare id, so existing promoted registry defaults keep
// applying). Keep this list in sync with the `context` prop passed at each
// SpinePlayer call site.
const SPINE_CONTEXTS = [
  { value: 'card',   label: () => t('admin.mini.spineContextCard') },    // CollectionGrid
  { value: 'detail', label: () => t('admin.mini.spineContextDetail') },  // CharacterDetailModal header
  { value: 'echo',   label: () => t('admin.mini.spineContextEcho') },    // EchoDetailModal "Recommended For"
];

// Sort sprite entries the way the Collection tab lists them: 5★ then 4★,
// each group ordered newest-first by RELEASE_ORDER. Banner entries come
// after all sprite entries. Ids not in either data source are dropped to
// the bottom alphabetically so the panel never silently hides them.
function orderSpineIds(ids) {
  const releaseRank = new Map(RELEASE_ORDER.map((name, idx) => [name, idx]));
  return [...ids].sort((a, b) => {
    const ea = SPINE_CHARACTERS[a];
    const eb = SPINE_CHARACTERS[b];
    // Surface: sprite (collection) first, banner second.
    if (ea.surface !== eb.surface) return ea.surface === 'collection' ? -1 : 1;
    // Rarity: 5★ above 4★.
    const ra = CHARACTER_DATA[ea.name]?.rarity ?? 0;
    const rb = CHARACTER_DATA[eb.name]?.rarity ?? 0;
    if (ra !== rb) return rb - ra;
    // Release order: newer first (higher index).
    const ia = releaseRank.has(ea.name) ? releaseRank.get(ea.name) : -1;
    const ib = releaseRank.has(eb.name) ? releaseRank.get(eb.name) : -1;
    if (ia !== ib) return ib - ia;
    return ea.name.localeCompare(eb.name);
  });
}

// Lightweight live readout of the WebGL budget. Mounts a 1Hz poll only
// while the panel is open, so it costs nothing the rest of the time.
function SpineBudgetReadout() {
  const [snap, setSnap] = useState(() => getSpineBudgetSnapshot());
  useEffect(() => {
    const id = setInterval(() => setSnap(getSpineBudgetSnapshot()), 1000);
    return () => clearInterval(id);
  }, []);
  const prerendered = Object.keys(PRERENDERED_IDLE).length;
  return (
    <div className="text-2xs text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
      <span title="Live WebGL spine instances currently mounted">
        WebGL: <span className="text-pink-300">{snap.active}</span> / {snap.max}
      </span>
      {snap.waiting > 0 && (
        <span className="text-yellow-300" title="Instances waiting for a slot to open">
          waiting: {snap.waiting}
        </span>
      )}
      <span title="Sprite characters with a pre-rendered idle.webp on disk">
        prerendered: <span className="text-emerald-300">{prerendered}</span>
      </span>
    </div>
  );
}

function SpineTuningSection() {
  const ids = useMemo(() => orderSpineIds(Object.keys(SPINE_CHARACTERS)), []);
  const [selected, setSelected] = useState(ids[0] || '');
  const [context, setContext] = useState('card');
  const tuningKey = context === 'card' ? selected : `${selected}#${context}`;
  const [tuning, set, reset] = useSpineTuning(tuningKey);
  if (!selected) return null;
  const def = SPINE_CHARACTERS[selected] || {};
  // Card context reads the top-level scale/tx/ty off the registry entry;
  // other contexts read the matching sub-object (def.detail, def.echo) so
  // the sliders start at whatever was promoted as the per-surface default.
  const ctxDef = context === 'card' ? def : (def[context] || {});
  const defScale = ctxDef.scale ?? 1;
  const defTx = ctxDef.tx ?? 0;
  const defTy = ctxDef.ty ?? 0;
  const scale = tuning.scale ?? defScale;
  const tx = tuning.tx ?? defTx;
  const ty = tuning.ty ?? defTy;
  const row = (label, value, step, min, max, key) => (
    <div className="flex items-center gap-2">
      <span className="text-2xs text-gray-400 w-8">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set({ [key]: Number(e.target.value) })}
        className="flex-1 accent-pink-500"
      />
      <input
        type="number" step={step} value={value}
        onChange={(e) => set({ [key]: Number(e.target.value) })}
        className="w-14 px-1 py-0.5 bg-black/40 border border-[var(--border-medium)] rounded text-xs text-white text-right"
      />
    </div>
  );
  return (
    <div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg space-y-1.5">
      <div className="text-pink-400 text-sm font-medium">{t('admin.mini.spineTuning')}</div>
      <SpineBudgetReadout />
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full px-2 py-1 bg-black/40 border border-[var(--border-medium)] rounded text-xs text-white"
      >
        {ids.map((id) => {
          const entry = SPINE_CHARACTERS[id];
          const rarity = CHARACTER_DATA[entry.name]?.rarity;
          return (
            <option key={id} value={id}>
              {rarity ? `${rarity}★ ` : ''}{entry.name} ({entry.surface || '?'})
            </option>
          );
        })}
      </select>
      <div className="flex gap-1">
        {SPINE_CONTEXTS.map((c) => (
          <button
            key={c.value}
            onClick={() => setContext(c.value)}
            className={`flex-1 py-0.5 rounded text-2xs border transition-colors ${
              context === c.value
                ? 'bg-pink-500/30 text-pink-200 border-pink-500/50'
                : 'bg-white/5 text-gray-400 border-[var(--border-medium)] hover:bg-white/10'
            }`}
          >
            {c.label()}
          </button>
        ))}
      </div>
      {row('scale', scale, 0.05, 0.2, 6, 'scale')}
      {row('tx', tx, 0.5, -50, 50, 'tx')}
      {row('ty', ty, 0.5, -50, 50, 'ty')}
      <div className="flex gap-1">
        <button
          onClick={reset}
          className="flex-1 py-1 rounded text-2xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
          title={`Clear ${context} tuning overrides for ${SPINE_CHARACTERS[selected].name}`}
        >
          {t('admin.mini.resetCharContext', { name: SPINE_CHARACTERS[selected].name, context })}
        </button>
        <button
          onClick={() => {
            const json = JSON.stringify(getAllSpineTuning(), null, 2);
            if (navigator.clipboard?.writeText) navigator.clipboard.writeText(json);
            else window.prompt(t('admin.mini.copyFramingPrompt'), json);
          }}
          className="flex-1 py-1 rounded text-2xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
        >
          <ClipboardList size={12} className="inline mr-1" /> {t('admin.mini.export')}
        </button>
      </div>
    </div>
  );
}

export default function AdminMiniPanel({
  setShowAdminPanel, setAdminMiniMode,
  visualSettings, saveVisualSettings, DEFAULT_VISUAL_SETTINGS,
  bgFramingMode, setBgFramingMode,
  editingBgTarget, setEditingBgTarget,
  updateBgPosition, getBgPositionLabel, exportBgPositions,
  detailModal, toast, confirm,
}) {
  const {
    imageFraming, framingMode, setFramingMode, editingImage, setEditingImage,
    getImageFraming, updateEditingFraming, resetEditingFraming,
    miniPanelPosition, saveMiniPanelPosition, getMiniPanelPositionClasses, saveImageFraming,
  } = useImageFramingContext();

  return createPortal(
    <div
      className={`fixed z-[10010] w-64 max-h-[50vh] overflow-auto rounded-xl border-2 border-cyan-500/50 bg-neutral-900/95 backdrop-blur-md kuro-shadow-admin ${getMiniPanelPositionClasses()}`}
    >
      <div className="sticky top-0 bg-cyan-900/40 border-b border-cyan-500/30 p-3 flex items-center justify-between">
        <span className="text-cyan-300 text-sm font-bold flex items-center gap-1.5"><Settings size={14} /> {t('admin.mini.visualSettings')}</span>
        <div className="flex gap-1">
          <div className="flex gap-0.5 mr-1">
            <button onClick={() => saveMiniPanelPosition('top-left')} aria-label={t('admin.mini.moveTopLeft')} className={`w-6 h-6 rounded text-2xs ${miniPanelPosition === 'top-left' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↖</button>
            <button onClick={() => saveMiniPanelPosition('top-right')} aria-label={t('admin.mini.moveTopRight')} className={`w-6 h-6 rounded text-2xs ${miniPanelPosition === 'top-right' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↗</button>
            <button onClick={() => saveMiniPanelPosition('bottom-left')} aria-label={t('admin.mini.moveBottomLeft')} className={`w-6 h-6 rounded text-2xs ${miniPanelPosition === 'bottom-left' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↙</button>
            <button onClick={() => saveMiniPanelPosition('bottom-right')} aria-label={t('admin.mini.moveBottomRight')} className={`w-6 h-6 rounded text-2xs ${miniPanelPosition === 'bottom-right' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↘</button>
          </div>
          <button onClick={() => setAdminMiniMode(false)} className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/20 bg-white/10 transition-colors" title={t('admin.mini.expand')} aria-label={t('admin.mini.expandAria')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
          <button onClick={() => { setShowAdminPanel(false); setAdminMiniMode(false); setFramingMode(false); setEditingImage(null); }} className="text-red-400 hover:text-white p-1 rounded hover:bg-red-500/30 bg-red-500/20 transition-colors" title={t('admin.mini.close')} aria-label={t('admin.mini.closeAria')}>
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Spine Tuning — live-binds to SpinePlayer via useSpineTuning */}
        <SpineTuningSection />

        {/* Framing Mode Toggle */}
        <button
          onClick={() => { setFramingMode(!framingMode); if (framingMode) setEditingImage(null); }}
          className={`w-full py-2 rounded text-sm font-medium border transition-all ${framingMode ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-[var(--border-medium)] hover:bg-white/10'}`}
        >
          {framingMode ? t('admin.mini.framingModeOn') : t('admin.mini.framingModeEnable')}
        </button>

        {/* Framing Controls */}
        {framingMode && editingImage && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="text-emerald-400 text-sm font-medium mb-2 truncate">
              {t('admin.mini.editing', { name: editingImage.replace('collection-', '').replace('team-', 'Team: ') })}
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <div />
              <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveUp')}>▲</button>
              <div />
              <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveLeft')}>◀</button>
              <button onClick={resetEditingFraming} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-2xs" aria-label={t('admin.mini.resetAria')}>{t('admin.mini.reset')}</button>
              <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveRight')}>▶</button>
              <div />
              <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveDown')}>▼</button>
              <div />
            </div>
            <div className="flex gap-1 justify-center items-center">
              <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom - 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.zoomOut')}>−</button>
              <span className="px-2 py-1 text-white text-base min-w-[48px] text-center">{getImageFraming(editingImage).zoom}%</span>
              <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom + 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.zoomIn')}>+</button>
            </div>
            <div className="text-center text-gray-500 text-2xs mt-2">{t('admin.mini.tapAnotherImage')}</div>
          </div>
        )}

        {framingMode && !editingImage && (
          <div className="p-2 bg-white/5 border border-[var(--border-medium)] rounded-lg text-center">
            <div className="text-gray-400 text-sm">{t('admin.mini.tapAnyImage')}</div>
          </div>
        )}

        {/* Info Panel Framing */}
        {framingMode && detailModal.show && ['character', 'weapon', 'echo'].includes(detailModal.type) && (() => {
          const infoKey = `info-${detailModal.name}`;
          const infoF = getImageFraming(infoKey);
          return (
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="text-orange-400 text-sm font-medium mb-2 truncate">
                {t('admin.mini.infoPanel', { name: detailModal.name })}
              </div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div />
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, y: Math.max(-100, Math.min(100, infoF.y + 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveInfoUp')}>▲</button>
                <div />
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, x: Math.max(-100, Math.min(100, infoF.x + 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveInfoLeft')}>◀</button>
                <button onClick={() => saveImageFraming(infoKey, { x: 0, y: 0, zoom: 100 })} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-2xs" aria-label={t('admin.mini.resetInfoAria')}>{t('admin.mini.reset')}</button>
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, x: Math.max(-100, Math.min(100, infoF.x - 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveInfoRight')}>▶</button>
                <div />
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, y: Math.max(-100, Math.min(100, infoF.y - 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.moveInfoDown')}>▼</button>
                <div />
              </div>
              <div className="flex gap-1 justify-center items-center">
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, zoom: Math.max(100, infoF.zoom - 10) })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.zoomOut')}>−</button>
                <span className="px-2 py-1 text-white text-base min-w-[48px] text-center">{infoF.zoom}%</span>
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, zoom: Math.min(300, infoF.zoom + 10) })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label={t('admin.mini.zoomIn')}>+</button>
              </div>
              <div className="text-center text-gray-500 text-2xs mt-2">{t('admin.mini.infoPanelHint')}</div>
            </div>
          );
        })()}

        {/* Export Framing Data */}
        {framingMode && Object.keys(imageFraming).length > 0 && (
          <button
            onClick={() => {
              const json = JSON.stringify(imageFraming);
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(json).then(
                  () => toast?.addToast?.(t('admin.mini.framingCopied'), 'success'),
                  () => { window.prompt(t('admin.mini.copyFramingPrompt'), json); }
                );
              } else {
                window.prompt(t('admin.mini.copyFramingPrompt'), json);
              }
            }}
            className="w-full py-2 rounded text-sm font-medium border transition-all bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
          >
            <ClipboardList size={12} className="inline mr-1" />
            {t('admin.mini.exportFramingData', { count: Object.keys(imageFraming).length })}
          </button>
        )}

        {/* Background Mode Toggle */}
        <button
          onClick={() => { setBgFramingMode(!bgFramingMode); if (bgFramingMode) setEditingBgTarget(null); }}
          className={`w-full py-2 rounded text-sm font-medium border transition-all ${bgFramingMode ? 'bg-cyan-500/30 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-[var(--border-medium)] hover:bg-white/10'}`}
        >
          {bgFramingMode ? t('admin.mini.backgroundModeOn') : t('admin.mini.backgroundModeEnable')}
        </button>

        {/* Background Position Controls */}
        {bgFramingMode && editingBgTarget && (
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="text-cyan-400 text-sm font-medium mb-2">
              {t('admin.mini.editingBg', { target: editingBgTarget === 'header' ? t('admin.mini.editingBgHeader') : editingBgTarget === 'nav' ? t('admin.mini.editingBgNav') : t('admin.mini.editingBgOther') })}
            </div>
            <div className="text-gray-400 text-2xs mb-2 font-mono text-center">{getBgPositionLabel()}</div>
            <div className="grid grid-cols-3 gap-1 w-24 mx-auto mb-2">
              <div />
              <button onClick={() => updateBgPosition(0, -2)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">▲</button>
              <div />
              <button onClick={() => updateBgPosition(-2, 0)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">◀</button>
              <button onClick={() => {
                const key = editingBgTarget === 'header' ? 'headerBg' : editingBgTarget === 'nav' ? 'navBg' : 'appBg';
                const current = visualSettings[key];
                if (current) saveVisualSettings({ ...visualSettings, [key]: { ...current, objectPosition: '50% 50%' } });
              }} className="bg-red-500/20 text-red-400 rounded p-1 text-2xs hover:bg-red-500/30 active:scale-95">RST</button>
              <button onClick={() => updateBgPosition(2, 0)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">▶</button>
              <div />
              <button onClick={() => updateBgPosition(0, 2)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">▼</button>
              <div />
            </div>
            <p className="text-gray-500 text-2xs text-center">{t('admin.mini.switchHint')}</p>
          </div>
        )}

        {/* Export BG Positions */}
        {bgFramingMode && (
          <button
            onClick={() => {
              const json = exportBgPositions();
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(json).then(
                  () => toast?.addToast?.(t('admin.mini.bgPositionsCopied'), 'success'),
                  () => { window.prompt(t('admin.mini.copyDataPrompt'), json); }
                );
              } else {
                window.prompt(t('admin.mini.copyDataPrompt'), json);
              }
            }}
            className="w-full py-2 rounded text-sm font-medium border transition-all bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
          >
            <ClipboardList size={12} className="inline mr-1" />
            {t('admin.mini.exportBgPositions')}
          </button>
        )}

        {!framingMode && !bgFramingMode && (
          <>
            <button
              onClick={async () => { if (await confirm({ title: t('admin.mini.resetSettingsTitle'), message: t('admin.mini.resetSettingsMessage'), confirmLabel: t('admin.mini.resetSettingsConfirm'), destructive: true })) saveVisualSettings(DEFAULT_VISUAL_SETTINGS); }}
              className="w-full py-1.5 rounded text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            >
              {t('admin.mini.resetAllDefaults')}
            </button>
            {VISUAL_SLIDER_CONFIGS.map((cfg) => (
              <VisualSliderGroup
                key={cfg.color}
                title={cfg.compactTitle} color={cfg.color} sliders={cfg.sliders}
                visualSettings={visualSettings} saveVisualSettings={saveVisualSettings}
                compact={true} directionControl={cfg.directionControl}
              />
            ))}
          </>
        )}

        <Card>
          <CardBody className="text-center">
            <p className="text-gray-500 text-sm">
              {t('admin.mini.footer', { version: APP_VERSION })} • <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-500 hover:text-yellow-400 transition-colors">{t('admin.mini.contact')}</a>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>,
    getPortalRoot()
  );
}
