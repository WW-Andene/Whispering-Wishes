import React, { useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, ChevronDown, Diamond, Download, Sparkles, Sword, Users, X, Zap } from 'lucide-react';

import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_DATA, getEnemyStatsAtLevel } from '../../data/echoes.js';
import { isHealerRole, DMG_FOCUS_ROLE_TAG } from './calcEngine.js';
import { haptic } from '../../utils/haptics.js';
import { getElementColor, getElementBg, getElementBorder, getElementShape, getElementIcon, getSetIcon, getWeaponTypeIcon, getStatIcon, getCombatRoleIcon } from '../../shared/utils/elementVisuals.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';

import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { EchoImage } from '../../shared/components/EchoImage.jsx';
import RotationTimeline from './RotationTimeline.jsx';
import { useSessionState } from '../../hooks/useSessionState.js';
import DPSComparisonCard from './DPSComparisonCard.jsx';
import { computeAutoEquipEntry, computeAutoEquipEntryOptimized, pickBestTeamForEnemy } from './autoEquip.js';
import { RELEASE_ORDER } from '../../data/characters.js';
import { RotationGuideCard } from './RotationGuideCard.jsx';
import { EnemyTargetCard, EnemyTargetModal } from './EnemyTargetSection.jsx';
import { calcTeamStats as calcTeamStatsImpl } from './calcTeamStats.js';
import { renderCharacterCard } from './characterCardRenderer.js';
import { t, formatNumber } from '../../utils/i18n.js';

const DamageCalculator = forwardRef(function DamageCalculator({
  teamEquipment,
  setTeamEquipment,
  state,
  dispatch,
  collectionData,
  collectionImages,
  teamCompareEntries,
  setTeamCompareEntries,
  confirm,
  toast,
  onOpenWeaponSelector,
  onOpenEchoSelector,
  onOpenEchoStatPanel,
  getImageFraming,
  // Enemy target state is owned by TeamsTab (not local here) so the sibling "Team Suggestions"
  // card there can also read the same selected enemy and rank its list against it, instead of
  // that card being structurally unable to ever know which enemy is selected.
  enemyLevel, setEnemyLevel,
  enemyEcho, setEnemyEcho,
  enemyEchoModalOpen, setEnemyEchoModalOpen,
  enemyEchoSearch, setEnemyEchoSearch,
  enemyEchoRankFilter, setEnemyEchoRankFilter,
  enemyEchoSetFilter, setEnemyEchoSetFilter,
  enemyEchoBuffFilter, setEnemyEchoBuffFilter,
}, ref) {
  const [autoTeamPool, setAutoTeamPool] = useState('owned'); // 'owned' | 'any'
  const [autoTeamBusy, setAutoTeamBusy] = useState(false);

  const ownedNames = useMemo(() => new Set([
    ...Object.keys(collectionData?.chars5Counts || {}),
    ...Object.keys(collectionData?.chars4Counts || {}),
  ]), [collectionData]);
  const ownedWeaps = useMemo(() => new Set([
    ...Object.keys(collectionData?.weaps5Counts || {}),
    ...Object.keys(collectionData?.weaps4Counts || {}),
  ]), [collectionData]);

  // ── Reusable calculator with proper WuWa damage formula ──
  // Memoized so it only recalculates when teamEquipment changes.
  const calcTeamStats = useCallback(
    (slots, teamIdx, mainDpsOverride) => calcTeamStatsImpl(slots, teamIdx, mainDpsOverride, teamEquipment, enemyEcho, enemyLevel),
    [teamEquipment, enemyLevel, enemyEcho]
  );

  // Expose calcTeamStats to parent via ref
  useImperativeHandle(ref, () => ({ calcTeamStats }), [calcTeamStats]);

  // Memoize active team stats
  const activeTeamData = state.teams?.[state.activeTeamIndex] || state.teams?.[0] || { name: t('teams.damageCalc.defaultTeamName'), slots: [null, null, null] };
  const activeTeamStats = useMemo(() =>
    calcTeamStats(activeTeamData.slots, state.activeTeamIndex, activeTeamData.mainDpsOverride),
    [calcTeamStats, activeTeamData.slots, state.activeTeamIndex, activeTeamData.mainDpsOverride]
  );

  const [overviewCollapsed, setOverviewCollapsed] = useSessionState('ww-team-overview-collapsed', false);

  const stats = activeTeamStats;

  // Enemy Target — drives enemyDef90/enemyResMap in calcTeamStats above, so it's rendered
  // unconditionally (both with and without a team set) rather than only inside DPSComparisonCard,
  // which is gated behind "+ Compare", or only alongside Team Overview, which needs a team. Shows
  // the boss's real icon and full HP/ATK/DEF/RES card (via MonsterCard, stats stacked below the
  // icon/name row) instead of a bare DEF number. No boss selected falls back to a nameless "no
  // target" state with just the level-formula DEF — there's no "Training Dummy" boss to pick since
  // it isn't an actual enemy.
  const enemyTargetCard = (
    <EnemyTargetCard
      enemyEcho={enemyEcho} setEnemyEcho={setEnemyEcho} enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
      collectionImages={collectionImages}
      setEnemyEchoSearch={setEnemyEchoSearch} setEnemyEchoModalOpen={setEnemyEchoModalOpen}
    />
  );
  const enemyTargetModal = (
    <EnemyTargetModal
      isOpen={enemyEchoModalOpen} onClose={() => setEnemyEchoModalOpen(false)}
      enemyEcho={enemyEcho} setEnemyEcho={setEnemyEcho}
      enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
      collectionImages={collectionImages}
      search={enemyEchoSearch} setSearch={setEnemyEchoSearch}
      rankFilter={enemyEchoRankFilter} setRankFilter={setEnemyEchoRankFilter}
      setFilter={enemyEchoSetFilter} setSetFilter={setEnemyEchoSetFilter}
      buffFilter={enemyEchoBuffFilter} setBuffFilter={setEnemyEchoBuffFilter}
    />
  );

  // Shared by both the empty-team state (build a team from scratch) and the populated Team
  // Overview header -- previously only rendered inside the populated branch below, so "Auto Team"
  // was invisible until the player had already put at least one member in the slots by hand.
  const autoTeamControls = (
    <div className="flex items-center gap-1.5">
      <select
        value={autoTeamPool}
        onClick={e => e.stopPropagation()}
        onChange={e => setAutoTeamPool(e.target.value)}
        className="text-2xs px-1 py-0.5 rounded bg-black/30 border border-[var(--border-medium)] text-gray-300"
        aria-label={t('teams.damageCalc.autoTeamPoolAria')}
        title={t('teams.damageCalc.autoTeamPoolAria')}
      >
        <option value="owned">{t('teams.damageCalc.autoTeamPoolOwned')}</option>
        <option value="any">{t('teams.damageCalc.autoTeamPoolAny')}</option>
      </select>
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Auto Team's whole premise is picking a team suited to a SPECIFIC enemy's per-element
          // RES (that's what pickBestTeamForEnemy actually optimizes for) -- with no enemy selected
          // there's no RES data to differentiate candidates on, so it silently degraded to just
          // re-confirming whichever team already scores highest on the enemy-blind heuristic, no
          // matter which pool/context was chosen. Require a target so the button either does what
          // its own label promises or explains why it didn't run, instead of quietly doing neither.
          if (!enemyEcho) {
            toast?.addToast?.(t('teams.damageCalc.autoTeamNoEnemy'), 'error');
            return;
          }
          setAutoTeamBusy(true);
          // Deferred so the busy state actually paints before the (synchronous, ~30-150ms)
          // search runs — pickBestTeamForEnemy builds and calc's several real candidate
          // teams against the current enemy, it's not instant like a single auto-equip call.
          setTimeout(() => {
            try {
              const pool = autoTeamPool === 'owned' ? [...ownedNames] : RELEASE_ORDER.filter(n => !n.startsWith('Rover:'));
              const best = pickBestTeamForEnemy(pool, ownedWeaps, ownedNames, enemyEcho, enemyLevel, state.activeTeamIndex);
              if (!best) {
                toast?.addToast?.(t('teams.damageCalc.autoTeamNoResult'), 'error');
                return;
              }
              best.members.forEach((name, idx) => {
                dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: idx, character: name });
              });
              dispatch({ type: 'SET_TEAM_MAIN_DPS', teamIndex: state.activeTeamIndex, name: best.mainDps });
              setTeamEquipment(prev => ({ ...prev, ...best.teamEquipment }));
              haptic.success();
            } finally {
              setAutoTeamBusy(false);
            }
          }, 0);
        }}
        disabled={autoTeamBusy}
        className="action-btn flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label={t('teams.damageCalc.autoTeamAria')}
        title={enemyEcho ? t('teams.damageCalc.autoTeamAria') : t('teams.damageCalc.autoTeamNoEnemy')}
      >
        <Users size={12} /> {autoTeamBusy ? t('teams.damageCalc.autoTeamBusy') : t('teams.damageCalc.autoTeam')}
      </button>
    </div>
  );

  if (!stats) return (
    <>
      {enemyTargetCard}
      <Card><CardBody className="text-center py-6">
        <div className="flex justify-center mb-3">{autoTeamControls}</div>
        <Users size={24} className="mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">{t('teams.damageCalc.emptyState')}</p>
      </CardBody></Card>
      {enemyTargetModal}
    </>
  );
  const { members, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, amplify, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, score, soloDps, teamDps, synergyUplift, dmgSources, warnings, memberDps, rotationTimeline, rotTime } = stats;
  const roleColors = { 'Main DPS': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }, 'Sub DPS': { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }, Support: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }, Healer: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' } };

  return (
    <>
      {enemyTargetCard}

      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setOverviewCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOverviewCollapsed(p => !p); } }} aria-expanded={!overviewCollapsed}>
          <CardHeader action={
            <div className="flex items-center gap-1.5">
              {autoTeamControls}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allNames = members.map(mem => mem.name);
                  // Thread a local snapshot across all 3 members instead of dispatching one
                  // setTeamEquipment per member — each member's 4-cost pick needs to be visible to
                  // the NEXT member's collision check (computeAutoEquipEntry avoids re-picking a
                  // teammate's already-equipped unique boss echo), which only works if every member
                  // sees the results of the ones already processed in this same pass.
                  let snapshot = teamEquipment;
                  allNames.forEach(name => {
                    const result = computeAutoEquipEntryOptimized(name, snapshot, state.activeTeamIndex, allNames, activeTeamData.mainDpsOverride, activeTeamData.slots, enemyEcho, enemyLevel);
                    if (result) snapshot = { ...snapshot, [result.aeqKey]: result.entry };
                  });
                  setTeamEquipment(snapshot);
                  haptic.success();
                }}
                disabled={members.length === 0}
                className="action-btn flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label={t('teams.damageCalc.fullAutoBuildAria')}
                title={t('teams.damageCalc.fullAutoBuildAria')}
              >
                <Sparkles size={12} /> {t('teams.damageCalc.fullAutoBuild')}
              </button>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${overviewCollapsed ? '' : 'rotate-180'}`} />
            </div>
          }><Zap size={14} className="text-yellow-400" /> {t('teams.damageCalc.teamOverview')}</CardHeader>
        </div>
        {!overviewCollapsed && (
        <CardBody>
          <div className="space-y-3">
            {/* Per-member: overview + damage breakdown */}
            {members.map((m) => {
              const rarity5 = m.d.rarity === 5;
              const rc = roleColors[m.d.role] || roleColors.Support;
              const isMain = m.name === mainDps.name;
              return (
                <div key={m.name} className="p-3 rounded-lg border hover:border-white/15 transition-colors space-y-2 team-member-card"
                  style={{ background: 'var(--bg-stat)', borderColor: `${getElementColor(m.d.element)}25`, boxShadow: `0 0 12px ${getElementColor(m.d.element)}10`, '--element-glow': `${getElementColor(m.d.element)}30` }}>

                  {/* ── Section 1: Character Header ── */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg overflow-hidden border border-white/15 flex-shrink-0${rarity5 ? ' holo-5star' : ''}`}
                      style={{ background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                      {collectionImages[m.name] ? (
                        <img src={collectionImages[m.name]} alt={m.name} className="w-full h-full object-cover object-top breath-zoom" onError={hideOnError} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">{m.name[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xl font-semibold">{m.name}</span>
                        <span className={`text-sm ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1 mt-1">
                        <span className={`kuro-badge ${rc.bg} ${rc.border} ${rc.text} font-medium`}>{m.d.role}</span>
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3.5 h-3.5 inline-block align-middle mr-0.5" onError={hideOnError} />}
                          {getElementShape(m.d.element)}{getElementShape(m.d.element) ? ' ' : ''}{m.d.element}
                        </span>
                        <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                          {getWeaponTypeIcon(m.d.weapon) && <img src={getWeaponTypeIcon(m.d.weapon)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                          {m.d.weapon}
                        </span>
                      </div>
                    </div>
                    {/* Export Build Card button */}
                    <button
                      className="kuro-btn text-sm px-2 py-1 flex-shrink-0 self-start"
                      aria-label={t('teams.damageCalc.exportCardAria', { name: m.name })}
                      onClick={() => {
                        const eqKeyExp = state.activeTeamIndex + ':' + m.name;
                        const eqExp = teamEquipment[eqKeyExp] || { weapon: null, echoes: [null, null, null, null, null] };
                        renderCharacterCard({ member: m, eq: eqExp, teamIdx: state.activeTeamIndex, collectionImages, getImageFraming, toast })
                          .catch(err => {
                            console.error('Build card export failed:', err);
                            toast?.addToast?.(`Failed to save build card${err?.message ? ': ' + err.message : ''}`, 'error');
                          });
                        haptic.light();
                      }}
                    >
                      <Download size={12} className="inline mr-0.5" />{t('teams.damageCalc.exportCard')}
                    </button>
                    {/* Auto Equip button */}
                    <button
                      className="kuro-btn text-sm px-2 py-1 flex-shrink-0 self-start"
                      aria-label={t('teams.damageCalc.autoEquipAria', { name: m.name })}
                      onClick={() => {
                        const result = computeAutoEquipEntryOptimized(m.name, teamEquipment, state.activeTeamIndex, members.map(mem => mem.name), activeTeamData.mainDpsOverride, activeTeamData.slots, enemyEcho, enemyLevel);
                        if (!result) return;
                        setTeamEquipment(prev => ({ ...prev, [result.aeqKey]: result.entry }));
                        haptic.success();
                      }}
                    >
                      <Zap size={12} className="inline mr-0.5" />{t('teams.damageCalc.autoEquip')}
                    </button>
                    {/* Reset Equipment button */}
                    {(() => {
                      const reqKey = state.activeTeamIndex + ':' + m.name;
                      const hasEquip = teamEquipment[reqKey] && (teamEquipment[reqKey].weapon || (teamEquipment[reqKey].echoes || []).some(e => e));
                      if (!hasEquip) return null;
                      return (
                        <button
                          className="kuro-btn text-sm px-2 py-1 flex-shrink-0 self-start text-gray-500 hover:text-red-400"
                          aria-label={t('teams.damageCalc.resetAria', { name: m.name })}
                          onClick={async () => {
                            if (await confirm?.({ title: t('teams.damageCalc.resetTitle'), message: t('teams.damageCalc.resetMessage', { name: m.name }), confirmLabel: t('teams.damageCalc.resetConfirm'), destructive: true })) {
                              setTeamEquipment(prev => {
                                const n = { ...prev };
                                n[reqKey] = { weapon: null, echoes: [null, null, null, null, null], sequence: prev[reqKey]?.sequence || 0, refinement: 1, echoSet: '', echoSet2: '', echoPreset: 'default' };
                                return n;
                              });
                              haptic.light();
                            }
                          }}
                        >
                          <X size={12} className="inline mr-0.5" />{t('teams.damageCalc.reset')}
                        </button>
                      );
                    })()}
                  </div>

                  {/* ── Section 2: Base Stats ── */}
                  <div>
                    <div className="kuro-label">{t('teams.damageCalc.baseStats')}</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="kuro-badge kuro-badge-neutral">HP {formatNumber(m.d.baseHp || 0)}</span>
                      <span className="kuro-badge kuro-badge-neutral">ATK {m.charAtk}</span>
                      <span className="kuro-badge kuro-badge-neutral">DEF {formatNumber(m.d.baseDef || 0)}</span>
                      <span className="kuro-badge kuro-badge-amber">{t('teams.damageCalc.weaponPrefix', { value: m.weapAtk })}</span>
                    </div>
                  </div>

                  {/* ── Section 3: Equipment & Build ── */}
                  {(() => {
                    const eqKey = state.activeTeamIndex + ':' + m.name;
                    const eq = teamEquipment[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
                    const equippedWeap = eq.weapon ? WEAPON_DATA[eq.weapon] : null;
                    const slotStyle = 'w-12 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all text-center relative overflow-hidden';
                    return (
                      <div className="space-y-2">
                        {/* Equipment grid + Weapon info */}
                        <div>
                          <div className="kuro-label">{t('teams.damageCalc.equipment')}</div>
                          <div className="flex items-start gap-2">
                            <div className="grid grid-cols-3 gap-1 flex-shrink-0">
                              {/* Weapon slot */}
                              <div
                                className={`${slotStyle} ${equippedWeap ? (equippedWeap.rarity === 5 ? 'border-yellow-500/40 bg-yellow-500/8 holo-5star' : 'border-purple-500/40 bg-purple-500/8') : 'border-dashed border-white/15 hover:border-yellow-500/40'}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  onOpenWeaponSelector(state.activeTeamIndex, m.name);
                                  haptic.light();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== 'Enter' && e.key !== ' ') return;
                                  e.preventDefault();
                                  onOpenWeaponSelector(state.activeTeamIndex, m.name);
                                  haptic.light();
                                }}
                                title={eq.weapon || t('teams.damageCalc.selectWeapon')}
                                aria-label={eq.weapon || t('teams.damageCalc.selectWeapon')}
                              >
                                {equippedWeap && collectionImages[eq.weapon] ? (
                                  <img src={collectionImages[eq.weapon]} alt={eq.weapon} className="w-full h-full object-cover rounded-lg" onError={hideOnError} />
                                ) : equippedWeap ? (
                                  <>
                                    <Sword size={14} className={equippedWeap.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} />
                                    <span className="text-sm text-gray-300 truncate w-full px-0.5 leading-tight mt-0.5">{eq.weapon.split(' ').slice(0, 2).join(' ')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Sword size={14} className="text-gray-500" />
                                    <span className="text-sm text-gray-500">{t('teams.damageCalc.weapon')}</span>
                                  </>
                                )}
                              </div>
                              {/* 5 Echo slots */}
                              {[0, 1, 2, 3, 4].map(ei => {
                                const echoEntry = eq.echoes?.[ei];
                                const echoName = typeof echoEntry === 'object' && echoEntry ? echoEntry.name : (typeof echoEntry === 'string' ? echoEntry : null);
                                const echoData = echoName ? ECHO_DATA[echoName] : null;
                                const costLabel = ei === 0 ? '4-cost' : ei < 3 ? '3-cost' : '1-cost';
                                const costNum = ei === 0 ? 4 : ei < 3 ? 3 : 1;
                                const costColor = costNum === 4 ? 'yellow' : costNum === 3 ? 'purple' : 'cyan';
                                return (
                                  <div key={ei}
                                    className={`${slotStyle} ${echoName ? `border-${costColor}-500/40 bg-${costColor}-500/8` : 'border-dashed border-white/15 hover:border-' + costColor + '-500/40'}`}
                                    role="button"
                                    tabIndex={0}
                                    title={echoName || t('teams.damageCalc.selectEcho', { cost: costLabel })}
                                    aria-label={echoName || t('teams.damageCalc.selectEcho', { cost: costLabel })}
                                    onClick={() => {
                                      if (echoName) {
                                        onOpenEchoStatPanel(state.activeTeamIndex, m.name, ei, echoName);
                                      } else {
                                        onOpenEchoSelector(state.activeTeamIndex, m.name, ei);
                                      }
                                      haptic.light();
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key !== 'Enter' && e.key !== ' ') return;
                                      e.preventDefault();
                                      if (echoName) {
                                        onOpenEchoStatPanel(state.activeTeamIndex, m.name, ei, echoName);
                                      } else {
                                        onOpenEchoSelector(state.activeTeamIndex, m.name, ei);
                                      }
                                      haptic.light();
                                    }}
                                  >
                                    {echoName && collectionImages[echoName] ? (
                                      <EchoImage src={collectionImages[echoName]} alt={echoName} className="w-full h-full object-cover rounded-lg" noBgProcess={ECHO_DATA[echoName]?.noBgProcess} />
                                    ) : echoName ? (
                                      <>
                                        <Diamond size={12} className={`text-${costColor}-400`} />
                                        <span className={`text-sm text-${costColor}-400 truncate w-full px-0.5 leading-tight`}>{echoName.split(' ').slice(0, 2).join(' ')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Diamond size={12} className="text-gray-500" />
                                        <span className="text-sm text-gray-500">{costLabel}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Weapon & Echo info beside grid */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              {equippedWeap ? (
                                <div className="text-sm space-y-0.5">
                                  <div className="text-yellow-400/80 font-medium truncate">{eq.weapon}</div>
                                  <div className="text-gray-500">{equippedWeap.stat} {equippedWeap.subStatValue}</div>
                                </div>
                              ) : m.d.bestWeapon ? (
                                <div className="text-sm space-y-0.5">
                                  <div><span className="text-gray-500">{t('teams.damageCalc.recommended')}</span><span className="text-yellow-400/50">{m.d.bestWeapon}</span></div>
                                  {m.d.bestEchoes && <div className="text-cyan-400/50">{m.d.bestEchoes.join(' + ')}</div>}
                                </div>
                              ) : null}
                              {/* Echo summary */}
                              {(() => {
                                const equipped = (eq.echoes || []).filter(e => e != null);
                                if (equipped.length === 0) return null;
                                const echoNames = equipped.map(e => typeof e === 'object' ? e.name : e).filter(Boolean);
                                const setCounts = {};
                                echoNames.forEach(n => {
                                  const ed = ECHO_DATA[n];
                                  if (ed?.sets) ed.sets.forEach(s => { setCounts[s] = (setCounts[s] || 0) + 1; });
                                });
                                const activeSets = Object.entries(setCounts).filter(([, c]) => c >= 2);
                                // All unique sets from equipped echoes (for manual override)
                                const allDetectedSets = [...new Set(echoNames.flatMap(n => ECHO_DATA[n]?.sets || []))];
                                const currentActiveSet = eq.echoSet || (activeSets[0]?.[0] || '');
                                return (
                                  <div className="text-sm mt-1 space-y-0.5">
                                    <div className="text-cyan-400/70">{t('teams.damageCalc.echoCount', { count: equipped.length })}</div>
                                    {activeSets.length > 0 ? activeSets.map(([setName, count]) => {
                                      const isForced = eq.echoSet === setName;
                                      return (
                                        <div key={setName} className={`text-gray-500 inline-flex items-center gap-1 ${allDetectedSets.length > 1 ? 'cursor-pointer hover:text-white' : ''}`}
                                          title={allDetectedSets.length > 1 ? t('teams.damageCalc.setActiveTitle') : ''}
                                          onClick={allDetectedSets.length > 1 ? () => {
                                            const eqk = state.activeTeamIndex + ':' + m.name;
                                            setTeamEquipment(prev => {
                                              const n = { ...prev };
                                              n[eqk] = { ...(n[eqk] || {}), echoSet: setName };
                                              return n;
                                            });
                                            haptic.light();
                                          } : undefined}>
                                          {isForced && <span className="text-emerald-400 mr-0.5">●</span>}
                                          {getSetIcon(setName) && <img src={getSetIcon(setName)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                                          {setName} <span className="text-emerald-400/70">×{count}</span>
                                        </div>
                                      );
                                    }) : allDetectedSets.length > 0 ? (
                                      <div className="text-gray-600 text-2xs">{t('teams.damageCalc.noSetBonus')}</div>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Echo Preset (available for all characters including main DPS) */}
                        {(
                          <div>
                            <div className="kuro-micro-label">{t('teams.damageCalc.echoPreset')}</div>
                            <div className="flex gap-0.5">
                              {[
                                { value: 'default', label: t('teams.damageCalc.presetDefault'), color: 'yellow' },
                                { value: 'er', label: t('teams.damageCalc.presetEr'), color: 'cyan' },
                                { value: 'support', label: t('teams.damageCalc.presetSupport'), color: 'blue' },
                              ].map(opt => {
                                const currentPreset = eq.echoPreset || 'default';
                                const isActive = currentPreset === opt.value;
                                return (
                                  <button key={opt.value}
                                    className={`flex-1 py-1 rounded text-sm font-medium transition-all ${isActive ? `bg-${opt.color}-500/20 border-${opt.color}-500/40 text-${opt.color}-400 border` : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
                                    onClick={() => {
                                      setTeamEquipment(prev => {
                                        const n = { ...prev };
                                        const existing = n[eqKey] || { weapon: null };
                                        const existingEchoes = existing.echoes || [null,null,null,null,null];
                                        // Update mainStats on existing echoes to match new preset, but preserve echo names
                                        const scaling = m.d.statScaling || 'ATK';
                                        const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
                                        const elKey = m.d.element ? m.d.element.charAt(0).toUpperCase() + m.d.element.slice(1).toLowerCase() + ' DMG' : '';
                                        const getPresetStat = (cost) => {
                                          if (opt.value === 'er') return cost >= 3 ? 'Energy Regen' : scalingStat;
                                          if (opt.value === 'support') return cost === 4 ? (isHealerRole(m.d.role) ? 'Healing Bonus' : 'Energy Regen') : cost === 3 ? (elKey || scalingStat) : (scaling === 'HP' ? 'HP%' : scalingStat);
                                          return cost === 4 ? 'Crit Rate' : cost === 3 ? (elKey || scalingStat) : scalingStat;
                                        };
                                        const updatedEchoes = existingEchoes.map((echo, i) => {
                                          if (!echo || !echo.name) return echo;
                                          const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
                                          return { ...echo, mainStat: getPresetStat(cost) };
                                        });
                                        n[eqKey] = { ...existing, echoPreset: opt.value, echoes: updatedEchoes };
                                        return n;
                                      });
                                      haptic.light();
                                    }}
                                  >{opt.label}</button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Advanced: Sequence + Refinement + Sonata (collapsible) */}
                        <details className="group" open>
                          <summary className="kuro-label cursor-pointer hover:text-gray-200 transition-colors select-none !flex !flex-row items-center gap-1 list-none [&::-webkit-details-marker]:hidden" style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
                            <ChevronDown size={12} className="transform group-open:rotate-180 transition-transform flex-shrink-0" />
                            <span>{t('teams.damageCalc.sequenceRefinement')}</span>
                          </summary>
                        <div className="kuro-detail-box mt-1 space-y-2">
                          <div className="flex" role="group" aria-label={t('teams.damageCalc.sequenceRefinementAria', { name: m.name })} style={{ gap: 'var(--card-padding)' }}>
                            <div className="flex-[7] min-w-0 space-y-0.5">
                              <div className="kuro-micro-label">{t('teams.damageCalc.sequence')}</div>
                              <div className="flex gap-0.5" role="radiogroup" aria-label={t('teams.damageCalc.sequenceAria', { name: m.name })}>
                                {[0,1,2,3,4,5,6].map(s => {
                                  const isActive = (eq.sequence || 0) === s;
                                  return (
                                    <button key={s}
                                      role="radio"
                                      aria-checked={isActive}
                                      className={`kuro-chip flex-1 text-2xs ${isActive ? 'active-gold' : ''}`}
                                      onClick={() => {
                                        setTeamEquipment(prev => {
                                          const n = { ...prev };
                                          n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), sequence: s };
                                                    return n;
                                        });
                                        haptic.light();
                                      }}
                                    >S{s}</button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex-[5] min-w-0 space-y-0.5">
                              <div className="kuro-micro-label">{t('teams.damageCalc.refinement')}</div>
                              <div className="flex gap-0.5" role="radiogroup" aria-label={t('teams.damageCalc.refinementAria', { name: m.name })}>
                                {[1,2,3,4,5].map(r => {
                                  const isActive = (eq.refinement || 1) === r;
                                  return (
                                    <button key={r}
                                      role="radio"
                                      aria-checked={isActive}
                                      className={`kuro-chip flex-1 text-2xs ${isActive ? 'active-gold' : ''}`}
                                      onClick={() => {
                                        setTeamEquipment(prev => {
                                          const n = { ...prev };
                                          n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), refinement: r };
                                                    return n;
                                        });
                                        haptic.light();
                                      }}
                                    >R{r}</button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        </details>
                      </div>
                    );
                  })()}

                  {/* ── Section 4: Combat Info ── */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {/* Damage Focus */}
                    <div className="min-w-0">
                      <div className="kuro-label">{t('teams.damageCalc.damageFocus')}</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3.5 h-3.5 inline-block align-middle mr-0.5" onError={hideOnError} />}
                          {getElementShape(m.d.element)}{getElementShape(m.d.element) ? ' ' : ''}{m.d.element} DMG
                        </span>
                        {/* Audited combatRoles is the authoritative, iconed tag source (see
                            CharacterDetailModal) — falls back to plain dmgFocus tags, iconed via
                            the same short-tag→wiki-tag mapping, only for un-audited characters. */}
                        {m.d.combatRoles?.length > 0 ? (
                          m.d.combatRoles.map((tag, ti) => {
                            const icon = getCombatRoleIcon(tag);
                            return (
                              <span key={ti} className="kuro-badge kuro-badge-amber inline-flex items-center gap-1">
                                {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                                {tag}
                              </span>
                            );
                          })
                        ) : (m.d.dmgFocus || []).map((df, di) => {
                          const icon = getCombatRoleIcon(DMG_FOCUS_ROLE_TAG[df]);
                          return (
                            <span key={di} className="kuro-badge kuro-badge-amber inline-flex items-center gap-1">
                              {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                              {df}
                            </span>
                          );
                        })}
                        {m.d.statScaling && (
                          <span className="kuro-badge kuro-badge-violet inline-flex items-center gap-1">
                            {getStatIcon(m.d.statScaling) && <img src={getStatIcon(m.d.statScaling)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                            {t('teams.damageCalc.scaling', { stat: m.d.statScaling })}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Buffs */}
                    {m.d.buffs?.length > 0 && (
                      <div className="min-w-0">
                        <div className="kuro-label">{t('teams.damageCalc.buffs')}</div>
                        <div className="flex flex-wrap gap-1">
                          {m.d.buffs.map((b, bi) => (
                            <span key={bi} className="kuro-badge kuro-badge-emerald">{b}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Debuffs */}
                    {m.d.debuffs?.length > 0 && (
                      <div className="min-w-0">
                        <div className="kuro-label">{t('teams.damageCalc.debuffs')}</div>
                        <div className="flex flex-wrap gap-1">
                          {m.d.debuffs.map((db, di) => (
                            <span key={di} className="kuro-badge kuro-badge-red">{db}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Section 5: Damage Stats (Main DPS only) ── */}
                  {isMain && (
                    <div>
                      <div className="kuro-label" title={t('teams.damageCalc.damageStatsTooltip')}>{t('teams.damageCalc.damageStats')}</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="kuro-badge kuro-badge-yellow">Eff.{mainDps.scaling !== 'ATK' ? mainDps.scaling : 'ATK'} {formatNumber(effAtk)}</span>
                        <span className="kuro-badge kuro-badge-cyan">CR {cr.toFixed(1)}%</span>
                        <span className="kuro-badge kuro-badge-cyan">CD {cd.toFixed(1)}%</span>
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3.5 h-3.5 inline-block align-middle mr-0.5" onError={hideOnError} />}
                          {getElementShape(m.d.element)}{getElementShape(m.d.element) ? ' ' : ''}{m.d.element} +{elemDmg.toFixed(0)}%
                        </span>
                        {skillDmg > 0 && <span className="kuro-badge kuro-badge-amber">Skill +{skillDmg.toFixed(0)}%</span>}
                        {atkPct > 0 && <span className="kuro-badge kuro-badge-emerald">ATK% +{atkPct.toFixed(0)}%</span>}
                        {deepen > 0 && <span className="kuro-badge kuro-badge-purple">Deepen +{deepen.toFixed(0)}%</span>}
                        {defShred > 0 && <span className="kuro-badge kuro-badge-red">DEF Shred {Math.round(defShred)}%</span>}
                        {resShred > 0 && <span className="kuro-badge kuro-badge-red">RES Shred {Math.round(resShred)}%</span>}
                        {defIgnore > 0 && <span className="kuro-badge kuro-badge-red">DEF Ignore {defIgnore}%</span>}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {/* Aggregated buffs/debuffs — values appended to existing tags */}
            {allBuffs.length > 0 && (
              <div>
                <div className="kuro-label">{t('teams.damageCalc.teamBuffs')}</div>
                <div className="flex flex-wrap gap-1">
                  {allBuffs.map((b, i) => (
                    <span key={i} className="kuro-badge kuro-badge-emerald">
                      {b.buff} <span className="text-gray-500">({b.source})</span>
                    </span>
                  ))}
                  {atkPct > 0 && <span className="kuro-badge kuro-badge-emerald">+{atkPct.toFixed(1)}% ATK</span>}
                  {elemDmg > 0 && <span className="kuro-badge kuro-badge-yellow">+{elemDmg.toFixed(1)}% Elem DMG</span>}
                  {skillDmg > 0 && <span className="kuro-badge kuro-badge-amber">+{skillDmg.toFixed(1)}% Skill DMG</span>}
                  {deepen > 0 && <span className="kuro-badge kuro-badge-purple">+{deepen.toFixed(1)}% Deepen</span>}
                  {amplify > 0 && <span className="kuro-badge kuro-badge-pink">+{amplify.toFixed(1)}% Amplify</span>}
                  {cr > 5 && <span className="kuro-badge kuro-badge-cyan">{cr.toFixed(1)}% Crit Rate</span>}
                  {cd > 150 && <span className="kuro-badge kuro-badge-cyan">{cd.toFixed(1)}% Crit DMG</span>}
                </div>
              </div>
            )}
            {(allDebuffs.length > 0 || defShred > 0 || resShred > 0 || defIgnore > 0) && (
              <div>
                <div className="kuro-label">{t('teams.damageCalc.enemyDebuffs')}</div>
                <div className="flex flex-wrap gap-1">
                  {allDebuffs.map((b, i) => (
                    <span key={i} className="kuro-badge kuro-badge-red">
                      {b.debuff} <span className="text-gray-500">({b.source})</span>
                    </span>
                  ))}
                  {defShred > 0 && <span className="kuro-badge kuro-badge-red">-{defShred.toFixed(1)}% DEF Shred</span>}
                  {resShred > 0 && <span className="kuro-badge kuro-badge-red">-{resShred.toFixed(1)}% RES Shred</span>}
                  {defIgnore > 0 && <span className="kuro-badge kuro-badge-red">{defIgnore.toFixed(1)}% DEF Ignore</span>}
                </div>
              </div>
            )}

            {/* DPS Tiers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="kuro-stat kuro-stat-cyan p-2 text-center col-span-2">
                <div className="text-gray-400 text-sm">{t('teams.damageCalc.teamDps')}</div>
                <div className="text-2xl font-bold text-cyan-400 kuro-number kuro-tshadow-glow-cyan">{formatNumber(teamDps)}/s</div>
                <div className="text-gray-500 text-sm">{t('teams.damageCalc.teamDpsDetail')}</div>
              </div>
              {enemyEcho && teamDps > 0 && (() => {
                const targetHp = getEnemyStatsAtLevel(enemyEcho, enemyLevel)?.hp;
                return targetHp > 0 && (
                  <div className="kuro-stat p-2 text-center col-span-2">
                    <div className="text-gray-400 text-sm">{t('teams.damageCalc.timeToKill')}</div>
                    <div className="text-lg font-bold text-white kuro-number">{(targetHp / teamDps).toFixed(1)}s</div>
                    <div className="text-gray-500 text-sm">
                      {t('teams.damageCalc.timeToKillDetail', { enemy: enemyEcho, level: enemyLevel, hp: formatNumber(targetHp) })}
                      {rotTime > 0 && <>{t('teams.damageCalc.rotationCycles', { value: (targetHp / teamDps / rotTime).toFixed(1) })}</>}
                    </div>
                  </div>
                );
              })()}
              <div className="kuro-stat kuro-stat-emerald p-2 text-center">
                <div className="text-gray-400 text-sm">{t('teams.damageCalc.soloDps')}</div>
                <div className="text-lg font-bold text-emerald-400 kuro-number kuro-tshadow-glow-emerald">{formatNumber(soloDps)}/s</div>
                <div className="text-gray-500 text-sm">{t('teams.damageCalc.soloDpsDetail')}</div>
              </div>
              <div className={`kuro-stat ${synergyUplift >= 80 ? 'kuro-stat-emerald' : synergyUplift >= 40 ? 'kuro-stat-gold' : 'kuro-stat-red'} p-2 text-center`}>
                <div className="text-gray-400 text-sm">{t('teams.damageCalc.synergyUplift')}</div>
                <div className={`text-lg font-bold kuro-number ${synergyUplift >= 80 ? 'text-emerald-400 synergy-high' : synergyUplift >= 40 ? 'text-amber-400' : 'text-red-400'}`} style={{ textShadow: `0 0 10px ${synergyUplift >= 80 ? 'rgba(34,197,94,0.5)' : synergyUplift >= 40 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}` }}>+{synergyUplift}%</div>
                <div className="text-gray-500 text-sm">{t('teams.damageCalc.synergyUpliftDetail')}</div>
              </div>
            </div>

            {/* DPS Breakdown per character */}
            {/* Damage Source Breakdown */}
            {dmgSources && (dmgSources.echo > 0 || dmgSources.dot > 0) && (
              <div className="mt-2 p-2 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="text-gray-500 text-sm">{t('teams.damageCalc.damageSources')}</div>
                {[
                  { label: t('teams.damageCalc.sourceRotation'), pct: dmgSources.rotation, color: '#06b6d4' },
                  ...(dmgSources.echo > 0 ? [{ label: t('teams.damageCalc.sourceEcho'), pct: dmgSources.echo, color: '#eab308' }] : []),
                  ...(dmgSources.dot > 0 ? [{ label: t('teams.damageCalc.sourceDot'), pct: dmgSources.dot, color: '#a855f7' }] : []),
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 w-24 truncate font-medium">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full dps-bar" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}30, ${s.color}60)`, boxShadow: `0 0 8px ${s.color}30` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {memberDps && (
              <div className="mt-2 p-2 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="text-gray-500 text-sm mb-1">{t('teams.damageCalc.damageDistribution')}</div>
                {memberDps.map(m => {
                  const mData = members.find(mem => mem.name === m.name);
                  const elColor = mData ? getElementColor(mData.d.element) : '#67e8f9';
                  return (
                    <div key={m.name} className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 w-24 truncate font-medium" title={m.name}>{m.name}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full dps-bar" style={{ width: `${m.pct}%`, background: `linear-gradient(90deg, ${elColor}30, ${elColor}60)`, boxShadow: `0 0 8px ${elColor}30` }} />
                      </div>
                      <span className="text-sm font-medium w-12 text-right" style={{ color: elColor }}>{m.pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {warnings.map((w, i) => (
                  <span key={i} className="kuro-badge kuro-badge-amber flex items-center gap-1 warning-badge">
                    <AlertTriangle size={12} /> {w}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 text-center mt-1">{t('teams.damageCalc.footerNote')}</p>
          </div>
        </CardBody>
        )}
      </Card>

      {/* Rotation Timeline — outside Team Overview Card to avoid overflow:hidden clipping */}
      <RotationTimeline rotationTimeline={rotationTimeline} />
      {members.some(m => (m.seqLevel || 0) > 0) && (
        <p className="text-2xs text-gray-500 -mt-2 px-1">
          {t('teams.damageCalc.resonanceChainNote')}
        </p>
      )}

      <RotationGuideCard rotationTimeline={rotationTimeline} />

      <DPSComparisonCard
        teamCompareEntries={teamCompareEntries} setTeamCompareEntries={setTeamCompareEntries}
        calcTeamStats={calcTeamStats}
        enemyEcho={enemyEcho} enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
        setEnemyEchoSearch={setEnemyEchoSearch} setEnemyEchoModalOpen={setEnemyEchoModalOpen}
        confirm={confirm}
        setTeamEquipment={setTeamEquipment}
      />

      {enemyTargetModal}
    </>
  );
});

export default DamageCalculator;
