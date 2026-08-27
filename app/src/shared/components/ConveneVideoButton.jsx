// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ConveneVideoButton.jsx
// Round play button that opens a centered panel playing a character's real
// "featured convene" showcase video. Sibling to FullSpineViewerButton (same
// self-contained button+modal shape) — BannerCard.jsx picks whichever of the
// two applies via getConveneAnimation(): this one when a real convene video
// exists for that character, the Spine viewer otherwise.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Play, X } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { t } from '../../utils/i18n.js';

const ConveneVideoButton = ({ name, videoUrl, className = '' }) => {
  const [open, setOpen] = React.useState(false);

  if (!videoUrl) return null;

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`kuro-btn w-8 h-8 !p-0 rounded-full flex items-center justify-center ${className}`}
        aria-label={t('modals.characterDetail.viewConveneVideoAria', { name })}
      >
        <Play size={12} className="fill-current ml-0.5" />
      </button>
      <FocusTrapModal isOpen={open} onClose={() => setOpen(false)} onClick={() => setOpen(false)} ariaLabel={t('modals.characterDetail.viewConveneVideoAria', { name })} centered padding="p-3">
        <div className="relative w-full max-w-2xl" style={{ filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.6))' }} onClick={e => e.stopPropagation()}>
          <video
            key={videoUrl}
            src={videoUrl}
            className="w-full aspect-video rounded-lg bg-black"
            autoPlay
            controls
            playsInline
          />
          <button onClick={() => setOpen(false)} className="kuro-btn absolute -top-3 -right-3 z-20 w-8 h-8 !p-0 rounded-full flex items-center justify-center" aria-label={t('modals.characterDetail.closeConveneVideoAria')}>
            <X size={14} />
          </button>
        </div>
      </FocusTrapModal>
    </>
  );
};

export { ConveneVideoButton };
