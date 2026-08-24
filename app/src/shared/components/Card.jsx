// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/Card.jsx
// Card, CardHeader, CardBody, TabButton (basic container components)
// ═══════════════════════════════════════════════════════════════════════════════

import React, { memo, useRef, useEffect } from 'react';
import { haptic } from '../../utils/helpers.js';
import { t } from '../../utils/i18n.js';

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
  // Skip whitespace-only text nodes (e.g. the literal " " JSX keeps as its own
  // child between an icon and a `{t('...')}` expression) so we don't pick that
  // up instead of the actual label.
  const text = childArray.find(child => typeof child === 'string' && child.trim() !== '')?.trim();
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
            indicator.style.transform = `translateX(${btn.offsetLeft + btn.offsetWidth * 0.2}px)`;
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
      aria-label={`${text || t('app.navigationFallback')} tab`}
      className={`relative flex flex-col items-center justify-center p-2 text-md font-medium transition-all duration-300 whitespace-nowrap group active:scale-[0.97] ${active && !accent ? 'text-yellow-400' : !active ? 'text-white hover:text-gray-300' : ''}`}
      style={active && accent ? { color: accent } : undefined}
    >
      <div className={`relative z-10 w-[30px] h-[30px] flex items-center justify-center transition-all duration-300 ${active && !accent ? 'bg-yellow-500/25 shadow-lg shadow-yellow-500/25' : !active ? 'group-hover:bg-white/5 group-hover:shadow-md group-hover:shadow-white/5' : ''}`} style={{ borderRadius: 'var(--radius-md)', ...(active ? { filter: `drop-shadow(0 0 3px ${accent ? accent + '80' : 'rgba(237,175,24,0.5)'})`, ...(accent ? { background: accent + '30', boxShadow: `0 10px 15px -3px ${accent}40` } : {}) } : { filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.35))' }) }}>
        {icon}
      </div>
      <span className="relative z-10 leading-none">{text}</span>
    </button>
  );
});
TabButton.displayName = 'TabButton';

export { Card, CardHeader, CardBody, TabButton };
