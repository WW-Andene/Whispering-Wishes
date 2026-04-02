// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EchoImage
// Drop-in <img> replacement that auto-erases dark backgrounds on echo images.
// Usage: <EchoImage src={url} alt={name} className="..." />
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { eraseEchoBg } from '../utils/echoBackground.js';
import { hideOnError } from '../utils/imageHelpers.js';

const EchoImage = ({ src, alt, className, style, ...rest }) => {
  const [processedSrc, setProcessedSrc] = useState(null);

  useEffect(() => {
    if (!src) { setProcessedSrc(null); return; }
    let cancelled = false;
    eraseEchoBg(src).then(url => { if (!cancelled) setProcessedSrc(url); });
    return () => { cancelled = true; };
  }, [src]);

  return (
    <img
      src={processedSrc || src}
      alt={alt}
      className={className}
      style={{ mixBlendMode: 'lighten', ...style }}
      onError={hideOnError}
      {...rest}
    />
  );
};

export { EchoImage };
