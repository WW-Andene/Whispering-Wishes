// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — IdCardModal (extracted from ProfileTab)
// Resonator ID Card preview with landscape/portrait download
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Download, Monitor, Smartphone, Star, X } from 'lucide-react';
import { CHARACTER_DATA, ALL_CHARACTERS } from '../../data/characters.js';
import { TROPHY_ICON_MAP } from '../../shared/utils/trophyIcons.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { buildPityHistogram } from '../../shared/utils/pityHistogram.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t, formatNumber } from '../../utils/i18n.js';

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
}) {
  const { getImageFraming } = useImageFramingContext();
  if (!showIdCard) return null;
  return (
      <FocusTrapModal isOpen={showIdCard} onClose={() => setShowIdCard(false)} className="" onClick={() => setShowIdCard(false)} ariaLabel={t('profile.idCard.ariaLabel')} centered padding="p-3">
          <div className="w-full overflow-y-auto rounded-2xl" style={{ maxWidth: '420px', maxHeight: '90vh', aspectRatio: '9/16' }} onClick={(e) => e.stopPropagation()}>
            {/* The Card */}
            <div className="kuro-card" style={{ overflow: 'hidden' }}>
              <div className="kuro-card-inner">
                {/* Main content — no header bar, same as the canvas export (idCardRenderer.js's
                    drawHero carries the identity role a header used to; see that file's own
                    "No header bar" comment). */}
                <div className="kuro-body" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>

                  {/* ═══ HERO PORTRAIT — same borderless, banner-bled treatment the canvas
                      export's drawHero uses: one large image (no separate boxed avatar), a top
                      fade with the username/UID/server overlaid in it, and the luck bar sitting
                      just below — a real flex row here, unlike the canvas version's manually
                      budgeted pixel widths, so there's nothing to clip regardless of content
                      length. ═══ */}
                  <div className="idcard-section relative overflow-hidden" style={{ padding: 0, aspectRatio: '3/2' }}>
                    <div className="idcard-img-shimmer" />
                    {state.profile.profilePic && collectionImages[state.profile.profilePic] ? (() => {
                      const f = getImageFraming(`collection-${state.profile.profilePic}`);
                      return <div className="absolute inset-0 breath-zoom"><img src={collectionImages[state.profile.profilePic]} alt={state.profile.profilePic} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} onError={hideOnError} /></div>;
                    })() : (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-stat)' }}>
                        <img src="./misc-assets/Abby_Full_Sprite.png" alt="Default" className="w-32 h-32 object-contain" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(rgba(8,12,18,0.9), transparent)' }} />
                    <div className="absolute top-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-xl truncate leading-tight kuro-tshadow-overlay">{state.profile.username || t('profile.idCard.usernameFallback')}</h3>
                      <p className="text-gray-300 text-sm kuro-tshadow-overlay">{t('profile.idCard.uid')} {state.profile.uid || '—'}</p>
                      <p className="text-base font-semibold kuro-tshadow-brand" style={{ color: '#edaf18' }}>{state.server}</p>
                    </div>
                    {luckRating && (
                      <div className="absolute left-0 right-0 p-3 flex items-center gap-2" style={{ bottom: 0, background: 'linear-gradient(transparent, rgba(8,12,18,0.9))' }}>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden kuro-border-subtle" style={{ background: 'var(--bg-stat)' }}>
                          <div className="h-full rounded-full kuro-gradient-luck kuro-shadow-luck-bar" style={{ width: `${Math.min(luckRating.percentile || 50, 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold flex-shrink-0 px-2 py-0.5 rounded" style={{ color: luckRating.color || '#edaf18', background: `${luckRating.color || '#edaf18'}15`, border: `1px solid ${luckRating.color || '#edaf18'}30`, textShadow: `0 0 8px ${luckRating.color || '#edaf18'}60` }}>{luckRating.tier} {luckRating.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* ═══ CONVENE STATS PANEL ═══ */}
                  <div className="idcard-section">
                    <div className="idcard-shimmer idcard-shimmer--gold" />
                    <div className="idcard-corner-tr" />
                    <div className="idcard-corner-bl" />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="idcard-gold-bar" />
                      <span className="text-sm font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>{t('profile.idCard.conveneStats')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: t('profile.idCard.avgPity'), value: overallStats?.avgPity ?? '—', color: '#edaf18', bg: 'rgba(237,175,24,0.1)', bc: 'rgba(237,175,24,0.3)' },
                      { label: t('profile.idCard.totalConvenes'), value: overallStats?.totalPulls != null ? formatNumber(overallStats.totalPulls) : '—', color: '#e5e7eb', bg: 'var(--bg-stat)', bc: 'rgba(255,255,255,0.12)' },
                      { label: t('profile.idCard.fiveStarObtained'), value: overallStats?.fiveStars ?? '—', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', bc: 'rgba(168,85,247,0.3)' },
                      { label: t('profile.idCard.winRate5050'), value: overallStats?.winRate ? overallStats.winRate + '%' : '—', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', bc: 'rgba(34,197,94,0.3)' },
                      { label: t('profile.idCard.won'), value: overallStats?.won5050 ?? '—', color: '#4ade80', bg: 'rgba(34,197,94,0.06)', bc: 'rgba(34,197,94,0.2)' },
                      { label: t('profile.idCard.lost'), value: overallStats?.lost5050 ?? '—', color: '#f87171', bg: 'rgba(248,113,113,0.1)', bc: 'rgba(248,113,113,0.3)' },
                    ].map((s, i) => (
                      <div key={i} className="relative rounded-lg px-2 py-1.5 text-center overflow-hidden" style={{ background: s.bg, border: `1px solid ${s.bc}` }}>
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                        <div className="font-bold text-xl kuro-number" style={{ color: s.color, textShadow: `0 0 8px ${s.color}30` }}>{s.value}</div>
                        <div className="text-gray-500 mt-0.5" style={{ fontSize: 'var(--font-2xs)', letterSpacing: '0.04em' }}>{s.label}</div>
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
                    const { buckets: bk, labels: labs } = buildPityHistogram(fsp);
                    const mx = Math.max(...Object.values(bk),1);
                    const avg = (fsp.reduce((s,p)=>s+p.pity,0)/fsp.length).toFixed(1);
                    const lo = Math.min(...fsp.map(p=>p.pity));
                    const hi = Math.max(...fsp.map(p=>p.pity));
                    return (
                      <div className="idcard-section">
                        <div className="idcard-shimmer idcard-shimmer--cyan" />
                        <div className="idcard-corner-tr" />
                        <div className="idcard-corner-bl" />
                        <div className="flex items-center gap-2 mb-2">
                          <div className="idcard-gold-bar" />
                          <span className="text-sm font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>{t('profile.idCard.pityDistribution')}</span>
                        </div>
                        {/* §E10-CH-F2: Summary moved above histogram, escalated to text-base */}
                        <div className="text-right mb-1.5">
                          <span className="text-base text-gray-400 kuro-number">{t('profile.idCard.pitySummary', { lo, avg, hi })}</span>
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
                                    <div className="absolute left-0 right-0 text-center font-bold kuro-number"
                                      style={{ fontSize: '8px', bottom: `${height}%`, marginBottom: 'var(--space-xs)', color, textShadow: `0 0 8px ${color}` }}>
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
                            <div key={i} className="flex-1 text-center" style={{ fontSize: 'var(--font-2xs)', color: '#6b7280' }}>{lab.split('-')[0]}</div>
                          ))}
                        </div>
                        {/* Summary moved above histogram per §E10-CH-F2 */}
                      </div>
                    );
                  })()}

                  {/* ═══ RESONATORS PANEL ═══ */}
                  {ownedCharNames.length > 0 && (
                    <div className="idcard-section">
                      <div className="idcard-shimmer idcard-shimmer--purple" />
                      <div className="idcard-corner-tr" />
                      <div className="idcard-corner-bl" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="idcard-gold-bar" />
                        <span className="text-sm font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>{t('profile.idCard.resonators', { count: ownedCharNames.length })}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {ownedCharNames.slice(0, 16).map(name => {
                          const imgUrl = collectionImages[name];
                          const f = getImageFraming(`collection-${name}`);
                          const is5Star = CHARACTER_DATA[name]?.rarity === 5;
                          return (
                            <div key={name}>
                              <div className={`relative rounded-lg overflow-hidden w-full kuro-avatar-frame kuro-shadow-card-subtle${is5Star ? ' holo-5star' : ''}`} style={{ aspectRatio: '9/14', border: '1px solid var(--border-medium)' }}>
                                <div className="idcard-img-shimmer" />
                                {imgUrl ? (
                                  <div className="absolute inset-0 breath-zoom"><img src={imgUrl} alt={name} loading="lazy" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} /></div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-500" style={{ fontSize: 'var(--font-md)' }}>{name[0]}</span>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-1 pointer-events-none idcard-img-fade--strong">
                                  <span className="text-gray-200 text-center truncate block kuro-tshadow-micro" style={{ fontSize: '8px' }}>{name}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {ownedCharNames.length > 16 && (
                          <div className="flex items-center justify-center rounded-lg w-full kuro-border-subtle" style={{ aspectRatio: '9/14', background: 'var(--bg-stat)' }}>
                            <span className="text-gray-500 font-mono" style={{ fontSize: 'var(--font-2xs)' }}>+{ownedCharNames.length - 16}</span>
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
                      <div className="idcard-section">
                        <div className="idcard-shimmer idcard-shimmer--gold-subtle" />
                        <div className="idcard-corner-tr" />
                        <div className="idcard-corner-bl" />
                        <div className="flex items-center gap-2 mb-2">
                          <div className="idcard-gold-bar" />
                          <span className="text-sm font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>{t('profile.idCard.trophies', { count: sorted.length })}</span>
                        </div>
                        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${sorted.length}, 1fr)` }}>
                          {sorted.map(trophy => {
                            const IconComponent = TROPHY_ICON_MAP[trophy.icon] || Star;
                            return (
                              <div key={trophy.id} className="relative p-2 rounded-lg text-center overflow-hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${trophy.color}18, ${trophy.color}08)`, border: `1px solid ${trophy.color}50`, boxShadow: `0 0 20px ${trophy.color}15, inset 0 0 20px ${trophy.color}05` }}>
                                <div className="rounded-full flex items-center justify-center mb-1" style={{ width: 'var(--size-avatar-sm)', height: 'var(--size-avatar-sm)', background: `linear-gradient(135deg, ${trophy.color}30, ${trophy.color}10)`, boxShadow: `0 0 15px ${trophy.color}40` }}>
                                  <IconComponent size={14} style={{ color: trophy.color }} />
                                </div>
                                <div className="font-bold text-white w-full px-0.5 leading-tight" style={{ fontSize: '8px', wordBreak: 'break-word' }}>{trophy.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══ FOOTER ═══ */}
                  <div className="relative flex items-center justify-between pt-1.5">
                    <div className="absolute top-0 left-0 right-0 h-px idcard-shimmer--subtle" />
                    <span className="text-gray-500 font-mono" style={{ fontSize: '8px' }}>{t('profile.idCard.generated', { date: new Date().toLocaleDateString() })}</span>
                    <span className="text-gray-500" style={{ fontSize: '8px' }}>whisperingwishes.app</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Format toggle + action buttons */}
            <div className="flex gap-2 mt-3">
              {/* Format toggle */}
              <div className="flex rounded-xl overflow-hidden kuro-border-medium" style={{ background: 'var(--bg-btn)' }}>
                <button
                  onClick={() => setIdCardFormat('landscape')}
                  className="px-3 py-3 text-sm font-medium flex items-center gap-1.5 transition-all"
                  style={idCardFormat === 'landscape' ? { background: 'rgba(237,175,24,0.15)', color: '#edaf18', borderRight: '1px solid var(--border-medium)' } : { color: '#6b7280', borderRight: '1px solid var(--border-medium)' }}
                  title={t('profile.idCard.landscape')}
                >
                  <Monitor size={12} /> 16:9
                </button>
                <button
                  onClick={() => setIdCardFormat('portrait')}
                  className="px-3 py-3 text-sm font-medium flex items-center gap-1.5 transition-all"
                  style={idCardFormat === 'portrait' ? { background: 'rgba(237,175,24,0.15)', color: '#edaf18' } : { color: '#6b7280' }}
                  title={t('profile.idCard.portrait')}
                >
                  <Smartphone size={12} /> 9:16
                </button>
              </div>
              {/* Download */}
              <button
                onClick={() => downloadIdCard(idCardFormat)}
                className="kuro-btn flex-1 py-3 text-base active-gold flex items-center justify-center gap-2"
              >
                <Download size={14} /> {t('profile.idCard.download', { format: idCardFormat === 'portrait' ? '9:16' : '16:9' })}
              </button>
              {/* Close */}
              <button
                onClick={() => setShowIdCard(false)}
                className="kuro-btn px-4 py-3 text-base"
              >
                <X size={14} />
              </button>
            </div>
          </div>
      </FocusTrapModal>
  );
}
