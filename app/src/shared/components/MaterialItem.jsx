// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/MaterialItem.jsx
// Reusable material item display (icon + name + quantity)
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { MATERIAL_IMAGES } from '../../data/constants.js';
import { hideOnError } from '../utils/imageHelpers.js';

const MaterialItem = ({ name, qty }) => {
  const img = MATERIAL_IMAGES[name];
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/5 border border-[var(--border-medium)] min-w-0">
      {img ? <img src={img} alt={name} className="w-7 h-7 rounded object-contain flex-shrink-0" onError={hideOnError} /> : <div className="w-7 h-7 rounded bg-white/10 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-300 truncate leading-tight">{name}</div>
        {qty != null && qty > 0 && <div className="text-xs text-yellow-400 font-bold leading-tight">&times;{qty}</div>}
      </div>
    </div>
  );
};

export { MaterialItem };
