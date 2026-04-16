// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/CollectionGrid.jsx
// CollectionGridSection component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { User, Crown } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters.js';
import { haptic } from '../../utils/helpers.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { SpinePlayer, getSpineId } from './SpinePlayer.jsx';

import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';

// Small error boundary to isolate Spine crashes per card
class SpineErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e) { if (this.props.onError) this.props.onError(e); }
  render() { return this.state.hasError ? null : this.props.children; }
}

// Long-press detection hook (500ms hold)
function useLongPress(onLongPress, onClick, { delay = 500 } = {}) {
  const timerRef = useRef(null);
  const firedRef = useRef(false);
  const eventRef = useRef(null);
  const onPointerDown = useCallback((e) => {
    firedRef.current = false;
    eventRef.current = e;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      haptic.success();
      onLongPress?.(eventRef.current);
    }, delay);
  }, [onLongPress, delay]);
  const onPointerUp = useCallback(() => {
    clearTimeout(timerRef.current);
    if (!firedRef.current) onClick?.();
  }, [onClick]);
  const onPointerLeave = useCallback(() => { clearTimeout(timerRef.current); }, []);
  const onContextMenu = useCallback((e) => { if (onLongPress) e.preventDefault(); }, [onLongPress]);
  return { onPointerDown, onPointerUp, onPointerLeave, onContextMenu };
}

// Internal: CollectionGridCard
const CollectionGridCard = memo(({ name, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew, isProfilePic, onSetProfilePic, isCharOwned, onToggleOwned, isEcho, noBgProcess, onLongPress, isCharacter, animationsFull }) => {
  // Pixel-level background removal for echo images (skip if pre-processed)
  const processedUrl = imgUrl;
  const [spineFailed, setSpineFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardElRef = useRef(null);
  const spineId = isCharacter && animationsFull && !framingMode ? getSpineId(name) : null;
  const canUseSpine = spineId && !spineFailed;
  const useSpine = canUseSpine && isVisible;

  // Only mount Spine when card is actually visible (avoids WebGL context limit)
  useEffect(() => {
    if (!canUseSpine || !cardElRef.current) return;
    const el = cardElRef.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setIsVisible(true);
      else setIsVisible(false);
    }, { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, [canUseSpine]);
  const longPressHandlers = useLongPress(
    onLongPress ? (event) => onLongPress(name, isCharacter, event) : null,
    () => {
      if (framingMode) {
        setEditingImage(imageKey);
      } else if (onClickCard) {
        haptic.light();
        onClickCard();
      }
    }
  );
  const cardStateClass = isSelected
    ? 'border-emerald-500 ring-2 ring-emerald-500/50'
    : isProfilePic
      ? ownedBg
      : owned
        ? `${ownedBg} ${ownedBorder} ${glowClass}`
        : 'bg-neutral-800/50 border-neutral-700/50';
  const cardClassName = `relative overflow-hidden border rounded text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer ${cardStateClass}`;
  return (
  <button
    ref={cardElRef}
    type="button"
    className={cardClassName}
    style={{ height: 'var(--height-card-sm)', contain: 'paint', textAlign: 'center', ...(isProfilePic && !isSelected ? { borderColor: 'rgba(251,146,60,0.7)', boxShadow: '0 0 16px rgba(251,146,60,0.25), inset 0 0 12px rgba(251,146,60,0.06)' } : {}) }}
    aria-label={`${name}${owned ? `, owned${count > 1 ? ` ×${count}` : ''}` : ', not owned'}${isProfilePic ? ', current profile picture' : ''}${isNew ? ', new' : ''}`}
    {...longPressHandlers}
  >
    {/* P15-FIX: NIT-4 — Skeleton placeholder while image loads, prevents layout shift */}
    {imgUrl ? (
      <div className="absolute inset-0 collection-img-wrap" style={{
        maskImage: (isEcho && noBgProcess) ? undefined
          : isEcho ? 'radial-gradient(ellipse 75% 70% at center 45%, black 40%, transparent 85%)'
          : 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
        WebkitMaskImage: (isEcho && noBgProcess) ? undefined
          : isEcho ? 'radial-gradient(ellipse 75% 70% at center 45%, black 40%, transparent 85%)'
          : 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
      }}>
        <img
          src={processedUrl || imgUrl}
          alt={name}
          loading="lazy"
          className={`w-full h-full ${isCharacter ? 'object-contain' : 'object-cover'} pointer-events-none`}
          style={{
            transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
            opacity: owned ? collOpacity : 0.3,
            filter: owned ? 'none' : 'grayscale(100%)',
            maskImage: collMask,
            WebkitMaskImage: collMask
          }}
          onError={hideOnError}
        />
      </div>
    ) : (
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
    )}
    {useSpine && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        <div className="w-full h-full" style={{ transform: 'scale(2.2) translateY(18%)', transformOrigin: 'center center' }}>
          <SpineErrorBoundary onError={() => setSpineFailed(true)}>
            <SpinePlayer
              characterId={spineId}
              className="w-full h-full"
              backgroundColor="#00000000"
              onError={() => setSpineFailed(true)}
            />
          </SpineErrorBoundary>
        </div>
      </div>
    )}
    {isNew && (
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-full text-sm font-bold tracking-wider uppercase bg-yellow-500 text-black kuro-shadow-glow-gold" style={{textShadow: 'none'}}>New</div>
    )}
    {/* Profile pic setter — top-right corner */}
    {!framingMode && onSetProfilePic && (
      <button
        className={`profile-pic-btn absolute z-20 flex items-center justify-center transition-all ${isProfilePic ? 'text-black shadow-lg' : 'bg-black/70 text-gray-500 hover:bg-yellow-500/30 hover:text-yellow-300'}`}
        style={{ top: '4px', right: '4px', width: 'var(--size-icon-btn)', height: 'var(--size-icon-btn)', minHeight: 'var(--size-icon-btn)', borderRadius: 'var(--radius-sm)', padding: 0, ...(isProfilePic ? { background: '#fb923c', boxShadow: '0 0 10px rgba(251,146,60,0.5)' } : {}) }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSetProfilePic(name); }}
        title={isProfilePic ? 'Current profile picture' : 'Set as profile picture'}
        aria-label={isProfilePic ? 'Current profile picture' : `Set ${name} as profile picture`}
      >
        <Crown size={14} />
      </button>
    )}
    {isSelected && (
      <div className="absolute top-1 right-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-black text-sm">✓</span>
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none kuro-tshadow-deep">
      {owned ? (
        <div className={`${countColor} font-bold text-2xl kuro-number`}>{countLabel}</div>
      ) : (
        <div className="text-gray-500 font-bold text-2xl">—</div>
      )}
      <div className={`text-sm truncate ${owned ? 'text-gray-200' : 'text-gray-400'}`}>{name}</div>
    </div>
  </button>
  );
}, (prev, next) =>
  prev.name === next.name && prev.count === next.count && prev.imgUrl === next.imgUrl &&
  prev.isSelected === next.isSelected && prev.owned === next.owned && prev.collMask === next.collMask &&
  prev.collOpacity === next.collOpacity && prev.framingMode === next.framingMode && prev.isNew === next.isNew &&
  prev.isProfilePic === next.isProfilePic &&
  prev.animationsFull === next.animationsFull &&
  prev.framing.zoom === next.framing.zoom && prev.framing.x === next.framing.x && prev.framing.y === next.framing.y
);
CollectionGridCard.displayName = 'CollectionGridCard';

// Collection grid section — eliminates ~170 lines of copy-paste across 5 grids
const CollectionGridSection = memo(({ title, starColor, items, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countColor, countPrefix, totalCount, hasActiveFilters, onClearFilters, collectionImages, withCacheBuster, activeBanners, setDetailModal, dataLookup, dataType, isCharacter, profilePic, onSetProfilePic, ownedChars, toggleOwned, onLongPress, collapsible = false, animationsFull = false }) => {
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return (
    <div className="text-center py-8">
      <div className="text-gray-400 text-md mb-2">No {dataType === 'echo' ? 'echoes' : dataType === 'weapon' ? 'weapons' : 'characters'} found</div>
      <p className="text-gray-600 text-sm mb-3">Try adjusting your filters or clearing them</p>
      {hasActiveFilters && onClearFilters && (
        <button onClick={onClearFilters} className="kuro-btn text-sm px-3 py-1.5 active-gold">Clear Filters</button>
      )}
    </div>
  );
  const ownedCount = items.filter(([_, c]) => c > 0).length;
  // When collapsed, show 3 rows worth of items (3 cols on mobile = 9 items)
  const COLLAPSED_ROWS = 3;
  const collapsedCount = COLLAPSED_ROWS * 3; // 3 cols on mobile
  const showItems = collapsible && !expanded ? items.slice(0, collapsedCount) : items;
  const canCollapse = collapsible && items.length > collapsedCount;
  return (
    <>
      <div className="text-sm text-gray-400 mb-2 text-right">{ownedCount}/{items.length} shown{hasActiveFilters ? ` (${totalCount} total)` : ''}</div>
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
        {showItems.map(([name, count]) => {
          const imgUrl = collectionImages[name];
          const imageKey = `collection-${name}`;
          const isNew = isCharacter
            ? activeBanners.characters?.some(c => c.name === name && c.isNew)
            : activeBanners.weapons?.some(w => w.name === name && w.isNew);
          return (
            <CollectionGridCard
              key={name} name={name} count={count}
              imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)}
              isSelected={framingMode && editingImage === imageKey}
              owned={count > 0} collMask={collMask} collOpacity={collOpacity}
              glowClass={glowClass} ownedBg={ownedBg} ownedBorder={ownedBorder}
              countLabel={dataType === 'echo' ? '' : count > 0 ? `${countPrefix}${countPrefix === 'S' ? count - 1 : count}` : ''} countColor={countColor}
              framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey}
              onClickCard={dataLookup[name] ? () => setDetailModal({ show: true, type: dataType, name, imageUrl: imgUrl, framing: getImageFraming(imageKey) }) : null}
              isNew={isNew}
              isProfilePic={profilePic === name}
              onSetProfilePic={onSetProfilePic}
              isCharOwned={ownedChars ? ownedChars.includes(name) : undefined}
              onToggleOwned={toggleOwned}
              isEcho={dataType === 'echo'}
              noBgProcess={dataType === 'echo' && dataLookup[name]?.noBgProcess}
              onLongPress={onLongPress}
              isCharacter={isCharacter}
              animationsFull={animationsFull}
            />
          );
        })}
      </div>
      {canCollapse && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="kuro-btn kuro-btn-sm w-full mt-2 flex items-center justify-center gap-1"
        >
          {expanded ? 'Show Less' : `Show All (${items.length})`}
        </button>
      )}
    </>
  );
});
CollectionGridSection.displayName = 'CollectionGridSection';

export { CollectionGridSection };
