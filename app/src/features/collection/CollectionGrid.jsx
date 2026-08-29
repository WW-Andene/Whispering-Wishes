// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/collection/CollectionGrid.jsx
// CollectionGridSection component
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback, memo } from 'react';
import { Crown, Image as ImageIcon } from 'lucide-react';

import { haptic } from '../../utils/haptics.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { SpinePlayer, getSpineId, SPINE_SPRITES_ENABLED_OUTSIDE_PANEL } from '../../shared/components/SpinePlayer.jsx';

import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t } from '../../utils/i18n.js';

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
const CollectionGridCard = memo(({ name, label, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew, isProfilePic, onSetProfilePic, isWallpaperAsset, onSetWallpaperAsset, isCharOwned, onToggleOwned, isEcho, noBgProcess, onLongPress, isCharacter, isFullAnim }) => {
  const displayLabel = label || name;
  // Pixel-level background removal for echo images (skip if pre-processed)
  const processedUrl = imgUrl;
  const [spineFailed, setSpineFailed] = useState(false);
  const spineId = isCharacter && isFullAnim && !framingMode ? getSpineId(name, { surface: 'collection' }) : null;
  const useSpine = SPINE_SPRITES_ENABLED_OUTSIDE_PANEL && !!spineId && !spineFailed;
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
    type="button"
    className={cardClassName}
    style={{ height: 'var(--height-card-sm)', contain: 'paint', textAlign: 'center', ...(isProfilePic && !isSelected ? { borderColor: 'rgba(251,146,60,0.7)', boxShadow: '0 0 16px rgba(251,146,60,0.25), inset 0 0 12px rgba(251,146,60,0.06)' } : {}) }}
    aria-label={`${displayLabel}${owned ? `${t('collection.grid.ownedSuffix')}${count > 1 ? ` ×${count}` : ''}` : t('collection.grid.notOwnedLabel')}${isProfilePic ? t('collection.grid.currentProfilePic') : ''}${isNew ? t('collection.grid.newLabel') : ''}`}
    {...longPressHandlers}
  >
    {/* P15-FIX: NIT-4 — Skeleton placeholder while image loads, prevents layout shift */}
    {imgUrl ? (
      <div className="absolute inset-0 collection-img-wrap" style={{
        maskImage: (isEcho && noBgProcess) ? 'radial-gradient(ellipse 90% 88% at center, black 88%, transparent 100%)'
          : isEcho ? 'radial-gradient(ellipse 75% 70% at center 45%, black 40%, transparent 85%)'
          : 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
        WebkitMaskImage: (isEcho && noBgProcess) ? 'radial-gradient(ellipse 90% 88% at center, black 88%, transparent 100%)'
          : isEcho ? 'radial-gradient(ellipse 75% 70% at center 45%, black 40%, transparent 85%)'
          : 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
      }}>
        {useSpine ? (
          <SpinePlayer
            characterId={spineId}
            className="w-full h-full pointer-events-none"
            style={{ opacity: owned ? collOpacity : 0.3, filter: owned ? undefined : 'grayscale(100%)' }}
            backgroundColor="#00000000"
            onError={() => setSpineFailed(true)}
            fallbackImgUrl={processedUrl || imgUrl}
            fallbackImgStyle={{
              transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
              maskImage: collMask,
              WebkitMaskImage: collMask,
            }}
          />
        ) : (
          <img
            src={processedUrl || imgUrl}
            alt={displayLabel}
            loading="lazy"
            decoding="async"
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
        )}
      </div>
    ) : (
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
    )}
    {isNew && (
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-full text-sm font-bold tracking-wider uppercase bg-yellow-500 text-black kuro-shadow-glow-gold" style={{textShadow: 'none'}}>{t('collection.grid.newBadge')}</div>
    )}
    {/* Profile pic setter — top-right corner */}
    {!framingMode && onSetProfilePic && (
      <button
        className={`profile-pic-btn absolute z-20 flex items-center justify-center transition-all ${isProfilePic ? 'text-black shadow-lg' : 'bg-black/70 text-gray-500 hover:bg-yellow-500/30 hover:text-yellow-300'}`}
        style={{ top: '4px', right: '4px', width: 'var(--size-icon-btn)', height: 'var(--size-icon-btn)', minHeight: 'var(--size-icon-btn)', borderRadius: 'var(--radius-sm)', padding: 0, ...(isProfilePic ? { background: '#fb923c', boxShadow: '0 0 10px rgba(251,146,60,0.5)' } : {}) }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSetProfilePic(name); }}
        title={isProfilePic ? t('collection.grid.currentProfilePicTitle') : t('collection.grid.setProfilePic')}
        aria-label={isProfilePic ? t('collection.grid.currentProfilePicTitle') : t('collection.grid.setProfilePicAria', { name })}
      >
        <Crown size={14} />
      </button>
    )}
    {/* Wallpaper picker — same corner as the profile-pic crown, offset one icon-width to its
        left so both can coexist; picking here only SELECTS the asset (state.profile.
        wallpaperAsset) — actually applying it to the phone's home/lock screen happens from
        ProfileTab's WallpaperCard, a native one-shot WallpaperManager call, not app state. */}
    {!framingMode && onSetWallpaperAsset && (
      <button
        className={`profile-pic-btn absolute z-20 flex items-center justify-center transition-all ${isWallpaperAsset ? 'text-black shadow-lg' : 'bg-black/70 text-gray-500 hover:bg-cyan-500/30 hover:text-cyan-300'}`}
        style={{ top: '4px', right: 'calc(var(--size-icon-btn) + 8px)', width: 'var(--size-icon-btn)', height: 'var(--size-icon-btn)', minHeight: 'var(--size-icon-btn)', borderRadius: 'var(--radius-sm)', padding: 0, ...(isWallpaperAsset ? { background: '#22d3ee', boxShadow: '0 0 10px rgba(34,211,238,0.5)' } : {}) }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onSetWallpaperAsset(name); }}
        title={isWallpaperAsset ? t('collection.grid.currentWallpaperAssetTitle') : t('collection.grid.setWallpaperAsset')}
        aria-label={isWallpaperAsset ? t('collection.grid.currentWallpaperAssetTitle') : t('collection.grid.setWallpaperAssetAria', { name })}
      >
        <ImageIcon size={14} />
      </button>
    )}
    {isSelected && (
      <div className="absolute top-1 right-1 z-20 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-black text-sm">✓</span>
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none kuro-tshadow-deep">
      {owned ? (
        <div className={`${countColor} font-bold text-2xl kuro-number`}>{countLabel}</div>
      ) : (
        <div className="text-gray-500 font-bold text-2xl">—</div>
      )}
      <div className={`text-sm truncate ${owned ? 'text-gray-200' : 'text-gray-400'}`}>{displayLabel}</div>
    </div>
  </button>
  );
}, (prev, next) =>
  prev.name === next.name && prev.label === next.label && prev.count === next.count && prev.imgUrl === next.imgUrl &&
  prev.isSelected === next.isSelected && prev.owned === next.owned && prev.collMask === next.collMask &&
  prev.collOpacity === next.collOpacity && prev.framingMode === next.framingMode && prev.isNew === next.isNew &&
  prev.isProfilePic === next.isProfilePic && prev.isWallpaperAsset === next.isWallpaperAsset && prev.isFullAnim === next.isFullAnim &&
  prev.framing.zoom === next.framing.zoom && prev.framing.x === next.framing.x && prev.framing.y === next.framing.y
);
CollectionGridCard.displayName = 'CollectionGridCard';

// Collection grid section — eliminates ~170 lines of copy-paste across 5 grids
const CollectionGridSection = memo(({ title, starColor, items, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countColor, countPrefix, totalCount, hasActiveFilters, onClearFilters, collectionImages, withCacheBuster, activeBanners, setDetailModal, dataLookup, dataType, isCharacter, profilePic, onSetProfilePic, wallpaperAsset, onSetWallpaperAsset, ownedChars, toggleOwned, onLongPress, collapsible = false, isFullAnim = false }) => {
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return (
    <div className="text-center py-8">
      <div className="text-gray-400 text-md mb-2">{t('collection.grid.noneFound', { type: dataType === 'echo' ? t('collection.grid.typeEchoes') : dataType === 'weapon' ? t('collection.grid.typeWeapons') : t('collection.grid.typeCharacters') })}</div>
      <p className="text-gray-600 text-sm mb-3">{t('collection.grid.tryAdjusting')}</p>
      {hasActiveFilters && onClearFilters && (
        <button onClick={onClearFilters} className="kuro-btn text-sm px-3 py-1.5 active-gold">{t('collection.grid.clearFilters')}</button>
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
      <div className="text-sm text-gray-400 mb-2 text-right">{t('collection.grid.shownCount', { owned: ownedCount, shown: items.length })}{hasActiveFilters ? t('collection.grid.totalSuffix', { total: totalCount }) : ''}</div>
      <div className="grid grid-cols-3 gap-2">
        {showItems.map(([name, count]) => {
          const imgUrl = collectionImages[name];
          const imageKey = `collection-${name}`;
          const isNew = isCharacter
            ? activeBanners.characters?.some(c => c.name === name && c.isNew)
            : activeBanners.weapons?.some(w => w.name === name && w.isNew);
          return (
            <CollectionGridCard
              key={name} name={name} label={dataLookup[name]?.displayName || name} count={count}
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
              isWallpaperAsset={wallpaperAsset === name}
              onSetWallpaperAsset={onSetWallpaperAsset}
              isCharOwned={ownedChars ? ownedChars.includes(name) : undefined}
              onToggleOwned={toggleOwned}
              isEcho={dataType === 'echo'}
              noBgProcess={dataType === 'echo' && dataLookup[name]?.noBgProcess}
              onLongPress={onLongPress}
              isCharacter={isCharacter}
              isFullAnim={isFullAnim}
            />
          );
        })}
      </div>
      {canCollapse && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="kuro-btn kuro-btn-sm w-full mt-2 flex items-center justify-center gap-1"
        >
          {expanded ? t('collection.grid.showLess') : t('collection.grid.showAll', { count: items.length })}
        </button>
      )}
    </>
  );
});
CollectionGridSection.displayName = 'CollectionGridSection';

export { CollectionGridSection };
