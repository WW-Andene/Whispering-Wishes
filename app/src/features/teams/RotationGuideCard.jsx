// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/RotationGuideCard.jsx (extracted from DamageCalculator.jsx)
// Rotation Guide — source-style: one self-contained block per character (readable on its
// own — what THEY do on field) chained to its neighbors via explicit inherited/handed-off
// buffs, instead of one flat list mixing everyone's numbers together. Pure UI, driven
// entirely by the already-computed rotationTimeline data.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronDown, ListOrdered } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { useSessionState } from '../../hooks/useSessionState.js';
import { stepStyle } from './RotationTimeline.jsx';
import { splitIntoParagraphs } from '../../shared/utils/textFormat.js';
import { t, getLocale } from '../../utils/i18n.js';

export function RotationGuideCard({ rotationTimeline }) {
  // Simple View — hides descriptive prose (step reason, per-skill notes, inherits/Own Kit/Hands Off
  // badges) leaving just each step's name, on-field time, and skill sequence type/name/damage. Off by
  // default (full detail).
  const [simpleView, setSimpleView] = useState(false);
  // Collapsed state persists per-tab-session, same convention as the Team Overview card's own
  // collapse toggle in DamageCalculator.jsx (and the Rotation timeline card above it).
  const [collapsed, setCollapsed] = useSessionState('ww-rotation-guide-collapsed', false);
  if (!(rotationTimeline?.steps?.length > 0)) return null;

  return (
    <Card>
      <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(p => !p); } }} aria-expanded={!collapsed}>
        <CardHeader action={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSimpleView(v => !v); }}
              className={`kuro-badge text-2xs shrink-0 ${simpleView ? 'kuro-badge-amber' : 'kuro-badge-neutral'}`}
            >
              {t('teams.rotationGuide.simpleView')}
            </button>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </div>
        }>
          <span className="flex items-center gap-1.5"><ListOrdered size={14} /> {t('teams.rotationGuide.title')}</span>
        </CardHeader>
      </div>
      {!collapsed && (
      <CardBody>
        <div className="space-y-0">
          {rotationTimeline.steps.map((step, i) => (
            <React.Fragment key={step.order}>
              <div className={`p-3 rounded-lg border ${step.isDps ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-[var(--border-medium)]'}`} style={step.isDps ? undefined : { background: 'var(--bg-stat)' }}>
                <div className="flex items-center gap-2">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold ${step.isDps ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>{step.order}</span>
                  <span className={`font-semibold text-sm ${step.isDps ? 'text-yellow-400' : 'text-gray-200'}`}>{step.name}</span>
                  <span className="text-gray-500 text-sm">{t('teams.rotationGuide.onField', { duration: step.duration })}</span>
                  {step.isDps && <span className="kuro-badge kuro-badge-yellow ml-auto">{t('teams.rotationGuide.mainDps')}</span>}
                </div>
                {!simpleView && step.reason && (
                  <div className="space-y-1 mt-1 pl-7">
                    {splitIntoParagraphs(step.reason, 160).map((para, pi) => (
                      <div key={pi} className="text-sm text-gray-500 leading-relaxed">{para}</div>
                    ))}
                  </div>
                )}

                {/* Verified skill-by-skill sequence (the source "Standard Rotation") — real combat
                    data, shown first since it's the most concrete/actionable part of the block.
                    Every abbreviation was replaced with the full action-type word plus a plain-
                    English explanation of what that TYPE of action generally does (a new player
                    shouldn't have to already know what "Forte" or "Outro" means to read this),
                    on top of the character-specific note for what THIS step does in this rotation. */}
                {step.skillSequence && (
                  <div className="mt-2 pl-7">
                    <div className="text-2xs text-gray-500 uppercase tracking-wide mb-1">{t('teams.rotationGuide.skillSequence')}</div>
                    <div className="space-y-2">
                      {step.skillSequence.map((s, si) => {
                        const sty = stepStyle(s.type, getLocale());
                        return (
                          <div key={si} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 text-gray-400 text-2xs font-bold flex items-center justify-center mt-0.5">{si + 1}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border ${sty.cls}`}>{sty.label}</span>
                                <span className="text-sm text-gray-200 font-medium">{s.skill}</span>
                              </div>
                              {!simpleView && (s.note ? (
                                <div className="space-y-0.5 mt-0.5">
                                  {splitIntoParagraphs(s.note, 140).map((para, pi) => (
                                    <div key={pi} className="text-2xs text-gray-400 leading-relaxed">{para}</div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-2xs text-yellow-600/60 italic mt-0.5">{t('teams.rotationGuide.noInstructions')}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!simpleView && (
                  <>
                    {/* Inbound — what earlier blocks handed this one, i.e. how it adapts to the team */}
                    {step.inherits.length > 0 && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-cyan-400/70 uppercase tracking-wide mb-1 flex items-center gap-1">↓ {t('teams.rotationGuide.inheritsFromTeam')}</div>
                        <div className="flex flex-wrap gap-1">
                          {step.inherits.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-cyan">{b}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Self-contained — this character's own kit, readable with zero team context */}
                    {step.selfActive.length > 0 && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-gray-500 uppercase tracking-wide mb-1">{t('teams.rotationGuide.ownKit')}</div>
                        <div className="flex flex-wrap gap-1">
                          {step.selfActive.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-violet">{b}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Outbound — what this block hands off to whoever comes next */}
                    {step.handsOff.length > 0 && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-emerald-400/70 uppercase tracking-wide mb-1">↑ {t('teams.rotationGuide.handsOffToNext')}</div>
                        <div className="flex flex-wrap gap-1">
                          {step.handsOff.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-emerald">{b}</span>)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              {i < rotationTimeline.steps.length - 1 && (
                <div className="flex justify-center py-0.5" aria-hidden="true">
                  <ChevronDown size={14} className="text-gray-600" />
                </div>
              )}
            </React.Fragment>
          ))}
          {/* This block chain is one cycle (rotTime seconds) that repeats — each character's own
              module (skill sequence + inherits/hands-off) is unaffected by which comp it's slotted
              into, so swapping any member here still "just works": the chain re-derives inherits/
              hands-off/ordering from whichever 1-3 characters are actually placed. */}
          {rotationTimeline.steps.length > 1 && (
            <div className="flex items-center gap-2 pt-2">
              <span className="h-px flex-1 bg-purple-500/20" />
              <span className="text-2xs text-purple-400/80 font-medium">↻ {t('teams.rotationGuide.loopBack', { name: rotationTimeline.steps[0]?.name, time: rotationTimeline.totalTime })}</span>
              <span className="h-px flex-1 bg-purple-500/20" />
            </div>
          )}
        </div>
      </CardBody>
      )}
    </Card>
  );
}
