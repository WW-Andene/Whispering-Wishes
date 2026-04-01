// Shared silent error handler — logs in dev, marks error as silenced
export const silentCatch = (err, context = '') => {
  if (typeof err === 'object' && err !== null) {
    Object.defineProperty(err, '_silenced', { value: true, writable: false, enumerable: false });
  }
  if (import.meta.env?.DEV) {
    console.warn(`[WW] Silent catch${context ? ` in ${context}` : ''}:`, err);
  }
};
