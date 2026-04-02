// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/KuroSelect.jsx
// Custom styled select dropdown — replaces native <select> with kuro-card backdrop
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown } from 'lucide-react';

const KuroSelect = memo(({ value, onChange, options, className = '', ariaLabel, small, center }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`flex items-center ${center ? 'justify-center' : 'justify-between'} gap-1 w-full rounded-lg text-gray-300 border border-[var(--border-medium)] focus:border-yellow-500/50 focus:outline-none transition-colors ${small ? 'px-2 py-1.5 text-[10px]' : 'px-2.5 py-1.5 text-[10px] min-h-[44px]'}`}
        style={{ background: 'var(--bg-btn)' }}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown size={12} className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 z-[200] flex flex-col gap-1.5"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map(opt => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`kuro-btn w-full text-left px-3 py-2.5 text-sm ${active ? 'active-gold' : 'text-gray-300'}`}
                style={{
                  backdropFilter: 'blur(2px) brightness(0.6)',
                  WebkitBackdropFilter: 'blur(2px) brightness(0.6)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
KuroSelect.displayName = 'KuroSelect';

export { KuroSelect };
