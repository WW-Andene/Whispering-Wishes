import React from 'react';
import { Diamond, Star, X } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters.js';
import { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, getLocalizedEchoData } from '../../data/echoes.js';
import { haptic } from '../../utils/haptics.js';
import { getSetIcon, getElementIcon } from '../../shared/utils/elementVisuals.js';
import { getLocale } from '../../utils/i18n.js';
import { isHealerRole, isSupportRole } from './calcEngine.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { EchoImage } from '../../shared/components/EchoImage.jsx';

const LOCALIZED_ECHO_DATA = getLocalizedEchoData(getLocale());

export default function EchoSelector({
  echoSelectorOpen,
  setEchoSelectorOpen,
  echoSelectorTarget,
  echoSearch,
  setEchoSearch,
  echoSetFilter,
  setEchoSetFilter,
  echoBuffFilter,
  setEchoBuffFilter,
  echoStatPanel,
  setEchoStatPanel,
  setTeamEquipment,
  teamEquipment,
  setEchoSelectorTarget,
  collectionImages,
}) {
  return (
    <>
      {/* Echo Selector Modal */}
      <FocusTrapModal isOpen={echoSelectorOpen} onClose={() => { setEchoSelectorOpen(false); setEchoSetFilter('all'); setEchoBuffFilter('all'); }} className="" onClick={() => { setEchoSelectorOpen(false); setEchoSetFilter('all'); setEchoBuffFilter('all'); }} centered padding="p-3">
        <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          {(() => {
            const slotIdx = echoSelectorTarget.slotIdx;
            const costNum = slotIdx === 0 ? 4 : slotIdx < 3 ? 3 : 1;
            const costColor = costNum === 4 ? 'yellow' : costNum === 3 ? 'purple' : 'cyan';
            const echoList = costNum === 4 ? ALL_4COST_ECHOES : costNum === 3 ? ALL_3COST_ECHOES : ALL_1COST_ECHOES;
            const charData = CHARACTER_DATA[echoSelectorTarget.charName];
            // Build recommended echoes from bestEchoes + matching sonata sets
            const recommendedEchoes = new Set();
            const recSets = new Set();
            (charData?.bestEchoes || []).forEach(entry => {
              // Direct echo name matches
              echoList.forEach(en => { if (entry.toLowerCase().includes(en.toLowerCase())) recommendedEchoes.add(en); });
              // Extract all set names from entries like "Eternal Radiance 5pc" or "Dream of the Lost 3pc + Havoc Eclipse 2pc"
              entry.split('+').forEach(part => {
                const setName = part.trim().replace(/\s+\d+pc$/i, '').trim();
                if (ECHO_SETS[setName]) recSets.add(setName);
              });
            });
            // Add echoes that belong to recommended sets
            if (recSets.size > 0) {
              echoList.forEach(en => {
                const ed = ECHO_DATA[en];
                if (ed?.sets?.some(s => recSets.has(s))) recommendedEchoes.add(en);
              });
            }
            // Available sonata sets for this cost tier
            const availableSets = [...new Set(echoList.flatMap(n => ECHO_DATA[n]?.sets || []))].sort();
            const availableBuffs = [...new Set(echoList.flatMap(n => { const d = ECHO_DATA[n]; return d ? (Array.isArray(d.buff) ? d.buff : [d.buff]) : []; }))].sort();
            const hasFilters = echoSetFilter !== 'all' || echoBuffFilter !== 'all';
            // Filter
            const filtered = echoList.filter(name => {
              if (echoSearch && !name.toLowerCase().includes(echoSearch.toLowerCase())) return false;
              const ed = ECHO_DATA[name];
              if (!ed) return !echoSearch;
              if (echoSetFilter !== 'all' && !ed.sets.includes(echoSetFilter)) return false;
              if (echoBuffFilter !== 'all' && !(Array.isArray(ed.buff) ? ed.buff.includes(echoBuffFilter) : ed.buff === echoBuffFilter)) return false;
              return true;
            }).sort((a, b) => {
              const aRec = recommendedEchoes.has(a) ? 0 : 1;
              const bRec = recommendedEchoes.has(b) ? 0 : 1;
              return aRec - bRec;
            });
            return (
              <>
                <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
                  <div>
                    <h3 className="text-white font-semibold text-xl">Select Echo</h3>
                    <p className="text-gray-400 text-sm">{echoSelectorTarget.charName} — Slot {slotIdx + 1} ({costNum}-Cost)</p>
                  </div>
                  <button onClick={() => { setEchoSelectorOpen(false); setEchoSetFilter('all'); setEchoBuffFilter('all'); }} className="p-3 min-w-[calc(48px*var(--ui-scale,1))] min-h-[calc(48px*var(--ui-scale,1))] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Close echo selector"><X size={16} /></button>
                </div>
                {/* Search + Filters */}
                <div className="p-2 border-b border-[var(--border-subtle)] flex-shrink-0 space-y-1.5">
                  <input value={echoSearch} onChange={e => setEchoSearch(e.target.value)} placeholder="Search echoes…" className="kuro-input w-full text-base" />
                  <div className="flex gap-1.5">
                    <KuroSelect
                      value={echoSetFilter}
                      onChange={v => setEchoSetFilter(v)}
                      options={[
                        { value: 'all', label: 'All Sets' },
                        ...availableSets.map(s => ({
                          value: s,
                          label: <span className="inline-flex items-center gap-1.5"><img src={getSetIcon(s)} alt="" width={14} height={14} className="shrink-0" /> {s}</span>,
                        })),
                      ]}
                      className="flex-1 text-sm"
                    />
                    <KuroSelect
                      value={echoBuffFilter}
                      onChange={v => setEchoBuffFilter(v)}
                      options={[
                        { value: 'all', label: 'All Buffs' },
                        ...availableBuffs.map(b => {
                          const icon = getElementIcon(b.replace(/ DMG$/, ''));
                          return {
                            value: b,
                            label: icon
                              ? <span className="inline-flex items-center gap-1.5"><img src={icon} alt="" width={14} height={14} className="shrink-0" /> {b}</span>
                              : b,
                          };
                        }),
                      ]}
                      className="flex-1 text-sm"
                    />
                    {hasFilters && (
                      <button onClick={() => { setEchoSetFilter('all'); setEchoBuffFilter('all'); setEchoSearch(''); }} className="kuro-btn kuro-btn-sm">Clear</button>
                    )}
                  </div>
                  {/* Recommendation indicator */}
                  {recommendedEchoes.size > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-orange-400">
                      <Star size={12} className="text-orange-400" fill="currentColor" />
                      <span>Orange glow = recommended for {echoSelectorTarget.charName}</span>
                    </div>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  <div className="space-y-1">
                    {/* Unequip option */}
                    <button
                      onClick={() => {
                        const eqKey = echoSelectorTarget.teamIdx + ':' + echoSelectorTarget.charName;
                        setTeamEquipment(prev => {
                          const n = { ...prev };
                          const existing = n[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
                          const newEchoes = [...(existing.echoes || [null, null, null, null, null])];
                          newEchoes[slotIdx] = null;
                          // Re-derive echoSet/echoSet2 from what's actually still equipped —
                          // otherwise unequipping an echo below a set's 2pc threshold silently
                          // keeps applying a set bonus the player no longer has gear for.
                          const allNames = newEchoes.map(e => e?.name).filter(Boolean);
                          const setCounts = {};
                          allNames.forEach(en => { (ECHO_DATA[en]?.sets || []).forEach(s => { setCounts[s] = (setCounts[s] || 0) + 1; }); });
                          const sortedSets = Object.entries(setCounts).sort((a, b) => b[1] - a[1]);
                          const primarySet = sortedSets[0]?.[1] >= 2 ? sortedSets[0][0] : '';
                          const secondarySet = sortedSets[1]?.[1] >= 2 ? sortedSets[1][0] : '';
                          n[eqKey] = { ...existing, echoes: newEchoes, echoSet: primarySet, echoSet2: secondarySet };
                          try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                          return n;
                        });
                        setEchoSelectorOpen(false);
                        setEchoSetFilter('all'); setEchoBuffFilter('all');
                        haptic.light();
                      }}
                      className="w-full p-2 rounded-lg border border-dashed border-white/15 text-sm text-gray-400 hover:border-red-500/30 hover:text-red-400 transition-all text-left"
                      style={{ background: 'var(--bg-btn)' }}
                    >
                      ✕ Unequip echo
                    </button>
                    {/* Echo list */}
                    {filtered.map(name => {
                        const ed = ECHO_DATA[name];
                        const isRec = recommendedEchoes.has(name);
                        const buffs = ed ? (Array.isArray(ed.buff) ? ed.buff : [ed.buff]) : [];
                        return (
                          <button
                            key={name}
                            onClick={() => {
                              const eqKey = echoSelectorTarget.teamIdx + ':' + echoSelectorTarget.charName;
                              setTeamEquipment(prev => {
                                const n = { ...prev };
                                const existing = n[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
                                const newEchoes = [...(existing.echoes || [null, null, null, null, null])];
                                // Auto-detect echo set from equipped echoes for set bonus calculation
                                newEchoes[slotIdx] = { name, mainStat: null, substats: [] };
                                // Update echoSet from equipped echo sonata sets
                                const allNames = newEchoes.map(e => e?.name).filter(Boolean);
                                const setCounts = {};
                                allNames.forEach(en => { (ECHO_DATA[en]?.sets || []).forEach(s => { setCounts[s] = (setCounts[s] || 0) + 1; }); });
                                const sortedSets = Object.entries(setCounts).sort((a, b) => b[1] - a[1]);
                                const primarySet = sortedSets[0]?.[1] >= 2 ? sortedSets[0][0] : existing.echoSet || '';
                                const secondarySet = sortedSets[1]?.[1] >= 2 ? sortedSets[1][0] : existing.echoSet2 || '';
                                n[eqKey] = { ...existing, echoes: newEchoes, echoSet: primarySet, echoSet2: secondarySet };
                                try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                return n;
                              });
                              setEchoSelectorOpen(false);
                              setEchoSetFilter('all'); setEchoBuffFilter('all');
                              // Open stat config immediately
                              setEchoStatPanel({ teamIdx: echoSelectorTarget.teamIdx, charName: echoSelectorTarget.charName, slotIdx, echoName: name });
                              haptic.success();
                            }}
                            className={`w-full p-2 rounded-lg border text-left transition-all hover:scale-[1.01] ${isRec ? 'border-2 border-orange-400 kuro-shadow-rec-md' : `border-${costColor}-500/30 bg-${costColor}-500/5`} hover:bg-${costColor}-500/10`}
                          >
                            <div className="flex items-center gap-2">
                              {collectionImages[name] ? (
                                <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border ${isRec ? 'border-orange-400/50 bg-orange-500/10' : `border-${costColor}-500/30 bg-${costColor}-500/8`}`} style={{ position: 'relative' }}>
                                  <EchoImage src={collectionImages[name]} alt={name} className="w-full h-full object-cover" noBgProcess={ECHO_DATA[name]?.noBgProcess} />
                                </div>
                              ) : (
                                <Diamond size={14} className={isRec ? 'text-orange-400' : `text-${costColor}-400`} />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white text-base font-semibold truncate">{LOCALIZED_ECHO_DATA[name]?.displayName || name}</span>
                                  {isRec && <span className="text-2xs px-1 py-0.5 rounded font-bold bg-orange-500 text-white kuro-tshadow-badge">★ REC</span>}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                  {buffs.map(b => <span key={b} className="text-sm text-gray-400">{b}</span>)}
                                  {ed?.sets && <span className="text-sm text-gray-500">· {ed.sets.join(', ')}</span>}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    {filtered.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-base">No echoes match filters</div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </FocusTrapModal>

      {/* Echo Stat Configuration Panel */}
      <FocusTrapModal isOpen={!!echoStatPanel} onClose={() => setEchoStatPanel(null)} className="" onClick={() => setEchoStatPanel(null)} centered padding="p-3">
        <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          {echoStatPanel && (() => {
            const { teamIdx, charName, slotIdx, echoName } = echoStatPanel;
            const eqKey = teamIdx + ':' + charName;
            const eq = teamEquipment[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
            const echoEntry = eq.echoes?.[slotIdx];
            const currentMainStat = (typeof echoEntry === 'object' && echoEntry) ? echoEntry.mainStat : null;
            const currentSubstats = (typeof echoEntry === 'object' && echoEntry) ? (echoEntry.substats || []) : [];
            const costNum = slotIdx === 0 ? 4 : slotIdx < 3 ? 3 : 1;
            const costColor = costNum === 4 ? 'yellow' : costNum === 3 ? 'purple' : 'cyan';
            const echoData = ECHO_DATA[echoName];
            const mainStatOptions = costNum === 4
              ? ['ATK%', 'HP%', 'DEF%', 'Crit Rate', 'Crit DMG', 'Healing Bonus', 'Energy Regen']
              : costNum === 3
              ? ['ATK%', 'HP%', 'DEF%', 'Glacio DMG', 'Fusion DMG', 'Electro DMG', 'Aero DMG', 'Spectro DMG', 'Havoc DMG', 'Energy Regen']
              : ['ATK%', 'HP%', 'DEF%', 'ATK', 'HP', 'DEF'];
            const substatOptions = ['ATK', 'ATK%', 'HP', 'HP%', 'DEF', 'DEF%', 'Crit Rate', 'Crit DMG', 'Energy Regen', 'Basic ATK DMG', 'Heavy ATK DMG', 'Resonance Skill DMG', 'Resonance Liberation DMG'];
            // Recommended stats based on character role/element
            const cd = CHARACTER_DATA[charName];
            const charEl = cd?.element;
            const charRole = cd?.role;
            const elDmgStat = charEl ? `${charEl} DMG` : null;
            // Compound role strings ('Support/Healer' — Chisa, Suisui) never match an exact
            // equality check, so those characters silently fell through to the plain-DPS
            // recommendation branch below. Use the substring-aware role helpers instead.
            const isHealer = isHealerRole(charRole);
            const isSupport = isSupportRole(charRole);
            const recMainStats = new Set();
            const recSubstats = new Set();
            // Recommended sonata sets for this character
            const charRecSets = new Set();
            (cd?.bestEchoes || []).forEach(entry => {
              entry.split('+').forEach(part => {
                const setName = part.trim().replace(/\s+\d+pc$/i, '').trim();
                if (ECHO_SETS[setName]) charRecSets.add(setName);
              });
            });
            if (isHealer) {
              // Healing Bonus is cost-4-only — it can't roll on a cost-3 echo at all. Healing scales
              // off HP for most healers (Verina, Baizhi, Shorekeeper), so both cost-3 slots go to HP%.
              if (costNum === 4) { recMainStats.add('Healing Bonus'); }
              else if (costNum === 3) { recMainStats.add('HP%'); }
              else { recMainStats.add('HP%'); }
              // ATK% carries zero effective weight for a healer's substat priority (per
              // wuwa.uk's per-role substat weight table) — HP%, Energy Regen and flat HP
              // are the ones that actually matter.
              ['HP%', 'Energy Regen', 'HP'].forEach(s => recSubstats.add(s));
            } else if (isSupport) {
              if (costNum === 4) { recMainStats.add('Energy Regen'); recMainStats.add('ATK%'); }
              else if (costNum === 3) { if (elDmgStat) recMainStats.add(elDmgStat); recMainStats.add('ATK%'); }
              else { recMainStats.add('ATK%'); }
              ['ATK%', 'Energy Regen', 'Crit Rate', 'Crit DMG'].forEach(s => recSubstats.add(s));
            } else {
              // DPS (Main DPS / Sub DPS)
              if (costNum === 4) { recMainStats.add('Crit Rate'); recMainStats.add('Crit DMG'); }
              else if (costNum === 3) { if (elDmgStat) recMainStats.add(elDmgStat); }
              else { recMainStats.add('ATK%'); }
              ['Crit Rate', 'Crit DMG', 'ATK%', 'Energy Regen'].forEach(s => recSubstats.add(s));
            }
            const updateEchoData = (updates) => {
              setTeamEquipment(prev => {
                const n = { ...prev };
                const existing = n[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
                const newEchoes = [...(existing.echoes || [null, null, null, null, null])];
                const cur = (typeof newEchoes[slotIdx] === 'object' && newEchoes[slotIdx]) ? newEchoes[slotIdx] : { name: echoName, mainStat: null, substats: [] };
                newEchoes[slotIdx] = { ...cur, ...updates };
                n[eqKey] = { ...existing, echoes: newEchoes };
                try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                return n;
              });
            };
            return (
              <>
                <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
                  <div className="flex items-center gap-2 min-w-0">
                    {collectionImages[echoName] ? (
                      <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-${costColor}-500/30 bg-${costColor}-500/8`} style={{ position: 'relative' }}>
                        <EchoImage src={collectionImages[echoName]} alt={echoName} className="w-full h-full object-cover" noBgProcess={ECHO_DATA[echoName]?.noBgProcess} />
                      </div>
                    ) : (
                      <Diamond size={16} className={`text-${costColor}-400`} />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-xl truncate">{LOCALIZED_ECHO_DATA[echoName]?.displayName || echoName}</h3>
                      <p className="text-gray-400 text-sm">{charName} — Slot {slotIdx + 1} · {costNum}-Cost</p>
                    </div>
                  </div>
                  <button onClick={() => setEchoStatPanel(null)} className="p-3 min-w-[calc(48px*var(--ui-scale,1))] min-h-[calc(48px*var(--ui-scale,1))] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0" aria-label="Close echo stats"><X size={16} /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-4">
                  {/* Sonata sets — highlight recommended */}
                  {echoData?.sets && (
                    <div>
                      <div className="kuro-section-label">Sonata Sets</div>
                      <div className="flex flex-wrap gap-1">
                        {echoData.sets.map(s => {
                          const isRec = charRecSets.has(s);
                          const setIcon = getSetIcon(s);
                          return (
                            <span key={s} className={`kuro-badge border inline-flex items-center gap-1 ${isRec ? 'bg-orange-500/15 border-orange-500/40 text-orange-300 font-semibold' : 'bg-white/5 border-[var(--border-medium)] text-gray-300'}`}>
                              {setIcon && <img src={setIcon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                              {s}{isRec ? ' ★' : ''}
                            </span>
                          );
                        })}
                      </div>
                      {charRecSets.size > 0 && echoData.sets.some(s => charRecSets.has(s)) && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-orange-400/80">
                          <Star size={8} className="text-orange-400" fill="currentColor" />
                          <span>Recommended set for {charName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Echo Skill Details */}
                  {echoData && (
                    <div>
                      <div className="kuro-section-label">Echo Skill</div>
                      <div className="kuro-detail-box">
                        {echoData.dmg > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-400">Damage:</span>
                            <span className="text-base font-bold text-yellow-400">{echoData.dmg}%</span>
                            {echoData.element && echoData.element !== 'Healing' && (
                              <span className="kuro-badge kuro-badge-neutral">{echoData.element}</span>
                            )}
                          </div>
                        )}
                        {echoData.dmg === 0 && (
                          <div className="text-sm text-gray-500 mb-1">Utility / Healing (no damage)</div>
                        )}
                        <p className="text-sm text-gray-400 leading-relaxed">{echoData.desc}</p>
                      </div>
                    </div>
                  )}

                  {/* Enemy Stats (4-cost bosses only) */}
                  {echoData?.enemyRes && (
                    <div>
                      <div className="kuro-section-label">As Enemy</div>
                      <div className="kuro-detail-box kuro-detail-box--danger">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(echoData.enemyRes).map(([el, val]) => (
                            <span key={el} className="kuro-badge kuro-badge-red">
                              {el.charAt(0).toUpperCase() + el.slice(1)} RES: {val}%
                            </span>
                          ))}
                          <span className="kuro-badge kuro-badge-gray">
                            Other: 10%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Boss echo — can be selected as DPS target</p>
                      </div>
                    </div>
                  )}

                  {/* Main Stat Selection */}
                  <div>
                    <div className="kuro-section-label mb-2">Main Stat {recMainStats.size > 0 && <span className="text-orange-400/70 normal-case">· ★ = recommended</span>}</div>
                    <div className="grid grid-cols-2 gap-1">
                      {mainStatOptions.map(stat => {
                        const isActive = currentMainStat === stat;
                        const isRec = recMainStats.has(stat);
                        return (
                          <button key={stat}
                            className={`px-2 py-1.5 rounded-lg text-base text-left transition-all border ${isRec && !isActive ? 'kuro-shadow-rec-subtle' : ''} ${isActive ? `bg-${costColor}-500/20 border-${costColor}-500/50 text-${costColor}-400 font-semibold` : isRec ? 'border-orange-500/40 bg-orange-500/8 text-orange-300 hover:bg-orange-500/15' : 'border-[var(--border-medium)] text-gray-400 hover:border-white/20 hover:text-gray-200'}`}
                            onClick={() => { updateEchoData({ mainStat: isActive ? null : stat }); haptic.light(); }}
                          >
                            {isRec && !isActive && <span className="text-orange-400 mr-1">★</span>}{stat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub Stats Selection */}
                  <div>
                    <div className="kuro-section-label">Sub Stats <span className="text-gray-600">(select up to 5)</span> {recSubstats.size > 0 && <span className="text-orange-400/70 normal-case">· ★ = recommended</span>}</div>
                    <div className="grid grid-cols-2 gap-1">
                      {substatOptions.map(stat => {
                        const isActive = currentSubstats.includes(stat);
                        const atMax = currentSubstats.length >= 5 && !isActive;
                        const isRec = recSubstats.has(stat);
                        return (
                          <button key={stat}
                            disabled={atMax}
                            className={`px-2 py-1.5 rounded-lg text-base text-left transition-all border ${isActive ? 'bg-white/10 border-white/30 text-white font-medium' : atMax ? 'border-[var(--border-medium)] text-gray-600 cursor-not-allowed' : isRec ? 'border-orange-500/30 bg-orange-500/5 text-orange-300/80 hover:bg-orange-500/10' : 'border-[var(--border-medium)] text-gray-400 hover:border-white/20 hover:text-gray-200'}`}
                            onClick={() => {
                              if (atMax) return;
                              const newSubs = isActive ? currentSubstats.filter(s => s !== stat) : [...currentSubstats, stat];
                              updateEchoData({ substats: newSubs });
                              haptic.light();
                            }}
                          >
                            {isRec && !isActive && <span className="text-orange-400 mr-1">★</span>}{stat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Change echo — open selector
                        setEchoStatPanel(null);
                        setEchoSelectorTarget({ teamIdx, charName, slotIdx });
                        setEchoSearch('');
                        setEchoSelectorOpen(true);
                        haptic.light();
                      }}
                      className="flex-1 py-2 rounded-lg text-base border border-[var(--border-medium)] text-gray-400 hover:text-white hover:border-white/20 transition-all"
                    >
                      Change Echo
                    </button>
                    <button
                      onClick={() => {
                        // Unequip
                        const eqKeyInner = teamIdx + ':' + charName;
                        setTeamEquipment(prev => {
                          const n = { ...prev };
                          const existing = n[eqKeyInner] || { weapon: null, echoes: [null, null, null, null, null] };
                          const newEchoes = [...(existing.echoes || [null, null, null, null, null])];
                          newEchoes[slotIdx] = null;
                          // Re-derive echoSet/echoSet2 from what's actually still equipped — see
                          // the matching fix in the "Unequip echo" selector button above.
                          const allNames = newEchoes.map(e => e?.name).filter(Boolean);
                          const setCounts = {};
                          allNames.forEach(en => { (ECHO_DATA[en]?.sets || []).forEach(s => { setCounts[s] = (setCounts[s] || 0) + 1; }); });
                          const sortedSets = Object.entries(setCounts).sort((a, b) => b[1] - a[1]);
                          const primarySet = sortedSets[0]?.[1] >= 2 ? sortedSets[0][0] : '';
                          const secondarySet = sortedSets[1]?.[1] >= 2 ? sortedSets[1][0] : '';
                          n[eqKeyInner] = { ...existing, echoes: newEchoes, echoSet: primarySet, echoSet2: secondarySet };
                          try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                          return n;
                        });
                        setEchoStatPanel(null);
                        haptic.light();
                      }}
                      className="px-4 py-2 rounded-lg text-base border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Unequip
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </FocusTrapModal>
    </>
  );
}
