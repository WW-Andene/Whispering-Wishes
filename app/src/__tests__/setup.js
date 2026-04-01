// Browser globals mock for SSR render tests
Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'node', clipboard: { writeText: async () => {} }, serviceWorker: { register: async () => {} } },
  writable: true, configurable: true,
});
globalThis.document = {
  createElement(tag) {
    return {
      tagName: tag, style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
      addEventListener() {}, removeEventListener() {},
      appendChild(c) { return c; }, removeChild(c) { return c; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      contains() { return false; },
      getContext() {
        const n = () => {};
        return new Proxy({}, { get(t, p) {
          if (p === 'measureText') return () => ({ width: 0 });
          if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ addColorStop: n });
          return n;
        }, set() { return true; } });
      },
      toBlob(cb) { cb(new Blob()); }, toDataURL() { return ''; },
      width: 0, height: 0, innerHTML: '', textContent: '', click() {},
    };
  },
  body: { appendChild() {}, removeChild() {}, contains() { return false; } },
  documentElement: { style: {} },
  getElementById() { return { innerHTML: '' }; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElementNS(ns, tag) { return globalThis.document.createElement(tag); },
  createTextNode(t) { return { textContent: t }; },
  addEventListener() {}, removeEventListener() {},
  head: { appendChild() {} },
};
globalThis.window = globalThis;
globalThis.localStorage = {
  _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; }, clear() { this._s = {}; },
};
globalThis.sessionStorage = {
  _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; }, clear() { this._s = {}; },
};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.ClipboardItem = class {};
globalThis.fetch = async () => ({ ok: false, status: 0, json: async () => ({}), text: async () => '' });
globalThis.Image = class { set src(v) {} set crossOrigin(v) {} set onload(v) {} set onerror(v) {} get width() { return 100; } get height() { return 100; } };
globalThis.Blob = globalThis.Blob || class {};
globalThis.AbortController = class {
  constructor() {
    this.signal = { addEventListener() {}, removeEventListener() {}, aborted: false, reason: undefined, onabort: null, throwIfAborted() {} };
  }
  abort() { this.signal.aborted = true; }
};
globalThis.TextEncoder = globalThis.TextEncoder || class { encode(s) { return new Uint8Array(s?.length || 0); } };
globalThis.HTMLElement = globalThis.HTMLElement || class {};
globalThis.location = { href: 'http://localhost', hostname: 'localhost', search: '', hash: '' };
globalThis.history = { pushState() {}, replaceState() {} };
globalThis.performance = globalThis.performance || { now: Date.now };
globalThis.getComputedStyle = () => new Proxy({}, { get() { return ''; } });
globalThis.MutationObserver = class { observe() {} disconnect() {} };
globalThis.CustomEvent = globalThis.CustomEvent || class extends Event { constructor(t, o) { super(t); this.detail = o?.detail; } };
