// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/Card.jsx
// Card, CardHeader, CardBody, TabButton (basic container components)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo, useRef, useEffect } from 'react';
import { haptic } from '../../utils/helpers.js';

const Card = memo(({ children, className = '', style = {} }) => <div className={`kuro-card ${className}`} style={style}><div className="kuro-card-inner">{children}</div></div>);
Card.displayName = 'Card';
/* E4-HH1: `as` prop enables semantic heading tags (h2/h3) for accessibility */
const CardHeader = memo(({ children, action, as: Tag = 'h3' }) => <div className="kuro-header"><Tag>{children}</Tag>{action && <div className="kuro-header-action">{action}</div>}</div>);
CardHeader.displayName = 'CardHeader';
const CardBody = memo(({ children, className = '', style }) => <div className={`kuro-body ${className}`} style={style}>{children}</div>);
CardBody.displayName = 'CardBody';

const TabButton = memo(({ active, onClick, children, tabRef, tabId, accentColor }) => {
  const childArray = React.Children.toArray(children);
  const icon = childArray.find(child => React.isValidElement(child));
  const text = childArray.find(child => typeof child === 'string')?.trim();
  const btnRef = useRef(null);
  const accent = accentColor || null;

  useEffect(() => {
    let rafId = null;
    try {
      if (active && btnRef.current && tabRef?.current) {
        rafId = requestAnimationFrame(() => {
          const btn = btnRef.current;
          const nav = tabRef?.current;
          if (!btn || !nav) return;
          const indicator = nav.querySelector('.tab-indicator');
          if (indicator) {
            indicator.style.left = `${btn.offsetLeft + btn.offsetWidth * 0.2}px`;
            indicator.style.width = `${btn.offsetWidth * 0.6}px`;
            if (accent) {
              indicator.style.background = `linear-gradient(90deg, ${accent}99, ${accent}, ${accent}99)`;
              indicator.style.boxShadow = `0 0 12px ${accent}80`;
            } else {
              indicator.style.background = `linear-gradient(90deg, rgba(237,175,24,0.6), rgba(237,175,24,1), rgba(237,175,24,0.6))`;
              indicator.style.boxShadow = `0 0 12px rgba(237,175,24,0.5)`;
            }
          }
        });
      }
    } catch (e) { /* ignore indicator errors */ }
    return () => { if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [active, tabRef, accent]);

  return (
    <button
      ref={btnRef}
      onClick={() => { haptic.light(); onClick(); }}
      role="tab"
      id={tabId ? `tab-${tabId}` : undefined}
      aria-selected={active}
      aria-controls={tabId ? `tabpanel-${tabId}` : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={`${text || 'Navigation'} tab`}
      className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 text-[10px] font-medium transition-all duration-300 whitespace-nowrap group ${active && !accent ? 'text-yellow-400' : !active ? 'text-gray-500 hover:text-gray-300' : ''}`}
      style={active && accent ? { color: accent } : undefined}
    >
      <div className={`relative z-10 p-1.5 rounded-xl transition-all duration-300 ${active && !accent ? 'bg-yellow-500/10 shadow-lg shadow-yellow-500/25' : !active ? 'group-hover:bg-white/5 group-hover:shadow-md group-hover:shadow-white/5' : ''}`} style={active ? { filter: `drop-shadow(0 0 5px ${accent ? accent + '80' : 'rgba(237,175,24,0.5)'})`, ...(accent ? { background: accent + '1a', boxShadow: `0 10px 15px -3px ${accent}40` } : {}) } : undefined}>
        {icon}
      </div>
      <span className="relative z-10">{text}</span>
    </button>
  );
});
TabButton.displayName = 'TabButton';

export { Card, CardHeader, CardBody, TabButton };
