// IntersectionObserver-backed visibility hook. Returns a ref to attach to
// the watched element and a boolean that flips true when the element enters
// the viewport (with rootMargin slack so cards just outside the fold stay
// mounted, avoiding mount/unmount thrash during scroll).

import { useEffect, useRef, useState } from 'react';

const DEFAULT_OPTIONS = { rootMargin: '200px', threshold: 0 };

export function useInView(options = DEFAULT_OPTIONS) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      // SSR / very old browser — assume visible so the spine renders at all.
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options,
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.rootMargin, options.threshold, options.root]);

  return [ref, inView];
}
