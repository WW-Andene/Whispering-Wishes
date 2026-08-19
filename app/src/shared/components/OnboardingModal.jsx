// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — OnboardingModal
// First-run onboarding walkthrough modal.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Sparkles, Calculator, Upload, Target, BarChart3, LayoutGrid, CheckCircle } from 'lucide-react';
import { FocusTrapModal } from './FocusTrapModal.jsx';

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Welcome to Whispering Wishes!", icon: <Sparkles size={28} />, desc: "Your companion for Wuthering Waves Convene planning.", color: '#edaf18' },
    { title: "Import Your History", icon: <Upload size={28} />, desc: "Head to the Profile tab to import your Convene history.", color: '#22d3ee' },
    { title: "Track Your Banners", icon: <Target size={28} />, desc: "See active banners, pity progress (pulls since last 5\u2605), and countdowns.", color: '#fb923c' },
    { title: "Build Your Collection", icon: <LayoutGrid size={28} />, desc: "Track all your Resonators and weapons.", color: '#a855f7' },
    { title: "Calculate Your Odds", icon: <Calculator size={28} />, desc: "Enter your Astrite and pity to see exact pull probabilities.", color: '#34d399' },
    { title: "View Analytics", icon: <BarChart3 size={28} />, desc: "Check your luck rating, charts, and Convene history.", color: '#f472b6' },
    { title: "You're Ready!", icon: <CheckCircle size={28} />, desc: "Good luck on your Convenes, Rover!", color: '#edaf18' }
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <FocusTrapModal isOpen={true} onClose={onComplete} ariaLabel="Welcome to Whispering Wishes" className="bg-black/90" centered>
      <div className="kuro-card w-full max-w-xs" style={{ border: `1px solid ${s.color}30` }}>
        <div className="kuro-card-inner rounded-2xl overflow-hidden">

          {/* Skip button */}
          <button onClick={onComplete} className="kuro-btn absolute top-3 right-3 z-20" style={{ padding: '6px 12px', fontSize: 'var(--font-sm)' }}>Skip</button>

          {/* Content */}
          <div className="kuro-body text-center pt-6" aria-live="polite" aria-atomic="true">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ color: s.color, background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
              {s.icon}
            </div>
            <h4 className="font-bold text-lg" style={{ color: 'var(--text-heading)' }}>{s.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>{s.desc}</p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 py-3" role="group" aria-label={`Step ${step + 1} of ${steps.length}`}>
            {steps.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all" style={{ width: i === step ? '14px' : '5px', background: i === step ? s.color : 'var(--border-medium)' }} aria-hidden="true" />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center" style={{ padding: 'var(--card-padding)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '72px' }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="kuro-btn" style={{ padding: '8px 14px', fontSize: 'var(--font-sm)' }}>Back</button>
              )}
            </div>
            <div>
              {!isLast ? (
                <button onClick={() => setStep(step + 1)} className="kuro-btn" style={{ padding: '8px 14px', fontSize: 'var(--font-sm)', borderColor: `${s.color}50`, color: s.color }}>Next</button>
              ) : (
                <button onClick={onComplete} className="kuro-btn active-emerald" style={{ padding: '8px 16px', fontSize: 'var(--font-sm)' }}>Get Started</button>
              )}
            </div>
          </div>

        </div>
      </div>
    </FocusTrapModal>
  );
};

export { OnboardingModal };
