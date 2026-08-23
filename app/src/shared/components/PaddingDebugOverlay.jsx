// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/PaddingDebugOverlay.jsx
// Dev tool: highlights every element's padding box on screen, with px labels.
// Toggled from Admin Panel > Debug tab (persisted in localStorage).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export const DEBUG_PADDING_STORAGE_KEY = 'ww-debug-padding';
export const DEBUG_PADDING_EVENT = 'ww-debug-padding-changed';

export function getDebugPaddingEnabled() {
  try { return localStorage.getItem(DEBUG_PADDING_STORAGE_KEY) === '1'; } catch { return false; }
}

export function setDebugPaddingEnabled(enabled) {
  try { localStorage.setItem(DEBUG_PADDING_STORAGE_KEY, enabled ? '1' : '0'); } catch {}
  window.dispatchEvent(new Event(DEBUG_PADDING_EVENT));
}

const SCAN_INTERVAL_MS = 400;

function collectPaddingBoxes(rootEl) {
  const boxes = [];
  const all = rootEl.querySelectorAll('*');
  for (const el of all) {
    if (el.closest('[data-ww-debug-overlay]')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const pt = parseFloat(cs.paddingTop) || 0;
    const pr = parseFloat(cs.paddingRight) || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;
    const pl = parseFloat(cs.paddingLeft) || 0;
    if (!pt && !pr && !pb && !pl) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) continue;

    const borderTop = el.clientTop;
    const borderLeft = el.clientLeft;
    const boxW = el.clientWidth;   // padding-box width (padding + content, no border/scrollbar)
    const boxH = el.clientHeight;  // padding-box height
    if (boxW === 0 || boxH === 0) continue;

    const boxTop = rect.top + borderTop;
    const boxLeft = rect.left + borderLeft;

    boxes.push({
      key: `${boxTop.toFixed(1)}-${boxLeft.toFixed(1)}-${boxW}-${boxH}-${pt}-${pr}-${pb}-${pl}-${Math.random().toString(36).slice(2, 6)}`,
      boxTop, boxLeft, boxW, boxH, pt, pr, pb, pl,
    });
  }
  // Number them reading order: top-to-bottom, then left-to-right
  boxes.sort((a, b) => a.boxTop - b.boxTop || a.boxLeft - b.boxLeft);
  boxes.forEach((b, i) => { b.num = i + 1; });
  return boxes;
}

const PaddingDebugOverlay = () => {
  const [enabled, setEnabled] = useState(getDebugPaddingEnabled);
  const [boxes, setBoxes] = useState([]);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onToggle = () => setEnabled(getDebugPaddingEnabled());
    window.addEventListener(DEBUG_PADDING_EVENT, onToggle);
    window.addEventListener('storage', onToggle);
    return () => {
      window.removeEventListener(DEBUG_PADDING_EVENT, onToggle);
      window.removeEventListener('storage', onToggle);
    };
  }, []);

  const scan = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setBoxes(collectPaddingBoxes(document.body)));
  }, []);

  useEffect(() => {
    if (!enabled) { setBoxes([]); return; }
    scan();
    timerRef.current = setInterval(scan, SCAN_INTERVAL_MS);
    window.addEventListener('scroll', scan, { passive: true, capture: true });
    window.addEventListener('resize', scan, { passive: true });
    return () => {
      clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', scan, { capture: true });
      window.removeEventListener('resize', scan);
    };
  }, [enabled, scan]);

  if (!enabled) return null;

  return createPortal(
    <div data-ww-debug-overlay className="fixed inset-0 pointer-events-none" style={{ zIndex: 999999 }}>
      {boxes.map(b => {
        const labelBase = {
          position: 'fixed',
          fontSize: '9px',
          lineHeight: 1,
          fontFamily: 'monospace',
          color: '#fff',
          background: 'rgba(236,72,153,0.9)',
          padding: '1px 3px',
          borderRadius: '2px',
          whiteSpace: 'nowrap',
        };
        const innerLeft = b.boxLeft + b.pl;
        const innerTop = b.boxTop + b.pt;
        const innerW = b.boxW - b.pl - b.pr;
        const innerH = b.boxH - b.pt - b.pb;
        return (
          <React.Fragment key={b.key}>
            {b.pt > 0 && <div style={{ position: 'fixed', top: b.boxTop, left: b.boxLeft, width: b.boxW, height: b.pt, background: 'rgba(236,72,153,0.35)', outline: '1px solid rgba(236,72,153,0.7)' }} />}
            {b.pb > 0 && <div style={{ position: 'fixed', top: b.boxTop + b.boxH - b.pb, left: b.boxLeft, width: b.boxW, height: b.pb, background: 'rgba(236,72,153,0.35)', outline: '1px solid rgba(236,72,153,0.7)' }} />}
            {b.pl > 0 && <div style={{ position: 'fixed', top: b.boxTop + b.pt, left: b.boxLeft, width: b.pl, height: b.boxH - b.pt - b.pb, background: 'rgba(236,72,153,0.35)', outline: '1px solid rgba(236,72,153,0.7)' }} />}
            {b.pr > 0 && <div style={{ position: 'fixed', top: b.boxTop + b.pt, left: b.boxLeft + b.boxW - b.pr, width: b.pr, height: b.boxH - b.pt - b.pb, background: 'rgba(236,72,153,0.35)', outline: '1px solid rgba(236,72,153,0.7)' }} />}

            {/* Top padding label — horizontal, centered on the top strip */}
            {b.pt > 0 && (
              <div style={{ ...labelBase, top: b.boxTop + Math.max(0, b.pt - 12) / 2, left: b.boxLeft + b.boxW / 2, transform: 'translate(-50%, 0)' }}>
                T{b.pt}
              </div>
            )}
            {/* Bottom padding label — horizontal, centered on the bottom strip */}
            {b.pb > 0 && (
              <div style={{ ...labelBase, top: b.boxTop + b.boxH - b.pb + Math.max(0, b.pb - 12) / 2, left: b.boxLeft + b.boxW / 2, transform: 'translate(-50%, 0)' }}>
                B{b.pb}
              </div>
            )}
            {/* Left padding label — rotated vertical, centered on the left strip */}
            {b.pl > 0 && (
              <div style={{ ...labelBase, top: innerTop + innerH / 2, left: b.boxLeft + b.pl / 2, transform: 'translate(-50%, -50%) rotate(-90deg)' }}>
                L{b.pl}
              </div>
            )}
            {/* Right padding label — rotated vertical, centered on the right strip */}
            {b.pr > 0 && (
              <div style={{ ...labelBase, top: innerTop + innerH / 2, left: b.boxLeft + b.boxW - b.pr / 2, transform: 'translate(-50%, -50%) rotate(-90deg)' }}>
                R{b.pr}
              </div>
            )}
            <div style={{ position: 'fixed', top: b.boxTop + 1, left: b.boxLeft + 1, fontSize: '9px', lineHeight: 1, fontFamily: 'monospace', color: '#fff', background: 'rgba(236,72,153,0.9)', padding: '1px 3px', borderRadius: '2px', whiteSpace: 'nowrap' }}>#{b.num}</div>
          </React.Fragment>
        );
      })}
      <div className="fixed bottom-3 right-3 text-xs font-mono text-white bg-pink-600/90 px-3 py-1.5 rounded-lg shadow-lg">
        🐛 Padding debug — {boxes.length} éléments
      </div>
    </div>,
    document.body
  );
};

export default PaddingDebugOverlay;
