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

// variant="tile": renders the Sprite asset tile shown in the character
// detail modal's Assets section — a labeled thumbnail that animates the
// Spine sprite directly in place when pressed (toggling to a stop button),
// instead of the small round button used everywhere else which opens a
// separate full-screen panel.
const FullSpineViewerButton = ({ name, imageUrl, className = '', variant = 'button', label }) => {
  const [open, setOpen] = React.useState(false);
  const [tilePlaying, setTilePlaying] = React.useState(false);
  const fullSpineId = getSpineId(name, { surface: 'collection' });

  if (!imageUrl) return null;

  const ariaLabel = t('modals.characterDetail.viewFullSpineAria', { name });

  return (
    <>
      {variant === 'tile' ? (
        <div className={`relative rounded-lg overflow-hidden border border-[var(--border-medium)] ${className}`}>
          {/* Always the same SpinePlayer instance, paused vs playing — was
              a plain <img> (object-cover) when not playing, which used a
              completely different framing math than the animated view and
              didn't reach the card's edges the same way. `paused` only
              freezes the animation; it renders through the identical
              scale/position pipeline either way, so the static and
              animated states now look consistent by construction instead
              of by separately tuning two different renderers.
              ty back to 0 (2026-08-27): -20 (an earlier "raise 20%"
              request, made before this static/animated unification, back
              when the static view was a differently-framed plain <img>)
              overshot badly once actually applied to this pipeline —
              screenshot showed ~2% gap at top vs ~30% at bottom, not
              centered at all. At scale 1 (no zoom, as requested), ty can
              only trade one edge's gap for the other's, not add margin to
              both — so true even top/bottom centering isn't reachable
              through ty alone without reintroducing zoom. Left at 0 (the
              character's own natural composition, which is close to
              centered already) rather than guess another coefficient;
              revisit with the admin Spine panel for live visual tuning if
              still off. */}
          <SpinePlayer
            characterId={fullSpineId}
            context="full"
            paused={!tilePlaying}
            className="absolute inset-0"
            backgroundColor="#00000000"
            scaleOverride={1}
            txOverride={0}
            tyOverride={0}
            fallbackImgUrl={imageUrl}
            fallbackImgStyle={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setTilePlaying(p => !p); }}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={tilePlaying ? t('modals.characterDetail.closeFullSpineAria') : ariaLabel}
          >
            {!tilePlaying && (
              <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                <Play size={12} className="fill-current text-white ml-0.5" />
              </div>
            )}
          </button>
          {tilePlaying && (
            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center pointer-events-none">
              <X size={12} className="text-white" />
            </div>
          )}
          {label && !tilePlaying && <span className="absolute bottom-1 left-1.5 text-white text-sm font-medium drop-shadow-lg pointer-events-none">{label}</span>}
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className={`kuro-btn w-8 h-8 !p-0 rounded-full flex items-center justify-center ${className}`}
          aria-label={ariaLabel}
        >
          <Play size={12} className="fill-current ml-0.5" />
        </button>
      )}
      <FocusTrapModal isOpen={open} onClose={() => setOpen(false)} onClick={() => setOpen(false)} ariaLabel={ariaLabel} centered padding="p-3">
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
