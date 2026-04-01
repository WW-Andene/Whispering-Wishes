// Test setup for jsdom environment
import '@testing-library/jest-dom';

// Mock browser APIs not available in jsdom
globalThis.matchMedia = globalThis.matchMedia || (() => ({
  matches: false, addEventListener() {}, removeEventListener() {},
}));
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.ClipboardItem = class {};
globalThis.fetch = async () => ({ ok: false, status: 0, json: async () => ({}), text: async () => '' });

// Suppress canvas/context errors
HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  return new Proxy({}, {
    get(t, p) {
      if (p === 'measureText') return () => ({ width: 0 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ addColorStop: noop });
      return noop;
    },
    set() { return true; },
  });
};

// Mock scrollTo
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
