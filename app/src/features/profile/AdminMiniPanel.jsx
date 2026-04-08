// ═══════════════════════════════════════════════════════════════════════════════
// AdminMiniPanel — Portaled floating mini window for image framing, BG positioning,
// and compact visual settings sliders
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, Settings, X } from 'lucide-react';
import { APP_VERSION } from '../../data/constants.js';
import { Card, CardBody } from '../../shared/components/Card.jsx';
import { VisualSliderGroup, VISUAL_SLIDER_CONFIGS } from '../../shared/components/VisualSlider.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';

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
      className={`fixed z-[9999] w-72 max-h-[50vh] overflow-auto rounded-xl border-2 border-cyan-500/50 bg-neutral-900/95 backdrop-blur-md kuro-shadow-admin ${getMiniPanelPositionClasses()}`}
    >
      <div className="sticky top-0 bg-cyan-900/40 border-b border-cyan-500/30 p-2.5 flex items-center justify-between">
        <span className="text-cyan-300 text-sm font-bold flex items-center gap-1.5"><Settings size={14} /> Visual Settings</span>
        <div className="flex gap-1">
          <div className="flex gap-0.5 mr-1">
            <button onClick={() => saveMiniPanelPosition('top-left')} aria-label="Move to top-left" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'top-left' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↖</button>
            <button onClick={() => saveMiniPanelPosition('top-right')} aria-label="Move to top-right" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'top-right' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↗</button>
            <button onClick={() => saveMiniPanelPosition('bottom-left')} aria-label="Move to bottom-left" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'bottom-left' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↙</button>
            <button onClick={() => saveMiniPanelPosition('bottom-right')} aria-label="Move to bottom-right" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'bottom-right' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↘</button>
          </div>
          <button onClick={() => setAdminMiniMode(false)} className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/20 bg-white/10 transition-colors" title="Expand" aria-label="Expand to full panel">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
          <button onClick={() => { setShowAdminPanel(false); setAdminMiniMode(false); setFramingMode(false); setEditingImage(null); }} className="text-red-400 hover:text-white p-1 rounded hover:bg-red-500/30 bg-red-500/20 transition-colors" title="Close" aria-label="Close image framing panel">
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Framing Mode Toggle */}
        <button
          onClick={() => { setFramingMode(!framingMode); if (framingMode) setEditingImage(null); }}
          className={`w-full py-2 rounded text-sm font-medium border transition-all ${framingMode ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-[var(--border-medium)] hover:bg-white/10'}`}
        >
          {framingMode ? '✓ Framing Mode ON' : '⊞ Enable Framing Mode'}
        </button>

        {/* Framing Controls */}
        {framingMode && editingImage && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="text-emerald-400 text-sm font-medium mb-2 truncate">
              Editing: {editingImage.replace('collection-', '').replace('team-', 'Team: ')}
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <div />
              <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move image up">▲</button>
              <div />
              <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move image left">◀</button>
              <button onClick={resetEditingFraming} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-[8px]" aria-label="Reset framing">Reset</button>
              <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move image right">▶</button>
              <div />
              <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move image down">▼</button>
              <div />
            </div>
            <div className="flex gap-1 justify-center items-center">
              <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom - 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Zoom out">−</button>
              <span className="px-2 py-1 text-white text-base min-w-[50px] text-center">{getImageFraming(editingImage).zoom}%</span>
              <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom + 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Zoom in">+</button>
            </div>
            <div className="text-center text-gray-500 text-[8px] mt-2">Tap another image to edit it</div>
          </div>
        )}

        {framingMode && !editingImage && (
          <div className="p-2 bg-white/5 border border-[var(--border-medium)] rounded-lg text-center">
            <div className="text-gray-400 text-sm">Tap any character image to frame it (Collection, Teams, or Detail modal)</div>
          </div>
        )}

        {/* Info Panel Framing */}
        {framingMode && detailModal.show && detailModal.type === 'character' && (() => {
          const infoKey = `info-${detailModal.name}`;
          const infoF = getImageFraming(infoKey);
          return (
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="text-orange-400 text-sm font-medium mb-2 truncate">
                Info Panel: {detailModal.name}
              </div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div />
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, y: Math.max(-100, Math.min(100, infoF.y + 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move info image up">▲</button>
                <div />
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, x: Math.max(-100, Math.min(100, infoF.x + 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move info image left">◀</button>
                <button onClick={() => saveImageFraming(infoKey, { x: 0, y: 0, zoom: 100 })} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-[8px]" aria-label="Reset info framing">Reset</button>
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, x: Math.max(-100, Math.min(100, infoF.x - 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move info image right">▶</button>
                <div />
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, y: Math.max(-100, Math.min(100, infoF.y - 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Move info image down">▼</button>
                <div />
              </div>
              <div className="flex gap-1 justify-center items-center">
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, zoom: Math.max(100, infoF.zoom - 10) })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Zoom out">−</button>
                <span className="px-2 py-1 text-white text-base min-w-[50px] text-center">{infoF.zoom}%</span>
                <button onClick={() => saveImageFraming(infoKey, { ...infoF, zoom: Math.min(300, infoF.zoom + 10) })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-base" aria-label="Zoom in">+</button>
              </div>
              <div className="text-center text-gray-500 text-[8px] mt-2">Adjusts the character info panel header image</div>
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
                  () => toast?.addToast?.('Framing data copied to clipboard!', 'success'),
                  () => { window.prompt('Copy this framing data:', json); }
                );
              } else {
                window.prompt('Copy this framing data:', json);
              }
            }}
            className="w-full py-2 rounded text-sm font-medium border transition-all bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
          >
            <ClipboardList size={10} className="inline mr-1" />
            Export Framing Data ({Object.keys(imageFraming).length} images)
          </button>
        )}

        {/* Background Mode Toggle */}
        <button
          onClick={() => { setBgFramingMode(!bgFramingMode); if (bgFramingMode) setEditingBgTarget(null); }}
          className={`w-full py-2 rounded text-sm font-medium border transition-all ${bgFramingMode ? 'bg-cyan-500/30 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-[var(--border-medium)] hover:bg-white/10'}`}
        >
          {bgFramingMode ? '✓ Background Mode ON' : '◐ Enable Background Mode'}
        </button>

        {/* Background Position Controls */}
        {bgFramingMode && editingBgTarget && (
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="text-cyan-400 text-sm font-medium mb-2">
              Editing: {editingBgTarget === 'header' ? 'Header' : editingBgTarget === 'nav' ? 'Navigation' : 'Background'}
            </div>
            <div className="text-gray-400 text-xs mb-2 font-mono text-center">{getBgPositionLabel()}</div>
            <div className="grid grid-cols-3 gap-1 w-24 mx-auto mb-2">
              <div />
              <button onClick={() => updateBgPosition(0, -2)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">▲</button>
              <div />
              <button onClick={() => updateBgPosition(-2, 0)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">◀</button>
              <button onClick={() => {
                const key = editingBgTarget === 'header' ? 'headerBg' : editingBgTarget === 'nav' ? 'navBg' : 'appBg';
                const current = visualSettings[key];
                if (current) saveVisualSettings({ ...visualSettings, [key]: { ...current, objectPosition: '50% 50%' } });
              }} className="bg-red-500/20 text-red-400 rounded p-1 text-xs hover:bg-red-500/30 active:scale-95">RST</button>
              <button onClick={() => updateBgPosition(2, 0)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">▶</button>
              <div />
              <button onClick={() => updateBgPosition(0, 2)} className="bg-white/10 text-white rounded p-1 text-sm hover:bg-white/20 active:scale-95">▼</button>
              <div />
            </div>
            <p className="text-gray-500 text-xs text-center">Tap header, nav, or background to switch</p>
          </div>
        )}

        {/* Export BG Positions */}
        {bgFramingMode && (
          <button
            onClick={() => {
              const json = exportBgPositions();
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(json).then(
                  () => toast?.addToast?.('Background positions copied!', 'success'),
                  () => { window.prompt('Copy this data:', json); }
                );
              } else {
                window.prompt('Copy this data:', json);
              }
            }}
            className="w-full py-2 rounded text-sm font-medium border transition-all bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
          >
            <ClipboardList size={10} className="inline mr-1" />
            Export BG Positions
          </button>
        )}

        {!framingMode && !bgFramingMode && (
          <>
            <button
              onClick={async () => { if (await confirm({ title: 'Reset settings', message: 'Reset all visual settings to defaults?', confirmLabel: 'Reset', destructive: true })) saveVisualSettings(DEFAULT_VISUAL_SETTINGS); }}
              className="w-full py-1.5 rounded text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            >
              ↻ Reset All to Defaults
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
              {`Whispering Wishes v${APP_VERSION}`} • by u/WW_Andene • Not affiliated with Kuro Games • <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-500 hover:text-yellow-400 transition-colors">Contact</a>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>,
    document.body
  );
}
