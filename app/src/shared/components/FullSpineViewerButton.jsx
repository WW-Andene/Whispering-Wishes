// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/FullSpineViewerButton.jsx
// Round play button that opens a centered panel showing a character's full
// Spine sprite animation. Self-contained (owns its own open state) so it can
// be dropped anywhere a character is shown — the character detail modal
// header, a banner card, etc. — without duplicating the button+panel markup.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Play, X } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { SpinePlayer, getSpineId } from './SpinePlayer.jsx';
import { t } from '../../utils/i18n.js';

const FullSpineViewerButton = ({ name, imageUrl, className = '' }) => {
  const [open, setOpen] = React.useState(false);
  const fullSpineId = getSpineId(name, { surface: 'collection' });

  if (!imageUrl) return null;

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`kuro-btn w-8 h-8 !p-0 rounded-full flex items-center justify-center ${className}`}
        aria-label={t('modals.characterDetail.viewFullSpineAria', { name })}
      >
        <Play size={13} className="fill-current ml-0.5" />
      </button>
      <FocusTrapModal isOpen={open} onClose={() => setOpen(false)} onClick={() => setOpen(false)} ariaLabel={t('modals.characterDetail.viewFullSpineAria', { name })} centered>
        <div className="relative" style={{ width: 'min(90vw, calc(85vh / 2))' }} onClick={e => e.stopPropagation()}>
          <div className="relative w-full aspect-[1/2]" style={{ filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.6))' }}>
            <SpinePlayer
              characterId={fullSpineId}
              context="full"
              className="absolute inset-0"
              backgroundColor="#00000000"
              scaleOverride={1}
              txOverride={0}
              tyOverride={0}
              fallbackImgUrl={imageUrl}
              fallbackImgStyle={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </div>
          <button onClick={() => setOpen(false)} className="kuro-btn absolute top-3 right-3 z-20 w-8 h-8 !p-0 rounded-full flex items-center justify-center" aria-label={t('modals.characterDetail.closeFullSpineAria')}>
            <X size={14} />
          </button>
        </div>
      </FocusTrapModal>
    </>
  );
};

export { FullSpineViewerButton };
