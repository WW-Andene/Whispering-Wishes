// ═══════════════════════════════════════════════════════════════════════════════
// RotationTimeline — Gantt-style chronology: rows top-to-bottom, time left-to-right
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { useSessionState } from '../../hooks/useSessionState.js';
import { t, getLocale } from '../../utils/i18n.js';

// PerfectSuite values ([32] primary, [512] primary) — px/second scale and floor width for the
// horizontally-scrollable chart below, so action sub-bars stay legible instead of being squeezed
// into a percentage-of-card width.
const PX_PER_SECOND = 32;
const MIN_CHART_WIDTH = 512;
// PerfectSuite value ((24) secondary) — floor width for one action chip. Before this, an action strip
// just split its field segment's own pixel width evenly across every step with only a 1%-of-chart
// floor, so a character with a long skillSequence packed into a short on-field window (a real, common
// case) rendered as a row of sub-5px slivers with no readable label at all. PX_PER_SECOND itself is
// bumped up (not per-row) so segment/buff alignment stays exactly proportional to time everywhere else.
const MIN_ACTION_PX = 24;

const ELEMENT_COLORS = {
  Glacio: '#06b6d4', Fusion: '#f97316', Electro: '#a855f7',
  Aero: '#10b981', Spectro: '#edaf18', Havoc: '#ec4899',
};

// Terse — for the Gantt timeline bars below, which are genuinely too narrow (some under 40px wide) for
// full words. Kept short on purpose, only used in this one tight-space context.
export const STAT_LABELS = {
  atkPct: 'ATK', allDmg: 'All DMG', elemDmg: 'Elem DMG', amplify: 'Amplify',
  basicDmg: 'Basic', heavyDmg: 'Heavy', libDmg: 'Lib', echoDmg: 'Echo',
  skillDmg: 'Skill', critRate: 'CR', critDmg: 'CD', resShred: 'RES↓', defShred: 'DEF↓',
  coordDmg: 'Coord', glacioDmg: 'Glacio', fusionDmg: 'Fusion', electroDmg: 'Electro',
  aeroDmg: 'Aero', spectroDmg: 'Spectro', havocDmg: 'Havoc',
};

// Full words — for the Rotation Guide's Inherits/Own kit/Hands-off badges, which have room to spell
// things out and are exactly the kind of "help text" a player shouldn't have to decode abbreviations
// for ("CR"/"CD"/"RES↓" reads as internal shorthand, not an explanation).
export const STAT_LABELS_FULL = {
  atkPct: 'ATK', allDmg: 'All DMG', elemDmg: 'Elemental DMG', amplify: 'DMG Amplify',
  basicDmg: 'Basic Attack DMG', heavyDmg: 'Heavy Attack DMG', libDmg: 'Liberation DMG', echoDmg: 'Echo Skill DMG',
  skillDmg: 'Resonance Skill DMG', critRate: 'Crit Rate', critDmg: 'Crit DMG', resShred: 'RES Shred', defShred: 'DEF Shred',
  coordDmg: 'Coordinated ATK DMG', glacioDmg: 'Glacio DMG', fusionDmg: 'Fusion DMG', electroDmg: 'Electro DMG',
  aeroDmg: 'Aero DMG', spectroDmg: 'Spectro DMG', havocDmg: 'Havoc DMG',
};

// Color + full label per CHARACTER_ROTATIONS step type — shared by the Rotation Guide's skill-sequence
// chips, just the category name and color (Intro/Skill/Liberation/Heavy/Basic/Forte/Echo/Outro spelled
// out, no 2-3 letter codes to decode). The actual how-to-execute instructions live in each step's own
// `note` field in CHARACTER_ROTATIONS (character- and step-specific — a generic "what a Forte Circuit
// is" blurb here can't tell you HOW to charge THIS character's Forte, only the real per-character combat
// text can), so this table intentionally carries no generic description text anymore.
export const STEP_TYPE_STYLE = {
  Intro: { label: 'Intro Skill', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  Skill: { label: 'Resonance Skill', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  Liberation: { label: 'Resonance Liberation', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  Ultimate: { label: 'Resonance Liberation (Ultimate)', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  'Heavy ATK': { label: 'Heavy Attack', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  'Basic ATK': { label: 'Basic Attack', cls: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
  Forte: { label: 'Forte Circuit', cls: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  'Mid-air': { label: 'Mid-air Attack', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  'Mid-air ATK': { label: 'Mid-air Attack', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  Echo: { label: 'Echo Skill', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  Outro: { label: 'Outro Skill', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  Step: { label: 'Action', cls: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
};
// French labels for the same step types — display-only, keyed the same as STEP_TYPE_STYLE.
// STEP_TYPE_STYLE's English keys (Intro/Skill/Liberation/etc.) stay untouched since they're
// matched against CHARACTER_ROTATIONS'/SKILL_MULTIPLIERS' raw `type` strings elsewhere.
export const STEP_TYPE_LABEL_FR = {
  Intro: "Compétence d'Intro",
  Skill: 'Compétence de Résonance',
  Liberation: 'Libération de Résonance',
  Ultimate: 'Libération de Résonance (Ultime)',
  'Heavy ATK': 'Attaque Lourde',
  'Basic ATK': 'Attaque Basique',
  Forte: 'Circuit Forte',
  'Mid-air': 'Attaque Aérienne',
  'Mid-air ATK': 'Attaque Aérienne',
  Echo: "Compétence d'Écho",
  Outro: "Compétence d'Outro",
  Step: 'Action',
};
/** @param {string} type @param {string} [locale] */
export const stepStyle = (type, locale) => {
  const base = STEP_TYPE_STYLE[type] || { label: type || 'Action', cls: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
  if (locale === 'fr' && STEP_TYPE_LABEL_FR[type]) return { ...base, label: STEP_TYPE_LABEL_FR[type] };
  return base;
};

// Short (1-word) chip labels for the action sub-bars below — the same widths that already forced
// STAT_LABELS to abbreviate apply here (a Basic ATK action chip on a 3-member team's field segment
// can be under 20px wide), so this deliberately trims STEP_TYPE_STYLE's own full labels rather than
// reusing them. Full name still shows in the chip's title tooltip via stepStyle() below.
const SHORT_STEP_LABEL = {
  Intro: 'Intro', Skill: 'Skill', Liberation: 'Lib', Ultimate: 'Lib',
  'Heavy ATK': 'Heavy', 'Basic ATK': 'Basic', Forte: 'Forte',
  'Mid-air': 'Air', 'Mid-air ATK': 'Air', Echo: 'Echo', Outro: 'Outro', Step: '•',
};

export default function RotationTimeline({ rotationTimeline }) {
  // Collapsed state persists per-tab-session, same convention as the Team Overview card's own
  // collapse toggle in DamageCalculator.jsx.
  const [collapsed, setCollapsed] = useSessionState('ww-rotation-timeline-collapsed', false);
  if (!rotationTimeline || !rotationTimeline.segments?.length || !rotationTimeline.totalTime) return null;

  const { segments, buffs, totalTime, steps } = rotationTimeline;
  // Per-character skill sequence (Intro/Skill/Basic/Heavy/Liberation/Forte/Echo/Outro/...) — steps
  // is index-aligned with segments (both built from the same orderedMems pass in calcTeamStats.js),
  // but matching by name is just as cheap and doesn't depend on that alignment holding.
  const stepByName = new Map((steps || []).map(s => [s.name, s]));

  // One cycle only — no looping
  const rows = [];
  segments.forEach(seg => {
    rows.push({ label: seg.name, start: seg.start, duration: seg.duration, color: ELEMENT_COLORS[seg.element] || '#6b7280', type: 'field', detail: `${seg.duration}s` });
  });
  buffs.forEach(buff => {
    // owner field links echo/weapon buffs back to their character
    const ownerName = buff.owner || buff.source;
    const color = ELEMENT_COLORS[segments.find(s => s.name === ownerName)?.element] || ELEMENT_COLORS[segments.find(s => s.name === buff.source)?.element] || '#6b7280';
    const isEcho = buff.type === 'echo';
    const prefix = isEcho ? '◆ ' : '';
    // Sync to the actual triggering action (2026-09-06): calcTeamStats.js now tags Outro/Liberation/
    // Intro/Echo-triggered buffs with `triggerStep`. Before this, every such buff bar started at its
    // owner's raw segment start (or end, for Outro), even when the real trigger — e.g. a Liberation-
    // triggered buff — actually fires partway through that character's action sequence. When the
    // owner's own skillSequence has a matching step, snap the buff's displayed start to that specific
    // action chip's equal-slice position instead, so the buff bar visually lines up with the action
    // that caused it rather than just the nearest segment edge.
    let start = buff.start;
    if (buff.triggerStep) {
      const ownerSeg = segments.find(s => s.name === ownerName);
      const ownerActions = stepByName.get(ownerName)?.skillSequence;
      if (ownerSeg && ownerActions?.length) {
        const matchTypes = buff.triggerStep === 'Liberation' ? ['Liberation', 'Ultimate'] : [buff.triggerStep];
        const idx = ownerActions.findIndex(a => matchTypes.includes(a.type));
        if (idx >= 0) start = ownerSeg.start + (ownerSeg.duration / ownerActions.length) * idx;
      }
    }
    if (buff.duration > 0) rows.push({ label: buff.source, owner: ownerName, start, duration: buff.duration, color, type: 'buff', buffKind: isEcho ? 'echo' : 'char', detail: `${prefix}${STAT_LABELS[buff.stat] || buff.stat} +${buff.value}%` });
  });

  // timeScale = the rotation length itself, not the furthest end of any bar — a buff bar that
  // outlasts the rotation (or carries a bad/sentinel duration) must never stretch the whole chart's
  // scale, or it silently squashes every real on-field segment into an unreadable sliver. Buff bars
  // are clamped to the visible width when rendered below instead.
  const maxEnd = Math.max(totalTime, ...rows.filter(r => r.type === 'field').map(r => r.start + r.duration));

  // Group: each on-field segment followed by its buffs
  const ordered = [];
  const usedBuffIdx = new Set();
  segments.forEach(seg => {
    const fieldRow = rows.find(r => r.type === 'field' && r.start === seg.start && r.label === seg.name);
    if (fieldRow) ordered.push(fieldRow);
    // Grouped purely by ownership now (2026-09-06) — the old start-time proximity check (only within
    // 0.5s of the segment's start or end) predates triggerStep syncing above and would silently drop
    // any buff now positioned mid-segment (e.g. a Liberation-triggered buff on a character whose
    // Liberation isn't their very first or last action) into the unowned/orphan bucket below. Since
    // each character has exactly one on-field segment in this timeline, ownership alone is unambiguous.
    const myBuffs = rows.map((r, i) => ({ ...r, _idx: i }))
      .filter(r => r.type === 'buff' && (r.owner === seg.name || r.label === seg.name) && !usedBuffIdx.has(r._idx))
      .sort((a, b) => a.start - b.start);
    myBuffs.forEach(b => { usedBuffIdx.add(b._idx); ordered.push(b); });
  });
  rows.forEach((r, i) => { if (r.type === 'buff' && !usedBuffIdx.has(i)) ordered.push(r); });

  // Ticks
  const tickInterval = maxEnd <= 10 ? 1 : 5;
  const ticks = [];
  for (let i = 0; i <= maxEnd; i += tickInterval) ticks.push(i);
  if (ticks[ticks.length - 1] < Math.ceil(maxEnd)) ticks.push(Math.ceil(maxEnd));

  // Scale up px/second (not per-row) so the densest action strip still clears MIN_ACTION_PX per chip —
  // keeps every bar's position exactly proportional to real time, just at a larger overall scale.
  const requiredPxPerSecond = segments.reduce((max, seg) => {
    const actionCount = stepByName.get(seg.name)?.skillSequence?.length || 0;
    if (actionCount <= 1 || seg.duration <= 0) return max;
    return Math.max(max, (MIN_ACTION_PX * actionCount) / seg.duration);
  }, PX_PER_SECOND);
  const chartWidth = Math.max(maxEnd * requiredPxPerSecond, MIN_CHART_WIDTH);

  return (
    <Card>
      <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(p => !p); } }} aria-expanded={!collapsed}>
        <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />}>
          {t('teams.rotation.header', { time: totalTime })}
        </CardHeader>
      </div>
      {!collapsed && (
      <CardBody>
        {/* Scrollable in both directions: the action sub-bars added below each field segment need
            real pixel width to stay legible (a Basic/Heavy/Skill/Liberation chip strip squeezed into
            a percentage-of-card width becomes unreadable on anything but a 1-member rotation), and a
            3-member team with several buff rows can run taller than the card wants to be by default.
            PX_PER_SECOND/MIN_CHART_WIDTH are both PerfectSuite values (32, 512). */}
        <div className="overflow-x-auto overflow-y-auto max-h-[384px]">
          <div style={{ position: 'relative', width: chartWidth, minWidth: '100%' }}>
            {ordered.map((row, i) => {
              const leftPct = Math.min((row.start / maxEnd) * 100, 100);
              // Clamp so a buff outlasting the rotation window is drawn flush to the right edge
              // instead of overflowing the card and forcing horizontal scroll.
              const widthPct = Math.min((row.duration / maxEnd) * 100, 100 - leftPct);
              const isField = row.type === 'field';
              const isEcho = row.buffKind === 'echo';
              // Action sub-bars — the verified skill-by-skill sequence (same data the Rotation Guide
              // card lists) rendered as a second strip under the field bar. There's no real per-action
              // timing in this data (only an ordered sequence), so each action gets an equal slice of
              // its character's on-field window — a deliberate approximation, not a claim these actions
              // are evenly timed in practice.
              const actions = isField ? (stepByName.get(row.label)?.skillSequence || []) : [];
              const hasActions = actions.length > 0;
              const rowHeight = isField && hasActions ? 48 : 24;
              return (
                <div key={i} style={{ position: 'relative', height: rowHeight, marginBottom: 2 }}>
                  {/* Grid lines */}
                  {ticks.map(tick => (
                    <div key={tick} className="absolute top-0 bottom-0 border-l border-white/5"
                      style={{ left: `${(tick / maxEnd) * 100}%` }} />
                  ))}
                  {/* Label */}
                  <span className={`absolute text-2xs ${isField ? 'font-bold text-gray-300' : isEcho ? 'text-gray-400' : 'text-gray-500'}`}
                    style={hasActions
                      ? { left: 0, top: 14, width: leftPct > 8 ? `${leftPct - 1}%` : undefined, textAlign: 'right', paddingRight: 4, zIndex: 2 }
                      : { left: 0, top: '50%', transform: 'translateY(-50%)', width: leftPct > 8 ? `${leftPct - 1}%` : undefined, textAlign: 'right', paddingRight: 4, zIndex: 2 }}>
                    {leftPct > 8 ? (isField ? row.label : isEcho ? '◆' : '↳') : ''}
                  </span>
                  {/* Bar */}
                  <div className={`absolute flex items-center ${isField ? 'rounded rotation-segment' : 'rounded-sm buff-bar'}`}
                    style={{
                      left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%`,
                      top: 2, ...(hasActions ? { height: 24 } : { bottom: 2 }),
                      background: `${row.color}${isField ? '30' : isEcho ? '14' : '18'}`,
                      border: `1px solid ${row.color}${isField ? '60' : isEcho ? '30' : '35'}`,
                      borderStyle: isEcho ? 'dashed' : 'solid',
                    }}>
                    <span className={`truncate px-1 ${isField ? 'text-2xs font-bold' : 'text-2xs'}`}
                      style={{ color: row.color }}>{isField ? `${row.label} ${row.detail}` : row.detail}</span>
                  </div>
                  {/* Action sub-bars — Intro/Skill/Basic/Heavy/Liberation/Forte/Echo/Outro sequence */}
                  {hasActions && (
                    <div className="absolute" style={{ left: 0, right: 0, top: 32, height: 16 }}>
                      {actions.map((a, ai) => {
                        const sty = stepStyle(a.type, getLocale());
                        const actionWidthPct = widthPct / actions.length;
                        const actionLeftPct = leftPct + ai * actionWidthPct;
                        return (
                          <div key={ai}
                            title={`${sty.label}: ${a.skill}${a.note ? ' — ' + a.note : ''}`}
                            className={`absolute rounded-sm border flex items-center justify-center overflow-hidden ${sty.cls}`}
                            style={{ left: `${actionLeftPct}%`, width: `${Math.max(actionWidthPct, 1)}%`, top: 0, bottom: 0 }}>
                            <span className="truncate px-0.5 text-2xs font-bold">{SHORT_STEP_LABEL[a.type] || a.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time scale at bottom */}
          <div style={{ position: 'relative', width: chartWidth, minWidth: '100%', height: 14, marginTop: 4 }}>
            {ticks.map(tick => (
              <span key={tick} className="absolute text-2xs text-gray-600 -translate-x-1/2"
                style={{ left: `${(tick / maxEnd) * 100}%` }}>{tick}s</span>
            ))}
          </div>
        </div>

        {/* Legend */}
        {ordered.some(r => r.buffKind === 'echo') && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
            <span className="text-2xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-3 h-[6px] rounded-sm border border-white/30 bg-white/15" /> {t('teams.rotation.legendChar')}
            </span>
            <span className="text-2xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-3 h-[6px] rounded-sm border border-dashed border-white/25 bg-white/10" /> {t('teams.rotation.legendEcho')}
            </span>
          </div>
        )}
      </CardBody>
      )}
    </Card>
  );
}
