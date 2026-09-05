import React, { useMemo } from 'react';
import { Search, Star, Users, X, Heart, Swords, TrendingUp, Target, Flame, Music2, ShieldOff, ShieldAlert } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters.js';
import { getElementColor, getElementShape, getElementIcon, getCombatRoleIcon, getRegionIcon, COMBAT_ROLE_ICONS } from '../../shared/utils/elementVisuals.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { t } from '../../utils/i18n.js';

export default function TeamSelector({
  teamSelectorOpen,
  setTeamSelectorOpen,
  teamSelectorSlot,
  teamSearch,
  setTeamSearch,
  teamElementFilter,
  setTeamElementFilter,
  teamRarityFilter,
  setTeamRarityFilter,
  teamBuffFilter,
  setTeamBuffFilter,
  teamDebuffFilter,
  setTeamDebuffFilter,
  teamDmgFilter,
  setTeamDmgFilter,
  teamRoleFilter,
  setTeamRoleFilter,
  teamCombatRoleFilter,
  setTeamCombatRoleFilter,
  teamRegionFilter,
  setTeamRegionFilter,
  activeTeam,
  filteredChars,
  recommendedNames,
  selectCharacter,
  collectionImages,
  collectionData,
  state,
}) {
  const { getImageFraming } = useImageFramingContext();
  // COMBAT_ROLE_ICONS's own key order IS the wiki's fixed, game-wide Combat Role ordering (see its
  // comment in elementVisuals.js) — sorting by that index instead of alphabetically is what makes
  // this list read as a coherent, curated ordering rather than a shuffled A-Z one.
  const COMBAT_ROLE_ORDER_INDEX = new Map(Object.keys(COMBAT_ROLE_ICONS).map((tag, i) => [tag, i]));
  const allCombatRoleTags = useMemo(() => {
    const tags = new Set();
    Object.values(CHARACTER_DATA).forEach(d => d.combatRoles?.forEach(t => tags.add(t)));
    return [...tags].sort((a, b) => (COMBAT_ROLE_ORDER_INDEX.get(a) ?? 999) - (COMBAT_ROLE_ORDER_INDEX.get(b) ?? 999));
  }, []);
  return (
                  <FocusTrapModal isOpen={teamSelectorOpen} onClose={() => setTeamSelectorOpen(false)} className="" onClick={() => setTeamSelectorOpen(false)} centered padding="p-3">
                      <div
                        className="kuro-card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                          <div>
                            <h3 className="text-white text-xl font-semibold">{t('teams.selector.title')}</h3>
                            <p className="text-gray-500 text-sm">{t('teams.selector.subtitle', { slot: teamSelectorSlot + 1, team: activeTeam.name })}</p>
                          </div>
                          <button onClick={() => setTeamSelectorOpen(false)} className="p-3 min-w-[calc(48px*var(--ui-scale,1))] min-h-[calc(48px*var(--ui-scale,1))] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('teams.selector.closeAria')}>
                            <X size={16} />
                          </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-3 space-y-2 border-b border-[var(--border-subtle)]">
                          <div className="relative">
                            {/* P6-FIX: Use .kuro-input for consistency (F-P6-051) */}
                            <input
                              type="text"
                              value={teamSearch}
                              onChange={(e) => setTeamSearch(e.target.value)}
                              placeholder={t('teams.selector.searchPlaceholder')}
                              className="kuro-input w-full pl-8 text-base"
                              aria-label={t('teams.selector.searchAria')}
                              autoFocus
                            />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <KuroSelect
                              value={teamElementFilter}
                              onChange={setTeamElementFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allElements') },
                                ...['Aero', 'Glacio', 'Electro', 'Fusion', 'Spectro', 'Havoc'].map(el => ({
                                  value: el,
                                  label: <span className="inline-flex items-center gap-1.5"><img src={getElementIcon(el)} alt="" width={14} height={14} className="shrink-0" /> {el}</span>,
                                })),
                              ]}
                              ariaLabel="Filter by element"
                              small
                            />
                            <KuroSelect
                              value={teamRarityFilter}
                              onChange={setTeamRarityFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allRarity') },
                                { value: '5', label: '5★' },
                                { value: '4', label: '4★' },
                              ]}
                              ariaLabel="Filter by rarity"
                              small
                            />
                            <KuroSelect
                              value={teamRoleFilter}
                              onChange={setTeamRoleFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allRoles') },
                                { value: 'Main DPS', label: t('teams.selector.roleMainDps') },
                                { value: 'Sub DPS', label: t('teams.selector.roleSubDps') },
                                { value: 'Support', label: t('teams.selector.roleSupport') },
                                { value: 'Healer', label: t('teams.selector.roleHealer') },
                              ]}
                              ariaLabel="Filter by role"
                              small
                            />
                            <KuroSelect
                              value={teamCombatRoleFilter}
                              onChange={setTeamCombatRoleFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allCombatRoles') },
                                ...allCombatRoleTags.map(tag => ({
                                  value: tag,
                                  label: <span className="inline-flex items-center gap-1.5"><img src={getCombatRoleIcon(tag)} alt="" width={14} height={14} className="shrink-0" /> {tag}</span>,
                                })),
                              ]}
                              ariaLabel="Filter by combat role"
                              small
                            />
                            <KuroSelect
                              value={teamRegionFilter}
                              onChange={setTeamRegionFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allRegions') },
                                ...['Huanglong', 'Rinascita', 'Black Shores', 'Lahai-Roi', 'Night City'].map(r => ({
                                  value: r,
                                  // Night City has no REGION_ICONS entry yet (no sourced emblem) — guard so it
                                  // falls back to text-only instead of rendering a broken <img>.
                                  label: <span className="inline-flex items-center gap-1.5">{getRegionIcon(r) && <img src={getRegionIcon(r)} alt="" width={14} height={14} className="shrink-0" />} {r}</span>,
                                })),
                              ]}
                              ariaLabel="Filter by region"
                              small
                            />
                            <KuroSelect
                              value={teamDmgFilter}
                              onChange={setTeamDmgFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.damageFocus') },
                                ...[
                                  ['Basic ATK', 'Basic Attack Damage'], ['Heavy ATK', 'Heavy Attack Damage'],
                                  ['Skill', 'Resonance Skill Damage'], ['Liberation', 'Resonance Liberation Damage'],
                                  ['Echo', 'Echo Skill Damage'], ['Coordinated ATK', 'Coordinated Attack'],
                                ].map(([val, tag]) => ({
                                  value: val,
                                  label: <span className="inline-flex items-center gap-1.5"><img src={getCombatRoleIcon(tag)} alt="" width={14} height={14} className="shrink-0" /> {val}</span>,
                                })),
                              ]}
                              ariaLabel="Filter by damage focus"
                              small
                            />
                            <KuroSelect
                              value={teamBuffFilter}
                              onChange={setTeamBuffFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allBuffs') },
                                ...[
                                  ['Heal', Heart], ['Coordinated ATK', Swords],
                                  ['ATK Buff', TrendingUp], ['Crit', Target], ['DMG', Flame, 'DMG Buff'],
                                ].map(([val, Icon, text]) => ({
                                  value: val,
                                  label: <span className="inline-flex items-center gap-1.5"><Icon size={14} className="shrink-0" /> {text || val}</span>,
                                })),
                              ]}
                              ariaLabel="Filter by buff type"
                              small
                            />
                            <KuroSelect
                              value={teamDebuffFilter}
                              onChange={setTeamDebuffFilter}
                              options={[
                                { value: 'all', label: t('teams.selector.allDebuffs') },
                                // The 6 elemental debuffs (one per element — Frazzle/Erosion/Chafe/Flare/
                                // Burst/Bane) use their matching ELEMENT_ICONS instead of a generic lucide
                                // icon, both for visual consistency with every other element-tagged filter
                                // in the app and because a plain Flame/Droplets pairing doesn't actually
                                // track each debuff's real element (this list used to only carry Frazzle
                                // and Erosion, silently dropping the other 4 element debuffs entirely).
                                ...[
                                  ['Frazzle', 'Spectro'], ['Erosion', 'Aero'], ['Glacio Chafe', 'Glacio'],
                                  ['Electro Flare', 'Electro'], ['Fusion Burst', 'Fusion'], ['Havoc Bane', 'Havoc'],
                                ].map(([val, element]) => ({
                                  value: val,
                                  label: <span className="inline-flex items-center gap-1.5"><img src={getElementIcon(element)} alt="" width={14} height={14} className="shrink-0" /> {val}</span>,
                                })),
                                ...[
                                  ['Off-Tune', Music2], ['DEF Shred', ShieldOff], ['RES Shred', ShieldAlert],
                                ].map(([val, Icon]) => ({
                                  value: val,
                                  label: <span className="inline-flex items-center gap-1.5"><Icon size={14} className="shrink-0" /> {val}</span>,
                                })),
                              ]}
                              ariaLabel="Filter by debuff type"
                              small
                            />
                          </div>
                          {/* Recommended teammates indicator */}
                          {recommendedNames.size > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-orange-400">
                              <Star size={12} className="text-orange-400" fill="currentColor" />
                              <span>{t('teams.selector.recommendedHint')}</span>
                            </div>
                          )}
                        </div>

                        {/* Character Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                          <div className="grid grid-cols-4 gap-2">
                            {/* recommendedNames is a Map built by sorting all candidates by score
                                descending then taking the top slice -- its insertion order already IS
                                the rank order, so this array's index (not the score itself, which the
                                badge has no room to show) gives each recommended character its
                                1st/2nd/3rd... position for the badge below. */}
                            {(() => { var recommendedOrder = [...recommendedNames.keys()]; return filteredChars.map(name => {
                              const cd = CHARACTER_DATA[name];
                              const img = collectionImages[name] || '';
                              const el = cd?.element;
                              const owned = collectionData.chars5Counts[name] || collectionData.chars4Counts[name];
                              const isInAnotherTeam = state.teams.some((t, ti) =>
                                ti !== state.activeTeamIndex && t.slots.includes(name)
                              );
                              const isRecommended = recommendedNames.has(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => selectCharacter(name)}
                                  className={`relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] active:scale-95 group collection-card ${cd?.rarity === 5 ? 'holo-5star' : ''} ${isRecommended ? 'border-2 border-orange-400 kuro-shadow-rec' : owned ? (cd?.rarity === 5 ? 'border bg-yellow-500/10 border-yellow-500/30 glow-gold' : 'border bg-purple-500/10 border-purple-500/30 glow-purple') : 'border bg-neutral-800/50 border-neutral-700/50'}`}
                                  style={{
                                    height: '96px',
                                    contain: 'paint',
                                    opacity: owned ? 1 : 0.5,
                                  }}
                                >
                                  {img && (() => {
                                    const f = getImageFraming(`collection-${name}`);
                                    return (
                                    <div className="absolute inset-0 collection-img-wrap">
                                    <img
                                      src={img}
                                      alt={name}
                                      className="w-full h-full object-contain pointer-events-none"
                                      style={{
                                        transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
                                        filter: owned ? 'none' : 'grayscale(100%)',
                                      }}
                                      loading="lazy"
                                      onError={hideOnError}
                                    />
                                    </div>
                                    );
                                  })()}
                                  <div className="absolute inset-x-0 bottom-0 h-1/2 kuro-gradient-fade-up" />
                                  {/* Element indicator */}
                                  <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full text-2xs font-bold text-white flex items-center justify-center overflow-hidden"
                                    style={{ background: getElementColor(el) }}>
                                    {getElementIcon(el)
                                      ? <img src={getElementIcon(el)} alt="" className="w-full h-full object-cover" onError={hideOnError} />
                                      : (getElementShape(el) || el?.[0])}
                                  </div>
                                  {/* Rarity */}
                                  <div className="absolute top-1 right-1">
                                    <Star size={8} className={cd?.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} fill="currentColor" />
                                  </div>
                                  {/* In another team */}
                                  {isInAnotherTeam && (
                                    <div className="absolute top-1 left-1 mt-4">
                                      <Users size={8} className="text-cyan-400" />
                                    </div>
                                  )}
                                  {/* Recommended badge — rank number is this candidate's position in
                                      recommendedOrder (highest synergy score = #1), not just a flat tag */}
                                  {isRecommended && (
                                    <div className="absolute top-0.5 right-0.5 z-10">
                                      <span className="text-2xs px-1 py-0.5 rounded font-bold bg-orange-500 text-white kuro-tshadow-badge">★ #{recommendedOrder.indexOf(name) + 1}</span>
                                    </div>
                                  )}
                                  {/* Role tag */}
                                  {cd?.role && (
                                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                                      <span className="text-2xs px-1 py-0.5 rounded bg-black/60 text-gray-300 border border-[var(--border-medium)]">{cd.role}</span>
                                    </div>
                                  )}
                                  {/* Name */}
                                  <div className="absolute bottom-0 inset-x-0 p-1 z-10">
                                    <div className="text-white text-2xs font-medium truncate text-center leading-tight">{name}</div>
                                  </div>
                                </button>
                              );
                            }); })()}
                          </div>
                          {filteredChars.length === 0 && (
                            <div className="text-center py-8">
                              <Search size={24} className="mx-auto mb-2 text-gray-600" />
                              <p className="text-gray-400 text-base">{t('teams.selector.noMatch')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                  </FocusTrapModal>
  );
}
