// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/calculator/PityRing.jsx
// PityRing component (the circular pity visualization)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { HARD_PITY, SOFT_PITY_START } from '../../data/constants.js';

const PityRing = memo(({ value = 0, max = 80, size = 52, strokeWidth = 4, color = '#edaf18', glowColor = 'rgba(237,175,24,0.4)', label, sublabel, softPityStart }) => {
  const safeValue = Number(value) || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(safeValue / max, 1);
  const offset = circumference * (1 - pct);
  
  // Soft pity zone: configurable threshold, defaults to 65 for max=80
  const softThreshold = softPityStart != null ? softPityStart : (max === HARD_PITY ? SOFT_PITY_START : null);
  const showSoftZone = softThreshold != null && softThreshold < max;
  const isSoftPity = showSoftZone && safeValue >= softThreshold;
  const isDanger = max === HARD_PITY && safeValue >= 75;

  const softStart = showSoftZone ? softThreshold / max : 0;
  const softLen = showSoftZone ? (max - softThreshold) / max : 0;
  const softDash = softLen * circumference;
  const softGap = circumference - softDash;
  const softOffset = -softStart * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`${isDanger ? 'pity-danger' : isSoftPity ? 'pity-soft' : ''}`} style={{ borderRadius: '50%', width: size, height: size, overflow: 'hidden' }}>
      <svg width={size} height={size} className={`${isSoftPity ? 'pulse-subtle' : ''}`} role="img" aria-label={`Pity: ${safeValue} out of ${max}${isSoftPity ? ', in soft pity zone' : ''}`}>
        <circle className="pity-ring-track" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} />
        {showSoftZone && (
          <circle 
            cx={size/2} cy={size/2} r={radius} 
            strokeWidth={strokeWidth} 
            stroke="rgba(251, 146, 60, 0.2)"
            fill="none"
            strokeDasharray={`${softDash} ${softGap}`} 
            strokeDashoffset={softOffset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt"
          />
        )}
        <circle className="pity-ring-fill" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} style={{'--ring-glow': glowColor}} />
        <text className="pity-ring-text" x={size/2} y={size/2} fontSize={size * 0.36} fill={color}>{safeValue}</text>
      </svg>
      </div>
      {label && <div className="text-gray-300 text-sm mt-0.5">{label}</div>}
      {sublabel && <div className="text-gray-400 text-sm">{sublabel}</div>}
    </div>
  );
});
PityRing.displayName = 'PityRing';

export { PityRing };
