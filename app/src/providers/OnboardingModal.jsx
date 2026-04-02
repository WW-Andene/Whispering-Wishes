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
  // P12-FIX: Add focus trapping and escape key support to onboarding modal (Step 11 audit — MEDIUM-6a)
  // Refactored to use FocusTrapModal wrapper (handles focus trap, escape key, and scroll lock)
  const steps = [
    { title: "Welcome to Whispering Wishes!", icon: <Sparkles size={32} />, desc: "Your companion for Wuthering Waves Convene planning.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#edaf18' },
    { title: "Import Your History", icon: <Upload size={32} />, desc: "Head to the Profile tab to import your Convene (pull) history.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20', color: '#22d3ee' },
    { title: "Track Your Banners", icon: <Target size={32} />, desc: "See active banners, pity progress (pulls since last 5★), and countdowns.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30', border: 'border-orange-500/30', bg: 'bg-orange-500/20', color: '#fb923c' },
    { title: "Build Your Collection", icon: <LayoutGrid size={32} />, desc: "Track all your Resonators and weapons.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30', border: 'border-purple-500/30', bg: 'bg-purple-500/20', color: '#a855f7' },
    { title: "Calculate Your Odds", icon: <Calculator size={32} />, desc: "Enter your Astrite and pity to see exact pull probabilities.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-emerald-900/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', color: '#34d399' },
    { title: "View Analytics", icon: <BarChart3 size={32} />, desc: "Check your luck rating, charts, and Convene history.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30', border: 'border-pink-500/30', bg: 'bg-pink-500/20', color: '#f472b6' },
    { title: "You're Ready!", icon: <CheckCircle size={32} />, desc: "Good luck on your Convenes, Rover!", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#edaf18' }
  ];

  const s = steps[step];

  return (
    <FocusTrapModal isOpen={true} onClose={onComplete} ariaLabel="Welcome to Whispering Wishes" className="bg-black/90" centered>
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient} w-full max-w-xs`} style={{ backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', zIndex: 5 }}>
        {/* §E9-MC-F3: Angular decorative patterns matching HUD aesthetic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" aria-hidden="true">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rotate-45 ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rotate-45 ${s.bg} blur-xl opacity-25`} />
        </div>

        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-xs min-h-[44px] min-w-[44px] px-3 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>

        {/* Content */}
        <div className="relative z-10 p-5 pt-8 text-center" aria-live="polite" aria-atomic="true">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.bg} border ${s.border} mb-3`} style={{color: s.color}}>
            {s.icon}
          </div>
          <h4 className="font-bold text-sm text-gray-200 mb-1">{s.title}</h4>
          <p className="text-gray-400 text-[10px]">{s.desc}</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-3" role="group" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === step ? s.bg : 'bg-white/10'}`} style={{ width: i === step ? '14px' : '5px' }} aria-hidden="true" />
          ))}
        </div>

        {/* Navigation */}
        <div className="p-3 flex justify-between items-center" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="w-12">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="text-xs min-h-[44px] px-4 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="text-xs min-h-[44px] px-4 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Next</button>
            ) : (
              <button onClick={onComplete} className="text-xs min-h-[44px] px-4 py-2 rounded border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-medium">Get Started</button>
            )}
          </div>
        </div>
      </div>
    </FocusTrapModal>
  );
};

export { OnboardingModal };
