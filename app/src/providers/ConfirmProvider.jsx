// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — ConfirmProvider
// Native-style confirmation modal (replaces window.confirm).
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { FocusTrapModal } from './FocusTrapModal.jsx';

// [SECTION:CONFIRM-DIALOG] — Native-style confirmation modal (replaces window.confirm)
const ConfirmContext = createContext(null);
const useConfirm = () => useContext(ConfirmContext);

const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  // F-I04: Reject stale promise on unmount to prevent memory leak
  useEffect(() => {
    return () => { resolveRef.current?.(false); resolveRef.current = null; };
  }, []);

  const confirm = useCallback(({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false }) => {
    // Resolve any pending confirm before opening a new one
    resolveRef.current?.(false);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ title, message, confirmLabel, cancelLabel, destructive });
    });
  }, []);

  const handleClose = useCallback((result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <FocusTrapModal isOpen={!!state} onClose={() => handleClose(false)} className="bg-black/80" onClick={() => handleClose(false)} ariaLabel={state?.title || 'Confirm'} centered>
        {state && (
          <div className="kuro-card w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="kuro-card-inner rounded-2xl overflow-hidden">
              <div className="p-5 text-center">
                <h3 className="text-white font-semibold text-md mb-2">{state.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed whitespace-pre-line">{state.message}</p>
              </div>
              <div className="border-t border-[var(--border-medium)] flex">
                <button onClick={() => handleClose(false)} className="flex-1 py-3.5 text-md text-gray-300 font-medium border-r border-[var(--border-medium)] active:bg-white/5 transition-colors">{state.cancelLabel}</button>
                <button onClick={() => handleClose(true)} className={`flex-1 py-3.5 text-md font-semibold active:bg-white/5 transition-colors ${state.destructive ? 'text-red-400' : 'text-cyan-400'}`}>{state.confirmLabel}</button>
              </div>
            </div>
          </div>
        )}
      </FocusTrapModal>
    </ConfirmContext.Provider>
  );
};

export { ConfirmProvider, useConfirm };
