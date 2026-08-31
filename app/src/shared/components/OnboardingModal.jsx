// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — OnboardingModal
// First-run onboarding walkthrough modal.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { getPortalRoot, toCanvasSpace, toCanvasLength } from '../scaling/canvasScale.js';
import { t } from '../../utils/i18n.js';

// Which real nav element (its `id="tab-<id>"`, set by Card.jsx's TabButton
// for the bottom nav, or directly on the header button for Profile) each
// step is actually about — null for the intro/outro steps, which aren't
// about any one tab. Drives the pulsing highlight ring below.
const TAB_ID_BY_STEP = [null, 'profile', 'tracker', 'gathering', 'teams', 'calculator', 'analytics', null];

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: t('modals.onboarding.step1Title'), desc: t('modals.onboarding.step1Desc'), color: '#edaf18' },
    { title: t('modals.onboarding.step2Title'), desc: t('modals.onboarding.step2Desc'), color: '#22d3ee' },
    { title: t('modals.onboarding.step3Title'), desc: t('modals.onboarding.step3Desc'), color: '#fb923c' },
    { title: t('modals.onboarding.step4Title'), desc: t('modals.onboarding.step4Desc'), color: '#a855f7' },
    { title: t('modals.onboarding.step5Title'), desc: t('modals.onboarding.step5Desc'), color: '#60a5fa' },
    { title: t('modals.onboarding.step6Title'), desc: t('modals.onboarding.step6Desc'), color: '#34d399' },
    { title: t('modals.onboarding.step7Title'), desc: t('modals.onboarding.step7Desc'), color: '#f472b6' },
    { title: t('modals.onboarding.step8Title'), desc: t('modals.onboarding.step8Desc'), color: '#edaf18' }
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  // Highlights the real tab this step is about with a pulsing ring —
  // measured in real screen space (getBoundingClientRect) then converted to
  // the canvas's own pre-transform coordinate space via toCanvasSpace/
  // toCanvasLength, same as FocusTrapModal's own drag handler does, since
  // this renders as a `position: fixed` portal inside ScaledCanvas.jsx's
  // transformed ancestor (see canvasScale.js's own comment on why that
  // conversion is needed). Portaled as its own top-level element (not just
  // a class toggled on the real nav button) so it renders ABOVE the
  // modal's own dark scrim instead of being dimmed along with it — a
  // z-index bump on the button itself couldn't escape <nav>'s own, lower
  // stacking context to get above that scrim.
  const [highlightRect, setHighlightRect] = useState(null);
  useEffect(() => {
    const tabId = TAB_ID_BY_STEP[step];
    if (!tabId) {
      setHighlightRect(null);
      return;
    }
    const update = () => {
      const el = document.getElementById(`tab-${tabId}`);
      if (!el) {
        setHighlightRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const topLeft = toCanvasSpace(r.left, r.top);
      setHighlightRect({ x: topLeft.x, y: topLeft.y, w: toCanvasLength(r.width), h: toCanvasLength(r.height) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [step]);

  return (
    <FocusTrapModal isOpen={true} onClose={onComplete} ariaLabel={t('modals.onboarding.ariaLabel')} className="" centered padding="p-3">
      <div className="kuro-card w-full max-w-xs" style={{ border: `1px solid ${s.color}30` }}>
        <div className="kuro-card-inner rounded-2xl overflow-hidden">

          {/* Skip button — no focus ring: FocusTrapModal auto-focuses the
              first focusable element on open (accessibility requirement,
              shared by every modal), which is this button since it's first
              in the DOM. Chromium's :focus-visible heuristic treats that
              programmatic focus as "visible" the same as real keyboard
              focus, so it showed a highlight ring immediately on open with
              no tab press involved. */}
          <button onClick={onComplete} className="kuro-btn onboarding-skip-btn absolute top-3 right-4 z-20 min-h-[48px]" style={{ padding: '8px 14px', fontSize: 'var(--font-sm)' }}>{t('modals.onboarding.skip')}</button>

          {/* Content — Abby hosts the tutorial throughout, not just the intro
              step, so she stays put above the per-step title/desc. */}
          <div className="kuro-body text-center flex flex-col items-center justify-center min-h-[254px]" aria-live="polite" aria-atomic="true">
            <img src="./misc-assets/Abby_Full_Sprite.png" alt="" aria-hidden="true" className="mx-auto w-48 h-32 object-contain object-bottom mb-1" />
            <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{s.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>{s.desc}</p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 py-3" role="group" aria-label={t('modals.onboarding.stepOf', { current: step + 1, total: steps.length })}>
            {steps.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all" style={{ width: i === step ? '14px' : '5px', background: i === step ? s.color : 'var(--border-medium)' }} aria-hidden="true" />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center" style={{ padding: 'var(--card-padding)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '72px' }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="kuro-btn min-h-[48px]" style={{ padding: '8px 14px', fontSize: 'var(--font-sm)' }}>{t('modals.onboarding.back')}</button>
              )}
            </div>
            <div>
              {!isLast ? (
                <button onClick={() => setStep(step + 1)} className="kuro-btn min-h-[48px]" style={{ padding: '8px 14px', fontSize: 'var(--font-sm)', borderColor: `${s.color}50`, color: s.color }}>{t('modals.onboarding.next')}</button>
              ) : (
                <button onClick={onComplete} className="kuro-btn active-emerald min-h-[48px]" style={{ padding: '8px 16px', fontSize: 'var(--font-sm)' }}>{t('modals.onboarding.getStarted')}</button>
              )}
            </div>
          </div>

        </div>
      </div>
      {highlightRect && createPortal(
        <div
          className="onboarding-tab-highlight"
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: highlightRect.x,
            top: highlightRect.y,
            width: highlightRect.w,
            height: highlightRect.h,
            zIndex: 10001,
            pointerEvents: 'none',
            borderRadius: 12,
          }}
        />,
        getPortalRoot(),
      )}
    </FocusTrapModal>
  );
};

export { OnboardingModal };
