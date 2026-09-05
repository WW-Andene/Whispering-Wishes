import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BookmarkPlus, ChevronDown, Crown, Download, FolderOpen, Plus, Share2, Shuffle, Target, Trash2, Upload, Users, X } from 'lucide-react';
import { CHARACTER_DATA, RELEASE_ORDER, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS } from '../../data/characters.js';
import { scoreTeamComposition, isHealerRole, isSupportRole } from './calcEngine.js';
import { getEnemyResMap } from './calcTeamStats.js';
import { haptic } from '../../utils/haptics.js';
import { getElementColor, getElementBg, getElementBorder, getElementShape, getElementIcon } from '../../shared/utils/elementVisuals.js';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import TeamSelector from './TeamSelector.jsx';
import WeaponSelector from './WeaponSelector.jsx';
import EchoSelector from './EchoSelector.jsx';
import DamageCalculator from './DamageCalculator.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { useSessionState } from '../../hooks/useSessionState.js';
import { t, formatNumber } from '../../utils/i18n.js';

function TeamsTab({
  state,
  dispatch,
  collectionImages,
  collectionData,
  toast,
  confirm,
}) {
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useSessionState('ww-team-suggestions-collapsed', false);
  // Lifted up from DamageCalculator so the "Team Suggestions" card below can rank against the same
  // selected enemy the calculator uses, instead of that card being entirely enemy-blind by
  // construction (it previously had no way to even know an enemy had been picked).
  const [enemyLevel, setEnemyLevel] = useState(90);
  const [enemyEcho, setEnemyEcho] = useState('');
  const [enemyEchoModalOpen, setEnemyEchoModalOpen] = useState(false);
  const [enemyEchoSearch, setEnemyEchoSearch] = useState('');
  const [enemyEchoRankFilter, setEnemyEchoRankFilter] = useState('all');
  const [enemyEchoSetFilter, setEnemyEchoSetFilter] = useState('all');
  const [enemyEchoBuffFilter, setEnemyEchoBuffFilter] = useState('all');
  const [saveLoadoutOpen, setSaveLoadoutOpen] = useState(false);
  const [saveLoadoutName, setSaveLoadoutName] = useState('');
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false);
  const [teamSelectorSlot, setTeamSelectorSlot] = useState(0);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamElementFilter, setTeamElementFilter] = useState('all');
  const [teamRarityFilter, setTeamRarityFilter] = useState('all');
  const [teamBuffFilter, setTeamBuffFilter] = useState('all');
  const [teamDebuffFilter, setTeamDebuffFilter] = useState('all');
  const [teamDmgFilter, setTeamDmgFilter] = useState('all');
  const [teamRoleFilter, setTeamRoleFilter] = useState('all');
  const [teamCombatRoleFilter, setTeamCombatRoleFilter] = useState('all');
  const [teamRegionFilter, setTeamRegionFilter] = useState('all');
  const [teamCompareEntries, setTeamCompareEntries] = useState([]);
  const [teamEquipment, setTeamEquipment] = useState(() => {
    try { const s = localStorage.getItem('ww-team-equipment'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [equipPresets, setEquipPresets] = useState(() => {
    try { const s = localStorage.getItem('ww-equipment-presets'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  // Debounced save for teamEquipment — prevents localStorage thrash on rapid interactions
  const eqSaveTimerRef = useRef(null);
  const teamEquipmentRef = useRef(teamEquipment);
  useEffect(() => { teamEquipmentRef.current = teamEquipment; }, [teamEquipment]);
  useEffect(() => {
    if (eqSaveTimerRef.current) clearTimeout(eqSaveTimerRef.current);
    eqSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem('ww-team-equipment', JSON.stringify(teamEquipment)); } catch {}
      eqSaveTimerRef.current = null;
    }, 300);
    return () => { if (eqSaveTimerRef.current) clearTimeout(eqSaveTimerRef.current); };
  }, [teamEquipment]);
  // Flush any still-pending debounced write on true unmount (e.g. switching tabs
  // within the 300ms window) instead of silently dropping it — not every
  // setTeamEquipment call site (Auto Equip / Full Auto Build / Reset Equipment in
  // DamageCalculator.jsx) also writes localStorage synchronously the way the
  // per-slot Weapon/Echo selectors do, so this debounce is their only save path.
  useEffect(() => {
    return () => {
      if (eqSaveTimerRef.current) {
        clearTimeout(eqSaveTimerRef.current);
        try { localStorage.setItem('ww-team-equipment', JSON.stringify(teamEquipmentRef.current)); } catch {}
      }
    };
  }, []);
  useEffect(() => {
    try { localStorage.setItem('ww-equipment-presets', JSON.stringify(equipPresets)); } catch {}
  }, [equipPresets]);
  const [weaponSelectorOpen, setWeaponSelectorOpen] = useState(false);
  const [weaponSelectorTarget, setWeaponSelectorTarget] = useState({ teamIdx: 0, charName: '' });
  const [weaponSearch, setWeaponSearch] = useState('');
  const [echoSelectorOpen, setEchoSelectorOpen] = useState(false);
  const [echoSelectorTarget, setEchoSelectorTarget] = useState({ teamIdx: 0, charName: '', slotIdx: 0 });
  const [echoSearch, setEchoSearch] = useState('');
  const [echoSetFilter, setEchoSetFilter] = useState('all');
  const [echoBuffFilter, setEchoBuffFilter] = useState('all');
  const [echoStatPanel, setEchoStatPanel] = useState(null);
  const [renamingTeamIdx, setRenamingTeamIdx] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const longPressRef = useRef(null);
  const startRename = useCallback((idx, name) => { setRenamingTeamIdx(idx); setRenameValue(name); haptic.medium(); }, []);
  const damageCalcRef = useRef(null);

  // Bumped by the Shuffle button to re-roll which curated teams are displayed (see metaTeams
  // selection below) — Shuffle mixes up the CURATED suggestions list itself, it does not load any
  // team into the active team's slots.
  const [metaShuffleSeed, setMetaShuffleSeed] = useState(0);
  // ── Memoized team suggestions — was previously duplicated verbatim (and drifted) inline in the
  // JSX render body below, recomputed unmemoized on every render; this is now the single source. ──
  const teamSuggestions = useMemo(() => {
    const ownedNames = new Set([
      ...Object.keys(collectionData?.chars5Counts || {}),
      ...Object.keys(collectionData?.chars4Counts || {}),
    ]);
    const ownedWeaps = new Set([
      ...Object.keys(collectionData?.weaps5Counts || {}),
      ...Object.keys(collectionData?.weaps4Counts || {}),
    ]);
    // scoreTeam moved to calcEngine.js as scoreTeamComposition — shared with the character
    // selector's recommendation ranking below so the two can't drift from each other again.
    // dpsOverride threads through to scoreTeamComposition so a candidate team built around an
    // off-role hypercarry pick still gets scored WITH its real DPS-power component instead of
    // silently finding no 'Main DPS'-tagged member and skipping that whole part of the score.
    // enemyResMap folds the selected enemy's per-element RES into the mainDps power term when one
    // is picked (null/no-op otherwise) — this is what makes the whole list re-rank per enemy
    // instead of always surfacing the same generically-strongest teams regardless of the target.
    const enemyResMap = getEnemyResMap(enemyEcho);
    const scoreTeam = (members, dpsOverride) => scoreTeamComposition(members, ownedWeaps, dpsOverride, enemyResMap);

    // ═══ SECTION 1: Build custom teams from YOUR owned characters ═══
    const customTeams = [];
    const ownedArr = [...ownedNames].filter(n => CHARACTER_DATA[n]);
    const ownedMainDps = ownedArr.filter(n => CHARACTER_DATA[n].role === 'Main DPS');
    const ownedSub = ownedArr.filter(n => CHARACTER_DATA[n].role === 'Sub DPS');
    // Realistic/overused hypercarry pool: any Sub DPS with real damage output (totalMult > 0) can
    // also be suggested as the headline carry of its own team — a genuinely common way many Sub DPS
    // characters get played, not just paired off-field with a canonical Main DPS. Kept separate from
    // ownedMainDps so partner-candidate pools below (ownedSub) still exclude whichever one is
    // currently standing in as "the dps" for a given candidate team (see `s !== dps` filters).
    const ownedHypercarry = ownedSub.filter(n => (CHARACTER_DATA[n]?.totalMult || 0) > 0);
    const ownedDps = [...ownedMainDps, ...ownedHypercarry];
    // 'Healer'/'Support' exact-match would silently exclude compound-role characters like Chisa/Suisui
    // ('Support/Healer') from the candidate pool entirely — use substring-aware role helpers instead.
    const ownedHeal = ownedArr.filter(n => isHealerRole(CHARACTER_DATA[n].role) || isSupportRole(CHARACTER_DATA[n].role));
    const customSeen = new Set();
    // For each owned DPS, find best sub + best healer/support
    for (const dps of ownedDps) {
      // Candidate pre-filtering used to run its own hand-rolled "fit" heuristic here — a second,
      // independently-maintained copy of what scoreTeamComposition already does, and one that never
      // received any of that shared engine's fixes (deepen/allDmg off-element gating, echo-set
      // potential, etc.) as they landed. It could pre-select an off-element phantom-synergy candidate
      // into the top-3/top-2 pool ahead of a genuinely better one, even though the FINAL assembled
      // team's score (below, via scoreTeam) was always correct — the bug was in which candidates ever
      // got a chance to be tried. Scoring each hypothetical [dps, candidate] pair through the same
      // scoreTeam the rest of this file uses keeps candidate selection and final scoring permanently
      // in sync instead of two logics that can only drift further apart over time.
      const subCandidates = ownedSub.filter(s => s !== dps)
        .map(sub => ({ name: sub, fit: scoreTeam([dps, sub], dps).score }))
        .sort((a, b) => b.fit - a.fit);
      const healCandidates = ownedHeal.filter(h => h !== dps)
        .map(heal => ({ name: heal, fit: scoreTeam([dps, heal], dps).score }))
        .sort((a, b) => b.fit - a.fit);
      // Build top 2 teams per DPS
      const bestSubs = subCandidates.slice(0, 3);
      const bestHeals = healCandidates.slice(0, 2);
      for (const sub of bestSubs) {
        for (const heal of bestHeals) {
          if (sub.name === heal.name) continue;
          const members = [dps, sub.name, heal.name];
          const key = [...members].sort().join('|');
          if (customSeen.has(key)) continue;
          customSeen.add(key);
          const { score, tags } = scoreTeam(members, dps);
          customTeams.push({ text: members.join(' + '), members, score, tags, ownedCount: 3, allOwned: true, custom: true, dpsOverride: dps });
        }
      }
    }
    customTeams.sort((a, b) => b.score - a.score);

    // ═══ SECTION 2: Curated meta teams (from CHARACTER_DATA.teams) ═══
    // Isolated from the DPS calc engine (2026-09-05, direct user instruction): this list is built
    // entirely from plain data — CHARACTER_DATA.teams' hand-curated strings for which members, and
    // collection ownership for `ownedCount`/`allOwned` — with no call into scoreTeamComposition, so
    // it keeps working independent of that engine. It is therefore unranked (curated-list order,
    // newest character first) and carries no score/tags badges.
    const metaTeams = [];
    const metaSeen = new Set();
    const orderedChars = [...RELEASE_ORDER].reverse();
    for (const name of orderedChars) {
      const d = CHARACTER_DATA[name];
      if (!d?.teams) continue;
      for (const t of d.teams) {
        const members = t.split('+').map(m => m.trim());
        const dedupeKey = [...members].sort().join('|');
        if (metaSeen.has(dedupeKey) || customSeen.has(dedupeKey)) continue;
        metaSeen.add(dedupeKey);
        if (members.length < 2) continue;
        const ownedCount = members.filter(m => ownedNames.has(m)).length;
        metaTeams.push({ text: t, members, ownedCount, allOwned: ownedCount === members.length });
      }
    }
    const metaDisplayCount = customTeams.length > 0 ? 7 : 15;
    // Shuffle re-rolls WHICH curated teams are shown from the full (unranked) pool — there is no
    // "quality" order left to preserve now that this section no longer scores anything.
    let metaDisplay = metaTeams.slice(0, metaDisplayCount);
    if (metaShuffleSeed > 0 && metaTeams.length > metaDisplayCount) {
      const pool = [...metaTeams];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      metaDisplay = pool.slice(0, metaDisplayCount);
    }

    const allSuggestions = [];
    // Show custom teams first (built from your roster), then meta
    if (customTeams.length > 0) {
      allSuggestions.push({ header: t('teams.tab.sectionYourRoster') });
      customTeams.slice(0, 8).forEach(s => allSuggestions.push(s));
    }
    if (metaDisplay.length > 0) {
      allSuggestions.push({ header: t('teams.tab.sectionCurated') });
      metaDisplay.forEach(s => allSuggestions.push(s));
    }
    return allSuggestions;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- metaShuffleSeed is a deliberate re-roll
    // trigger, not a real data dependency; its value is never read, only its identity changing matters.
  }, [collectionData, metaShuffleSeed, enemyEcho]);

  return (
          <div role="tabpanel" id="tabpanel-teams" aria-labelledby="tab-teams" tabIndex="0">
          <TabErrorBoundary tabName={t('tabs.teams')}>
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="teams" />

            {(() => {
              const activeTeam = state.teams[state.activeTeamIndex] || state.teams[0];
              const teamSlots = activeTeam.slots;
              // Shared by the per-suggestion click handler and the Shuffle button below — loads a
              // suggestion's members into the active team's slots. Most suggestions clear any stale
              // headline-DPS override left over from whatever this team used to contain and let
              // auto-detect find the (statically role-tagged) Main DPS as usual. A hypercarry
              // suggestion (an off-role Sub DPS built around as the real carry) instead explicitly
              // sets the crown to that character — auto-detect has no role tag to go on for these and
              // would otherwise just guess the highest totalMult member, which isn't guaranteed to be
              // the one this specific suggestion was actually built and scored around.
              const applySuggestion = (s) => {
                s.members.slice(0, 3).forEach((m, idx) => {
                  dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: idx, character: m });
                });
                dispatch({ type: 'SET_TEAM_MAIN_DPS', teamIndex: state.activeTeamIndex, name: s.dpsOverride || null });
                haptic.success();
              };
              // Re-rolls WHICH curated teams are displayed in the suggestions list (a fresh random
              // sample from the full scored pool) — does NOT touch the active team's slots.
              const shuffleSuggestion = () => {
                setMetaShuffleSeed(s => s + 1);
                haptic.light();
              };
              // The crown is offered whenever more than one member could plausibly be the headline DPS
              // (dmgCapableCount > 1) — NOT gated behind "auto-detect thinks this is ambiguous". That
              // used to require mainDpsCandidateCount !== 1 (a dual/zero-Main-DPS-role heuristic), which
              // meant the button silently never appeared for the vast majority of curated suggestions —
              // almost every curated trio is exactly 1 Main DPS + 1 Sub + 1 Support by construction, so
              // auto-detect always considered them "unambiguous" and hid the override entirely, even
              // though the player might legitimately want to build around a different member than the
              // nominal Main DPS. Always letting the player override (when there's more than one
              // dmg-capable choice) is simpler and matches what was actually being reported as missing.
              const dmgCapableCount = teamSlots.filter(n => n && (CHARACTER_DATA[n]?.totalMult || 0) > 0).length;
              const setTeamMainDps = (name) => {
                dispatch({ type: 'SET_TEAM_MAIN_DPS', teamIndex: state.activeTeamIndex, name: activeTeam.mainDpsOverride === name ? null : name });
                haptic.light();
              };
              const openSelector = (slotIdx) => {
                setTeamSelectorSlot(slotIdx);
                setTeamSearch('');
                setTeamElementFilter('all');
                setTeamRarityFilter('all');
                setTeamBuffFilter('all');
                setTeamDebuffFilter('all');
                setTeamDmgFilter('all');
                setTeamRoleFilter('all');
                setTeamCombatRoleFilter('all');
                setTeamRegionFilter('all');
                setTeamSelectorOpen(true);
                haptic.light();
              };

              const selectCharacter = (name) => {
                dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: teamSelectorSlot, character: name });
                setTeamSelectorOpen(false);
                haptic.success();
              };

              const removeFromSlot = async (slotIdx) => {
                const charName = teamSlots[slotIdx];
                if (await confirm?.({ title: t('teams.tab.removeResonatorTitle'), message: t('teams.tab.removeResonatorMessage', { name: charName || t('teams.tab.thisResonator') }), confirmLabel: t('teams.tab.removeResonatorConfirm'), destructive: true })) {
                  dispatch({ type: 'CLEAR_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: slotIdx });
                  // Clean up orphaned equipment entry to prevent localStorage bloat
                  if (charName) {
                    setTeamEquipment(prev => {
                      const eqKey = state.activeTeamIndex + ':' + charName;
                      if (!prev[eqKey]) return prev;
                      const n = { ...prev };
                      delete n[eqKey];
                      return n;
                    });
                  }
                  haptic.light();
                }
              };

              // All available characters for selection
              const allCharNames = [...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS];

              // Characters already in this team (excluding current slot)
              const usedInTeam = new Set(teamSlots.filter((s, i) => s && i !== teamSelectorSlot));

              // Rover: Spectro/Havoc/Aero/Electro are 4 roster entries for the same in-game unit
              // (Rover freely re-specs attunement, but you only ever own one) — a team can never
              // contain two different Rover attunements at once, so once one is placed, the other
              // three attunements must be excluded from the selector, not just the exact duplicate.
              const usedRoverAttuned = [...usedInTeam].some(n => n.startsWith('Rover:'));

              // ── Character recommendation engine ──
              // Two earlier iterations both relied SOLELY on hand-curated `teams` string lists
              // (each character's own small, illustrative sample of tested comps): first a naive
              // union (recommended Luuk for a Hiyuki+Mornye team because Mornye's own list happens
              // to mention him elsewhere, in an unrelated comp); then a strict "every other placed
              // member must appear in the same curated string" fix, which solved that but could go
              // to ZERO recommendations whenever no single curated trio happened to name every
              // placed character (e.g. Denia+Lynae: neither's list mentions the other, even though
              // both separately name Mornye/Aemeath — a real signal the strict rule couldn't see).
              //
              // The actual fix is structural, not another patch: every character already carries
              // everything scoreTeamComposition needs (element, role, dmgFocus, tier, CHAR_BUFF_
              // TABLE's buffs/debuffs, bestWeapon) — the same engine the Team Suggestions card uses
              // to score whole teams. So instead of asking "did someone write this exact trio down
              // somewhere," score EVERY eligible candidate by actually forming the hypothetical team
              // (already-placed + candidate) and running it through that same synergy math. This
              // always produces a real, ranked answer — never empty, never dependent on curated-data
              // coverage — while curated `teams` convergence (multiple placed members' own lists
              // independently naming the same candidate) is folded in as a meaningful bonus so
              // community-tested pairs still rank above merely mechanically-plausible ones.
              const placedNow = teamSlots.filter(s => s);
              const ownedWeapsForRec = new Set([
                ...Object.keys(collectionData?.weaps5Counts || {}),
                ...Object.keys(collectionData?.weaps4Counts || {}),
              ]);
              const curatedVotes = new Map();
              placedNow.forEach(charInSlot => {
                const d = CHARACTER_DATA[charInSlot];
                if (!d?.teams) return;
                const mentionedByThisMember = new Set();
                d.teams.forEach(teamStr => {
                  teamStr.split('+').map(m => m.trim()).forEach(m => {
                    if (m !== charInSlot && !usedInTeam.has(m)) mentionedByThisMember.add(m);
                  });
                });
                mentionedByThisMember.forEach(m => curatedVotes.set(m, (curatedVotes.get(m) || 0) + 1));
              });
              // Full synergy score for every eligible candidate — drives sort order for the whole list.
              // Fixed 2026-09-01 (found via a per-character/all-pairs recommendation audit): without an
              // explicit crown AND with no role-tagged 'Main DPS' among the already-placed members yet
              // (the common case — a player who just placed a single Sub DPS/support character, e.g.
              // Yinlin, hasn't crowned anyone), scoreTeamComposition's own internal fallback
              // (`roleMainDps = members.find(role === 'Main DPS')`) let any candidate who happens to
              // BE role:'Main DPS' silently become the presumed carry of the hypothetical team for
              // scoring purposes — evaluating "how good would THIS candidate be as the star, with the
              // placed member as their support" instead of "how good is this candidate AS A TEAMMATE
              // for the character the player is actually building around". Every top-tier, off-element
              // Main DPS in the roster (Hiyuki, Aemeath, Sigrika, ...) won this way for nearly any
              // placed Sub DPS/support, regardless of real synergy. Anchor the assumed carry explicitly:
              // the crown if set, else an already-placed role:'Main DPS' member if one exists, else the
              // first character the player actually placed — never let the yet-untested candidate
              // itself claim the role.
              const assumedMainDps = activeTeam.mainDpsOverride
                || placedNow.find(m => CHARACTER_DATA[m]?.role === 'Main DPS')
                || placedNow[0];
              const candidateScores = new Map();
              allCharNames.forEach(name => {
                if (usedInTeam.has(name) || (usedRoverAttuned && name.startsWith('Rover:')) || !CHARACTER_DATA[name]) return;
                const hypotheticalTeam = placedNow.length > 0 ? [...placedNow, name] : [name];
                const { score } = scoreTeamComposition(hypotheticalTeam, ownedWeapsForRec, assumedMainDps);
                candidateScores.set(name, score + (curatedVotes.get(name) || 0) * 20);
              });
              // "Recommended" badge/highlight = top-scoring candidates only — now that every eligible
              // character has a real score, badging literally everyone would make the highlight
              // meaningless, so keep it to a bounded top slice of the ranked list.
              const REC_BADGE_COUNT = 8;
              const recommendedNames = new Map(
                [...candidateScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, REC_BADGE_COUNT)
              );

              // Filter characters for selector
              const filteredChars = allCharNames.filter(name => {
                if (usedInTeam.has(name)) return false;
                if (usedRoverAttuned && name.startsWith('Rover:')) return false;
                if (teamSearch && !name.toLowerCase().includes(teamSearch.toLowerCase())) return false;
                const data = CHARACTER_DATA[name];
                if (!data) return false;
                if (teamElementFilter !== 'all' && data.element !== teamElementFilter) return false;
                if (teamRarityFilter !== 'all' && data.rarity !== Number(teamRarityFilter)) return false;
                if (teamBuffFilter !== 'all' && !(data.buffs || []).some(b => b.includes(teamBuffFilter))) return false;
                if (teamDebuffFilter !== 'all' && !(data.debuffs || []).some(b => b.includes(teamDebuffFilter))) return false;
                if (teamDmgFilter !== 'all' && !(data.dmgFocus || []).includes(teamDmgFilter)) return false;
                if (teamRoleFilter === 'Healer' && !isHealerRole(data.role)) return false;
                if (teamRoleFilter === 'Support' && !isSupportRole(data.role)) return false;
                if ((teamRoleFilter === 'Main DPS' || teamRoleFilter === 'Sub DPS') && data.role !== teamRoleFilter) return false;
                if (teamCombatRoleFilter !== 'all' && !data.combatRoles?.includes(teamCombatRoleFilter)) return false;
                if (teamRegionFilter !== 'all' && data.region !== teamRegionFilter) return false;
                return true;
              }).sort((a, b) => {
                // Higher vote count (more placed members independently recommending them) ranks first.
                const aRec = candidateScores.get(a) || 0;
                const bRec = candidateScores.get(b) || 0;
                if (aRec !== bRec) return bRec - aRec;
                // 5★ before 4★
                const aRar = CHARACTER_DATA[a]?.rarity || 0;
                const bRar = CHARACTER_DATA[b]?.rarity || 0;
                if (aRar !== bRar) return bRar - aRar;
                // Within each group, sort newest first (later in array = newer)
                const aIdx = allCharNames.indexOf(a);
                const bIdx = allCharNames.indexOf(b);
                return bIdx - aIdx;
              });

              // P6-FIX: Element color utilities now imported from appcore-data.js (F-P6-046)

              return (
                <div className="space-y-3">
                  {/* Team Card — selector row + grid + stats all inside one Card */}
                  <Card>
                    <CardHeader action={
                      <div className="flex gap-1 items-center">
                        <button
                          onClick={() => {
                            try {
                              const data = JSON.stringify({ teams: state.teams, activeTeamIndex: state.activeTeamIndex, equipment: teamEquipment }, null, 2);
                              const blob = new Blob([data], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a'); a.href = url; a.download = 'ww-teams.json';
                              document.body.appendChild(a); a.click(); document.body.removeChild(a);
                              setTimeout(() => URL.revokeObjectURL(url), 100);
                              toast?.addToast?.(t('teams.tab.exportSuccess'), 'success');
                            } catch { toast?.addToast?.(t('teams.tab.exportFailed'), 'error'); }
                          }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5 whitespace-nowrap"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.exportAria')}
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
                            input.onchange = (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                try {
                                  const data = JSON.parse(ev.target.result);
                                  if (!data.teams || !Array.isArray(data.teams)) throw new Error(t('teams.tab.invalidFormat'));
                                  if (data.teams.length !== 5) throw new Error(t('teams.tab.expectedTeams', { count: data.teams.length }));
                                  // Issue #102: Validate team structure before importing
                                  for (let i = 0; i < data.teams.length; i++) {
                                    const tm = data.teams[i];
                                    if (!tm || typeof tm !== 'object') throw new Error(t('teams.tab.teamNotObject', { index: i + 1 }));
                                    if (!Array.isArray(tm.slots)) throw new Error(t('teams.tab.teamMissingSlots', { index: i + 1 }));
                                    if (tm.name !== undefined && typeof tm.name !== 'string') throw new Error(t('teams.tab.teamInvalidName', { index: i + 1 }));
                                    for (let j = 0; j < tm.slots.length; j++) {
                                      if (tm.slots[j] !== null && tm.slots[j] !== '' && typeof tm.slots[j] !== 'string') {
                                        throw new Error(t('teams.tab.slotInvalidValue', { team: i + 1, slot: j + 1 }));
                                      }
                                    }
                                  }
                                  dispatch({ type: 'IMPORT_TEAMS', teams: data.teams, activeTeamIndex: data.activeTeamIndex });
                                  if (data.equipment && typeof data.equipment === 'object') {
                                    setTeamEquipment(data.equipment);
                                    try { localStorage.setItem('ww-team-equipment', JSON.stringify(data.equipment)); } catch {}
                                  }
                                  toast?.addToast?.(t('teams.tab.importSuccess'), 'success');
                                } catch (err) { toast?.addToast?.(t('teams.tab.invalidFile', { message: err.message }), 'error'); }
                              };
                              reader.readAsText(file);
                            };
                            input.click();
                          }}
                          className="kuro-btn kuro-btn-sm kuro-btn-primary text-sm px-2 py-1.5 whitespace-nowrap"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.importAria')}
                        >
                          <Upload size={12} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const team = state.teams[state.activeTeamIndex] || state.teams[0];
                              const slots = team.slots;
                              if (!slots.some(s => s)) return;
                              const stats = damageCalcRef.current?.calcTeamStats?.(slots, state.activeTeamIndex, team.mainDpsOverride);
                              const charParts = slots.filter(s => s).map(name => {
                                const eqKey = state.activeTeamIndex + ':' + name;
                                const eq = teamEquipment[eqKey];
                                const d = CHARACTER_DATA[name];
                                const weapName = (eq?.weapon) || d?.bestWeapon || 'None';
                                return `${name} (${weapName})`;
                              });
                              const lines = [t('teams.tab.shareLabel', { name: team.name || t('teams.tab.defaultTeamName', { index: state.activeTeamIndex + 1 }) })];
                              lines.push(charParts.join(' | '));
                              if (stats) {
                                lines.push(t('teams.tab.shareStats', { raw: formatNumber(stats.rawDps), full: formatNumber(stats.realDps), perfect: formatNumber(stats.perfectDps) }));
                              }
                              const text = lines.join('\n');
                              await navigator.clipboard.writeText(text);
                              toast?.addToast?.(t('teams.tab.copySuccess'), 'success');
                              haptic.light();
                            } catch { toast?.addToast?.(t('teams.tab.shareFailed'), 'error'); }
                          }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5 whitespace-nowrap"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.copyAria')}
                        >
                          <Share2 size={12} />
                        </button>
                        <button
                          onClick={() => {
                            const slots = (state.teams[state.activeTeamIndex] || state.teams[0]).slots;
                            if (!slots.some(s => s)) return;
                            if (teamCompareEntries.length >= 5) return;
                            // H1-01: fallback for browsers without structuredClone (Safari <15.4)
                            const clonedSlots = typeof structuredClone === 'function' ? structuredClone(slots) : JSON.parse(JSON.stringify(slots));
                            const id = Date.now();
                            // Snapshot equipment under a synthetic ('cmp<id>') team index rather than
                            // reusing state.activeTeamIndex. calcTeamStats looks up gear by `teamIdx + ':' +
                            // name`, so a saved comparison entry that kept the real teamIdx would silently
                            // pick up any later weapon/echo edits made to that same team slot — retroactively
                            // changing a snapshot that's supposed to be frozen at "+ Compare" time.
                            const cmpIdx = 'cmp' + id;
                            setTeamEquipment(prev => {
                              const next = { ...prev };
                              clonedSlots.filter(Boolean).forEach(name => {
                                const srcKey = state.activeTeamIndex + ':' + name;
                                if (prev[srcKey]) {
                                  next[cmpIdx + ':' + name] = typeof structuredClone === 'function' ? structuredClone(prev[srcKey]) : JSON.parse(JSON.stringify(prev[srcKey]));
                                }
                              });
                              return next;
                            });
                            setTeamCompareEntries(prev => [...prev, { id, slots: clonedSlots, teamIdx: cmpIdx }]);
                            haptic.success();
                          }}
                          disabled={teamCompareEntries.length >= 5 || !(state.teams[state.activeTeamIndex] || state.teams[0]).slots.some(s => s)}
                          title={teamCompareEntries.length >= 5 ? t('teams.tab.compareMax') : !(state.teams[state.activeTeamIndex] || state.teams[0]).slots.some(s => s) ? t('teams.tab.compareNeedChars') : t('teams.tab.compareAdd')}
                          className="kuro-btn kuro-btn-sm kuro-btn-primary active-gold text-sm px-2 py-1.5 whitespace-nowrap"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.compareAria')}
                        >
                          {t('teams.tab.compareLabel')}
                        </button>
                        <button
                          onClick={() => {
                            setSaveLoadoutName(t('teams.tab.saveDefaultName', { name: activeTeam.name || t('teams.tab.defaultTeamName', { index: state.activeTeamIndex + 1 }) }));
                            setSaveLoadoutOpen(true);
                          }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.saveAria')}
                          title={t('teams.tab.saveTitle')}
                        >
                          <BookmarkPlus size={12} />
                        </button>
                        <button
                          onClick={() => setShowPresetDropdown(prev => !prev)}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.loadAria')}
                          aria-expanded={showPresetDropdown}
                          title={t('teams.tab.loadTitle')}
                        >
                          <FolderOpen size={12} />
                        </button>
                        <button
                          onClick={async () => { if (await confirm?.({ title: t('teams.tab.clearTeamTitle'), message: t('teams.tab.clearTeamMessage'), confirmLabel: t('teams.tab.clearTeamConfirm'), destructive: true })) {
                            dispatch({ type: 'CLEAR_TEAM', teamIndex: state.activeTeamIndex });
                            // Clean up orphaned equipment entries for every cleared member — CLEAR_TEAM
                            // wipes all slots at once, so this must sweep all of them (single-slot
                            // removeFromSlot only ever cleaned up its own one entry).
                            const clearedNames = teamSlots.filter(Boolean);
                            if (clearedNames.length) {
                              setTeamEquipment(prev => {
                                const n = { ...prev };
                                let changed = false;
                                clearedNames.forEach(charName => {
                                  const eqKey = state.activeTeamIndex + ':' + charName;
                                  if (n[eqKey]) { delete n[eqKey]; changed = true; }
                                });
                                return changed ? n : prev;
                              });
                            }
                            haptic.medium();
                          } }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5 whitespace-nowrap"
                          style={{ paddingLeft: 8, paddingRight: 8 }}
                          aria-label={t('teams.tab.clearAllSlotsAria')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    }>
                      <Users size={14} className="text-yellow-400" /> {t('teams.tab.teamBuilder')}
                    </CardHeader>
                    <CardBody>
                      {/* Team Selector Tabs — P6-FIX: ARIA tab pattern (F-P6-059) */}
                      <div className="flex gap-1 mb-3" role="tablist" aria-label={t('teams.tab.teamSelectorAria')} onKeyDown={(e) => {
                        const idx = state.activeTeamIndex;
                        let next;
                        if (e.key === 'ArrowRight') { e.preventDefault(); next = (idx + 1) % state.teams.length; }
                        else if (e.key === 'ArrowLeft') { e.preventDefault(); next = (idx - 1 + state.teams.length) % state.teams.length; }
                        if (next !== undefined) { dispatch({ type: 'SET_ACTIVE_TEAM', index: next }); setTimeout(() => e.currentTarget.children[next]?.focus(), 50); }
                      }}>
                        {state.teams.map((team, idx) => {
                          const hasChars = team.slots.some(s => s);
                          const isActive = state.activeTeamIndex === idx;
                          const isRenaming = renamingTeamIdx === idx;
                          if (isRenaming) {
                            return (
                              <input
                                key={`rename-${idx}`}
                                type="text"
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value.slice(0, 20))}
                                onBlur={() => { dispatch({ type: 'RENAME_TEAM', teamIndex: idx, name: renameValue }); setRenamingTeamIdx(null); }}
                                onKeyDown={e => { if (e.key === 'Enter') { e.target.blur(); } else if (e.key === 'Escape') { setRenamingTeamIdx(null); } }}
                                className="kuro-input flex-1 min-w-0 text-center text-base py-1.5"
                                maxLength={20}
                                autoFocus
                                aria-label={t('teams.tab.renameTeamAria', { index: idx + 1 })}
                              />
                            );
                          }
                          return (
                            <button
                              key={idx}
                              role="tab"
                              aria-selected={isActive}
                              tabIndex={isActive ? 0 : -1}
                              onClick={() => { dispatch({ type: 'SET_ACTIVE_TEAM', index: idx }); haptic.light(); }}
                              onDoubleClick={() => { if (isActive) startRename(idx, team.name); }}
                              onTouchStart={() => { if (isActive) longPressRef.current = setTimeout(() => startRename(idx, team.name), 500); }}
                              onTouchEnd={() => { clearTimeout(longPressRef.current); }}
                              onTouchMove={() => { clearTimeout(longPressRef.current); }}
                              className={`kuro-btn flex-1 min-w-0 flex items-center justify-center gap-1 ${
                                isActive ? 'active-gold' : ''
                              }`}
                            >
                              <span className="truncate">{team.name}</span>
                              {hasChars && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 flex-shrink-0" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Loadout preset dropdown (triggered from header Load icon) */}
                      {showPresetDropdown && (
                        <div className="relative mb-3">
                          <div className="absolute top-0 right-0 z-50 min-w-[calc(192px*var(--ui-scale,1))] rounded-lg border border-[var(--border-medium)] bg-[var(--bg-card)] shadow-xl overflow-hidden">
                            {equipPresets.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">{t('teams.tab.noSavedLoadouts')}</div>
                            ) : (
                              equipPresets.map((preset, i) => (
                                <div key={i} className="flex items-center border-b border-[var(--border-medium)] last:border-b-0">
                                  <button onClick={() => { setTeamEquipment(preset.equipment); try { localStorage.setItem('ww-team-equipment', JSON.stringify(preset.equipment)); } catch {} if (preset.teams?.[0]?.slots) { preset.teams.forEach((tm, ti) => { if (tm.slots) tm.slots.forEach((char, si) => { dispatch({ type: 'SET_TEAM_SLOT', teamIndex: ti, slotIndex: si, character: char }); }); }); } setShowPresetDropdown(false); toast?.addToast?.(t('teams.tab.loadoutLoaded', { name: preset.name }), 'success'); haptic.success(); }} className="flex-1 text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors">{preset.name}</button>
                                  <button onClick={(e) => { e.stopPropagation(); setEquipPresets(prev => prev.filter((_, idx) => idx !== i)); toast?.addToast?.(t('teams.tab.loadoutDeleted', { name: preset.name }), 'success'); }} className="px-2 py-2 text-gray-500 hover:text-red-400 transition-colors" aria-label={t('teams.tab.deleteLoadoutAria', { name: preset.name })}><X size={12} /></button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* Character Cards Grid — E2-FP2: hero treatment for active team */}
                      <div className="grid grid-cols-3 gap-2 p-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 kuro-shadow-glow-gold">
                        {!teamSlots.some(s => s) && (
                          <div className="col-span-3 text-center py-4">
                            <div className="text-gray-400 text-md mb-1">{t('teams.tab.noCharsAssigned')}</div>
                            <p className="text-gray-600 text-sm">{t('teams.tab.tapEmptySlot')}</p>
                          </div>
                        )}
                        {teamSlots.map((charName, slotIdx) => {
                          const charData = charName ? CHARACTER_DATA[charName] : null;
                          const imgUrl = charName ? (collectionImages[charName] || '') : '';
                          const teamKey = `team-${charName}`;
                          const framing = charName ? (getImageFraming(teamKey) || { x: 0, y: 0, zoom: 100 }) : { x: 0, y: 0, zoom: 100 };

                          if (!charName) {
                            return (
                              <button
                                key={slotIdx}
                                onClick={() => openSelector(slotIdx)}
                                className="relative overflow-hidden border-2 border-dashed rounded-lg border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all flex flex-col items-center justify-center gap-1.5 group"
                                style={{ height: '160px', contain: 'paint' }}
                                aria-label={t('teams.tab.addSlotAria', { slot: slotIdx + 1 })}
                              >
                                <Plus size={24} className="text-yellow-500/50 group-hover:text-yellow-400 transition-colors" />
                                <span className="text-sm text-yellow-500/40 group-hover:text-yellow-400 font-medium transition-colors">{t('teams.tab.addResonator')}</span>
                              </button>
                            );
                          }

                          const rarity5 = charData?.rarity === 5;
                          return (
                            <div
                              key={slotIdx}
                              className={`relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer group ${framingMode && editingImage === teamKey ? 'border-emerald-500 ring-2 ring-emerald-500/50' : rarity5 ? 'bg-yellow-500/10 border-yellow-500/30 holo-5star' : 'bg-purple-500/10 border-purple-500/30'}`}
                              style={{ height: '160px', contain: 'paint' }}
                              role="button"
                              tabIndex={0}
                              aria-label={t('teams.tab.changeSlotAria', { name: charName, slot: slotIdx + 1 })}
                              onClick={() => {
                                if (framingMode) {
                                  setEditingImage(teamKey);
                                } else {
                                  openSelector(slotIdx);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter' && e.key !== ' ') return;
                                e.preventDefault();
                                if (framingMode) {
                                  setEditingImage(teamKey);
                                } else {
                                  openSelector(slotIdx);
                                }
                              }}
                            >
                              {framingMode && editingImage === teamKey && (
                                <div className="absolute top-1 left-1 z-20 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-black text-sm">✓</span>
                                </div>
                              )}
                              {imgUrl && (
                                <div className="absolute inset-0 breath-zoom">
                                <img
                                  src={imgUrl}
                                  alt={charName}
                                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                  style={{
                                    transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
                                  }}
                                  loading="lazy"
                                  onError={hideOnError}
                                />
                                </div>
                              )}
                              {/* P6-FIX: Increased from w-6 h-6 to w-[calc(28px*var(--ui-scale,1))] h-[calc(28px*var(--ui-scale,1))] for touch targets (F-P6-050) */}
                              {!framingMode && <button
                                onClick={(e) => { e.stopPropagation(); removeFromSlot(slotIdx); }}
                                className="action-btn absolute top-1 right-1 z-20 w-[calc(28px*var(--ui-scale,1))] h-[calc(28px*var(--ui-scale,1))] aspect-square p-0 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 btn-icon-square"
                                aria-label={t('teams.tab.removeSlotAria', { name: charName, slot: slotIdx + 1 })}
                              >
                                <X size={12} />
                              </button>}
                              {!framingMode && dmgCapableCount > 1 && (charData?.totalMult || 0) > 0 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setTeamMainDps(charName); }}
                                  className={`action-btn absolute top-1 left-1 z-20 w-[calc(28px*var(--ui-scale,1))] h-[calc(28px*var(--ui-scale,1))] aspect-square p-0 rounded-lg flex items-center justify-center btn-icon-square transition-all ${activeTeam.mainDpsOverride === charName ? 'bg-yellow-500 text-black opacity-100' : 'bg-black/60 text-yellow-400/70 opacity-60 hover:opacity-100'}`}
                                  aria-label={activeTeam.mainDpsOverride === charName ? t('teams.tab.headlineDpsClearAria', { name: charName }) : t('teams.tab.headlineDpsSetAria', { name: charName })}
                                  title={activeTeam.mainDpsOverride === charName ? t('teams.tab.headlineDpsClearTitle') : t('teams.tab.headlineDpsSetTitle')}
                                >
                                  <Crown size={12} fill={activeTeam.mainDpsOverride === charName ? 'currentColor' : 'none'} />
                                </button>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 z-10 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none kuro-tshadow-deep">
                                <div className={`${rarity5 ? 'text-yellow-400' : 'text-purple-400'} text-2xs`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                                <div className="text-sm truncate text-gray-200">{charName}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Team Elements Summary */}
                      {teamSlots.some(s => s) && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {teamSlots.filter(s => s).map((name, i) => {
                            const d = CHARACTER_DATA[name];
                            return d ? (
                              <div key={i} className="kuro-badge font-medium inline-flex items-center gap-1"
                                style={{ color: getElementColor(d.element), background: getElementBg(d.element), border: `1px solid ${getElementBorder(d.element)}` }}>
                                {getElementIcon(d.element) && <img src={getElementIcon(d.element)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                                {getElementShape(d.element)}{getElementShape(d.element) ? ' ' : ''}{d.element}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                    </CardBody>
                  </Card>

                  {/* Team Overview + Damage Analysis */}
                  <DamageCalculator
                    ref={damageCalcRef}
                    teamEquipment={teamEquipment}
                    setTeamEquipment={setTeamEquipment}
                    state={state}
                    dispatch={dispatch}
                    collectionData={collectionData}
                    collectionImages={collectionImages}
                    teamCompareEntries={teamCompareEntries}
                    setTeamCompareEntries={setTeamCompareEntries}
                    confirm={confirm}
                    toast={toast}
                    onOpenWeaponSelector={(teamIdx, charName) => {
                      setWeaponSelectorTarget({ teamIdx, charName });
                      setWeaponSearch('');
                      setWeaponSelectorOpen(true);
                    }}
                    onOpenEchoSelector={(teamIdx, charName, slotIdx) => {
                      setEchoSelectorTarget({ teamIdx, charName, slotIdx });
                      setEchoSearch('');
                      setEchoSelectorOpen(true);
                    }}
                    onOpenEchoStatPanel={(teamIdx, charName, slotIdx, echoName) => {
                      setEchoStatPanel({ teamIdx, charName, slotIdx, echoName });
                    }}
                    getImageFraming={getImageFraming}
                    enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
                    enemyEcho={enemyEcho} setEnemyEcho={setEnemyEcho}
                    enemyEchoModalOpen={enemyEchoModalOpen} setEnemyEchoModalOpen={setEnemyEchoModalOpen}
                    enemyEchoSearch={enemyEchoSearch} setEnemyEchoSearch={setEnemyEchoSearch}
                    enemyEchoRankFilter={enemyEchoRankFilter} setEnemyEchoRankFilter={setEnemyEchoRankFilter}
                    enemyEchoSetFilter={enemyEchoSetFilter} setEnemyEchoSetFilter={setEnemyEchoSetFilter}
                    enemyEchoBuffFilter={enemyEchoBuffFilter} setEnemyEchoBuffFilter={setEnemyEchoBuffFilter}
                  />

                  {/* Suggested Teams from Character Data — collapsible */}
                  <Card>
                    <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setSuggestionsCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSuggestionsCollapsed(p => !p); } }} aria-expanded={!suggestionsCollapsed}>
                      <CardHeader action={
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); shuffleSuggestion(); }}
                            disabled={!teamSuggestions.some(s => s.header === t('teams.tab.sectionCurated'))}
                            className="action-btn flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            aria-label={t('teams.tab.shuffleAria')}
                            title={t('teams.tab.shuffleAria')}
                          >
                            <Shuffle size={12} /> {t('teams.tab.shuffle')}
                          </button>
                          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${suggestionsCollapsed ? '' : 'rotate-180'}`} />
                        </div>
                      }><Target size={14} className="text-cyan-400" /> {t('teams.tab.teamSuggestions')}</CardHeader>
                    </div>
                    {!suggestionsCollapsed && (
                    <CardBody>
                      <div className="space-y-2 team-suggestions-grid">
                        {(() => {
                          if (teamSuggestions.length === 0) {
                            return <p className="text-gray-500 text-sm text-center py-2">{t('teams.tab.noSuggestions')}</p>;
                          }
                          return teamSuggestions.map((s, i) => {
                            if (s.header) return <div key={`h${i}`} className="text-xs text-gray-500 uppercase tracking-wider font-medium pt-2 pb-2 flex items-center gap-2"><span className="h-px flex-1 bg-white/5" />{s.header}<span className="h-px flex-1 bg-white/5" /></div>;
                            return (
                            <button
                              key={i}
                              onClick={() => applySuggestion(s)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border-medium)] hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all text-left"
                              style={{ background: 'var(--bg-stat)' }}
                            >
                              <div className="flex gap-1 flex-shrink-0">
                                {s.members.slice(0, 3).map((m, j) => {
                                  const cd = CHARACTER_DATA[m];
                                  const sf = getImageFraming(`collection-${m}`) || { x: 0, y: 0, zoom: 100 };
                                  return (
                                    <div key={j} className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative${cd?.rarity === 5 ? ' holo-5star' : ''}`}
                                      style={{ background: cd ? getElementBg(cd.element) : 'rgba(255,255,255,0.1)', contain: 'paint', border: cd ? `1px solid ${getElementColor(cd.element)}50` : '1px solid rgba(255,255,255,0.15)', boxShadow: cd ? `0 0 8px ${getElementColor(cd.element)}30` : 'none' }}>
                                      {collectionImages[m] ? (
                                        <div className="absolute inset-0 breath-zoom"><img src={collectionImages[m]} alt={m} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${sf.zoom / 100}) translate(${-sf.x}%, ${-sf.y}%)` }} onError={hideOnError} /></div>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 font-medium">{m[0]}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-300 truncate">{s.text}</div>
                                <div className="flex gap-1 mt-0.5 flex-wrap">
                                  {s.members.slice(0, 3).map((m, j) => {
                                    const role = CHARACTER_DATA[m]?.role;
                                    const rc = role === 'Main DPS' ? 'text-red-400' : role === 'Sub DPS' ? 'text-orange-400' : isHealerRole(role) ? 'text-emerald-400' : 'text-blue-400';
                                    return <span key={j} className={`text-2xs ${rc}`}>{role || '?'}</span>;
                                  })}
                                  {s.tags?.map((tag, j) => (
                                    <span key={`t${j}`} className={`text-2xs px-1 rounded ${tag === 'Meta' ? 'text-yellow-400 bg-yellow-500/10' : tag === 'Strong' ? 'text-orange-400 bg-orange-500/10' : tag === 'Balanced' ? 'text-emerald-400 bg-emerald-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}>{tag}</span>
                                  ))}
                                </div>
                              </div>
                              {s.allOwned ? (
                                <span className="kuro-badge kuro-badge-emerald flex-shrink-0 text-2xs">{t('teams.tab.ready')}</span>
                              ) : (
                                <span className="text-2xs text-gray-500 flex-shrink-0">{s.ownedCount}/{s.members.length}</span>
                              )}
                            </button>
                          );
                          });
                        })()}
                      </div>
                    </CardBody>
                    )}
                  </Card>

                  {/* Character Selector Modal */}
                  <TeamSelector
                    teamSelectorOpen={teamSelectorOpen}
                    setTeamSelectorOpen={setTeamSelectorOpen}
                    teamSelectorSlot={teamSelectorSlot}
                    teamSearch={teamSearch}
                    setTeamSearch={setTeamSearch}
                    teamElementFilter={teamElementFilter}
                    setTeamElementFilter={setTeamElementFilter}
                    teamRarityFilter={teamRarityFilter}
                    setTeamRarityFilter={setTeamRarityFilter}
                    teamBuffFilter={teamBuffFilter}
                    setTeamBuffFilter={setTeamBuffFilter}
                    teamDebuffFilter={teamDebuffFilter}
                    setTeamDebuffFilter={setTeamDebuffFilter}
                    teamDmgFilter={teamDmgFilter}
                    setTeamDmgFilter={setTeamDmgFilter}
                    teamRoleFilter={teamRoleFilter}
                    setTeamRoleFilter={setTeamRoleFilter}
                    teamCombatRoleFilter={teamCombatRoleFilter}
                    setTeamCombatRoleFilter={setTeamCombatRoleFilter}
                    teamRegionFilter={teamRegionFilter}
                    setTeamRegionFilter={setTeamRegionFilter}
                    activeTeam={activeTeam}
                    filteredChars={filteredChars}
                    recommendedNames={recommendedNames}
                    selectCharacter={selectCharacter}
                    collectionImages={collectionImages}
                    collectionData={collectionData}
                    state={state}
                  />

                  {/* Save Loadout Modal */}
                  <FocusTrapModal isOpen={saveLoadoutOpen} onClose={() => setSaveLoadoutOpen(false)} className="" onClick={() => setSaveLoadoutOpen(false)} centered padding="p-3" ariaLabel={t('teams.tab.saveTitle')}>
                    <div className="kuro-card w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                        <h3 className="text-white font-semibold text-lg">{t('teams.tab.saveTitle')}</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        <label className="block text-gray-400 text-sm">{t('teams.tab.savePrompt')}</label>
                        <input
                          type="text"
                          className="kuro-input w-full text-base"
                          value={saveLoadoutName}
                          onChange={(e) => setSaveLoadoutName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter' || !saveLoadoutName.trim()) return;
                            const name = saveLoadoutName.trim();
                            const preset = { name, teams: state.teams.map(tm => ({ name: tm.name, slots: [...tm.slots] })), equipment: { ...teamEquipment } };
                            setEquipPresets(prev => [...prev.filter(p => p.name !== name), preset]);
                            toast?.addToast?.(t('teams.tab.saveSuccess', { name }), 'success');
                            haptic.success();
                            setSaveLoadoutOpen(false);
                          }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setSaveLoadoutOpen(false)} className="kuro-btn flex-1 text-sm">{t('teams.tab.saveCancel')}</button>
                          <button
                            onClick={() => {
                              if (!saveLoadoutName.trim()) return;
                              const name = saveLoadoutName.trim();
                              const preset = { name, teams: state.teams.map(tm => ({ name: tm.name, slots: [...tm.slots] })), equipment: { ...teamEquipment } };
                              setEquipPresets(prev => [...prev.filter(p => p.name !== name), preset]);
                              toast?.addToast?.(t('teams.tab.saveSuccess', { name }), 'success');
                              haptic.success();
                              setSaveLoadoutOpen(false);
                            }}
                            disabled={!saveLoadoutName.trim()}
                            className="kuro-btn kuro-btn-primary active-gold flex-1 text-sm"
                          >
                            {t('teams.tab.saveConfirm')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </FocusTrapModal>

                  {/* Weapon Selector Modal */}
                  <WeaponSelector
                    weaponSelectorOpen={weaponSelectorOpen}
                    setWeaponSelectorOpen={setWeaponSelectorOpen}
                    weaponSelectorTarget={weaponSelectorTarget}
                    weaponSearch={weaponSearch}
                    setWeaponSearch={setWeaponSearch}
                    setTeamEquipment={setTeamEquipment}
                    collectionImages={collectionImages}
                  />

                  {/* Echo Selector Modal + Echo Stat Configuration Panel */}
                  <EchoSelector
                    echoSelectorOpen={echoSelectorOpen}
                    setEchoSelectorOpen={setEchoSelectorOpen}
                    echoSelectorTarget={echoSelectorTarget}
                    echoSearch={echoSearch}
                    setEchoSearch={setEchoSearch}
                    echoSetFilter={echoSetFilter}
                    setEchoSetFilter={setEchoSetFilter}
                    echoBuffFilter={echoBuffFilter}
                    setEchoBuffFilter={setEchoBuffFilter}
                    echoStatPanel={echoStatPanel}
                    setEchoStatPanel={setEchoStatPanel}
                    setTeamEquipment={setTeamEquipment}
                    teamEquipment={teamEquipment}
                    setEchoSelectorTarget={setEchoSelectorTarget}
                    collectionImages={collectionImages}
                  />

                </div>
              );
            })()}
          </div>
          </TabErrorBoundary>
          </div>
  );
}

export default React.memo(TeamsTab, (prev, next) =>
  prev.state.teams === next.state.teams && prev.state.activeTeamIndex === next.state.activeTeamIndex &&
  prev.collectionImages === next.collectionImages && prev.collectionData === next.collectionData &&
  prev.dispatch === next.dispatch
);
