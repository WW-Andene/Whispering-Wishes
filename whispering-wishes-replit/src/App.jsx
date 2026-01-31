import React, { useState, useMemo, useCallback, useReducer, useEffect, useRef, createContext, useContext } from 'react';
import { Sparkles, Swords, Sword, Star, Calculator, User, Clock, Calendar, TrendingUp, Upload, Download, RefreshCcw, Globe, Monitor, Smartphone, Gamepad2, Trash2, Plus, Minus, Check, Target, BarChart3, Zap, Bell, Save, BookmarkPlus, X, ChevronDown, ChevronUp, LayoutGrid, Archive, History, HelpCircle, Info, CheckCircle, AlertCircle, Trophy, Award, Loader2, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v2.2.0 - Wuthering Waves Convene Companion
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" filename.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:TOAST]        - Toast notification system
// [SECTION:ONBOARDING]   - Onboarding modal
// [SECTION:LUCK]         - Luck rating calculation
// [SECTION:STYLES]       - KuroStyles CSS
// [SECTION:PITYRING]     - PityRing component
// [SECTION:SERVERS]      - Server/region data
// [SECTION:BANNERS]      - Current banner data
// [SECTION:HISTORY]      - Banner history archive
// [SECTION:EVENTS]       - Time-gated events data
// [SECTION:CONSTANTS]    - Game constants (pity, rates)
// [SECTION:TIME]         - Time utilities
// [SECTION:SIMULATION]   - Gacha simulation
// [SECTION:STATE]        - State management & reducer
// [SECTION:CALCULATIONS] - Pull calculations
// [SECTION:COMPONENTS]   - Reusable UI components
// [SECTION:MAINAPP]      - Main app component
// [SECTION:TAB-TRACKER]  - Tracker tab UI
// [SECTION:TAB-EVENTS]   - Events tab UI
// [SECTION:TAB-CALC]     - Calculator tab UI
// [SECTION:TAB-PLANNER]  - Planner tab UI
// [SECTION:TAB-STATS]    - Stats/Analytics tab UI
// [SECTION:TAB-COLLECT]  - Collection tab UI
// [SECTION:TAB-PROFILE]  - Profile tab UI
// [SECTION:EXPORT]       - Main export
// ─────────────────────────────────────────────────────────────────────────────

// [SECTION:TOAST]

const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{position:'fixed', bottom:'80px', left:'16px', right:'16px', zIndex:9999, display:'flex', flexDirection:'column', gap:'8px', pointerEvents:'none'}}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px', fontWeight: 500, pointerEvents: 'auto', animation: 'slideUp 0.2s ease-out',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Welcome to Whispering Wishes!", icon: <Sparkles size={32} />, desc: "Your companion for Wuthering Waves Convene planning.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#fbbf24' },
    { title: "Import Your History", icon: <Upload size={32} />, desc: "Go to the Profile tab and import data from wuwatracker.com.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20', color: '#22d3ee' },
    { title: "Track Your Banners", icon: <Target size={32} />, desc: "View current banners, pity progress, and time remaining.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30', border: 'border-orange-500/30', bg: 'bg-orange-500/20', color: '#fb923c' },
    { title: "Build Your Collection", icon: <LayoutGrid size={32} />, desc: "Track all your Resonators and weapons.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30', border: 'border-purple-500/30', bg: 'bg-purple-500/20', color: '#a855f7' },
    { title: "Calculate Your Odds", icon: <Calculator size={32} />, desc: "See your chances based on pity and resources.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-emerald-900/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', color: '#34d399' },
    { title: "View Analytics", icon: <BarChart3 size={32} />, desc: "Check your luck rating, charts, and Convene history.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30', border: 'border-pink-500/30', bg: 'bg-pink-500/20', color: '#f472b6' },
    { title: "You're Ready!", icon: <CheckCircle size={32} />, desc: "Good luck on your Convenes, Rover!", gradient: 'from-neutral-900/30 via-neutral-900/20 to-emerald-900/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', color: '#34d399' }
  ];
  
  const s = steps[step];
  
  return (
    <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'16px', background:'rgba(0,0,0,0.9)'}}>
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient}`} style={{ width:'100%', maxWidth:'320px', backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', position: 'relative', zIndex: 5 }}>
        {/* Decorative gradient circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rounded-full ${s.bg} blur-xl opacity-25`} />
        </div>
        
        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-[9px] px-2 py-0.5 rounded text-gray-400 hover:text-gray-300" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>
        
        {/* Content */}
        <div className="relative z-10 p-5 pt-8 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.bg} border ${s.border} mb-3`} style={{color: s.color}}>
            {s.icon}
          </div>
          <h4 className="font-bold text-sm text-gray-200 mb-1">{s.title}</h4>
          <p className="text-gray-500 text-[10px]">{s.desc}</p>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === step ? s.bg : 'bg-white/10'}`} style={{ width: i === step ? '14px' : '5px' }} />
          ))}
        </div>
        
        {/* Navigation */}
        <div className="p-3 flex justify-between items-center" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="w-12">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="text-[9px] px-2 py-1 rounded text-gray-400" style={{background:'rgba(255,255,255,0.05)'}}>Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="text-[9px] px-3 py-1 rounded text-gray-400" style={{background:'rgba(255,255,255,0.05)'}}>Next</button>
            ) : (
              <button onClick={onComplete} className="text-[9px] px-3 py-1 rounded border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">Get Started</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// [SECTION:LUCK]
const calculateLuckRating = (avgPity) => {
  if (!avgPity || avgPity === '—') return null;
  const avg = parseFloat(avgPity);
  if (isNaN(avg) || avg <= 0) return null;
  
  // Calculate percentile based on normal distribution (mean=62.5, std=12)
  // Lower avg pity = better luck = higher percentile
  const zScore = (62.5 - avg) / 12;
  const percentile = Math.min(99, Math.max(1, Math.round(50 + zScore * 34)));
  
  // WuWa-themed rank names
  if (percentile >= 90) return { rating: 'Arbiter', color: '#fbbf24', tier: 'S+', percentile };
  if (percentile >= 80) return { rating: 'Sentinel', color: '#a855f7', tier: 'S', percentile };
  if (percentile >= 60) return { rating: 'Resonator', color: '#3b82f6', tier: 'A', percentile };
  if (percentile >= 40) return { rating: 'Tacet Discord', color: '#22c55e', tier: 'B', percentile };
  return { rating: 'Civilian', color: '#6b7280', tier: 'C', percentile };
};

// [SECTION:STYLES]
const KuroStyles = () => (
  <style>{`
    /* ══════════════════════════════════════════════════════════════════════
       LAHAI-ROI DESIGN LANGUAGE - Black, White, Gold
       ══════════════════════════════════════════════════════════════════════ */
    
    .kuro-calc {
      position: relative;
      min-height: 100vh;
      color: #e2e8f0;
    }
    
    @keyframes rotate-ring {
      from { transform: translateX(-50%) rotate(0deg); }
      to { transform: translateX(-50%) rotate(360deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* ═══ CARD SYSTEM - Glassy gradient with ambient glow ═══ */
    .kuro-card {
      position: relative;
      z-index: 5;
      background: rgba(12, 16, 24, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      overflow: visible;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }
    
    /* Ambient glow behind card - creates depth */
    .kuro-card::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 16px;
      background: radial-gradient(
        ellipse 80% 60% at 50% 0%,
        rgba(255, 255, 255, 0.05) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse 60% 40% at 50% 100%,
        rgba(255, 255, 255, 0.03) 0%,
        transparent 50%
      );
      filter: blur(12px);
      z-index: -1;
      opacity: 0.6;
    }
    
    /* Top shimmer line */
    .kuro-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.3) 20%,
        rgba(255, 255, 255, 0.5) 50%,
        rgba(255, 255, 255, 0.3) 80%,
        transparent 100%
      );
      animation: shimmer 3s ease-in-out infinite;
      z-index: 1;
    }
    
    @keyframes shimmer {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    .kuro-card-inner {
      position: relative;
      overflow: hidden;
      border-radius: 11px;
    }
    
    /* Corner decorations */
    .kuro-card-inner::before {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0 4px 0 0;
      z-index: 2;
    }
    
    .kuro-card-inner::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 8px;
      width: 20px;
      height: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0 0 0 4px;
      z-index: 2;
    }
    
    .kuro-header {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%);
    }
    
    .kuro-header h3 {
      color: #f8fafc;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    
    /* Header icon decoration - white accent */
    .kuro-header h3::before {
      content: '';
      width: 3px;
      height: 14px;
      background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5));
      border-radius: 2px;
    }
    
    .kuro-body {
      padding: 16px;
      color: #e2e8f0;
    }
    
    /* ═══ BUTTONS - Glassy style with bright text ═══ */
    .kuro-btn {
      position: relative;
      background: rgba(15, 20, 28, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 12px;
      color: #f1f5f9;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s ease;
      text-align: center;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .kuro-btn:hover {
      border-color: rgba(255, 255, 255, 0.35);
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    
    /* Active states with glassy glow */
    .kuro-btn.active-gold {
      background: rgba(240, 192, 64, 0.2);
      border-color: rgba(240, 192, 64, 0.8);
      color: #fef08a;
      box-shadow: 0 0 30px rgba(240, 192, 64, 0.35), inset 0 0 20px rgba(240, 192, 64, 0.1);
      text-shadow: 0 0 10px rgba(240, 192, 64, 0.5);
    }
    
    .kuro-btn.active-pink {
      background: rgba(236, 72, 153, 0.2);
      border-color: rgba(236, 72, 153, 0.8);
      color: #fbcfe8;
      box-shadow: 0 0 30px rgba(236, 72, 153, 0.35), inset 0 0 20px rgba(236, 72, 153, 0.1);
      text-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
    }
    
    /* Blue for Standard banners */
    .kuro-btn.active-cyan {
      background: rgba(56, 189, 248, 0.2);
      border-color: rgba(56, 189, 248, 0.8);
      color: #bae6fd;
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.35), inset 0 0 20px rgba(56, 189, 248, 0.1);
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    
    .kuro-btn.active-purple {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.8);
      color: #e9d5ff;
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.35), inset 0 0 20px rgba(168, 85, 247, 0.1);
      text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }
    
    /* Muted green for Both options */
    .kuro-btn.active-emerald {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.8);
      color: #86efac;
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1);
      text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
    }
    
    .kuro-btn.active-orange {
      background: rgba(251, 146, 60, 0.2);
      border-color: rgba(251, 146, 60, 0.8);
      color: #fed7aa;
      box-shadow: 0 0 30px rgba(251, 146, 60, 0.35), inset 0 0 20px rgba(251, 146, 60, 0.1);
      text-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
    }
    
    /* Red for 50/50 */
    .kuro-btn.active-red {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.8);
      color: #fecaca;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.35), inset 0 0 20px rgba(239, 68, 68, 0.1);
      text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }
    
    /* ═══ INPUTS - Glassy style ═══ */
    .kuro-input {
      background: rgba(8, 12, 18, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 12px;
      color: #ffffff;
      font-size: 14px;
      width: 100%;
      transition: all 0.25s ease;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .kuro-input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05);
    }
    
    .kuro-input::placeholder {
      color: #9ca3af;
    }
    
    .kuro-input-sm {
      padding: 4px 8px;
      font-size: 12px;
      width: 56px;
      text-align: center;
    }
    
    /* ═══ PITY DISPLAY ═══ */
    .kuro-pity-ring {
      position: relative;
      width: 56px;
      height: 56px;
    }
    
    .kuro-pity-ring svg {
      transform: rotate(-90deg);
    }
    
    .kuro-pity-ring .ring-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 4;
    }
    
    .kuro-pity-ring .ring-progress {
      fill: none;
      stroke-width: 4;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease;
    }
    
    .kuro-pity-value {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    
    /* ═══ STAT BOXES - Glassy holographic style ═══ */
    .kuro-stat {
      position: relative;
      background: rgba(12, 16, 22, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      overflow: hidden;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .kuro-stat::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    }
    
    .kuro-stat-label {
      color: #d1d5db;
      font-size: 10px;
      margin-top: 4px;
    }
    
    .kuro-stat-gold {
      background: rgba(240, 192, 64, 0.15);
      border-color: rgba(240, 192, 64, 0.5);
    }
    .kuro-stat-gold::before {
      background: linear-gradient(90deg, transparent, rgba(240, 192, 64, 1), transparent);
    }
    
    .kuro-stat-pink {
      background: rgba(236, 72, 153, 0.15);
      border-color: rgba(236, 72, 153, 0.5);
    }
    .kuro-stat-pink::before {
      background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 1), transparent);
    }
    
    .kuro-stat-cyan {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.5);
    }
    .kuro-stat-cyan::before {
      background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 1), transparent);
    }
    
    .kuro-stat-green {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.5);
    }
    .kuro-stat-green::before {
      background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 1), transparent);
    }
    
    .kuro-stat-purple {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.5);
    }
    .kuro-stat-purple::before {
      background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 1), transparent);
    }
    
    .kuro-stat-emerald {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.5);
    }
    .kuro-stat-emerald::before {
      background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 1), transparent);
    }
    
    .kuro-stat-red {
      background: rgba(248, 113, 113, 0.15);
      border-color: rgba(248, 113, 113, 0.5);
    }
    .kuro-stat-red::before {
      background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 1), transparent);
    }
    
    /* ═══ LABELS - Bright for readability ═══ */
    .kuro-label {
      color: #e2e8f0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    
    /* ═══ RANGE SLIDER ═══ */
    .kuro-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.15);
      outline: none;
      margin: 8px 0;
    }
    
    .kuro-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f0c040, #fbbf24);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(240, 192, 64, 0.6);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    
    .kuro-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 18px rgba(240, 192, 64, 0.8);
    }
    
    .kuro-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f0c040, #fbbf24);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(240, 192, 64, 0.6);
    }
    
    .kuro-slider.pink::-webkit-slider-thumb {
      background: linear-gradient(135deg, #ec4899, #f472b6);
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
    }
    .kuro-slider.pink::-webkit-slider-thumb:hover {
      box-shadow: 0 0 18px rgba(236, 72, 153, 0.8);
    }
    
    .kuro-slider.cyan::-webkit-slider-thumb {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }
    .kuro-slider.cyan::-webkit-slider-thumb:hover {
      box-shadow: 0 0 18px rgba(56, 189, 248, 0.8);
    }
    
    .kuro-slider.purple::-webkit-slider-thumb {
      background: linear-gradient(135deg, #94a3b8, #64748b);
      box-shadow: 0 0 12px rgba(148, 163, 184, 0.6);
    }
    .kuro-slider.purple::-webkit-slider-thumb:hover {
      box-shadow: 0 0 18px rgba(148, 163, 184, 0.8);
    }
    
    /* ═══ PROGRESS BAR ═══ */
    .kuro-progress {
      position: relative;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-top: 8px;
    }
    
    .kuro-progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s ease;
      position: relative;
    }
    
    .kuro-progress-bar.gold {
      background: linear-gradient(90deg, #b8860b, #f0c040, #ffd700);
      box-shadow: 0 0 10px rgba(240, 192, 64, 0.5);
    }
    
    .kuro-progress-bar.pink {
      background: linear-gradient(90deg, #be185d, #ec4899, #f472b6);
      box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
    }
    
    .kuro-progress-bar.cyan {
      background: linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    
    .kuro-progress-bar.purple {
      background: linear-gradient(90deg, #7c3aed, #a855f7, #c084fc);
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }
    
    .kuro-progress-bar::after {
      content: '';
      position: absolute;
      right: 0;
      top: -2px;
      bottom: -2px;
      width: 20px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7));
      border-radius: 3px;
    }
    
    /* ═══ SOFT PITY ANIMATION ═══ */
    .kuro-soft-pity {
      animation: kuroPulseOrange 2s ease-in-out infinite;
    }
    
    @keyframes kuroPulseOrange {
      0%, 100% { 
        text-shadow: 0 0 8px rgba(251, 146, 60, 0.7);
      }
      50% { 
        text-shadow: 0 0 15px rgba(251, 146, 60, 1), 0 0 25px rgba(251, 146, 60, 0.6);
      }
    }
    
    .kuro-soft-pity-cyan {
      animation: kuroPulseCyan 2s ease-in-out infinite;
    }
    
    @keyframes kuroPulseCyan {
      0%, 100% { 
        text-shadow: 0 0 8px rgba(103, 232, 249, 0.7);
      }
      50% { 
        text-shadow: 0 0 15px rgba(103, 232, 249, 1), 0 0 25px rgba(103, 232, 249, 0.6);
      }
    }
    
    .kuro-soft-pity-pink {
      animation: kuroPulsePink 2s ease-in-out infinite;
    }
    
    @keyframes kuroPulsePink {
      0%, 100% { 
        text-shadow: 0 0 8px rgba(244, 114, 182, 0.7);
      }
      50% { 
        text-shadow: 0 0 15px rgba(244, 114, 182, 1), 0 0 25px rgba(244, 114, 182, 0.6);
      }
    }
    
    /* ═══ NUMBER STYLING ═══ */
    .kuro-number {
      font-variant-numeric: tabular-nums;
      font-weight: 700;
    }
    
    /* ═══ DIVIDER ═══ */
    .kuro-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      margin: 12px 0;
    }
  `}</style>
);

// [SECTION:PITYRING]
const PityRing = ({ value, max, color, softPity }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const strokeColor = {
    gold: '#fbbf24',    // Gold/Yellow for Featured
    pink: '#f472b6',    // Pink for Featured Weapon
    cyan: '#38bdf8',    // Blue for Standard banners
    purple: '#a855f7'   // Purple for 4★
  }[color] || '#fbbf24';
  
  const isSoft = value >= (softPity || 66);
  const softColor = color === 'cyan' ? '#67e8f9' : color === 'pink' ? '#f9a8d4' : '#fb923c';
  const softPityClass = color === 'cyan' ? 'kuro-soft-pity-cyan' : color === 'pink' ? 'kuro-soft-pity-pink' : 'kuro-soft-pity';
  
  return (
    <div className="kuro-pity-ring">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle className="ring-bg" cx="28" cy="28" r={radius} />
        <circle 
          className="ring-progress" 
          cx="28" cy="28" r={radius}
          stroke={isSoft ? softColor : strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ filter: `drop-shadow(0 0 8px ${isSoft ? (color === 'cyan' ? 'rgba(103,232,249,0.7)' : color === 'pink' ? 'rgba(244,114,182,0.7)' : 'rgba(251,146,60,0.7)') : strokeColor + '80'})` }}
        />
      </svg>
      <div className={`kuro-pity-value ${isSoft ? softPityClass : ''}`} style={{ color: isSoft ? softColor : strokeColor }}>
        {value}
      </div>
    </div>
  );
};

// [SECTION:SERVERS]
const SERVERS = {
  'Asia': { name: 'Asia', timezone: 'Asia/Shanghai', utcOffset: 8, resetHour: 4 },
  'America': { name: 'America', timezone: 'America/New_York', utcOffset: -5, resetHour: 4 },
  'Europe': { name: 'Europe', timezone: 'Europe/Paris', utcOffset: 1, resetHour: 4 },
  'SEA': { name: 'SEA', timezone: 'Asia/Singapore', utcOffset: 8, resetHour: 4 },
  'HMT': { name: 'HMT', timezone: 'Asia/Hong_Kong', utcOffset: 8, resetHour: 4 },
};

// [SECTION:BANNERS]
const CURRENT_BANNERS = {
  version: '3.0', phase: 2,
  startDate: '2026-01-15T06:00:00Z',
  endDate: '2026-02-04T05:59:59Z',
  characterBannerImage: '',
  weaponBannerImage: '',
  eventBannerImage: '',
  characters: [
    { id: 'mornye', name: 'Mornye', title: 'Distant May the Starlights Be', element: 'Fusion', weaponType: 'Broadblade', isNew: true, featured4Stars: ['Chixia', 'Sanhua', 'Danjin'] },
    { id: 'augusta', name: 'Augusta', title: 'The Eternal Radiance on the Crown', element: 'Electro', weaponType: 'Broadblade', isNew: false, featured4Stars: ['Chixia', 'Sanhua', 'Danjin'] },
    { id: 'iuno', name: 'Iuno', title: "Across Time's Waxes and Wanes", element: 'Aero', weaponType: 'Gauntlets', isNew: false, featured4Stars: ['Chixia', 'Sanhua', 'Danjin'] },
  ],
  weapons: [
    { id: 'starfield', name: 'Starfield Calibrator', title: 'Absolute Pulsation', type: 'Broadblade', forCharacter: 'Mornye', element: 'Fusion', isNew: true, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'] },
    { id: 'thunderflare', name: 'Thunderflare Dominion', title: 'Absolute Pulsation', type: 'Broadblade', forCharacter: 'Augusta', element: 'Electro', isNew: false, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'] },
    { id: 'moongazer', name: "Moongazer's Sigil", title: 'Absolute Pulsation', type: 'Gauntlets', forCharacter: 'Iuno', element: 'Aero', isNew: false, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'] },
  ],
  // Standard Resonator Banner (Lustrous Tide)
  standardCharacters: ['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina'],
  // Standard Weapon Banner (Lustrous Tide)
  standardWeapons: [
    { name: 'Verdant Summit', type: 'Broadblade' },
    { name: 'Emerald of Genesis', type: 'Sword' },
    { name: 'Static Mist', type: 'Pistols' },
    { name: 'Abyss Surges', type: 'Gauntlets' },
    { name: 'Cosmic Ripples', type: 'Rectifier' },
  ],
};

// [SECTION:HISTORY]
const BANNER_HISTORY = [
  // Version 3.0
  { version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04' },
  { version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-24', endDate: '2026-01-15' },
  // Version 2.8
  { version: '2.8', phase: 2, characters: ['Phrolova', 'Cantarella'], weapons: ['Lethean Elegy', 'Whispers of Sirens'], startDate: '2025-12-11', endDate: '2025-12-24' },
  { version: '2.8', phase: 1, characters: ['Chisa', 'Phoebe'], weapons: ['Kumokiri', 'Luminous Hymn'], startDate: '2025-11-20', endDate: '2025-12-11' },
  // Version 2.7
  { version: '2.7', phase: 2, characters: ['Qiuyuan', 'Zani'], weapons: ['Emerald Sentence', 'Blazing Justice'], startDate: '2025-10-30', endDate: '2025-11-19' },
  { version: '2.7', phase: 1, characters: ['Galbrena', 'Lupa'], weapons: ['Lux & Umbra', 'Wildfire Mark'], startDate: '2025-10-09', endDate: '2025-10-30' },
  // Version 2.6
  { version: '2.6', phase: 2, characters: ['Iuno', 'Ciaccona'], weapons: ["Moongazer's Sigil", 'Woodland Aria'], startDate: '2025-09-17', endDate: '2025-10-08' },
  { version: '2.6', phase: 1, characters: ['Augusta', 'Carlotta', 'Shorekeeper'], weapons: ['Thunderflare Dominion', 'The Last Dance', 'Stellar Symphony'], startDate: '2025-08-28', endDate: '2025-09-17' },
  // Version 2.5
  { version: '2.5', phase: 2, characters: ['Cantarella', 'Brant'], weapons: ['Whispers of Sirens', 'Unflickering Valor'], startDate: '2025-08-14', endDate: '2025-08-27' },
  { version: '2.5', phase: 1, characters: ['Phrolova', 'Roccia'], weapons: ['Lethean Elegy', 'Tragicomedy'], startDate: '2025-07-24', endDate: '2025-08-14' },
  // Version 2.4
  { version: '2.4', phase: 2, characters: ['Lupa'], weapons: ['Wildfire Mark'], startDate: '2025-07-03', endDate: '2025-07-23' },
  { version: '2.4', phase: 1, characters: ['Cartethyia'], weapons: ["Defier's Thorn"], startDate: '2025-06-12', endDate: '2025-07-03' },
  // Version 2.3 (Anniversary)
  { version: '2.3', phase: 2, characters: ['Ciaccona', 'Jinhsi', 'Changli', 'Carlotta', 'Roccia', 'Brant'], weapons: ['Woodland Aria'], startDate: '2025-05-22', endDate: '2025-06-11' },
  { version: '2.3', phase: 1, characters: ['Zani', 'Jiyan', 'Yinlin', 'Zhezhi', 'Xiangli Yao', 'Phoebe'], weapons: ['Blazing Justice'], startDate: '2025-04-29', endDate: '2025-05-22' },
  // Version 2.2
  { version: '2.2', phase: 2, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2025-04-17', endDate: '2025-04-28' },
  { version: '2.2', phase: 1, characters: ['Cantarella', 'Camellya'], weapons: ['Whispers of Sirens', 'Red Spring'], startDate: '2025-03-27', endDate: '2025-04-17' },
  // Version 2.1
  { version: '2.1', phase: 2, characters: ['Brant', 'Changli'], weapons: ['Unflickering Valor', 'Blazing Brilliance'], startDate: '2025-03-06', endDate: '2025-03-26' },
  { version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06' },
  // Version 2.0
  { version: '2.0', phase: 2, characters: ['Roccia', 'Jinhsi'], weapons: ['Tragicomedy', 'Ages of Harvest'], startDate: '2025-01-23', endDate: '2025-02-12' },
  { version: '2.0', phase: 1, characters: ['Carlotta', 'Zhezhi'], weapons: ['The Last Dance', 'Rime-Draped Sprouts'], startDate: '2025-01-02', endDate: '2025-01-23' },
  // Version 1.4.1
  { version: '1.4', phase: 2, characters: ['Yinlin', 'Xiangli Yao'], weapons: ['Stringmaster', "Verity's Handle"], startDate: '2024-12-12', endDate: '2025-01-01' },
  { version: '1.4', phase: 1, characters: ['Camellya'], weapons: ['Red Spring'], startDate: '2024-11-14', endDate: '2024-12-12' },
  // Version 1.3
  { version: '1.3', phase: 2, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-10-24', endDate: '2024-11-13' },
  { version: '1.3', phase: 1, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2024-09-29', endDate: '2024-10-24' },
  // Version 1.2
  { version: '1.2', phase: 2, characters: ['Xiangli Yao'], weapons: ["Verity's Handle"], startDate: '2024-09-07', endDate: '2024-09-28' },
  { version: '1.2', phase: 1, characters: ['Zhezhi'], weapons: ['Rime-Draped Sprouts'], startDate: '2024-08-15', endDate: '2024-09-07' },
  // Version 1.1
  { version: '1.1', phase: 2, characters: ['Changli'], weapons: ['Blazing Brilliance'], startDate: '2024-07-22', endDate: '2024-08-14' },
  { version: '1.1', phase: 1, characters: ['Jinhsi'], weapons: ['Ages of Harvest'], startDate: '2024-06-28', endDate: '2024-07-22' },
  // Version 1.0
  { version: '1.0', phase: 2, characters: ['Yinlin'], weapons: ['Stringmaster'], startDate: '2024-06-06', endDate: '2024-06-26' },
  { version: '1.0', phase: 1, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-05-23', endDate: '2024-06-13' },
];

// [SECTION:EVENTS]
const EVENTS = {
  whimperingWastes: { 
    name: 'Whimpering Wastes', 
    subtitle: 'Respawning Waters', 
    description: 'Combat challenge with token system', 
    resetType: '~28 days', 
    color: 'cyan', 
    currentEnd: '2026-02-02T04:00:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.imgur.com/DyzH6nH.png'
  },
  doubledPawns: { 
    name: 'Doubled Pawns Matrix', 
    subtitle: 'Pilot', 
    description: 'High difficulty boss rush', 
    resetType: 'Version update', 
    color: 'pink', 
    currentEnd: '2026-02-05T04:00:00Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: 'https://i.imgur.com/mOFZ4A8.jpeg'
  },
  towerOfAdversity: { 
    name: 'Tower of Adversity', 
    subtitle: 'Hazard Zone', 
    description: 'Endgame combat challenge', 
    resetType: '28 days', 
    color: 'orange', 
    currentEnd: '2026-02-02T04:00:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30',
    accentColor: 'orange'
  },
  illusiveRealm: { 
    name: 'Fantasies of the Thousand Gateways', 
    subtitle: 'Roguelike Mode', 
    description: 'Weekly reward reset', 
    resetType: 'Weekly (Monday)', 
    color: 'purple', 
    weeklyReset: true, 
    rewards: '300 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30',
    accentColor: 'purple',
    imageUrl: 'https://i.imgur.com/KG3PwMv.jpeg'
  },
  dailyReset: { 
    name: 'Daily Reset', 
    subtitle: 'Daily Activities & Tacet Fields', 
    description: 'Daily activity reset', 
    resetType: 'Daily 4:00 AM', 
    color: 'yellow', 
    dailyReset: true, 
    rewards: 'Waveplates',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_COLORS = {
  Fusion: { bg: 'rgba(249,115,22,0.2)', border: 'rgb(249,115,22)', text: 'rgb(251,146,60)' },
  Electro: { bg: 'rgba(139,92,246,0.2)', border: 'rgb(139,92,246)', text: 'rgb(167,139,250)' },
  Aero: { bg: 'rgba(16,185,129,0.2)', border: 'rgb(16,185,129)', text: 'rgb(52,211,153)' },
  Glacio: { bg: 'rgba(6,182,212,0.2)', border: 'rgb(6,182,212)', text: 'rgb(34,211,238)' },
  Havoc: { bg: 'rgba(236,72,153,0.2)', border: 'rgb(236,72,153)', text: 'rgb(244,114,182)' },
  Spectro: { bg: 'rgba(234,179,8,0.2)', border: 'rgb(234,179,8)', text: 'rgb(250,204,21)' },
};

const WEAPON_COLORS = {
  Broadblade: { bg: 'rgba(239,68,68,0.2)', border: 'rgb(239,68,68)', text: 'rgb(248,113,113)' },
  Sword: { bg: 'rgba(59,130,246,0.2)', border: 'rgb(59,130,246)', text: 'rgb(96,165,250)' },
  Pistols: { bg: 'rgba(234,179,8,0.2)', border: 'rgb(234,179,8)', text: 'rgb(250,204,21)' },
  Gauntlets: { bg: 'rgba(168,85,247,0.2)', border: 'rgb(168,85,247)', text: 'rgb(192,132,252)' },
  Rectifier: { bg: 'rgba(16,185,129,0.2)', border: 'rgb(16,185,129)', text: 'rgb(52,211,153)' },
};

// [SECTION:CONSTANTS]
const HARD_PITY = 80, SOFT_PITY_START = 66, AVG_PITY = 62.5;

// Subscription and top-up prices (USD) - Updated January 2026
const SUBSCRIPTIONS = {
  lunite: { name: 'Lunite Subscription', price: 4.99, astrite: 3000, daily: 90, duration: 30, desc: '300 Lunite + 90 Astrite/day for 30 days' },
  bpInsider: { name: 'Pioneer Podcast - Insider', price: 9.99, astrite: 680, radiant: 5, lustrous: 2, desc: '680 Astrite + 5 Radiant Tides + 2 Lustrous Tides' },
  bpConnoisseur: { name: 'Pioneer Podcast - Connoisseur', price: 19.99, astrite: 680, radiant: 5, lustrous: 5, desc: '680 Astrite + 5 Radiant Tides + 5 Lustrous Tides' },
  directTop60: { name: 'Direct Top-Up (60)', price: 0.99, astrite: 60, desc: '60 Astrite' },
  directTop300: { name: 'Direct Top-Up (300)', price: 4.99, astrite: 300, desc: '300 Astrite' },
  directTop980: { name: 'Direct Top-Up (980)', price: 14.99, astrite: 980, desc: '980 Astrite' },
  directTop1980: { name: 'Direct Top-Up (1980)', price: 29.99, astrite: 1980, desc: '1980 Astrite' },
  directTop3280: { name: 'Direct Top-Up (3280)', price: 49.99, astrite: 3280, desc: '3280 Astrite' },
  directTop6480: { name: 'Direct Top-Up (6480)', price: 99.99, astrite: 6480, desc: '6480 Astrite' },
};

// 4-star pity constants
const HARD_PITY_4STAR = 10; // Guaranteed 4★ every 10 pulls
const AVG_PITY_4STAR = 8.5; // Average pulls per 4★
const FEATURED_4STAR_RATE = 0.5; // 50% chance for featured 4-star

// [SECTION:TIME]
const getTimeRemaining = (endDate) => {
  const total = new Date(endDate) - new Date();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return { days: Math.floor(total / (1000 * 60 * 60 * 24)), hours: Math.floor((total / (1000 * 60 * 60)) % 24), minutes: Math.floor((total / 1000 / 60) % 60), seconds: Math.floor((total / 1000) % 60), expired: false };
};

const getNextDailyReset = (server) => {
  const now = new Date();
  const serverOffset = SERVERS[server]?.utcOffset || 0;
  // Reset is at 4:00 AM server time
  // Convert to UTC: if server is UTC+8, 4AM local = 4-8 = -4 = 20:00 UTC previous day
  const resetHourUTC = (4 - serverOffset + 24) % 24;
  const reset = new Date(now);
  reset.setUTCHours(resetHourUTC, 0, 0, 0);
  if (reset <= now) reset.setDate(reset.getDate() + 1);
  return reset.toISOString();
};

const getNextWeeklyReset = (server) => {
  const now = new Date();
  const serverOffset = SERVERS[server]?.utcOffset || 0;
  const resetHourUTC = (4 - serverOffset + 24) % 24;
  const reset = new Date(now);
  const dayOfWeek = reset.getUTCDay();
  // Monday is day 1, so we need to find next Monday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : (8 - dayOfWeek);
  reset.setDate(reset.getDate() + daysUntilMonday);
  reset.setUTCHours(resetHourUTC, 0, 0, 0);
  if (reset <= now) reset.setDate(reset.getDate() + 7);
  return reset.toISOString();
};

// [SECTION:SIMULATION]
const simulateGacha = (pulls, pity, guaranteed, type, target) => {
  const results = Array(target + 1).fill(0);
  const runs = 10000;
  for (let s = 0; s < runs; s++) {
    let p = pity, g = guaranteed, r = pulls, c = 0;
    while (r > 0 && c < target) {
      p++; r--;
      let rate = 0.008;
      if (p >= 66) rate = Math.min(0.008 + (p - 65) * 0.055, 1.0);
      if (p >= 80) rate = 1.0;
      if (Math.random() < rate) {
        if (type === 'char') {
          // Character banner: 50/50 system
          if (g || Math.random() < 0.5) { c++; g = false; } else g = true;
        } else {
          // Weapon banner: 100% featured when you get 5★
          c++;
        }
        p = 0;
      }
    }
    results[Math.min(c, target)]++;
  }
  return results.map(n => (n / runs) * 100);
};

const factorial = (n) => {
  if (n <= 1) return 1;
  if (n > 20) return 2.43290200817664e18;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

// [SECTION:STATE]
const initialState = {
  server: 'Asia',
  profile: {
    uid: '', importedAt: null,
    featured: { history: [], pity5: 0, pity4: 0, guaranteed: false },
    weapon: { history: [], pity5: 0, pity4: 0 },
    standardChar: { history: [], pity5: 0, pity4: 0 },
    standardWeap: { history: [], pity5: 0, pity4: 0 },
    beginner: { history: [], pity5: 0, pity4: 0 },
  },
  calc: {
    bannerCategory: 'featured',
    selectedBanner: 'char',
    charPity: 0, charGuaranteed: false, charGuaranteedManual: false, charCopies: 1,
    weapPity: 0, weapCopies: 1,
    stdCharPity: 0, stdCharCopies: 1,
    stdWeapPity: 0, stdWeapCopies: 1,
    char4StarCopies: 1, weap4StarCopies: 1, stdChar4StarCopies: 1, stdWeap4StarCopies: 1,
    astrite: '', radiant: '', forging: '', lustrous: '',
  },
  planner: {
    dailyAstrite: 60, luniteActive: false,
    goalType: '5star', goalBanner: 'featuredChar', goalTarget: 1, goalPulls: 80, goalModifier: 1,
    goal4StarTarget: 1, goal4StarType: 'featured',
    addedIncome: [],
  },
  bookmarks: [],
  settings: { showOnboarding: true, autoSyncPity: true, theme: 'default' },
};

// Load saved state from persistent storage
const STORAGE_KEY = 'whispering-wishes-v2.2';

const loadState = () => {
  return initialState;
};

const loadFromStorage = async () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return {
      ...initialState,
      ...parsed,
      server: parsed.server || initialState.server,
      profile: { ...initialState.profile, ...parsed.profile },
      calc: { ...initialState.calc, ...parsed.calc },
      planner: { ...initialState.planner, ...parsed.planner },
      settings: { ...initialState.settings, ...parsed.settings },
      bookmarks: parsed.bookmarks || [],
    };
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

const saveToStorage = async (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed:', e);
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SERVER': return { ...state, server: action.server };
    case 'SET_CALC': return { ...state, calc: { ...state.calc, [action.field]: action.value } };
    case 'SET_PLANNER': return { ...state, planner: { ...state.planner, [action.field]: action.value } };
    case 'SET_SETTINGS': return { ...state, settings: { ...state.settings, [action.field]: action.value } };
    case 'ADD_INCOME': return { ...state, planner: { ...state.planner, addedIncome: [...state.planner.addedIncome, action.income] }, calc: { ...state.calc, astrite: String((+state.calc.astrite || 0) + action.income.astrite), radiant: String((+state.calc.radiant || 0) + (action.income.radiant || 0)), lustrous: String((+state.calc.lustrous || 0) + (action.income.lustrous || 0)) } };
    case 'REMOVE_INCOME': {
      const item = state.planner.addedIncome.find(i => i.id === action.id);
      return item ? { ...state, planner: { ...state.planner, addedIncome: state.planner.addedIncome.filter(i => i.id !== action.id) }, calc: { ...state.calc, astrite: String(Math.max(0, (+state.calc.astrite || 0) - item.astrite)), radiant: String(Math.max(0, (+state.calc.radiant || 0) - (item.radiant || 0))), lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - (item.lustrous || 0))) } } : state;
    }
    case 'ADD_DAILY_INCOME': {
      const dailyTotal = (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? 90 : 0);
      const totalAstrite = dailyTotal * action.days;
      return { ...state, calc: { ...state.calc, astrite: String((+state.calc.astrite || 0) + totalAstrite) } };
    }
    case 'SYNC_PITY': return { ...state, calc: { ...state.calc, charPity: state.profile.featured.pity5 || 0, charGuaranteed: state.profile.featured.guaranteed || false, weapPity: state.profile.weapon.pity5 || 0, stdCharPity: state.profile.standardChar?.pity5 || 0, stdWeapPity: state.profile.standardWeap?.pity5 || 0 }};
    case 'IMPORT_HISTORY': {
      const newProfile = { ...state.profile, importedAt: new Date().toISOString(), uid: action.uid || state.profile.uid };
      if (action.bannerType === 'featured') {
        newProfile.featured = { history: action.history, pity5: action.pity5, pity4: action.pity4, guaranteed: action.guaranteed || false };
      } else if (action.bannerType === 'weapon') {
        newProfile.weapon = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'standardChar') {
        newProfile.standardChar = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'standardWeap') {
        newProfile.standardWeap = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'beginner') {
        newProfile.beginner = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      }
      return { ...state, profile: newProfile };
    }
    case 'SET_UID': return { ...state, profile: { ...state.profile, uid: action.uid } };
    case 'CLEAR_PROFILE': return { ...state, profile: initialState.profile };
    case 'SAVE_BOOKMARK': return { ...state, bookmarks: [...state.bookmarks, { id: Date.now(), name: action.name, timestamp: new Date().toISOString(), ...state.calc }] };
    case 'LOAD_BOOKMARK': {
      const b = state.bookmarks.find(bm => bm.id === action.id);
      return b ? { ...state, calc: { ...state.calc, charPity: b.charPity, charGuaranteed: b.charGuaranteed, weapPity: b.weapPity, astrite: b.astrite, radiant: b.radiant, forging: b.forging, lustrous: b.lustrous, charCopies: b.charCopies, weapCopies: b.weapCopies } } : state;
    }
    case 'DELETE_BOOKMARK': return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    case 'LOAD_STATE': return { ...action.state };
    case 'RESET': return initialState;
    default: return state;
  }
};

// [SECTION:CALCULATIONS]
const calcStats = (pulls, pity, guaranteed, isChar, copies) => {
  const effective = pulls + pity;
  // Character: 50/50 means avg ~125 pulls, guaranteed means avg ~62.5
  // Weapon: 100% featured rate, avg ~62.5 pulls per 5★
  const avgForFeatured = isChar ? (guaranteed ? AVG_PITY : AVG_PITY * 2) : AVG_PITY;
  const lambda = effective / avgForFeatured;
  
  const poisson = (n) => {
    if (lambda <= 0) return 0;
    let prob = 0;
    for (let k = n; k <= n + 10; k++) prob += (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    return Math.min(100, Math.max(0, prob * 100));
  };
  
  const worstCase = HARD_PITY * copies * (isChar && !guaranteed ? 2 : 1);
  const successRate = effective >= worstCase ? 100 : poisson(copies);
  const missingPulls = Math.max(0, worstCase - effective);
  
  // 4-star calculations
  const fourStarCount = Math.floor(effective / HARD_PITY_4STAR);
  const featuredFourStarCount = Math.floor(fourStarCount * FEATURED_4STAR_RATE);
  const pity4 = effective % HARD_PITY_4STAR;
  
  return {
    successRate: successRate.toFixed(1),
    p1: poisson(1).toFixed(1),
    p2: poisson(2).toFixed(1),
    p3: poisson(3).toFixed(1),
    p4: poisson(4).toFixed(1),
    p5: poisson(5).toFixed(1),
    p6: poisson(6).toFixed(1),
    missingPulls,
    missingAstrite: missingPulls * 160,
    fourStarCount,
    featuredFourStarCount,
    pity4,
  };
};

// [SECTION:COMPONENTS]
const Card = ({ children, className = '' }) => <div className={`kuro-card ${className}`} style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}><div className="kuro-card-inner">{children}</div></div>;
const CardHeader = ({ children, action }) => <div className="kuro-header" style={{position:'relative'}}><h3>{children}</h3>{action && <div style={{position:'relative', zIndex:10}}>{action}</div>}</div>;
const CardBody = ({ children, className = '' }) => <div className={`kuro-body ${className}`}>{children}</div>;

const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${active ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'}`}>
    {children}
  </button>
);

const CountdownTimer = ({ endDate, color = 'yellow', compact = false, alwaysShow = false }) => {
  const [time, setTime] = useState(() => getTimeRemaining(endDate));
  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeRemaining(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);
  
  // For daily/weekly resets, never show "ENDED" - recalculate next reset
  if (time.expired && !alwaysShow) return <span className="text-red-400 text-xs font-bold">ENDED</span>;
  if (time.expired && alwaysShow) {
    // If expired but alwaysShow, show "0h 0m 0s" briefly until next tick updates
    return <span className={`font-mono text-xs ${color === 'yellow' ? 'text-yellow-400' : color === 'pink' ? 'text-pink-400' : color === 'cyan' ? 'text-cyan-400' : color === 'orange' ? 'text-orange-400' : 'text-purple-400'}`}>0h 0m 0s</span>;
  }
  
  const textColor = color === 'yellow' ? 'text-yellow-400' : color === 'pink' ? 'text-pink-400' : color === 'cyan' ? 'text-cyan-400' : color === 'orange' ? 'text-orange-400' : 'text-purple-400';
  
  // Unified compact style matching Tracker tab
  if (compact) {
    return (
      <span className={`${textColor} font-mono text-xs font-medium`}>
        {time.days > 0 && `${time.days}d `}{String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m {String(time.seconds).padStart(2, '0')}s
      </span>
    );
  }
  
  return (
    <div className="flex gap-1">
      {time.days > 0 && <div className="bg-neutral-800 rounded px-1.5 py-0.5 text-center"><div className="text-white font-bold text-sm">{time.days}</div><div className="text-gray-300 text-[8px]">D</div></div>}
      <div className="bg-neutral-800 rounded px-1.5 py-0.5 text-center"><div className="text-white font-bold text-sm">{String(time.hours).padStart(2,'0')}</div><div className="text-gray-300 text-[8px]">H</div></div>
      <div className="bg-neutral-800 rounded px-1.5 py-0.5 text-center"><div className="text-white font-bold text-sm">{String(time.minutes).padStart(2,'0')}</div><div className="text-gray-300 text-[8px]">M</div></div>
      <div className="bg-neutral-800 rounded px-1.5 py-0.5 text-center"><div className={`font-bold text-sm ${textColor}`}>{String(time.seconds).padStart(2,'0')}</div><div className="text-gray-300 text-[8px]">S</div></div>
    </div>
  );
};

const BannerCard = ({ item, type, stats, bannerImage }) => {
  const isChar = type === 'character';
  
  const gradientMap = {
    Fusion: { border: 'border-orange-500/40', bg: 'bg-orange-500/20', text: 'text-orange-400' },
    Electro: { border: 'border-violet-500/40', bg: 'bg-violet-500/20', text: 'text-violet-400' },
    Aero: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    Glacio: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    Havoc: { border: 'border-pink-500/40', bg: 'bg-pink-500/20', text: 'text-pink-400' },
    Spectro: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  };
  
  const style = gradientMap[item.element] || gradientMap.Fusion;
  const imgUrl = item.imageUrl || bannerImage;
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${style.border}`} style={{ minHeight: imgUrl ? '180px' : 'auto' }}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={item.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      
      <div className="relative z-10 p-4 flex flex-col justify-between h-full" style={{ minHeight: imgUrl ? '180px' : 'auto' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {item.isNew && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">NEW</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded ${style.bg} ${style.text} border ${style.border}`}>{isChar ? item.element : item.type}</span>
          </div>
          <h4 className={`font-bold text-lg text-white drop-shadow-lg`}>{item.name}</h4>
          {item.title && <p className="text-gray-300 text-xs mt-0.5 drop-shadow">{item.title}</p>}
        </div>
        
        <div className="mt-auto pt-3">
          <div className="text-gray-300 text-[10px] mb-1">Featured 4★</div>
          <div className="flex gap-1 flex-wrap">
            {item.featured4Stars.map(n => <span key={n} className="text-[10px] text-cyan-300 bg-cyan-500/30 px-2 py-0.5 rounded backdrop-blur-sm">{n}</span>)}
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-white/20">
            <div><div className="text-yellow-400 font-bold drop-shadow">{stats.pity5}/80</div><div className="text-gray-300 text-[9px]">5★ Pity</div></div>
            <div><div className="text-purple-400 font-bold drop-shadow">{stats.pity4}/10</div><div className="text-gray-300 text-[9px]">4★ Pity</div></div>
            <div><div className="text-white font-bold drop-shadow">{stats.totalPulls}</div><div className="text-gray-300 text-[9px]">Convenes</div></div>
          </div>
        )}
        {stats && isChar && <div className={`mt-1.5 text-center text-[10px] py-1 rounded backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/30 text-emerald-400' : 'bg-neutral-800/50 text-gray-400'}`}>{stats.guaranteed ? '✓ Guaranteed' : '50/50'}</div>}
      </div>
    </div>
  );
};

const EventCard = ({ event, server, bannerImage }) => {
  const endDate = event.dailyReset ? getNextDailyReset(server) : event.weeklyReset ? getNextWeeklyReset(server) : event.currentEnd;
  const isDaily = event.dailyReset;
  const isWeekly = event.weeklyReset;
  
  const accentColors = {
    cyan: { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20' },
    pink: { text: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/20' },
    orange: { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/20' },
    purple: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/20' },
    yellow: { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20' },
  };
  
  const colors = accentColors[event.accentColor] || accentColors.cyan;
  const imgUrl = bannerImage;
  
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${colors.border}`} style={{ minHeight: imgUrl ? '140px' : '100px' }}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={event.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      
      <div className="relative z-10 p-4 flex flex-col justify-between h-full" style={{ minHeight: imgUrl ? '140px' : '100px' }}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h4 className={`font-bold text-sm ${colors.text} drop-shadow-lg`}>{event.name}</h4>
            <p className="text-gray-300 text-[10px] drop-shadow">{event.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-gray-300 text-[9px] mb-1">{isDaily ? 'Resets in' : isWeekly ? 'Weekly reset' : 'Ends in'}</div>
            <CountdownTimer endDate={endDate} color={event.color} alwaysShow={isDaily || isWeekly} />
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-auto pt-3">
          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} backdrop-blur-sm`}>
            {event.rewards}
          </div>
          <div className="text-gray-300 text-[9px] drop-shadow">
            {event.resetType}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProbabilityBar = ({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-300 text-[10px] w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-500'} transition-all flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-[9px] text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-[10px] text-gray-300 w-10">{value}%</span>}
  </div>
);

// Admin banner storage key
const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';

// Load custom banners from localStorage
const loadCustomBanners = () => {
  try {
    const saved = localStorage.getItem(ADMIN_BANNER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// Get active banners (custom or default)
const getActiveBanners = () => {
  const custom = loadCustomBanners();
  return custom || CURRENT_BANNERS;
};

// [SECTION:MAINAPP]
function WhisperingWishesInner() {
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState('');
  const stateRef = useRef(state);
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [adminTapTimer, setAdminTapTimer] = useState(null);
  const [activeBanners, setActiveBanners] = useState(() => getActiveBanners());
  
  // Admin password - stored in localStorage (user sets their own)
  const ADMIN_PASS_KEY = 'whispering-wishes-admin-pass';
  const [storedAdminPass, setStoredAdminPass] = useState(() => {
    try { return localStorage.getItem(ADMIN_PASS_KEY) || ''; } catch { return ''; }
  });
  
  // Keep ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Load state from persistent storage on mount
  useEffect(() => {
    const rawSaved = localStorage.getItem(STORAGE_KEY);
    loadFromStorage().then(savedState => {
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', state: savedState });
        if (savedState.profile.importedAt) {
          toast?.addToast?.('Data restored', 'success');
        }
        // For existing users: check if they've explicitly dismissed onboarding
        // Parse raw data to check original settings, not merged with initialState
        let originalSettings = {};
        try {
          const parsed = rawSaved ? JSON.parse(rawSaved) : null;
          originalSettings = parsed?.settings || {};
        } catch (e) {}
        // Only show onboarding if the original saved data had it explicitly true
        // If settings.showOnboarding is missing/undefined, user is existing - don't show
        const shouldShow = originalSettings.showOnboarding === true;
        setShowOnboarding(shouldShow);
      } else {
        // First time user only - show onboarding
        setShowOnboarding(true);
      }
      setStorageLoaded(true);
    });
  }, []);
  
  // Save state to storage whenever it changes
  useEffect(() => {
    if (!storageLoaded) return;
    saveToStorage(state);
  }, [state, storageLoaded]);
  
  // Save on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (stateRef.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
  const [activeTab, setActiveTab] = useState('tracker');
  const [trackerCategory, setTrackerCategory] = useState('character');
  const [importPlatform, setImportPlatform] = useState(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  const [chartRange, setChartRange] = useState('monthly');
  const [chartOffset, setChartOffset] = useState(9999);

  const setCalc = useCallback((f, v) => dispatch({ type: 'SET_CALC', field: f, value: v }), []);

  // Calculate pulls for each banner type - Note: Featured does NOT include Lustrous
  const charPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.radiant || 0), [state.calc.astrite, state.calc.radiant]);
  const weapPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.forging || 0), [state.calc.astrite, state.calc.forging]);
  const stdCharPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.lustrous || 0), [state.calc.astrite, state.calc.lustrous]);
  const stdWeapPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.lustrous || 0), [state.calc.astrite, state.calc.lustrous]);
  
  // Calculate stats for each banner type
  const charStats = useMemo(() => calcStats(charPulls, state.calc.charPity, state.calc.charGuaranteed, true, state.calc.charCopies), [charPulls, state.calc.charPity, state.calc.charGuaranteed, state.calc.charCopies]);
  const weapStats = useMemo(() => calcStats(weapPulls, state.calc.weapPity, false, false, state.calc.weapCopies), [weapPulls, state.calc.weapPity, state.calc.weapCopies]);
  const stdCharStats = useMemo(() => calcStats(stdCharPulls, state.calc.stdCharPity, false, true, state.calc.stdCharCopies), [stdCharPulls, state.calc.stdCharPity, state.calc.stdCharCopies]);
  const stdWeapStats = useMemo(() => calcStats(stdWeapPulls, state.calc.stdWeapPity, false, false, state.calc.stdWeapCopies), [stdWeapPulls, state.calc.stdWeapPity, state.calc.stdWeapCopies]);

  // Combined stats for "Both" mode
  const combined = useMemo(() => {
    if (state.calc.selectedBanner !== 'both') return null;
    
    let charProb, weapProb;
    if (state.calc.bannerCategory === 'featured') {
      charProb = parseFloat(charStats.successRate) / 100;
      weapProb = parseFloat(weapStats.successRate) / 100;
    } else {
      charProb = parseFloat(stdCharStats.successRate) / 100;
      weapProb = parseFloat(stdWeapStats.successRate) / 100;
    }
    
    return {
      both: (charProb * weapProb * 100).toFixed(1),
      atLeastOne: ((charProb + weapProb - charProb * weapProb) * 100).toFixed(1),
      charOnly: (charProb * (1 - weapProb) * 100).toFixed(1),
      weapOnly: (weapProb * (1 - charProb) * 100).toFixed(1),
      neither: ((1 - charProb) * (1 - weapProb) * 100).toFixed(1),
    };
  }, [state.calc.selectedBanner, state.calc.bannerCategory, charStats, weapStats, stdCharStats, stdWeapStats]);

  // Overall stats from imported history
  const overallStats = useMemo(() => {
    const stdCharHist = state.profile.standardChar?.history || [];
    const stdWeapHist = state.profile.standardWeap?.history || [];
    const featuredHist = state.profile.featured.history || [];
    const weaponHist = state.profile.weapon.history || [];
    const beginnerHist = state.profile.beginner?.history || [];
    const all = [...featuredHist, ...weaponHist, ...stdCharHist, ...stdWeapHist, ...beginnerHist];
    if (!all.length) return null;
    
    // All 5★ pulls
    const fives = all.filter(p => p.rarity === 5);
    
    // 50/50 stats from featured character banner
    const featured5Stars = featuredHist.filter(p => p.rarity === 5);
    const won = featured5Stars.filter(p => p.won5050 === true).length;
    const lost = featured5Stars.filter(p => p.won5050 === false).length;
    
    // Average pity - only count 5★ with pity > 0
    const fivesWithPity = fives.filter(p => p.pity && p.pity > 0);
    const avgPity = fivesWithPity.length > 0 
      ? (fivesWithPity.reduce((s, p) => s + p.pity, 0) / fivesWithPity.length).toFixed(1) 
      : '—';
    
    return { 
      totalPulls: all.length, 
      totalAstrite: all.length * 160, 
      fiveStars: fives.length, 
      won5050: won, 
      lost5050: lost, 
      winRate: (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : null, 
      avgPity 
    };
  }, [state.profile]);

  // Luck rating
  const luckRating = useMemo(() => calculateLuckRating(overallStats?.avgPity), [overallStats]);

  // Daily income calculation
  const dailyIncome = useMemo(() => {
    return (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? 90 : 0);
  }, [state.planner.dailyAstrite, state.planner.luniteActive]);

  // File import handler
  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const pulls = data.pulls || data.conveneHistory || data.history || [];
        
        // List of known standard 5★ characters (for 50/50 calculation)
        // These are the characters you can lose 50/50 to on featured banner
        const standard5Stars = ['Verina', 'Jianxin', 'Lingyang', 'Calcharo', 'Encore', 'Rover'];
        
        const convert = (arr, type) => {
          const filtered = arr.filter(p => {
            const poolType = p.cardPoolType || p.gachaType;
            if (type === 'featured') return p.bannerType === 'featured' || p.bannerType === 'character' || poolType === 1;
            if (type === 'weapon') return p.bannerType === 'weapon' || poolType === 2;
            if (type === 'standardChar') return p.bannerType === 'standard-char' || poolType === 3;
            if (type === 'standardWeap') return p.bannerType === 'standard-weapon' || poolType === 4;
            if (type === 'beginner') return p.bannerType === 'beginner' || poolType === 5 || poolType === 6;
            return false;
          });
          
          // Sort by timestamp (oldest first) to calculate pity correctly
          filtered.sort((a, b) => new Date(a.time || a.timestamp) - new Date(b.time || b.timestamp));
          
          let pityCounter = 0;
          let lastWasLost = false; // Track if last 5★ was a loss (for guarantee)
          
          return filtered.map((p, i) => {
            pityCounter++;
            const rarity = p.rarity || p.qualityLevel || 4;
            const name = p.name || p.resourceName || '';
            
            let won5050 = undefined;
            let pity = pityCounter;
            
            if (rarity === 5) {
              // For featured banner, check if won or lost 50/50
              if (type === 'featured') {
                const isStandard = standard5Stars.some(s => name.toLowerCase().includes(s.toLowerCase()));
                if (lastWasLost) {
                  // This was a guaranteed pull
                  won5050 = null; // Guaranteed, not a 50/50
                  lastWasLost = false;
                } else {
                  // This was a 50/50
                  won5050 = !isStandard;
                  lastWasLost = isStandard;
                }
              }
              pityCounter = 0; // Reset pity after 5★
            }
            
            return { 
              id: p.id || Date.now() + i, 
              name, 
              rarity, 
              pity: rarity === 5 ? pity : 0, 
              won5050, 
              timestamp: p.timestamp || p.time 
            };
          });
        };
        
        let totalImported = 0;
        ['featured', 'weapon', 'standardChar', 'standardWeap', 'beginner'].forEach(type => {
          const history = convert(pulls, type);
          if (history.length) {
            let currentPity5 = 0;
            let currentPity4 = 0;
            for (let i = history.length - 1; i >= 0; i--) {
              if (history[i].rarity === 5) break;
              currentPity5++;
            }
            for (let i = history.length - 1; i >= 0; i--) {
              if (history[i].rarity >= 4) break;
              currentPity4++;
            }
            const fiveStars = history.filter(p => p.rarity === 5);
            const lastFive = fiveStars[fiveStars.length - 1];
            const guaranteed = type === 'featured' && lastFive?.won5050 === false;
            dispatch({ type: 'IMPORT_HISTORY', bannerType: type, history, pity5: currentPity5, pity4: currentPity4, guaranteed, uid: data.uid || data.playerId });
            totalImported += history.length;
          }
        });
        // Auto-sync pity - longer delay to ensure state updates are processed
        setTimeout(() => dispatch({ type: 'SYNC_PITY' }), 500);
        toast?.addToast?.(`Imported ${totalImported} Convenes!`, 'success');
      } catch (err) { toast?.addToast?.('Import failed: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [toast]);

  // Export data
  const handleExport = useCallback(() => {
    const data = { timestamp: new Date().toISOString(), version: '2.2', state };
    const jsonStr = JSON.stringify(data, null, 2);
    setExportData(jsonStr);
    setShowExportModal(true);
  }, [state]);

  // Handle onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    dispatch({ type: 'SET_SETTINGS', field: 'showOnboarding', value: false });
  }, []);

  // Secret admin access - tap version 5 times quickly
  const handleAdminTap = useCallback(() => {
    if (adminTapTimer) clearTimeout(adminTapTimer);
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      setShowAdminPanel(true);
      setAdminTapCount(0);
    } else {
      const timer = setTimeout(() => setAdminTapCount(0), 1500);
      setAdminTapTimer(timer);
    }
  }, [adminTapCount, adminTapTimer]);

  // Save custom banners
  const saveCustomBanners = useCallback((banners) => {
    try {
      localStorage.setItem(ADMIN_BANNER_KEY, JSON.stringify(banners));
      setActiveBanners(banners);
      toast?.addToast?.('Banner data updated!', 'success');
    } catch (e) {
      toast?.addToast?.('Failed to save banner data', 'error');
    }
  }, [toast]);


  // Verify admin password
  const verifyAdminPassword = useCallback(() => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }
    if (!storedAdminPass) {
      localStorage.setItem(ADMIN_PASS_KEY, adminPassword);
      setStoredAdminPass(adminPassword);
      setAdminUnlocked(true);
      toast?.addToast?.('Admin password set!', 'success');
    } else if (adminPassword === storedAdminPass) {
      setAdminUnlocked(true);
    } else {
      toast?.addToast?.('Incorrect password', 'error');
    }
  }, [adminPassword, storedAdminPass, toast]);

  return (
    <div className="min-h-screen bg-neutral-950">
      <KuroStyles />
      
      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/15" style={{backgroundColor: 'rgba(12, 16, 24, 0.85)', backdropFilter: 'blur(12px)'}}>
        <div className="max-w-lg mx-auto px-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-black" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">Whispering Wishes</h1>
                <p className="text-gray-300 text-[10px]">WuWa Gacha Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={state.server} onChange={e => dispatch({ type: 'SET_SERVER', server: e.target.value })} className="text-gray-200 text-xs px-2 py-1 rounded border border-white/20" style={{backgroundColor: 'rgba(12, 16, 24, 0.8)'}}>
                {Object.keys(SERVERS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleExport} className="p-1.5 rounded border border-white/20 text-gray-300 hover:text-white hover:border-white/40 active:scale-95 transition-all" style={{backgroundColor: 'rgba(12, 16, 24, 0.8)'}}>
                <Download size={14} />
              </button>
            </div>
          </div>
          <nav className="flex -mb-px overflow-x-auto">
            <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')}><Sparkles size={14} /> Tracker</TabButton>
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}><Calendar size={14} /> Events</TabButton>
            <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')}><Calculator size={14} /> Calc</TabButton>
            <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')}><TrendingUp size={14} /> Plan</TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}><BarChart3 size={14} /> Stats</TabButton>
            <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')}><Archive size={14} /> Collection</TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}><User size={14} /> Profile</TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-3 py-3 space-y-3">
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* LAHAI-ROI BACKGROUND */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: '-10%',
              right: '-10%',
              height: '35%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(160,190,215,0.18) 0%, rgba(140,175,200,0.08) 40%, transparent 100%)',
              filter: 'blur(20px)'
            }} />
            
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '25%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(100,130,160,0.03) 0%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="trackerNodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="trackerGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <line x1="0" y1="25" x2="50" y2="25" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <circle cx="25" cy="25" r="2.5" fill="rgba(230,242,255,0.75)" filter="url(#trackerNodeGlow)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#trackerGrid)"/>
              </svg>
            </div>
            
            {/* Bottom ambient glow */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.04) 30%, transparent 60%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%),
                radial-gradient(ellipse 90% 80% at 50% 55%, transparent 50%, rgba(6,10,16,0.35) 100%)
              `
            }} />

            {/* Category Tabs */}
            <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
              <div className="kuro-card-inner">
                <div className="kuro-body">
                  <div className="flex gap-2">
                    {[['character', 'Resonators', 'yellow'], ['weapon', 'Weapons', 'pink'], ['standard', 'Standard', 'cyan']].map(([key, label, color]) => (
                      <button key={key} onClick={() => setTrackerCategory(key)} className={`kuro-btn flex-1 ${trackerCategory === key ? (color === 'yellow' ? 'active-gold' : color === 'pink' ? 'active-pink' : 'active-cyan') : ''}`}>
                        {key === 'character' ? <Sparkles size={12} className="inline mr-1" /> : key === 'weapon' ? <Swords size={12} className="inline mr-1" /> : <Star size={12} className="inline mr-1" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-gray-300 text-[10px]" style={{position: 'relative', zIndex: 5}}>
              <span>v{activeBanners.version} Phase {activeBanners.phase} • {state.server}</span>
              <CountdownTimer endDate={activeBanners.endDate} color={trackerCategory === 'weapon' ? 'pink' : 'yellow'} />
            </div>
            
            {new Date() > new Date(activeBanners.endDate) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center" style={{position: 'relative', zIndex: 5}}>
                <p className="text-yellow-400 text-xs font-medium">Banner period ended</p>
                <p className="text-gray-400 text-[10px] mt-1">New banners are now live in-game. App update coming soon!</p>
              </div>
            )}

            {trackerCategory === 'character' && (
              <div className="space-y-2">
                {activeBanners.characters.map(c => <BannerCard key={c.id} item={c} type="character" bannerImage={activeBanners.characterBannerImage} stats={state.profile.featured.history.length ? { pity5: state.profile.featured.pity5, pity4: state.profile.featured.pity4, totalPulls: state.profile.featured.history.length, guaranteed: state.profile.featured.guaranteed } : null} />)}
              </div>
            )}

            {trackerCategory === 'weapon' && (
              <div className="space-y-2">
                {activeBanners.weapons.map(w => <BannerCard key={w.id} item={w} type="weapon" bannerImage={activeBanners.weaponBannerImage} stats={state.profile.weapon.history.length ? { pity5: state.profile.weapon.pity5, pity4: state.profile.weapon.pity4, totalPulls: state.profile.weapon.history.length } : null} />)}
              </div>
            )}

            {trackerCategory === 'standard' && (
              <div className="space-y-3">
                <div className="text-gray-300 text-xs uppercase tracking-wider" style={{position: 'relative', zIndex: 5}}>Permanent Banners</div>
                
                {/* Standard Resonator Banner */}
                <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-neutral-900/30 via-neutral-900/20 to-cyan-900/30" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 5}}>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-cyan-500/20 blur-2xl opacity-30" />
                  </div>
                  <div className="relative z-10 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm text-cyan-400">Tidal Chorus</h3>
                      <span className="text-gray-400 text-[10px]">Standard Resonator</span>
                    </div>
                    <div className="text-gray-300 text-[9px] mb-1">Available 5★</div>
                    <div className="flex gap-1 flex-wrap">
                      {activeBanners.standardCharacters.map(n => <span key={n} className="text-[9px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">{n}</span>)}
                    </div>
                    {state.profile.standardChar?.history?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-white/10">
                        <div><div className="text-cyan-400 font-bold">{state.profile.standardChar.pity5}/80</div><div className="text-gray-300 text-[9px]">5★ Pity</div></div>
                        <div><div className="text-purple-400 font-bold">{state.profile.standardChar.pity4}/10</div><div className="text-gray-300 text-[9px]">4★ Pity</div></div>
                        <div><div className="text-white font-bold">{state.profile.standardChar.history.length}</div><div className="text-gray-300 text-[9px]">Convenes</div></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Standard Weapon Banner */}
                <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-neutral-900/30 via-neutral-900/20 to-purple-900/30" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 5}}>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-500/20 blur-2xl opacity-30" />
                  </div>
                  <div className="relative z-10 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm text-purple-400">Winter Brume</h3>
                      <span className="text-gray-400 text-[10px]">Standard Weapon</span>
                    </div>
                    <div className="text-gray-300 text-[9px] mb-1">Available 5★</div>
                    <div className="flex gap-1 flex-wrap">
                      {activeBanners.standardWeapons.map(w => <span key={w.name} className="text-[9px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded">{w.name}</span>)}
                    </div>
                    {state.profile.standardWeap?.history?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-white/10">
                        <div><div className="text-purple-400 font-bold">{state.profile.standardWeap.pity5}/80</div><div className="text-gray-300 text-[9px]">5★ Pity</div></div>
                        <div><div className="text-purple-400 font-bold">{state.profile.standardWeap.pity4}/10</div><div className="text-gray-300 text-[9px]">4★ Pity</div></div>
                        <div><div className="text-white font-bold">{state.profile.standardWeap.history.length}</div><div className="text-gray-300 text-[9px]">Convenes</div></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Banner History Archive */}
            <Card>
              <CardHeader><Archive size={14} className="text-purple-400" /> Banner History</CardHeader>
              <CardBody>
                <div className="max-h-64 overflow-y-auto kuro-scroll space-y-1.5">
                  {BANNER_HISTORY.map((b, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-xs font-medium">v{b.version} P{b.phase}</span>
                        <span className="text-gray-500 text-[9px]">{b.startDate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {b.characters.map(c => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">{c}</span>
                        ))}
                        {b.weapons.map(w => (
                          <span key={w} className="text-[9px] px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded">{w}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* [SECTION:TAB-EVENTS] */}
        {activeTab === 'events' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* LAHAI-ROI BACKGROUND */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: '-10%',
              right: '-10%',
              height: '35%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(160,190,215,0.18) 0%, rgba(140,175,200,0.08) 40%, transparent 100%)',
              filter: 'blur(20px)'
            }} />
            
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '25%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(100,130,160,0.03) 0%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="eventsNodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="eventsGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <line x1="0" y1="25" x2="50" y2="25" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <circle cx="25" cy="25" r="2.5" fill="rgba(230,242,255,0.75)" filter="url(#eventsNodeGlow)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#eventsGrid)"/>
              </svg>
            </div>
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(150,180,205,0.1) 0%, rgba(130,160,185,0.04) 30%, transparent 60%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%),
                radial-gradient(ellipse 90% 80% at 50% 55%, transparent 50%, rgba(6,10,16,0.35) 100%)
              `
            }} />

            <div className="flex items-center justify-between" style={{position: 'relative', zIndex: 5}}>
              <h2 className="text-white font-semibold text-sm">Time-Gated Content</h2>
              <span className="text-gray-300 text-[10px]">Server: {state.server}</span>
            </div>
            <div className="space-y-2">
              {Object.values(EVENTS).map((ev, i) => <EventCard key={i} event={ev} server={state.server} bannerImage={activeBanners.eventBannerImage} />)}
            </div>
            <p className="text-neutral-500 text-[10px] text-center" style={{position: 'relative', zIndex: 5}}>Reset times based on {state.server} server (UTC{SERVERS[state.server]?.utcOffset >= 0 ? '+' : ''}{SERVERS[state.server]?.utcOffset})</p>
          </div>
        )}

        {/* [SECTION:TAB-CALC] */}
        {activeTab === 'calculator' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* LAHAI-ROI 2D PATTERN */}
            
            {/* Dark base with slight blue tint - lighter at bottom */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)'
            }} />
            
            {/* Volumetric light from BOTTOM - diffuse spread like lamp below screen */}
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              zIndex: 1,
              pointerEvents: 'none',
              background: `
                linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)
              `
            }} />
            
            {/* Additional soft horizontal glow at very bottom */}
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: '-10%',
              right: '-10%',
              height: '35%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(160,190,215,0.18) 0%, rgba(140,175,200,0.08) 40%, transparent 100%)',
              filter: 'blur(20px)'
            }} />
            
            {/* Subtle top ambient - minimal */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '25%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(100,130,160,0.03) 0%, transparent 100%)'
            }} />
            
            {/* Square grid pattern with nodes at intersections */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="gridCell" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <line x1="0" y1="25" x2="50" y2="25" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <circle cx="25" cy="25" r="2.5" fill="rgba(230,242,255,0.75)" filter="url(#nodeGlow)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridCell)"/>
              </svg>
            </div>
            
            {/* Atmospheric depth layer - horizontal bottom glow */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              background: `
                linear-gradient(0deg, rgba(150,180,205,0.1) 0%, rgba(130,160,185,0.04) 30%, transparent 60%)
              `
            }} />
            
            {/* Soft vignette - darker at top, lighter at bottom */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%),
                radial-gradient(ellipse 90% 80% at 50% 55%, transparent 50%, rgba(6,10,16,0.35) 100%)
              `
            }} />
            
            {/* Banner Selection */}
            <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
              <div className="kuro-card-inner">
                <div className="kuro-header">
                  <h3>Banner Selection</h3>
                  <button onClick={() => setShowBookmarkModal(true)} className="text-purple-400 text-[10px] flex items-center gap-1 hover:text-purple-300 transition-colors">
                    <BookmarkPlus size={12} />Save
                  </button>
                </div>
                <div className="kuro-body space-y-4">
                  {/* Featured Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label">Featured Convene</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'char'); }} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char' ? 'active-gold' : ''}`}>
                        <Sparkles size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'weap'); }} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' ? 'active-pink' : ''}`}>
                        <Swords size={16} className="mx-auto mb-1.5" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'both'); }} className={`kuro-btn w-full ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Featured
                    </button>
                  </div>

                  {/* Standard Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label">Standard Convene</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'char'); }} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char' ? 'active-cyan' : ''}`}>
                        <Star size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'weap'); }} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap' ? 'active-cyan' : ''}`}>
                        <Sword size={16} className="mx-auto mb-1.5 rotate-45" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'both'); }} className={`kuro-btn w-full ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Standard
                    </button>
                  </div>

                  {/* 50/50 Toggle */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <button onClick={() => { const newVal = !state.calc.charGuaranteed; setCalc('charGuaranteed', newVal); setCalc('charGuaranteedManual', newVal); }} className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : ''}`}>
                      {state.calc.charGuaranteed ? '✓ Guaranteed' : '50/50 Active'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pity Counter */}
            <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
              <div className="kuro-card-inner">
                <div className="kuro-header">
                  <h3>Pity Counter</h3>
                </div>
                <div className="kuro-body space-y-4">
                  {/* Featured Character Pity */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.charPity} max={80} color="gold" softPity={66} />
                        <div className="flex-1">
                          <div style={{color: '#fde047'}} className="text-sm font-medium mb-1">Featured Resonator</div>
                          <input type="range" min="0" max="80" value={state.calc.charPity} onChange={e => { const v = +e.target.value; setCalc('charPity', v); if (v >= 80 && !state.calc.charGuaranteed) setCalc('charGuaranteed', true); else if (v < 80 && !state.calc.charGuaranteedManual) setCalc('charGuaranteed', false); }} className="kuro-slider" />
                          {state.calc.charPity >= 66 && <p className="text-[10px] kuro-soft-pity" style={{color: '#fb923c'}}><Sparkles size={10} className="inline mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(253,224,71,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.charPity >= 66 ? '#fb923c' : '#fde047'}} className={`text-2xl kuro-number ${state.calc.charPity >= 66 ? 'kuro-soft-pity' : ''}`}>{state.calc.charPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span style={{color: '#fde047'}}>5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.charCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('charCopies', Math.max(0, Math.min(7, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{color: '#c4b5fd'}}>4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.char4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('char4StarCopies', Math.max(0, Math.min(21, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Weapon Pity - Pink to match weapon banners */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.weapPity} max={80} color="pink" softPity={66} />
                        <div className="flex-1">
                          <div style={{color: '#f472b6'}} className="text-sm font-medium mb-1">Featured Weapon</div>
                          <input type="range" min="0" max="80" value={state.calc.weapPity} onChange={e => setCalc('weapPity', +e.target.value)} className="kuro-slider pink" />
                          {state.calc.weapPity >= 66 && <p className="text-[10px] kuro-soft-pity-pink" style={{color: '#f9a8d4'}}><Swords size={10} className="inline mr-1" style={{color: '#f9a8d4', filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.weapPity >= 66 ? '#f9a8d4' : '#f472b6'}} className={`text-2xl kuro-number ${state.calc.weapPity >= 66 ? 'kuro-soft-pity-pink' : ''}`}>{state.calc.weapPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span style={{color: '#f472b6'}}>5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.weapCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('weapCopies', Math.max(0, Math.min(5, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{color: '#c4b5fd'}}>4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.weap4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('weap4StarCopies', Math.max(0, Math.min(15, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Resonator Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.stdCharPity} max={80} color="cyan" softPity={66} />
                        <div className="flex-1">
                          <div style={{color: '#7dd3fc'}} className="text-sm font-medium mb-1">Standard Resonator</div>
                          <input type="range" min="0" max="80" value={state.calc.stdCharPity} onChange={e => setCalc('stdCharPity', +e.target.value)} className="kuro-slider cyan" />
                          {state.calc.stdCharPity >= 66 && <p className="text-[10px] kuro-soft-pity-cyan" style={{color: '#67e8f9'}}><Star size={10} className="inline mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(103,232,249,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.stdCharPity >= 66 ? '#67e8f9' : '#7dd3fc'}} className={`text-2xl kuro-number ${state.calc.stdCharPity >= 66 ? 'kuro-soft-pity-cyan' : ''}`}>{state.calc.stdCharPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span style={{color: '#7dd3fc'}}>5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdCharCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdCharCopies', Math.max(0, Math.min(7, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{color: '#c4b5fd'}}>4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdChar4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdChar4StarCopies', Math.max(0, Math.min(21, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Weapon Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.stdWeapPity} max={80} color="cyan" softPity={66} />
                        <div className="flex-1">
                          <div style={{color: '#7dd3fc'}} className="text-sm font-medium mb-1">Standard Weapon</div>
                          <input type="range" min="0" max="80" value={state.calc.stdWeapPity} onChange={e => setCalc('stdWeapPity', +e.target.value)} className="kuro-slider cyan" />
                          {state.calc.stdWeapPity >= 66 && <p className="text-[10px] kuro-soft-pity-cyan" style={{color: '#67e8f9'}}><Sword size={10} className="inline mr-1 rotate-45" style={{filter: 'drop-shadow(0 0 4px rgba(103,232,249,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.stdWeapPity >= 66 ? '#67e8f9' : '#7dd3fc'}} className={`text-2xl kuro-number ${state.calc.stdWeapPity >= 66 ? 'kuro-soft-pity-cyan' : ''}`}>{state.calc.stdWeapPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span style={{color: '#7dd3fc'}}>5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdWeapCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdWeapCopies', Math.max(0, Math.min(5, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{color: '#c4b5fd'}}>4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdWeap4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdWeap4StarCopies', Math.max(0, Math.min(15, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
              <div className="kuro-card-inner">
                <div className="kuro-header">
                  <h3>Resources</h3>
                </div>
                <div className="kuro-body space-y-3">
                  <div>
                    <label className="kuro-label mb-1.5 block">Astrite</label>
                    <input type="number" value={state.calc.astrite} onChange={e => setCalc('astrite', e.target.value)} className="kuro-input" placeholder="0" />
                    <p className="text-gray-200 text-[10px] mt-1.5">= {Math.floor((+state.calc.astrite || 0) / 160)} Convenes</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[160, 800, 1600, 3200].map(amt => (
                        <button key={amt} onClick={() => setCalc('astrite', String((+state.calc.astrite || 0) + amt))} className="px-2 py-1 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors">+{amt}</button>
                      ))}
                      <button onClick={() => setCalc('astrite', '')} className="px-2 py-1 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors">Clear</button>
                    </div>
                  </div>

                  {/* Featured banner resources */}
                  {state.calc.bannerCategory === 'featured' && (
                    <div className="grid grid-cols-2 gap-3">
                      {(state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label style={{color: '#fde047'}} className="text-xs mb-1.5 block font-medium">Radiant Tides</label>
                          <input type="number" value={state.calc.radiant} onChange={e => setCalc('radiant', e.target.value)} className="kuro-input" placeholder="0" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('radiant', String((+state.calc.radiant || 0) + amt))} className="px-2 py-0.5 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {(state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label style={{color: '#fde047'}} className="text-xs mb-1.5 block font-medium">Forging Tides</label>
                          <input type="number" value={state.calc.forging} onChange={e => setCalc('forging', e.target.value)} className="kuro-input" placeholder="0" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('forging', String((+state.calc.forging || 0) + amt))} className="px-2 py-0.5 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard banner resources */}
                  {state.calc.bannerCategory === 'standard' && (
                    <div>
                      <label style={{color: '#7dd3fc'}} className="text-xs mb-1.5 block font-medium">Lustrous Tides</label>
                      <input type="number" value={state.calc.lustrous} onChange={e => setCalc('lustrous', e.target.value)} className="kuro-input" placeholder="0" />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String((+state.calc.lustrous || 0) + amt))} className="px-2 py-0.5 text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">+{amt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Convenes Display */}
                  <div className="kuro-stat">
                    <div className="flex justify-around items-center">
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div style={{color: '#fde047'}} className="kuro-number text-xl">{Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.radiant || 0)}</div>
                          <div className="text-gray-200 text-[10px]">Resonator Convenes</div>
                        </div>
                      )}
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div style={{color: '#fde047'}} className="kuro-number text-xl">{Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.forging || 0)}</div>
                          <div className="text-gray-200 text-[10px]">Weapon Convenes</div>
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (
                        <div className="text-center">
                          <div style={{color: '#7dd3fc'}} className="kuro-number text-xl">{Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.lustrous || 0)}</div>
                          <div className="text-gray-200 text-[10px]">Standard Convenes</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Cards */}
            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
              <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
                <div className="kuro-card-inner">
                  <div className="kuro-header">
                    <h3>Featured Resonator Results</h3>
                  </div>
                  <div className="kuro-body space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-gold">
                        <div className={`text-3xl kuro-number ${parseFloat(charStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(charStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(charStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{charStats.successRate}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{charStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="kuro-stat kuro-stat-purple"><span style={{color: '#c4b5fd'}} className="kuro-number">~{charStats.fourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">4★ Expected</div></div>
                      <div className="kuro-stat kuro-stat-purple"><span style={{color: '#c4b5fd'}} className="kuro-number">~{charStats.featuredFourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">Featured 4★</div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
                <div className="kuro-card-inner">
                  <div className="kuro-header">
                    <h3>Featured Weapon Results</h3>
                  </div>
                  <div className="kuro-body space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-gold">
                        <div className={`text-3xl kuro-number ${parseFloat(weapStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(weapStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(weapStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{weapStats.successRate}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{weapStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="kuro-stat kuro-stat-purple"><span style={{color: '#c4b5fd'}} className="kuro-number">~{weapStats.fourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">4★ Expected</div></div>
                      <div className="kuro-stat kuro-stat-purple"><span style={{color: '#c4b5fd'}} className="kuro-number">~{weapStats.featuredFourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">Featured 4★</div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
              <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
                <div className="kuro-card-inner">
                  <div className="kuro-header">
                    <h3>Standard Resonator Results</h3>
                  </div>
                  <div className="kuro-body space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className={`text-3xl kuro-number ${parseFloat(stdCharStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stdCharStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stdCharStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stdCharStats.successRate}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{stdCharStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="kuro-stat kuro-stat-purple text-xs"><span style={{color: '#c4b5fd'}} className="kuro-number">~{stdCharStats.fourStarCount}</span> <span className="text-gray-200">4★ Expected</span></div>
                  </div>
                </div>
              </div>
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
                <div className="kuro-card-inner">
                  <div className="kuro-header">
                    <h3>Standard Weapon Results</h3>
                  </div>
                  <div className="kuro-body space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className={`text-3xl kuro-number ${parseFloat(stdWeapStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stdWeapStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stdWeapStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stdWeapStats.successRate}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{stdWeapStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="kuro-stat kuro-stat-purple text-xs"><span style={{color: '#c4b5fd'}} className="kuro-number">~{stdWeapStats.fourStarCount}</span> <span className="text-gray-200">4★ Expected</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Combined Analysis */}
            {state.calc.selectedBanner === 'both' && combined && (
              <div className="kuro-card" style={{backgroundColor: 'rgba(12, 16, 24, 0.28)', backdropFilter: 'blur(8px)'}}>
                <div className="kuro-card-inner">
                  <div className="kuro-header">
                    <h3>Combined Analysis</h3>
                  </div>
                  <div className="kuro-body">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-emerald">
                        <div className="text-2xl kuro-number text-emerald-400">{combined.both}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">Get Both</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gold">
                        <div style={{color: '#fde047'}} className="text-2xl kuro-number">{combined.atLeastOne}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">At Least One</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="kuro-stat"><span style={{color: state.calc.bannerCategory === 'featured' ? '#fde047' : '#7dd3fc'}} className="kuro-number">{combined.charOnly}%</span><div className="text-gray-200 mt-0.5">Char Only</div></div>
                      <div className="kuro-stat"><span style={{color: state.calc.bannerCategory === 'featured' ? '#fde047' : '#7dd3fc'}} className="kuro-number">{combined.weapOnly}%</span><div className="text-gray-200 mt-0.5">Weap Only</div></div>
                      <div className="kuro-stat"><span className="text-red-400 kuro-number">{combined.neither}%</span><div className="text-gray-200 mt-0.5">Neither</div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* LAHAI-ROI BACKGROUND */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: '-10%',
              right: '-10%',
              height: '35%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(160,190,215,0.18) 0%, rgba(140,175,200,0.08) 40%, transparent 100%)',
              filter: 'blur(20px)'
            }} />
            
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '25%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(100,130,160,0.03) 0%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="plannerNodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="plannerGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <line x1="0" y1="25" x2="50" y2="25" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <circle cx="25" cy="25" r="2.5" fill="rgba(230,242,255,0.75)" filter="url(#plannerNodeGlow)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#plannerGrid)"/>
              </svg>
            </div>
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(150,180,205,0.1) 0%, rgba(130,160,185,0.04) 30%, transparent 60%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%),
                radial-gradient(ellipse 90% 80% at 50% 55%, transparent 50%, rgba(6,10,16,0.35) 100%)
              `
            }} />

            {/* Daily Income Setup - Clean summary only */}
            <Card>
              <CardHeader>Daily Income</CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <label className="kuro-label">Base Daily Astrite (Commissions, etc.)</label>
                  <input type="number" value={state.planner.dailyAstrite} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: +e.target.value || 0 })} className="kuro-input w-full" />
                </div>
                
                {/* Active Subscriptions Summary - Read-only display */}
                {state.planner.luniteActive && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 text-xs">Lunite Subscription</span>
                    </div>
                    <span className="text-emerald-400 text-xs">+90/day</span>
                  </div>
                )}

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 text-sm font-medium">📅 Daily Income</span>
                    <span className="text-yellow-400 font-bold">{dailyIncome} Astrite</span>
                  </div>
                  <div className="text-gray-200 text-[10px] mt-1">≈ {(dailyIncome / 160).toFixed(2)} Convenes/day • {Math.floor(dailyIncome * 30 / 160)} Convenes/month</div>
                </div>
              </CardBody>
            </Card>

            {/* Add Purchases */}
            <Card>
              <div className="kuro-header cursor-pointer" onClick={() => setShowIncomePanel(!showIncomePanel)}>
                <h3>Add Purchases</h3>
                <ChevronDown size={14} className={`text-gray-200 transition-transform ${showIncomePanel ? 'rotate-180' : ''}`} />
              </div>
              {showIncomePanel && (
                <CardBody className="space-y-1.5 max-h-80 overflow-y-auto">
                  {/* Subscriptions */}
                  <div className="kuro-label mb-1">Subscriptions</div>
                  
                  {/* Lunite Monthly Toggle */}
                  <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteActive', value: !state.planner.luniteActive })} className={`kuro-btn w-full text-left ${state.planner.luniteActive ? 'active-emerald' : ''}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded flex items-center justify-center ${state.planner.luniteActive ? 'bg-emerald-500 text-black' : 'bg-neutral-700'}`}>
                          {state.planner.luniteActive && <Check size={10} />}
                        </span>
                        <div>
                          <div className={`text-xs font-medium ${state.planner.luniteActive ? 'text-emerald-400' : 'text-gray-200'}`}>Lunite Subscription</div>
                          <div className="text-gray-300 text-[10px]">300 Lunite + 90 Ast/day × 30d</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-xs">$4.99/mo</span>
                    </div>
                  </button>

                  {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
                    <button key={k} onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: Date.now(), astrite: s.astrite, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } })} className="kuro-btn w-full text-left">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="text-gray-200 text-xs font-medium">{s.name}</div>
                          <div className="text-gray-300 text-[10px]">{s.desc}</div>
                        </div>
                        <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                      </div>
                    </button>
                  ))}

                  {/* Direct Top-Ups */}
                  <div className="kuro-label mt-3 mb-1">Direct Top-Ups</div>
                  {Object.entries(SUBSCRIPTIONS).filter(([k]) => k.startsWith('directTop')).map(([k, s]) => (
                    <button key={k} onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: Date.now(), astrite: s.astrite, radiant: 0, lustrous: 0, label: s.name, price: s.price } })} className="kuro-btn w-full text-left">
                      <div className="flex items-center justify-between w-full">
                        <div><div className="text-gray-200 text-xs font-medium">{s.name}</div><div className="text-gray-300 text-[10px]">{s.desc}</div></div>
                        <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                      </div>
                    </button>
                  ))}
                </CardBody>
              )}
            </Card>

            {/* Added Income - Show if any purchases made */}
            {state.planner.addedIncome.length > 0 && (
              <Card>
                <CardHeader action={<button onClick={() => state.planner.addedIncome.forEach(i => dispatch({ type: 'REMOVE_INCOME', id: i.id }))} className="text-red-400 text-[10px]">Clear All</button>}>Added Purchases</CardHeader>
                <CardBody className="space-y-1">
                  {state.planner.addedIncome.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-1.5 bg-white/5 rounded text-xs">
                      <span className="text-gray-200">{i.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">+{i.astrite}</span>
                        {i.radiant > 0 && <span className="text-cyan-400">+{i.radiant}RT</span>}
                        {i.lustrous > 0 && <span className="text-purple-400">+{i.lustrous}LT</span>}
                        <button onClick={() => dispatch({ type: 'REMOVE_INCOME', id: i.id })} className="text-red-400"><Minus size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                    <span className="text-gray-300">Total Spent</span>
                    <span className="text-emerald-400 font-bold">${state.planner.addedIncome.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Income Projections */}
            <Card>
              <CardHeader>Income Projections</CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 30, 90].map(days => {
                    const income = dailyIncome * days;
                    const convenes = Math.floor(income / 160);
                    return (
                      <div key={days} className="kuro-stat p-3 text-center">
                        <div className="text-gray-200 text-[10px] mb-1">{days} Days</div>
                        <div className="text-2xl kuro-number text-yellow-400">{convenes}</div>
                        <div className="text-gray-300 text-[9px]">Convenes</div>
                        <div className="text-gray-400 text-[9px]">{income.toLocaleString()} Ast</div>
                      </div>
                    );
                  })}
                </div>
                {state.planner.luniteActive && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                    <span className="text-emerald-400 text-xs">Monthly Subscription Cost: </span>
                    <span className="text-emerald-400 font-bold text-xs">${SUBSCRIPTIONS.lunite.price}/month</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Goal Settings - Uses Calculator values for banner/copies */}
            <Card>
              <CardHeader>Goal Progress</CardHeader>
              <CardBody className="space-y-3">
                {/* Base Convenes and Modifier */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="kuro-label">Base Convenes (per copy)</label>
                    <select value={state.planner.goalPulls} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +e.target.value })} className="kuro-input w-full">
                      <option value={80}>80 (Soft Pity)</option>
                      <option value={160}>160 (Guaranteed)</option>
                      <option value={240}>240 (Char + Signature)</option>
                    </select>
                  </div>
                  <div>
                    <label className="kuro-label">Multiplier</label>
                    <select value={state.planner.goalModifier} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +e.target.value })} className="kuro-input w-full">
                      <option value={1}>×1</option>
                      <option value={2}>×2</option>
                      <option value={3}>×3</option>
                    </select>
                  </div>
                </div>

                {/* Goal Progress - Uses Calculator banner/copies */}
                {(() => {
                  const currentAstrite = +state.calc.astrite || 0;
                  const isFeatured = state.calc.bannerCategory === 'featured';
                  const isChar = state.calc.selectedBanner === 'char';
                  const isWeap = state.calc.selectedBanner === 'weap';
                  const isBoth = state.calc.selectedBanner === 'both';
                  
                  // Get copies from Calculator
                  let copies = 1;
                  let bannerLabel = '';
                  if (isFeatured) {
                    if (isChar) { copies = state.calc.charCopies; bannerLabel = 'Featured Resonator'; }
                    else if (isWeap) { copies = state.calc.weapCopies; bannerLabel = 'Featured Weapon'; }
                    else { copies = Math.max(state.calc.charCopies, state.calc.weapCopies); bannerLabel = 'Featured Both'; }
                  } else {
                    if (isChar) { copies = state.calc.stdCharCopies; bannerLabel = 'Standard Resonator'; }
                    else if (isWeap) { copies = state.calc.stdWeapCopies; bannerLabel = 'Standard Weapon'; }
                    else { copies = Math.max(state.calc.stdCharCopies, state.calc.stdWeapCopies); bannerLabel = 'Standard Both'; }
                  }
                  
                  const targetPulls = state.planner.goalPulls * copies * state.planner.goalModifier;
                  const targetAstrite = targetPulls * 160;
                  const needed = Math.max(0, targetAstrite - currentAstrite);
                  const daysNeeded = dailyIncome > 0 ? Math.ceil(needed / dailyIncome) : Infinity;
                  const progress = Math.min(100, (currentAstrite / targetAstrite) * 100);
                  
                  return (
                    <>
                      <div className="p-2 bg-white/5 rounded text-[10px] text-gray-200 text-center">
                        Using Calculator: <span className={isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{bannerLabel}</span> × <span className="text-gray-100">{copies}</span> copies
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-200">Target</span>
                          <span className="text-gray-100 font-bold">{targetPulls} Convenes ({targetAstrite.toLocaleString()} Ast)</span>
                        </div>
                        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                          <span className="text-gray-300">{Math.floor(currentAstrite / 160)} / {targetPulls} Convenes</span>
                          <span className="text-gray-100">{progress.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 text-center rounded-lg border border-white/15" style={{backgroundColor: 'rgba(12, 16, 24, 0.5)', backdropFilter: 'blur(8px)'}}>
                          <div className="text-yellow-400 kuro-number text-xl">{needed.toLocaleString()}</div>
                          <div className="text-gray-200 text-[10px]">Astrite Needed</div>
                        </div>
                        <div className="p-3 text-center rounded-lg border border-white/15" style={{backgroundColor: 'rgba(12, 16, 24, 0.5)', backdropFilter: 'blur(8px)'}}>
                          <div className="text-yellow-400 kuro-number text-xl">{daysNeeded === Infinity ? '∞' : daysNeeded}</div>
                          <div className="text-gray-200 text-[10px]">Days to Goal</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardBody>
            </Card>

            {/* Bookmarks */}
            {state.bookmarks.length > 0 && (
              <Card>
                <CardHeader>Saved States</CardHeader>
                <CardBody className="space-y-1.5">
                  {state.bookmarks.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <div className="text-gray-200 text-xs font-medium">{b.name}</div>
                        <div className="text-gray-300 text-[10px]">{b.astrite} Ast • P{b.charPity}/{b.weapPity}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-[10px] hover:bg-cyan-500/30">Load</button>
                        <button onClick={() => dispatch({ type: 'DELETE_BOOKMARK', id: b.id })} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] hover:bg-red-500/30">×</button>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* [SECTION:TAB-STATS] */}
        {activeTab === 'analytics' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)' }} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70%', zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%)' }} />

            {!overallStats ? (
              <Card>
                <CardBody className="text-center py-8">
                  <BarChart3 size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400 text-sm">No data to analyze</p>
                  <p className="text-gray-500 text-xs mt-1">Import your Convene history in Profile tab</p>
                </CardBody>
              </Card>
            ) : (
              <>
                {/* Success Rate Card */}
                {luckRating && (
                  <Card>
                    <CardHeader>Success Rate</CardHeader>
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold mb-1" style={{color: luckRating.color}}>{luckRating.rating}</div>
                          <div className="text-xs text-gray-400">
                            Rank <span className="font-bold" style={{color: luckRating.color}}>{luckRating.tier}</span> • Avg pity {overallStats.avgPity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">Top {Math.max(1, 100 - luckRating.percentile)}%</div>
                          <div className="text-[10px] text-gray-500">of players</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Convenes Chart with Time Range */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} /> Convene History</span>
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const allHist = [...(state.profile.featured?.history || []), ...(state.profile.weapon?.history || []), ...(state.profile.standardChar?.history || []), ...(state.profile.standardWeap?.history || [])];
                      if (allHist.length < 10) return <p className="text-gray-500 text-xs text-center py-6">Need more Convene data for trends</p>;
                      
                      const groupData = (range) => {
                        const grouped = {};
                        allHist.forEach(p => {
                          if (p.timestamp) {
                            const date = new Date(p.timestamp);
                            let key;
                            if (range === 'daily') {
                              key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                            } else if (range === 'weekly') {
                              const startOfYear = new Date(date.getFullYear(), 0, 1);
                              const weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                              key = `${date.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
                            } else if (range === 'monthly') {
                              key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
                            } else {
                              key = `${date.getFullYear()}`;
                            }
                            if (!grouped[key]) grouped[key] = { pulls: 0, fiveStars: 0 };
                            grouped[key].pulls++;
                            if (p.rarity === 5) grouped[key].fiveStars++;
                          }
                        });
                        return grouped;
                      };
                      
                      const formatLabel = (key, range) => {
                        if (range === 'daily') {
                          const d = new Date(key);
                          return `${d.getDate()}/${d.getMonth()+1}`;
                        } else if (range === 'weekly') {
                          return key.split('-')[1];
                        } else if (range === 'monthly') {
                          return new Date(key + '-01').toLocaleString('default', { month: 'short' });
                        } else {
                          return key;
                        }
                      };
                      
                      const visibleCount = { daily: 14, weekly: 12, monthly: 6, yearly: 6 };
                      const grouped = groupData(chartRange);
                      const allData = Object.entries(grouped)
                        .sort((a,b) => a[0].localeCompare(b[0]))
                        .map(([key, data]) => ({
                          key,
                          label: formatLabel(key, chartRange),
                          pulls: data.pulls
                        }));
                      
                      if (allData.length < 2) return <p className="text-gray-500 text-xs text-center py-6">Need more data</p>;
                      
                      const maxVisible = visibleCount[chartRange];
                      const maxOffset = Math.max(0, allData.length - maxVisible);
                      const clampedOffset = Math.min(chartOffset, maxOffset);
                      const chartData = allData.slice(clampedOffset, clampedOffset + maxVisible);
                      const canGoLeft = clampedOffset > 0;
                      const canGoRight = clampedOffset < maxOffset;
                      
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-1">
                              {['daily', 'weekly', 'monthly', 'yearly'].map(r => (
                                <button
                                  key={r}
                                  onClick={() => { setChartRange(r); setChartOffset(9999); }}
                                  className={`px-2 py-1 text-[10px] rounded transition-all ${chartRange === r ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                >
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                              ))}
                            </div>
                            {allData.length > maxVisible && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => setChartOffset(Math.max(0, clampedOffset - Math.floor(maxVisible / 2)))}
                                  disabled={!canGoLeft}
                                  className={`p-1 rounded ${canGoLeft ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-600'}`}
                                >
                                  <ChevronDown size={14} className="rotate-90" />
                                </button>
                                <button 
                                  onClick={() => setChartOffset(Math.min(maxOffset, clampedOffset + Math.floor(maxVisible / 2)))}
                                  disabled={!canGoRight}
                                  className={`p-1 rounded ${canGoRight ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-600'}`}
                                >
                                  <ChevronDown size={14} className="-rotate-90" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="pullGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(251,191,36,0.22)" />
                                    <stop offset="100%" stopColor="rgba(251,191,36,0)" />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                  contentStyle={{ background: 'rgba(15,20,28,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px' }} 
                                  labelStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="natural" dataKey="pulls" stroke="rgba(251,191,36,0.4)" fill="url(#pullGradient)" strokeWidth={1} name="Convenes" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          {allData.length > maxVisible && (
                            <div className="text-center text-[9px] text-gray-500 mt-1">
                              {clampedOffset + 1}-{Math.min(clampedOffset + maxVisible, allData.length)} of {allData.length}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* Overall Stats */}
                <Card>
                  <CardHeader><BarChart3 size={14} /> Overall Statistics</CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-white font-bold">{overallStats.totalPulls}</div><div className="text-gray-400 text-[9px]">Total Pulls</div></div>
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-yellow-400 font-bold">{overallStats.totalAstrite.toLocaleString()}</div><div className="text-gray-400 text-[9px]">Astrite Spent</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="p-1.5 bg-white/5 rounded text-center"><div className="text-emerald-400 font-bold text-sm">{overallStats.won5050}</div><div className="text-gray-400 text-[8px]">Won 50/50</div></div>
                      <div className="p-1.5 bg-white/5 rounded text-center"><div className="text-red-400 font-bold text-sm">{overallStats.lost5050}</div><div className="text-gray-400 text-[8px]">Lost 50/50</div></div>
                      <div className="p-1.5 bg-white/5 rounded text-center"><div className="text-white font-bold text-sm">{overallStats.avgPity}</div><div className="text-gray-400 text-[8px]">Avg. Pity</div></div>
                    </div>
                    {overallStats.winRate && <div className="text-center text-[10px] text-gray-400 mt-2">50/50 Win Rate: <span className="text-emerald-400 font-bold">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* Pity Distribution */}
                <Card>
                  <CardHeader>Pity Distribution</CardHeader>
                  <CardBody>
                    {(() => {
                      const allPulls = [...(state.profile.featured?.history || []), ...(state.profile.weapon?.history || [])];
                      const fiveStars = allPulls.filter(p => p.rarity === 5 && p.pity > 0);
                      if (fiveStars.length < 2) return <p className="text-gray-500 text-xs text-center py-4">Need more 5★ data</p>;
                      
                      const ranges = [
                        { range: '1-40', label: 'Early', min: 1, max: 40, color: '34,197,94' },
                        { range: '41-60', label: 'Normal', min: 41, max: 60, color: '59,130,246' },
                        { range: '61-70', label: 'Soft Pity', min: 61, max: 70, color: '245,158,11' },
                        { range: '71-80', label: 'Hard Pity', min: 71, max: 80, color: '239,68,68' },
                      ];
                      
                      const maxCount = Math.max(...ranges.map(r => fiveStars.filter(p => p.pity >= r.min && p.pity <= r.max).length));
                      
                      return (
                        <div className="space-y-3">
                          {ranges.map(({range, label, min, max, color}) => {
                            const count = fiveStars.filter(p => p.pity >= min && p.pity <= max).length;
                            const pct = maxCount > 0 ? (count / maxCount) * 50 : 0;
                            return (
                              <div key={range}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-gray-300 text-[11px]">{label} <span className="text-gray-500">({range})</span></span>
                                  <span className="text-gray-300 text-[11px] font-medium">{count}</span>
                                </div>
                                <div className="h-3 overflow-hidden" style={{background: 'rgba(255,255,255,0.02)', borderRadius: '1px'}}>
                                  <div className="h-full transition-all" style={{
                                    width: `${Math.max(pct, count > 0 ? 5 : 0)}%`,
                                    borderRadius: '1px',
                                    background: `linear-gradient(90deg, rgba(${color},0.25) 0%, rgba(${color},0.15) 70%, rgba(${color},0.08) 100%)`
                                  }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* Total Obtained */}
                <Card>
                  <CardHeader>Total Obtained</CardHeader>
                  <CardBody>
                    <p className="text-gray-400 text-[9px] mb-1.5">Resonators</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      <div className="p-1.5 bg-yellow-500/10 rounded text-center"><div className="text-yellow-400 font-bold text-sm">{[...(state.profile.featured?.history || []), ...(state.profile.standardChar?.history || [])].filter(p => p.rarity === 5).length}</div><div className="text-gray-400 text-[8px]">5★</div></div>
                      <div className="p-1.5 bg-purple-500/10 rounded text-center"><div className="text-purple-400 font-bold text-sm">{[...(state.profile.featured?.history || []), ...(state.profile.standardChar?.history || [])].filter(p => p.rarity === 4).length}</div><div className="text-gray-400 text-[8px]">4★</div></div>
                    </div>
                    
                    <p className="text-gray-400 text-[9px] mb-1.5">Weapons</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="p-1.5 bg-yellow-500/10 rounded text-center"><div className="text-yellow-400 font-bold text-sm">{[...(state.profile.weapon?.history || []), ...(state.profile.standardWeap?.history || [])].filter(p => p.rarity === 5).length}</div><div className="text-gray-400 text-[8px]">5★</div></div>
                      <div className="p-1.5 bg-purple-500/10 rounded text-center"><div className="text-purple-400 font-bold text-sm">{[...(state.profile.weapon?.history || []), ...(state.profile.standardWeap?.history || [])].filter(p => p.rarity === 4).length}</div><div className="text-gray-400 text-[8px]">4★</div></div>
                      <div className="p-1.5 bg-blue-500/10 rounded text-center"><div className="text-blue-400 font-bold text-sm">{[...(state.profile.weapon?.history || []), ...(state.profile.standardWeap?.history || [])].filter(p => p.rarity === 3).length}</div><div className="text-gray-400 text-[8px]">3★</div></div>
                    </div>
                  </CardBody>
                </Card>

                {/* Per-Banner Stats */}
                <Card>
                  <CardHeader>Per-Banner Breakdown</CardHeader>
                  <CardBody className="space-y-2">
                    {[
                      { name: 'Featured Resonator', key: 'featured', color: 'yellow' },
                      { name: 'Featured Weapon', key: 'weapon', color: 'pink' },
                      { name: 'Standard Resonator', key: 'standardChar', color: 'cyan' },
                      { name: 'Standard Weapon', key: 'standardWeap', color: 'purple' },
                    ].filter(b => (state.profile[b.key]?.history || []).length > 0).map(banner => {
                      const hist = state.profile[banner.key]?.history || [];
                      const pity = state.profile[banner.key]?.pity5 || 0;
                      return (
                        <div key={banner.name} className="p-2 bg-white/5 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium" style={{color: banner.color === 'yellow' ? '#fbbf24' : banner.color === 'pink' ? '#f472b6' : banner.color === 'cyan' ? '#22d3ee' : '#a78bfa'}}>{banner.name}</span>
                            <span className="text-gray-400 text-[10px]">{hist.length} Convenes</span>
                          </div>
                          <div className="flex gap-2 text-[9px]">
                            <span className="text-yellow-400">{hist.filter(p => p.rarity === 5).length} 5★</span>
                            <span className="text-purple-400">{hist.filter(p => p.rarity === 4).length} 4★</span>
                            <span className="text-gray-400">Pity: {pity}/80</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* LAHAI-ROI BACKGROUND */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="gatheringNodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="gatheringGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <line x1="0" y1="25" x2="50" y2="25" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <circle cx="25" cy="25" r="2.5" fill="rgba(230,242,255,0.75)" filter="url(#gatheringNodeGlow)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gatheringGrid)"/>
              </svg>
            </div>
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%),
                radial-gradient(ellipse 90% 80% at 50% 55%, transparent 50%, rgba(6,10,16,0.35) 100%)
              `
            }} />

            {!state.profile.importedAt ? (
              <Card>
                <CardBody className="text-center py-8">
                  <Archive size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400 text-sm">No Convene data imported</p>
                  <p className="text-gray-500 text-xs mt-1">Go to Profile tab to import your data</p>
                </CardBody>
              </Card>
            ) : (
              <>
                {/* 5★ Resonators */}
                <Card>
                  <CardHeader>
                    <span className="text-yellow-400">★★★★★</span> Resonators
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      // Resonators come from featured banner and standard resonator banner
                      const allHistory = [...state.profile.featured.history, ...(state.profile.standardChar?.history || [])];
                      const chars5 = allHistory.filter(p => p.rarity === 5 && p.name);
                      const charCounts = chars5.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
                      const uniqueChars = Object.entries(charCounts);
                      if (uniqueChars.length === 0) return <p className="text-gray-500 text-xs text-center">No 5★ Resonators obtained</p>;
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {uniqueChars.map(([name, count]) => (
                            <div key={name} className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                              <div className="text-yellow-400 font-bold text-lg">S{count - 1}</div>
                              <div className="text-gray-200 text-[9px] truncate">{name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 4★ Resonators */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">★★★★</span> Resonators
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      // Resonators come from featured banner and standard resonator banner
                      const allHistory = [...state.profile.featured.history, ...(state.profile.standardChar?.history || [])];
                      const chars4 = allHistory.filter(p => p.rarity === 4 && p.name);
                      const charCounts = chars4.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
                      const uniqueChars = Object.entries(charCounts);
                      if (uniqueChars.length === 0) return <p className="text-gray-500 text-xs text-center">No 4★ Resonators obtained</p>;
                      return (
                        <div className="grid grid-cols-4 gap-1.5">
                          {uniqueChars.map(([name, count]) => (
                            <div key={name} className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded text-center">
                              <div className="text-purple-400 font-bold text-sm">S{count - 1}</div>
                              <div className="text-gray-200 text-[8px] truncate">{name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 5★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-yellow-400">★★★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const allHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || [])];
                      const weaps5 = allHistory.filter(p => p.rarity === 5 && p.name);
                      const weapCounts = weaps5.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
                      const uniqueWeaps = Object.entries(weapCounts);
                      if (uniqueWeaps.length === 0) return <p className="text-gray-500 text-xs text-center">No 5★ weapons obtained</p>;
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {uniqueWeaps.map(([name, count]) => (
                            <div key={name} className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                              <div className="text-yellow-400 font-bold text-lg">R{count}</div>
                              <div className="text-gray-200 text-[9px] truncate">{name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 4★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">★★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const allHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || [])];
                      const weaps4 = allHistory.filter(p => p.rarity === 4 && p.name);
                      const weapCounts = weaps4.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
                      const uniqueWeaps = Object.entries(weapCounts);
                      if (uniqueWeaps.length === 0) return <p className="text-gray-500 text-xs text-center">No 4★ weapons obtained</p>;
                      return (
                        <div className="grid grid-cols-4 gap-1.5">
                          {uniqueWeaps.map(([name, count]) => (
                            <div key={name} className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded text-center">
                              <div className="text-purple-400 font-bold text-sm">R{count}</div>
                              <div className="text-gray-200 text-[8px] truncate">{name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 3★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-blue-400">★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const allHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || [])];
                      const weaps3 = allHistory.filter(p => p.rarity === 3 && p.name);
                      const weapCounts = weaps3.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
                      const uniqueWeaps = Object.entries(weapCounts);
                      if (uniqueWeaps.length === 0) return <p className="text-gray-500 text-xs text-center">No 3★ weapons obtained</p>;
                      return (
                        <div className="grid grid-cols-4 gap-1.5">
                          {uniqueWeaps.map(([name, count]) => (
                            <div key={name} className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                              <div className="text-blue-400 font-bold text-sm">R{count}</div>
                              <div className="text-gray-200 text-[8px] truncate">{name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {activeTab === 'profile' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3">
            {/* LAHAI-ROI BACKGROUND */}
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #080c12 0%, #0a0e16 40%, #0c1018 70%, #0e141e 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(140,175,200,0.22) 0%, rgba(120,160,190,0.12) 25%, rgba(100,140,170,0.05) 50%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: '-10%',
              right: '-10%',
              height: '35%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(160,190,215,0.18) 0%, rgba(140,175,200,0.08) 40%, transparent 100%)',
              filter: 'blur(20px)'
            }} />
            
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '25%',
              zIndex: 1,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(100,130,160,0.03) 0%, transparent 100%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.6
            }}>
              <svg style={{width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="profileNodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="profileGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <line x1="0" y1="25" x2="50" y2="25" stroke="rgba(150,180,200,0.22)" strokeWidth="0.5"/>
                    <circle cx="25" cy="25" r="2.5" fill="rgba(230,242,255,0.75)" filter="url(#profileNodeGlow)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#profileGrid)"/>
              </svg>
            </div>
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              background: 'linear-gradient(0deg, rgba(150,180,205,0.1) 0%, rgba(130,160,185,0.04) 30%, transparent 60%)'
            }} />
            
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(6,10,16,0.35) 0%, rgba(6,10,16,0.15) 30%, transparent 50%, transparent 80%, rgba(6,10,16,0.08) 100%),
                radial-gradient(ellipse 90% 80% at 50% 55%, transparent 50%, rgba(6,10,16,0.35) 100%)
              `
            }} />

            <Card>
              <CardHeader>Server Region</CardHeader>
              <CardBody>
                <div className="grid grid-cols-5 gap-1">
                  {Object.keys(SERVERS).map(s => (
                    <button key={s} onClick={() => dispatch({ type: 'SET_SERVER', server: s })} className={`kuro-btn py-2 text-[10px] font-medium ${state.server === s ? 'active-gold' : ''}`}>{s}</button>
                  ))}
                </div>
                <p className="text-gray-300 text-[10px] mt-2 text-center">Reset: 4:00 AM (UTC{SERVERS[state.server]?.utcOffset >= 0 ? '+' : ''}{SERVERS[state.server]?.utcOffset})</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Import Convene History</CardHeader>
              <CardBody className="space-y-3">
                <p className="text-gray-300 text-[10px]">Import from wuwatracker, wuwapal, or other trackers.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['pc', 'PC', Monitor], ['android', 'Android', Smartphone], ['ps5', 'PS5', Gamepad2]].map(([k, l, Icon]) => (
                    <button key={k} onClick={() => setImportPlatform(k)} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
                      <Icon size={16} className="mx-auto mb-0.5" /><div className="text-[10px]">{l}</div>
                    </button>
                  ))}
                </div>
                {importPlatform === 'pc' && (
                  <div className="p-3 bg-white/5 border border-white/15 rounded text-[10px] text-gray-200 space-y-2">
                    <p className="text-gray-100 font-medium text-xs">PC</p>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <p>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <p>Run <span className="text-gray-100 font-medium">PowerShell script</span> or upload <span className="text-gray-100 font-medium">Client.log</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <p>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <p><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</p>
                    </div>
                  </div>
                )}
                {importPlatform === 'android' && (
                  <div className="p-3 bg-white/5 border border-white/15 rounded text-[10px] text-gray-200 space-y-2">
                    <p className="text-gray-100 font-medium text-xs">Android (11+)</p>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <p>Download <span className="text-gray-100 font-medium">Ascent app</span> (v2.1.6+) to get URL</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <p>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Import URL</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <p>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <p><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</p>
                    </div>
                  </div>
                )}
                {importPlatform === 'ps5' && (
                  <div className="p-3 bg-white/5 border border-white/15 rounded text-[10px] text-gray-200 space-y-2">
                    <p className="text-gray-100 font-medium text-xs">PS5 (In-Game Browser)</p>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <p>Open WuWa → Convene → History → tap <span className="text-gray-100 font-medium">"View Details"</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <p>Press <span className="text-gray-100 font-medium">"Options"</span> → Select <span className="text-gray-100 font-medium">"Page Information"</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <p>Find <span className="text-gray-100 font-medium">player_id</span> and <span className="text-gray-100 font-medium">record_id</span> in the URL</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <p>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Enter IDs → Import</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">5</span>
                      <p>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">6</span>
                      <p><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</p>
                    </div>
                    
                    <p className="text-gray-400 text-[9px] pt-1 border-t border-white/10">⚠️ URL valid for ~24 hours only</p>
                  </div>
                )}
                <label className="block">
                  <div className="p-4 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:border-yellow-500/50">
                    <Upload size={20} className="mx-auto mb-1 text-gray-300" />
                    <p className="text-gray-300 text-[10px]">Upload JSON file</p>
                  </div>
                  <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                </label>
              </CardBody>
            </Card>

            {state.profile.importedAt && (
              <Card>
                <CardHeader action={<button onClick={() => { dispatch({ type: 'CLEAR_PROFILE' }); toast?.addToast?.('Profile cleared!', 'info'); }} className="text-red-400 text-[10px]">Clear</button>}>Import Info</CardHeader>
                <CardBody>
                  {state.profile.uid && <div className="flex justify-between text-xs mb-2"><span className="text-gray-400">UID</span><span className="text-gray-100 font-mono">{state.profile.uid}</span></div>}
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Imported</span><span className="text-gray-300">{new Date(state.profile.importedAt).toLocaleDateString()}</span></div>
                  <p className="text-gray-500 text-[9px] mt-2">View detailed stats in the Stats tab</p>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody className="space-y-2">
                <button onClick={handleExport} className="kuro-btn w-full py-2 flex items-center justify-center gap-1">
                  <Download size={14} /> Export Backup
                </button>
                <button onClick={() => { dispatch({ type: 'RESET' }); toast?.addToast?.('All data reset!', 'info'); }} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs border border-red-500/30">
                  Reset All Data
                </button>
              </CardBody>
            </Card>

            {/* About & Legal */}
            <Card>
              <CardHeader>About</CardHeader>
              <CardBody className="space-y-3">
                <div className="text-center">
                  <h4 className="text-gray-100 font-medium">Whispering Wishes</h4>
                  <p className="text-gray-500 text-[10px]">Version 2.1.0</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-[10px] mb-1">Questions, issues, or feedback?</p>
                  <a 
                    href="mailto:whisperingwishes.app@gmail.com" 
                    className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors underline"
                  >
                    whisperingwishes.app@gmail.com
                  </a>
                </div>
                
                <div className="kuro-divider" />
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Disclaimer</p>
                  <p>Whispering Wishes is an unofficial fan-made tool and is not affiliated with, endorsed by, or associated with Kuro Games, Kuro Technology (HK) Co., Limited, or any of their subsidiaries.</p>
                  <p>Wuthering Waves, all game content, characters, names, and related media are trademarks and copyrights of Kuro Games © 2024-2026. All rights reserved.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Data & Privacy</p>
                  <p>All data is stored locally on your device using browser storage. No personal information is collected, transmitted, or shared with any third party. Your Convene history and settings remain private and under your control.</p>
                  <p>This app does not require any special device permissions. Data import relies on files you manually provide from third-party tools like wuwatracker.com.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Third-Party Services</p>
                  <p>This app recommends wuwatracker.com for data export. We are not affiliated with wuwatracker.com and are not responsible for their services, data handling, or availability.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">License</p>
                  <p>This tool is provided "as is" without warranty of any kind. Use at your own discretion. The developers are not responsible for any issues arising from the use of this application.</p>
                </div>
                
                <p className="text-center text-[8px] text-gray-600 pt-2">© 2026 Whispering Wishes by <a href="https://www.reddit.com/u/WW_Andene" className="text-gray-500 hover:text-gray-400">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>
              </CardBody>
            </Card>
          </div>
        )}

      </main>

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"><X size={16} /></button>}>Save Current State</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} placeholder="Enter name..." className="kuro-input w-full" />
              <div className="text-gray-300 text-[10px]">
                <p>Astrite: {state.calc.astrite || 0} • Pity: {state.calc.charPity}/{state.calc.weapPity}</p>
                <p>Radiant: {state.calc.radiant || 0} • Forging: {state.calc.forging || 0}</p>
              </div>
              <button onClick={() => { dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">Save Bookmark</button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowExportModal(false)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"><X size={16} /></button>}>Backup</CardHeader>
            <CardBody className="space-y-3">
              <p className="text-gray-400 text-[10px]">Copy this data and save it as a .json file:</p>
              <textarea 
                value={exportData} 
                readOnly 
                className="kuro-input w-full h-24 text-[9px] font-mono"
                onClick={e => e.target.select()}
              />
              <button 
                onClick={() => {
                  const textarea = document.querySelector('textarea');
                  textarea?.select();
                  document.execCommand('copy');
                  toast?.addToast?.('Copied to clipboard!', 'success');
                }} 
                className="kuro-btn w-full"
              >
                Copy to Clipboard
              </button>
              
              <div className="kuro-divider" />
              
              <p className="text-gray-400 text-[10px]">Or paste backup data to restore:</p>
              <textarea 
                placeholder="Paste backup JSON here..."
                className="kuro-input w-full h-20 text-[9px] font-mono"
                id="import-textarea"
              />
              <button 
                onClick={() => {
                  try {
                    const textarea = document.getElementById('import-textarea');
                    const data = JSON.parse(textarea.value);
                    if (data.state) {
                      const restoredState = {
                        ...initialState,
                        ...data.state,
                        server: data.state.server || initialState.server,
                        profile: { ...initialState.profile, ...data.state.profile },
                        calc: { ...initialState.calc, ...data.state.calc },
                        planner: { ...initialState.planner, ...data.state.planner },
                        settings: { ...initialState.settings, ...data.state.settings },
                        bookmarks: data.state.bookmarks || [],
                      };
                      dispatch({ type: 'LOAD_STATE', state: restoredState });
                      toast?.addToast?.(`Backup restored! (v${data.version || 'unknown'})`, 'success');
                      setShowExportModal(false);
                    } else {
                      toast?.addToast?.('Invalid backup format', 'error');
                    }
                  } catch (e) {
                    toast?.addToast?.('Invalid JSON data', 'error');
                  }
                }} 
                className="kuro-btn w-full"
              >
                Restore Backup
              </button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 overflow-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Settings size={16} /> Admin Panel</span>
              <button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </CardHeader>
            <CardBody className="space-y-4">
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-center">
                    <p className="text-yellow-400 text-sm font-medium">Admin Access Required</p>
                    <p className="text-gray-400 text-[10px] mt-1">{storedAdminPass ? 'Enter your password' : 'Set a new password (first time)'}</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={storedAdminPass ? "Enter password" : "Create new password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && verifyAdminPassword()}
                      className="kuro-input flex-1 text-sm"
                    />
                    <button onClick={verifyAdminPassword} className="kuro-btn px-4">{storedAdminPass ? 'Unlock' : 'Set'}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-center">
                    <p className="text-emerald-400 text-xs">Admin Panel Unlocked</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Quick Banner Update</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Version (e.g., 3.1)"
                        id="admin-version"
                        defaultValue={activeBanners.version}
                        className="kuro-input text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Phase"
                        id="admin-phase"
                        defaultValue={activeBanners.phase}
                        className="kuro-input text-xs"
                      />
                      <input
                        type="datetime-local"
                        placeholder="Start Date"
                        id="admin-start"
                        defaultValue={activeBanners.startDate?.slice(0, 16)}
                        className="kuro-input text-xs"
                      />
                      <input
                        type="datetime-local"
                        placeholder="End Date"
                        id="admin-end"
                        defaultValue={activeBanners.endDate?.slice(0, 16)}
                        className="kuro-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Resonators (JSON)</h3>
                    <textarea
                      id="admin-chars"
                      className="kuro-input w-full h-32 text-[9px] font-mono"
                      defaultValue={JSON.stringify(activeBanners.characters, null, 2)}
                      placeholder="Paste characters array JSON"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Weapons (JSON)</h3>
                    <textarea
                      id="admin-weaps"
                      className="kuro-input w-full h-32 text-[9px] font-mono"
                      defaultValue={JSON.stringify(activeBanners.weapons, null, 2)}
                      placeholder="Paste weapons array JSON"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Resonator Images</h3>
                    <div className="space-y-1">
                      {activeBanners.characters.map((c, i) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <span className="text-gray-300 text-[10px] w-20 truncate">{c.name}</span>
                          <input
                            type="text"
                            placeholder="https://i.ibb.co/..."
                            id={`admin-char-img-${i}`}
                            defaultValue={c.imageUrl || ''}
                            className="kuro-input flex-1 text-[10px] py-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Weapon Images</h3>
                    <div className="space-y-1">
                      {activeBanners.weapons.map((w, i) => (
                        <div key={w.id} className="flex items-center gap-2">
                          <span className="text-gray-300 text-[10px] w-20 truncate">{w.name}</span>
                          <input
                            type="text"
                            placeholder="https://i.ibb.co/..."
                            id={`admin-weap-img-${i}`}
                            defaultValue={w.imageUrl || ''}
                            className="kuro-input flex-1 text-[10px] py-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Event Banner Image</h3>
                    <input
                      type="text"
                      placeholder="https://i.ibb.co/..."
                      id="admin-event-img"
                      defaultValue={activeBanners.eventBannerImage || ''}
                      className="kuro-input w-full text-xs"
                    />
                    <p className="text-gray-500 text-[9px]">Paste direct image URLs from ibb.co (use i.ibb.co links)</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        try {
                          const chars = JSON.parse(document.getElementById('admin-chars').value);
                          const weaps = JSON.parse(document.getElementById('admin-weaps').value);
                          if (!Array.isArray(chars) || !Array.isArray(weaps)) throw new Error('Characters and weapons must be arrays');
                          if (chars.length === 0) throw new Error('At least one character required');
                          if (weaps.length === 0) throw new Error('At least one weapon required');
                          chars.forEach((c, i) => {
                            if (!c.id || !c.name) throw new Error(`Character ${i + 1} missing id or name`);
                            const imgInput = document.getElementById(`admin-char-img-${i}`);
                            if (imgInput) c.imageUrl = imgInput.value.trim();
                          });
                          weaps.forEach((w, i) => {
                            if (!w.id || !w.name) throw new Error(`Weapon ${i + 1} missing id or name`);
                            const imgInput = document.getElementById(`admin-weap-img-${i}`);
                            if (imgInput) w.imageUrl = imgInput.value.trim();
                          });
                          const startVal = document.getElementById('admin-start').value;
                          const endVal = document.getElementById('admin-end').value;
                          const startDate = new Date(startVal);
                          const endDate = new Date(endVal);
                          if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
                          if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
                          if (endDate <= startDate) throw new Error('End date must be after start date');
                          const eventImg = document.getElementById('admin-event-img').value.trim();
                          const newBanners = {
                            ...activeBanners,
                            version: document.getElementById('admin-version').value || '1.0',
                            phase: parseInt(document.getElementById('admin-phase').value) || 1,
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString(),
                            characters: chars,
                            weapons: weaps,
                            eventBannerImage: eventImg || '',
                          };
                          saveCustomBanners(newBanners);
                          setShowAdminPanel(false);
                          setAdminUnlocked(false);
                        } catch (e) {
                          toast?.addToast?.('Invalid data: ' + e.message, 'error');
                        }
                      }}
                      className="kuro-btn flex-1"
                    >
                      Save Banner Updates
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem(ADMIN_BANNER_KEY);
                        setActiveBanners(CURRENT_BANNERS);
                        toast?.addToast?.('Reset to default banners', 'success');
                      }}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/30"
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center border-t border-white/5" style={{background: 'rgba(8,12,18,0.9)'}}>
        <p className="text-gray-600 text-[9px]">
          <span onClick={handleAdminTap} className="cursor-pointer select-none">Whispering Wishes v2.2.0</span> • by u/WW_Andene • Not affiliated with Kuro Games • 
          <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-500 hover:text-yellow-400 transition-colors ml-1">Contact</a>
        </p>
      </footer>
    </div>
  );
}

// [SECTION:EXPORT]
export default function WhisperingWishes() {
  return (
    <ToastProvider>
      <WhisperingWishesInner />
    </ToastProvider>
  );
}
