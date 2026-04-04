// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — IdCardModal (extracted from ProfileTab)
// Resonator ID Card preview with landscape/portrait download
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Crown, Download, Monitor, Smartphone, Star, X } from 'lucide-react';
import { CHARACTER_DATA, ALL_CHARACTERS } from '../../data/characters.js';
import { HEADER_ICON } from '../../data/constants.js';
import { TROPHY_ICON_MAP } from '../../shared/utils/trophyIcons.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';

const TROPHY_TIER_ORDER = { legendary: 0, epic: 1, gold: 2, purple: 3, orange: 4, pink: 5, cyan: 6, red: 7, green: 8, blue: 9, gray: 10 };

export default function IdCardModal({
  showIdCard, setShowIdCard,
  idCardFormat, setIdCardFormat,
  downloadIdCard,
  state,
  luckRating,
  overallStats,
  collectionImages,
  ownedCharNames,
  idCardTrapRef,
  trophies,
  getImageFraming,
}) {
  if (!showIdCard) return null;
  return (
      <FocusTrapModal isOpen={showIdCard} onClose={() => setShowIdCard(false)} className="" onClick={() => setShowIdCard(false)} ariaLabel="Resonator ID Card" centered>
          <div className="w-full overflow-y-auto rounded-2xl" style={{ maxWidth: '420px', maxHeight: '90vh', aspectRatio: '9/16' }} onClick={(e) => e.stopPropagation()}>
            {/* The Card */}
            <div className="kuro-card" style={{ overflow: 'hidden' }}>
              <div className="kuro-card-inner">
                {/* Header */}
                <div className="kuro-header">
                  <span className="text-gray-100 font-bold text-xs flex items-center gap-2"><Crown size={14} className="text-yellow-400" /> RESONATOR ID</span>
                  <span className="text-gray-500 text-[10px]">Whispering Wishes</span>
                </div>

                {/* Main content */}
                <div className="kuro-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* ═══ PROFILE PANEL ═══ */}
                  <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '12px' }}>
                    <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
                    <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                    <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)' }}>{state.profile.username || 'Resonator'}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider" style={{ width: '32px', flexShrink: 0 }}>UID</span>
                            <span className="text-gray-200 text-xs font-mono">{state.profile.uid || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider" style={{ width: '32px', flexShrink: 0 }}>SVR</span>
                            <span className="text-xs font-mono" style={{ color: '#edaf18', textShadow: '0 0 8px rgba(237,175,24,0.3)' }}>{state.server}</span>
                          </div>
                        </div>
                        {luckRating && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(luckRating.percentile || 50, 100)}%`, background: 'linear-gradient(90deg, #f87171, #edaf18, #34d399)', boxShadow: '0 0 6px rgba(237,175,24,0.4)' }} />
                            </div>
                            <span className="text-[10px] font-bold flex-shrink-0 px-2 py-0.5 rounded" style={{ color: luckRating.color || '#edaf18', background: `${luckRating.color || '#edaf18'}15`, border: `1px solid ${luckRating.color || '#edaf18'}30`, textShadow: `0 0 8px ${luckRating.color || '#edaf18'}60`, fontFamily: 'var(--font-display)' }}>{luckRating.tier} {luckRating.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={`relative rounded-xl overflow-hidden${CHARACTER_DATA[state.profile.profilePic]?.rarity === 5 ? ' holo-5star' : ''}`} style={{ width: '110px', height: '110px', background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 15px rgba(237,175,24,0.04), inset 0 1px 0 rgba(255,255,255,0.08)', contain: 'paint' }}>
                          <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
                          {state.profile.profilePic && collectionImages[state.profile.profilePic] ? (() => {
                            const f = getImageFraming(`collection-${state.profile.profilePic}`);
                            {/* AUDIT-FIX L21: onError fallback for profile pic in ID card */}
                            return <div className="absolute inset-0 breath-zoom"><img src={collectionImages[state.profile.profilePic]} alt={state.profile.profilePic} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} onError={hideOnError} /></div>;
                          })() : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-stat)' }}>
                              <img src={HEADER_ICON} alt="Default" className="w-12 h-12 object-contain opacity-60" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />
                        </div>
                        {state.profile.profilePic && (
                          <p className="text-gray-500 text-center mt-1 truncate" style={{ fontSize: '7px', width: '110px' }}>{state.profile.profilePic}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ═══ CONVENE STATS PANEL ═══ */}
                  <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                    <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(237,175,24,0.4), transparent)' }} />
                    <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                    <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                    <div className="flex items-center gap-2 mb-2">
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                      <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em', fontFamily: 'var(--font-display)' }}>Convene Stats</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Avg Pity', value: overallStats?.avgPity ?? '—', color: '#edaf18', bg: 'rgba(237,175,24,0.1)', bc: 'rgba(237,175,24,0.3)' },
                      { label: 'Total Convenes', value: overallStats?.totalPulls?.toLocaleString('en-US') ?? '—', color: '#e5e7eb', bg: 'var(--bg-stat)', bc: 'rgba(255,255,255,0.12)' },
                      { label: '5★ Obtained', value: overallStats?.fiveStars ?? '—', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', bc: 'rgba(168,85,247,0.3)' },
                      { label: '50/50 Win', value: overallStats?.winRate ? overallStats.winRate + '%' : '—', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', bc: 'rgba(34,197,94,0.3)' },
                      { label: 'Won', value: overallStats?.won5050 ?? '—', color: '#4ade80', bg: 'rgba(34,197,94,0.06)', bc: 'rgba(34,197,94,0.2)' },
                      { label: 'Lost', value: overallStats?.lost5050 ?? '—', color: '#f87171', bg: 'rgba(248,113,113,0.1)', bc: 'rgba(248,113,113,0.3)' },
                    ].map((s, i) => (
                      <div key={i} className="relative rounded-lg px-2 py-1.5 text-center overflow-hidden" style={{ background: s.bg, border: `1px solid ${s.bc}` }}>
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                        <div className="font-bold text-sm" style={{ color: s.color, textShadow: `0 0 8px ${s.color}30`, fontFamily: 'var(--font-data)' }}>{s.value}</div>
                        <div className="text-gray-500 mt-0.5" style={{ fontSize: '7px', letterSpacing: '0.04em' }}>{s.label}</div>
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* ═══ PITY DISTRIBUTION PANEL ═══ */}
                  {(() => {
                    const bgnHist = state.profile.beginner?.history||[];
                    const charHist = [...(state.profile.featured?.history||[]),...(state.profile.standardChar?.history||[]),...bgnHist.filter(p=>p.name&&ALL_CHARACTERS.has(p.name))];
                    const weapHist = [...(state.profile.weapon?.history||[]),...(state.profile.standardWeap?.history||[]),...bgnHist.filter(p=>p.name&&!ALL_CHARACTERS.has(p.name))];
                    const fsp = [...charHist,...weapHist].filter(p=>p.rarity===5&&p.pity>0);
                    if(fsp.length < 2) return null;
                    const bk = {};
                    fsp.forEach(p => { if(p.pity>80){bk['81+']=(bk['81+']||0)+1;} else {const b=Math.floor((p.pity-1)/10)*10+1;bk[`${b}-${b+9}`]=(bk[`${b}-${b+9}`]||0)+1;} });
                    const labs = Array.from({length:8},(_,i)=>`${i*10+1}-${(i+1)*10}`);
                    if(bk['81+'])labs.push('81+');
                    labs.forEach(b=>{if(!bk[b])bk[b]=0;});
                    const mx = Math.max(...Object.values(bk),1);
                    const avg = (fsp.reduce((s,p)=>s+p.pity,0)/fsp.length).toFixed(1);
                    const lo = Math.min(...fsp.map(p=>p.pity));
                    const hi = Math.max(...fsp.map(p=>p.pity));
                    return (
                      <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                        <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.35), transparent)' }} />
                        <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                        <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                        <div className="flex items-center gap-2 mb-2">
                          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                          <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em', fontFamily: 'var(--font-display)' }}>Pity Distribution</span>
                        </div>
                        {/* §E10-CH-F2: Summary moved above histogram, escalated to text-xs */}
                        <div className="text-right mb-1.5">
                          <span className="text-xs text-gray-400 kuro-number" style={{ fontFamily: 'var(--font-data)' }}>Lo {lo} · Avg {avg} · Hi {hi}</span>
                        </div>
                        <div className="flex items-end gap-1.5" style={{ marginBottom: '2px' }}>
                          {labs.map((lab, i) => {
                            const cnt = bk[lab]||0;
                            const height = mx > 0 ? (cnt / mx) * 100 : 0;
                            const bucket = parseInt(lab, 10) || 81;
                            const color = bucket<=20?'#22c55e':bucket<=40?'#4ade80':bucket<=50?'#edaf18':bucket<=60?'#f97316':'#ef4444';
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div className="w-full relative" style={{ height: '96px' }}>
                                  {cnt > 0 && (
                                    <div className="absolute left-0 right-0 text-center font-bold"
                                      style={{ fontSize: '8px', bottom: `${height}%`, marginBottom: '4px', color, textShadow: `0 0 8px ${color}`, fontFamily: 'var(--font-data)' }}>
                                      {cnt}
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-1 right-1 rounded-t"
                                    style={{ height: `${height}%`, minHeight: cnt > 0 ? '8px' : '0',
                                      background: `linear-gradient(to top, ${color}40, ${color}20)`,
                                      border: cnt > 0 ? `1px solid ${color}90` : 'none', borderBottom: 'none',
                                      boxShadow: cnt > 0 ? `0 0 12px ${color}50, inset 0 0 15px ${color}30` : 'none' }} />
                                  {cnt > 0 && (
                                    <div className="absolute bottom-0 left-1 right-1 rounded-full"
                                      style={{ height: '2px', background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80` }} />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-1.5">
                          {labs.map((lab, i) => (
                            <div key={i} className="flex-1 text-center" style={{ fontSize: '7px', color: '#6b7280' }}>{lab.split('-')[0]}</div>
                          ))}
                        </div>
                        {/* Summary moved above histogram per §E10-CH-F2 */}
                      </div>
                    );
                  })()}

                  {/* ═══ RESONATORS PANEL ═══ */}
                  {ownedCharNames.length > 0 && (
                    <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                      <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.35), transparent)' }} />
                      <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                      <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                      <div className="flex items-center gap-2 mb-2">
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                        <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>Resonators ({ownedCharNames.length})</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {ownedCharNames.slice(0, 16).map(name => {
                          const imgUrl = collectionImages[name];
                          const f = getImageFraming(`collection-${name}`);
                          const is5Star = CHARACTER_DATA[name]?.rarity === 5;
                          return (
                            <div key={name}>
                              <div className={`relative rounded-lg overflow-hidden w-full${is5Star ? ' holo-5star' : ''}`} style={{ aspectRatio: '9/14', background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', contain: 'paint' }}>
                                <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
                                {imgUrl ? (
                                  <div className="absolute inset-0 breath-zoom"><img src={imgUrl} alt={name} loading="lazy" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} /></div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-500" style={{ fontSize: '14px' }}>{name[0]}</span>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-1 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                                  <span className="text-gray-200 text-center truncate block" style={{ fontSize: '6px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{name}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {ownedCharNames.length > 16 && (
                          <div className="flex items-center justify-center rounded-lg w-full" style={{ aspectRatio: '9/14', background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-gray-500 font-mono" style={{ fontSize: '9px' }}>+{ownedCharNames.length - 16}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ═══ TROPHIES PANEL ═══ */}
                  {(() => {
                    const sorted = [...(trophies?.list || [])].sort((a,b) => (TROPHY_TIER_ORDER[a.tier]??99) - (TROPHY_TIER_ORDER[b.tier]??99)).slice(0, 5);
                    if (!sorted.length) return null;
                    return (
                      <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                        <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(237,175,24,0.3), transparent)' }} />
                        <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                        <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                        <div className="flex items-center gap-2 mb-2">
                          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                          <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>Trophies ({sorted.length})</span>
                        </div>
                        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${sorted.length}, 1fr)` }}>
                          {sorted.map(trophy => {
                            const IconComponent = TROPHY_ICON_MAP[trophy.icon] || Star;
                            return (
                              <div key={trophy.id} className="relative p-2 rounded-lg text-center overflow-hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${trophy.color}18, ${trophy.color}08)`, border: `1px solid ${trophy.color}50`, boxShadow: `0 0 20px ${trophy.color}15, inset 0 0 20px ${trophy.color}05` }}>
                                <div className="rounded-full flex items-center justify-center mb-1" style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${trophy.color}30, ${trophy.color}10)`, boxShadow: `0 0 15px ${trophy.color}40` }}>
                                  <IconComponent size={14} style={{ color: trophy.color }} />
                                </div>
                                <div className="font-bold text-white w-full px-0.5 leading-tight" style={{ fontSize: '7px', wordBreak: 'break-word' }}>{trophy.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══ FOOTER ═══ */}
                  <div className="relative flex items-center justify-between pt-1.5">
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />
                    <span className="text-gray-500 font-mono" style={{ fontSize: '8px' }}>Generated {new Date().toLocaleDateString()}</span>
                    <span className="text-gray-500" style={{ fontSize: '8px' }}>whisperingwishes.app</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Format toggle + action buttons */}
            <div className="flex gap-2 mt-3">
              {/* Format toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--bg-btn)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setIdCardFormat('landscape')}
                  className="px-3 py-2.5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                  style={idCardFormat === 'landscape' ? { background: 'rgba(237,175,24,0.15)', color: '#edaf18', borderRight: '1px solid rgba(255,255,255,0.1)' } : { color: '#6b7280', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                  title="Landscape 16:9"
                >
                  <Monitor size={12} /> 16:9
                </button>
                <button
                  onClick={() => setIdCardFormat('portrait')}
                  className="px-3 py-2.5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                  style={idCardFormat === 'portrait' ? { background: 'rgba(237,175,24,0.15)', color: '#edaf18' } : { color: '#6b7280' }}
                  title="Portrait 9:16"
                >
                  <Smartphone size={12} /> 9:16
                </button>
              </div>
              {/* Download */}
              <button
                onClick={() => downloadIdCard(idCardFormat)}
                className="kuro-btn flex-1 py-2.5 text-xs active-gold flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download {idCardFormat === 'portrait' ? '9:16' : '16:9'}
              </button>
              {/* Close */}
              <button
                onClick={() => setShowIdCard(false)}
                className="kuro-btn px-4 py-2.5 text-xs"
              >
                <X size={14} />
              </button>
            </div>
          </div>
      </FocusTrapModal>
  );
}
