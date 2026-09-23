// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/ReferenceImagePopover.jsx (same
// header-anchored popover shell as IconFiltersPopover.jsx)
// Controls for the reference-image overlay (ReferenceImageLayer.jsx):
// import/replace/remove the screenshot, an Adjust toggle (drag/wheel target
// the image while on; clicks pass through to place points while off), and
// opacity/zoom/rotation sliders. Pure UI; refImage state and onChange stay
// in MapTab.jsx (session-only — see ReferenceImageLayer.jsx's own comment).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { t } from '../../utils/i18n.js';

export function ReferenceImagePopover({ panelRef, top, maxHeight, refImage, onImportFile, onChange, onToggleAdjust, onRemove, onClose }) {
  const fileInputRef = useRef(null);

  return (
    <div
      ref={panelRef}
      className="map-filters-popover"
      role="dialog"
      aria-label={t('map.header.referenceImage')}
      onClick={(e) => e.stopPropagation()}
      style={{ top: `${top}px`, maxHeight }}
    >
      <Card>
        <CardHeader
          action={
            <button type="button" className="kuro-btn kuro-btn-sm kuro-btn-icon" onClick={onClose} aria-label={t('map.wip.close')}>✕</button>
          }
        >
          {t('map.header.referenceImage')}
        </CardHeader>
        <CardBody className="map-filters-body">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = '';
            }}
          />
          <div className="zone-selector-row">
            <button type="button" className="kuro-btn kuro-btn-sm w-full" onClick={() => fileInputRef.current?.click()}>
              {refImage ? t('map.referenceImage.change') : t('map.referenceImage.import')}
            </button>
          </div>
          {!refImage && (
            <div className="zone-selector-empty">{t('map.referenceImage.hint')}</div>
          )}
          {refImage && (
            <>
              <div className="zone-selector-row">
                <button
                  type="button"
                  className={`kuro-btn kuro-btn-sm w-full ${refImage.adjust ? 'is-active' : ''}`}
                  aria-pressed={refImage.adjust}
                  onClick={onToggleAdjust}
                  title={refImage.adjust ? t('map.referenceImage.adjustOnHint') : t('map.referenceImage.adjustOffHint')}
                >
                  {refImage.adjust ? t('map.referenceImage.adjustOn') : t('map.referenceImage.adjustOff')}
                </button>
              </div>
              <div className="map-ref-slider-row">
                <label htmlFor="map-ref-opacity">{t('map.referenceImage.opacity')}</label>
                <input
                  id="map-ref-opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={refImage.opacity}
                  onChange={(e) => onChange({ opacity: Number(e.target.value) })}
                />
              </div>
              <div className="map-ref-slider-row">
                <label htmlFor="map-ref-scale">{t('map.referenceImage.zoom')}</label>
                <input
                  id="map-ref-scale"
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.05"
                  value={refImage.scale}
                  onChange={(e) => onChange({ scale: Number(e.target.value) })}
                />
              </div>
              <div className="map-ref-slider-row">
                <label htmlFor="map-ref-rotation">{t('map.referenceImage.rotation')}</label>
                <input
                  id="map-ref-rotation"
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={refImage.rotation}
                  onChange={(e) => onChange({ rotation: Number(e.target.value) })}
                />
              </div>
              <div className="zone-selector-row">
                <button type="button" className="kuro-btn kuro-btn-sm w-full" onClick={onRemove}>
                  {t('map.referenceImage.remove')}
                </button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
