// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EchoImage
// Memoized drop-in <img> replacement for echo icon images.
// Usage: <EchoImage src={url} alt={name} className="..." />
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo } from 'react';
import { hideOnError } from '../utils/imageHelpers.js';

const ECHO_IMG_STYLE = {
  imageRendering: 'auto',
  WebkitBackfaceVisibility: 'hidden',
  backfaceVisibility: 'hidden',
};

const EchoImage = memo(({ src, alt, className, style, noBgProcess, ...rest }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    style={{ ...ECHO_IMG_STYLE, ...style }}
    onError={hideOnError}
    {...rest}
  />
));

export { EchoImage };
