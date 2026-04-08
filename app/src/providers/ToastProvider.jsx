// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — ToastProvider
// Toast queue system with haptic feedback and undo support.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { haptic, generateUniqueId } from '../utils/helpers.js';

// [SECTION:TOAST]

const ToastContext = createContext(null);


const MAX_TOASTS = 5;

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef(new Map());
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
      timerRefs.current.clear();
    };
  }, []);

  const addToast = useCallback((message, type = 'info', duration, onUndo = null) => {
    if (duration === undefined) duration = type === 'error' ? 4500 : 3000;
    const id = generateUniqueId();
    setToasts(prev => {
      const next = [...prev, { id, message, type, onUndo }];
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timerRefs.current.delete(id);
    }, duration);
    timerRefs.current.set(id, timer);
    // Haptic feedback per toast type
    if (type === 'success') haptic.success();
    else if (type === 'error') haptic.error();
    else if (type === 'warning') haptic.warning();
    else haptic.light();
  }, []);

  const contextValue = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* MED-4: Toast z-index separated from install prompt */}
      <div className="fixed bottom-20 left-3 right-3 z-[9500] flex flex-col items-center gap-2 pointer-events-none" role="status" aria-live="polite" aria-atomic="true" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg flex items-center gap-2 text-base font-medium pointer-events-auto border ${toast.type === 'warning' ? 'text-amber-900 border-amber-300/40' : 'text-white border-white/20'}`} style={{
            animation: 'slideUp 0.2s ease-out',
            background: toast.type === 'success' ? 'rgba(34,197,94,0.9)' : toast.type === 'error' ? 'rgba(248,113,113,0.9)' : toast.type === 'warning' ? 'rgba(252,211,77,0.95)' : 'rgba(56,189,248,0.9)',
          }}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {/* AUDIT-FIX N7: Use AlertTriangle for warnings to distinguish from errors */}
            {toast.type === 'warning' && <AlertTriangle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            <span className="flex-1">{toast.message}</span>
            {toast.onUndo && (
              <button onClick={() => {
                toast.onUndo();
                setToasts(prev => prev.filter(t => t.id !== toast.id));
                const timer = timerRefs.current.get(toast.id);
                if (timer) { clearTimeout(timer); timerRefs.current.delete(toast.id); }
              }} className={`ml-2 px-2 py-0.5 rounded text-base font-bold uppercase tracking-wider transition-colors flex-shrink-0 ${toast.type === 'warning' ? 'bg-amber-900/15 hover:bg-amber-900/25 text-amber-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

export { ToastContext, ToastProvider, useToast };
