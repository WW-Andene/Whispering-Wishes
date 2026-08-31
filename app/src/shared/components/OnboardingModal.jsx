// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — OnboardingModal
// First-run onboarding walkthrough modal.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Sparkles, Calculator, Upload, Target, BarChart3, LayoutGrid, CheckCircle, Users } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';
import { t } from '../../utils/i18n.js';

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: t('modals.onboarding.step1Title'), icon: <Sparkles size={28} />, desc: t('modals.onboarding.step1Desc'), color: '#edaf18' },
    { title: t('modals.onboarding.step2Title'), icon: <Upload size={28} />, desc: t('modals.onboarding.step2Desc'), color: '#22d3ee' },
    { title: t('modals.onboarding.step3Title'), icon: <Target size={28} />, desc: t('modals.onboarding.step3Desc'), color: '#fb923c' },
    { title: t('modals.onboarding.step4Title'), icon: <LayoutGrid size={28} />, desc: t('modals.onboarding.step4Desc'), color: '#a855f7' },
    { title: t('modals.onboarding.step5Title'), icon: <Users size={28} />, desc: t('modals.onboarding.step5Desc'), color: '#60a5fa' },
    { title: t('modals.onboarding.step6Title'), icon: <Calculator size={28} />, desc: t('modals.onboarding.step6Desc'), color: '#34d399' },
    { title: t('modals.onboarding.step7Title'), icon: <BarChart3 size={28} />, desc: t('modals.onboarding.step7Desc'), color: '#f472b6' },
    { title: t('modals.onboarding.step8Title'), icon: <CheckCircle size={28} />, desc: t('modals.onboarding.step8Desc'), color: '#edaf18' }
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

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

          {/* Content */}
          <div className="kuro-body text-center pt-6" aria-live="polite" aria-atomic="true">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ color: s.color, background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
              {s.icon}
            </div>
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
    </FocusTrapModal>
  );
};

export { OnboardingModal };
