// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EchoImage
// Drop-in <img> replacement that auto-erases dark backgrounds on echo images.
// Pass noBgProcess={true} to skip processing (pre-cut transparent images).
// Usage: <EchoImage src={url} alt={name} className="..." />
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { eraseEchoBg } from '../utils/echoBackground.js';
import { hideOnError } from '../utils/imageHelpers.js';

const EchoImage = ({ src, alt, className, style, noBgProcess, ...rest }) => {
  const [processedSrc, setProcessedSrc] = useState(noBgProcess ? src : null);

  useEffect(() => {
    if (!src || noBgProcess) { setProcessedSrc(src); return; }
    let cancelled = false;
    eraseEchoBg(src).then(url => { if (!cancelled) setProcessedSrc(url); });
    return () => { cancelled = true; };
  }, [src, noBgProcess]);

  return (
    <img
      src={processedSrc || src}
      alt={alt}
      className={className}
      style={style}
      onError={hideOnError}
      {...rest}
    />
  );
};

export { EchoImage };
