// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/RarityStars.jsx
// Renders the official in-game rarity star icon(s) for a given star count.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { RARITY_STAR_ICONS } from '../constants/appConstants.js';

// Single star icon for one rarity tier, e.g. <RarityStar rarity={5} size={14} />
export function RarityStar({ rarity, size = 14, className = '', alt }) {
  const src = RARITY_STAR_ICONS[rarity];
  if (!src) return <span className={className}>{'★'.repeat(rarity)}</span>; // fallback until that tier's icon is added
  return (
    <img
      src={src}
      alt={alt || `${rarity}★`}
      width={size}
      height={size}
      className={`inline-block align-middle shrink-0 ${className}`}
      loading="lazy"
      draggable={false}
    />
  );
}

// Row of `count` star icons for the same rarity, e.g. section headers previously showing '★★★★★'
export function RarityStarRow({ rarity, count = rarity, size = 14, className = '', gap = 'gap-0.5' }) {
  return (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <RarityStar key={i} rarity={rarity} size={size} />
      ))}
    </span>
  );
}

export default RarityStar;
