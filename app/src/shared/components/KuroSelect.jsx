// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/KuroSelect.jsx
// Custom styled select dropdown — replaces native <select> with kuro-card backdrop
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const KuroSelect = memo(({ value, onChange, options, className = '', ariaLabel, small, center }) => {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const dropRef = useRef(null);
  const optionRefs = useRef([]);
  const selected = options.find(o => o.value === value);

  // Compute position when opening
  const toggle = useCallback(() => {
    setOpen(prev => {
      if (!prev && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
      return !prev;
    });
  }, []);

  // Close on outside click (check both trigger and dropdown)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current?.contains(e.target)) return;
      if (dropRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Focus the highlighted option when focusIdx changes
  useEffect(() => {
    if (open && focusIdx >= 0 && optionRefs.current[focusIdx]) {
      optionRefs.current[focusIdx].focus();
    }
  }, [open, focusIdx]);

  // Reset focus index when opening, starting at current value
  useEffect(() => {
    if (open) {
      const idx = options.findIndex(o => o.value === value);
      setFocusIdx(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  // G3-01: Arrow key navigation for ARIA listbox compliance
  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIdx(i => (i + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIdx(i => (i - 1 + options.length) % options.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusIdx(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusIdx(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIdx >= 0 && options[focusIdx]) {
          onChange(options[focusIdx].value);
          setOpen(false);
          ref.current?.querySelector('button')?.focus();
        }
        break;
      default:
        break;
    }
  }, [open, options, focusIdx, onChange]);

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center ${center ? 'justify-center' : 'justify-between'} gap-1 w-full rounded-lg text-gray-300 border border-[var(--border-medium)] focus:border-yellow-500/50 focus:outline-none transition-colors ${small ? 'px-2 py-1.5 text-sm' : 'px-3 py-1.5 text-sm min-h-[48px]'}`}
        style={{ background: 'var(--bg-btn)' }}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown size={12} className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && pos && createPortal(
        <div
          ref={dropRef}
          className="fixed flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto scrollbar-hide"
          role="listbox"
          aria-label={ariaLabel ? ariaLabel + ' options' : undefined}
          aria-activedescendant={focusIdx >= 0 && options[focusIdx] ? `kuroselect-opt-${options[focusIdx].value}` : undefined}
          style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 10001, overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          {options.map((opt, i) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                id={`kuroselect-opt-${opt.value}`}
                ref={el => { optionRefs.current[i] = el; }}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={i === focusIdx ? 0 : -1}
                onClick={() => { onChange(opt.value); setOpen(false); ref.current?.querySelector('button')?.focus(); }}
                className={`kuro-btn w-full text-left px-3 py-3 text-md ${active ? 'active-gold' : 'text-gray-300'}`}
                style={{
                  backdropFilter: 'blur(2px) brightness(0.6)',
                  WebkitBackdropFilter: 'blur(2px) brightness(0.6)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
});
KuroSelect.displayName = 'KuroSelect';

export { KuroSelect };
