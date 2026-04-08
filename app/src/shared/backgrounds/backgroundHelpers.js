// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/backgrounds/backgroundHelpers.js
// Shared noise, resize, and wave phase functions for background animations.
// ═══════════════════════════════════════════════════════════════════════════════

// P5-F005: RAF-throttled resize handler — prevents 100+ canvas reallocations per second during drag
export const throttledResize = (fn) => { let pending = false; const handler = () => { if (pending) return; pending = true; requestAnimationFrame(() => { fn(); pending = false; }); }; handler._original = fn; return handler; };

// Deterministic pseudo-random number generator (used by background animations)
export function seededRandom(seed) { let s = seed; return function() { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

// Noise functions for baked ground rendering
export function _bgHash(n) { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); }
export function valueNoise(x,y,freq,seed){const fx=x*freq,fy=y*freq,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);const n00=_bgHash((ix+iy*137)*7+seed),n10=_bgHash(((ix+1)+iy*137)*7+seed),n01=_bgHash((ix+(iy+1)*137)*7+seed),n11=_bgHash(((ix+1)+(iy+1)*137)*7+seed);return(n00+(n10-n00)*sx)+((n01+(n11-n01)*sx)-(n00+(n10-n00)*sx))*sy;}
export function _bgFbm(x,y,oct,seed){let v=0,a=0.5,f=1,t=0;for(let i=0;i<oct;i++){v+=valueNoise(x,y,f,seed+i*1000)*a;t+=a;a*=0.5;f*=2.1;}return v/t;}
export function _bgRidged(x,y,oct,seed){let v=0,a=0.5,f=1,t=0;for(let i=0;i<oct;i++){const n=1-Math.abs(valueNoise(x,y,f,seed+i*1000)*2-1);v+=n*n*a;t+=a;a*=0.45;f*=2.2;}return v/t;}

// Wave phase functions shared by BackgroundGlow and TriangleMirrorWave
export const _wf1 = (x, y, t) => x * 0.012 + Math.sin(y * 0.006) * 3.0 + Math.cos(y * 0.003 + x * 0.002) * 1.5 - t * 0.35;
export const _wf2 = (x, y, t) => (x * 0.007 + y * 0.009) + Math.sin(x * 0.004 - y * 0.003) * 2.2 + Math.cos(x * 0.002) * 1.2 - t * 0.25;
export const _wf3 = (x, y, t) => y * 0.011 + Math.sin(x * 0.008) * 2.5 + Math.cos(y * 0.004 + x * 0.003) * 1.3 - t * 0.2;
