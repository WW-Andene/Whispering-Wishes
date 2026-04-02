// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/maskGradient.js
// Unified vertical mask gradient generator (for collection) + cache
// ═══════════════════════════════════════════════════════════════════════════════

// Simple memo cache for vertical mask gradients
const _vertMaskCache = new Map();
const generateVerticalMaskGradient = (fadePos, fadeIntensity, direction = 'bottom') => {
  const key = `v-${fadePos}-${fadeIntensity}-${direction}`;
  if (_vertMaskCache.has(key)) return _vertMaskCache.get(key);

  const maxOpacity = fadeIntensity / 100;
  const endPos = fadePos;
  const dir = direction === 'top' ? 'to top' : 'to bottom';
  let result;
  if (endPos <= 10) {
    result = `linear-gradient(${dir}, rgba(0,0,0,0) 0%, rgba(0,0,0,${maxOpacity}) ${endPos}%, rgba(0,0,0,${maxOpacity}) 100%)`;
  } else {
    const steps = [`rgba(0,0,0,0) 0%`];
    const fadeStart = Math.max(0, endPos - 40);
    if (fadeStart > 0) steps.push(`rgba(0,0,0,0) ${fadeStart}%`);
    for (let i = 1; i <= 5; i++) {
      const pos = fadeStart + (endPos - fadeStart) * (i / 5);
      const opacity = maxOpacity * (i / 5);
      steps.push(`rgba(0,0,0,${opacity.toFixed(2)}) ${pos.toFixed(0)}%`);
    }
    steps.push(`rgba(0,0,0,${maxOpacity}) 100%`);
    result = `linear-gradient(${dir}, ${steps.join(', ')})`;
  }

  if (_vertMaskCache.size > 200) _vertMaskCache.clear();
  _vertMaskCache.set(key, result);
  return result;
};

export { generateVerticalMaskGradient };
