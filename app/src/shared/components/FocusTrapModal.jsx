// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — FocusTrapModal
// Accessible modal with focus trapping, escape key, drag-to-dismiss, scroll lock.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getPortalRoot, getScrollContainer, toCanvasLength } from '../scaling/canvasScale.js';

// [SECTION:A11Y_HOOKS] - Accessibility hooks for modal focus trapping & escape key
// P14-FIX: MEDIUM-22 — Re-query focusable elements on each Tab keypress instead of caching.
// Dynamic modals may render content after the trap is set up, so the focusable list can become stale.
const useFocusTrap = (isOpen) => {
  const ref = useRef(null);
  const previousFocusRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    const el = ref.current;
    if (!el) return;
    const getFocusable = () => el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const raf = requestAnimationFrame(() => { const f = getFocusable(); if (f.length) f[0].focus(); else if (el) { el.tabIndex = -1; el.focus(); } });
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      // Re-query on each Tab press to catch dynamically rendered elements
      const nodes = getFocusable();
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('keydown', handleKeyDown); if (previousFocusRef.current?.focus) previousFocusRef.current.focus(); };
  }, [isOpen]);
  return ref;
};
// Modal stack prevents multiple modals from all closing on a single Escape press.
// Only the most recently opened (topmost) modal responds to Escape.
const _modalStack = [];
const useEscapeKey = (isOpen, onClose) => {
  const idRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const id = Symbol('modal');
    idRef.current = id;
    _modalStack.push({ id, onClose });
    const handler = (e) => {
      if (e.key === 'Escape' && _modalStack.length > 0 && _modalStack[_modalStack.length - 1].id === id) {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      const idx = _modalStack.findIndex(m => m.id === id);
      if (idx !== -1) _modalStack.splice(idx, 1);
    };
  }, [isOpen, onClose]);
};

// P12-FIX: Reusable modal wrapper with focus trapping + escape handling for inline modals (Step 11 audit — MEDIUM-6d)
const FocusTrapModal = ({ isOpen, onClose, ariaLabel, children, className = '', onClick, centered = false, padding = 'p-4' }) => {
  const focusTrapRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, onClose);
  const dragRef = useRef({ startY: 0, currentY: 0, dragging: false });
  const sheetRef = useRef(null);
  // Prevent background scroll when modal is open. Used to be the classic
  // iOS body-scroll-lock trick (position:fixed + negative top offset) —
  // that specifically worked around iOS Safari ignoring `overflow:hidden`
  // on the real page's own <body> while still rubber-banding it. Now that
  // ScaledCanvas.jsx's inner div is the app's actual scroll container (not
  // body, which is `overflow:hidden` globally — see index.css), a plain
  // overflow toggle on that div is enough; it's a normal scrollable
  // element, not the page body, so it doesn't need the same workaround.
  useEffect(() => {
    if (!isOpen) return;
    const scrollEl = getScrollContainer();
    const prevOverflow = scrollEl.style.overflowY;
    scrollEl.style.overflowY = 'hidden';
    return () => {
      scrollEl.style.overflowY = prevOverflow;
    };
  }, [isOpen]);

  // Drag-to-dismiss handlers (mobile bottom sheet) — only from header zone
  const onTouchStart = useCallback((e) => {
    // Only allow drag from the header area (handle bar + header row)
    const target = e.target;
    const header = target.closest('[data-sheet-header]');
    if (!header) return;
    dragRef.current = { startY: e.touches[0].clientY, currentY: 0, dragging: true };
  }, []);
  const onTouchMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    // clientY delta is real screen px, but this translateY nests inside
    // ScaledCanvas.jsx's own transform — without converting, a finger
    // moving 100 real px would drag the sheet 100 CANVAS px, which renders
    // as 100*scale real px, breaking 1:1 finger tracking on any non-1x
    // canvas scale. toCanvasLength() undoes that.
    const dy = toCanvasLength(e.touches[0].clientY - dragRef.current.startY);
    if (dy < 0) return; // only drag down
    dragRef.current.currentY = dy;
    const sheet = sheetRef.current;
    if (sheet) sheet.style.transform = `translateY(${dy}px)`;
  }, []);
  const onTouchEnd = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const sheet = sheetRef.current;
    if (dragRef.current.currentY > 100) {
      // Dismiss
      if (sheet) sheet.style.transform = 'translateY(100%)';
      setTimeout(onClose, 150);
    } else {
      // Snap back
      if (sheet) sheet.style.transform = '';
    }
    dragRef.current.currentY = 0;
  }, [onClose]);

  if (!isOpen) return null;
  // Used to also carry sm:items-center/sm:justify-center/sm:p-3/sm:p-4 (and
  // the sheet div below had sm:contents), switching every modal — even
  // bottom-sheet ones — to a centered desktop dialog layout whenever the
  // REAL device was >=640px wide. Predates ScaledCanvas.jsx's engine: the
  // canvas is now ALWAYS phone-shaped regardless of real device width, so
  // that "desktop" swap fought the `centered` prop's own intentional
  // choice of bottom-sheet vs dialog instead of respecting it. Removed —
  // `centered` alone decides the layout now, unconditionally.
  return createPortal(
    <div
      ref={focusTrapRef}
      className={`fixed inset-0 z-[10000] flex ${centered ? `items-center justify-center ${padding === 'p-3' ? 'p-3' : 'p-4'}` : 'items-end'} modal-backdrop ${className}`}
      style={{
        // DSA-06 audit fix: chromatic navy scrim (--scrim token) instead of
        // the prior pure backdrop-blur-only treatment. Keeps modals cohesive
        // with the rest of the LAHAI-ROI palette; the blur still applies on top.
        background: 'var(--scrim)',
        backdropFilter: 'blur(2px) brightness(0.4)',
        WebkitBackdropFilter: 'blur(2px) brightness(0.4)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <div
        ref={sheetRef}
        className={`w-full ${centered ? 'flex items-center justify-center' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)', animation: centered ? 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'sheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {children}
      </div>
    </div>,
    getPortalRoot()
  );
};

export { useFocusTrap, useEscapeKey, FocusTrapModal };
