import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BookmarkPlus, ChevronDown, Download, FolderOpen, Plus, Search, Share2, Target, Trash2, Upload, Users, X, Zap } from 'lucide-react';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RELEASE_ORDER, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS } from '../../data/characters.js';
import { haptic, getElementColor, getElementBg, getElementBorder, getElementShape } from '../../utils/helpers.js';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import TeamSelector from './TeamSelector.jsx';
import WeaponSelector from './WeaponSelector.jsx';
import EchoSelector from './EchoSelector.jsx';
import DamageCalculator from './DamageCalculator.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';

function TeamsTab({
  state,
  dispatch,
  collectionImages,
  collectionData,
  toast,
  confirm,
}) {
  const { getImageFraming, framingMode, editingImage, setEditingImage } = useImageFramingContext();
  const [overviewCollapsed, setOverviewCollapsed] = useState(false);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false);
  const [teamSelectorSlot, setTeamSelectorSlot] = useState(0);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamElementFilter, setTeamElementFilter] = useState('all');
  const [teamRarityFilter, setTeamRarityFilter] = useState('all');
  const [teamBuffFilter, setTeamBuffFilter] = useState('all');
  const [teamDebuffFilter, setTeamDebuffFilter] = useState('all');
  const [teamDmgFilter, setTeamDmgFilter] = useState('all');
  const [teamRoleFilter, setTeamRoleFilter] = useState('all');
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
  useEffect(() => {
    if (eqSaveTimerRef.current) clearTimeout(eqSaveTimerRef.current);
    eqSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem('ww-team-equipment', JSON.stringify(teamEquipment)); } catch {}
    }, 300);
    return () => { if (eqSaveTimerRef.current) clearTimeout(eqSaveTimerRef.current); };
  }, [teamEquipment]);
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

  // ── Memoized team suggestions — prevents O(n³) recomputation on every render (H-1 fix) ──
  const teamSuggestions = useMemo(() => {
    const ownedNames = new Set([
      ...Object.keys(collectionData?.chars5Counts || {}),
      ...Object.keys(collectionData?.chars4Counts || {}),
    ]);
    const TIER_SCORES = { 'T0': 40, 'T0.5': 35, 'T1': 28, 'T1.5': 22, 'T2': 16, 'T3': 8, 'T4': 0 };
    const scoreTeam = (members) => {
      let score = 0;
      const roles = members.map(m => CHARACTER_DATA[m]?.role).filter(Boolean);
      const tags = [];
      let tierSum = 0;
      members.forEach(m => { const t = CHARACTER_DATA[m]?.tier?.toa; if (t) tierSum += (TIER_SCORES[t] ?? 10); });
      score += tierSum;
      if (tierSum >= 115) tags.push('Meta'); else if (tierSum >= 95) tags.push('Strong');
      const hasMain = roles.includes('Main DPS'), hasSub = roles.includes('Sub DPS');
      const hasHeal = roles.includes('Healer'), hasSupp = roles.includes('Support');
      if (hasMain) score += 15; if (hasHeal || hasSupp) score += 10; if (hasSub) score += 8;
      if (hasMain && (hasHeal || hasSupp) && hasSub) { score += 15; tags.push('Balanced'); }
      const mainDps = members.find(m => CHARACTER_DATA[m]?.role === 'Main DPS');
      if (mainDps) {
        score += Math.min(25, Math.round((CHARACTER_DATA[mainDps]?.totalMult || 0) / 120));
        const mainEl = CHARACTER_DATA[mainDps]?.element;
        members.forEach(other => {
          if (other === mainDps) return;
          const bt = CHAR_BUFF_TABLE[other];
          if (!bt) return;
          (bt.outroBuffs || []).forEach(b => {
            if (b.stat === 'deepen') score += 8;
            else if (b.stat === 'elemDmg') { const cond = (b.condition || '').toLowerCase(); const mel = (mainEl || '').toLowerCase(); if (!cond || cond.includes(mel) || cond.includes('all')) score += 6; }
            else if (b.stat === 'basicDmg' || b.stat === 'heavyDmg' || b.stat === 'skillDmg') score += 5;
            else if (b.stat === 'critRate' || b.stat === 'critDmg') score += 4;
          });
          (bt.debuffs || []).forEach(db => { if (db.stat === 'defShred' || db.stat === 'resShred' || db.stat === 'defIgnore') score += 4; });
        });
      }
      const elements = new Set(members.map(m => CHARACTER_DATA[m]?.element).filter(Boolean));
      if (elements.size < members.length) { score += 5; tags.push('Resonance'); }
      return { score, tags };
    };
    // Custom teams from roster
    const customTeams = [];
    const ownedArr = [...ownedNames].filter(n => CHARACTER_DATA[n]);
    const ownedDps = ownedArr.filter(n => CHARACTER_DATA[n].role === 'Main DPS');
    const ownedSub = ownedArr.filter(n => ['Sub DPS', 'Support'].includes(CHARACTER_DATA[n].role));
    const ownedHeal = ownedArr.filter(n => ['Healer', 'Support'].includes(CHARACTER_DATA[n].role));
    for (const dps of ownedDps) {
      const bestSubs = ownedSub.filter(s => s !== dps).map(sub => ({ name: sub, score: scoreTeam([dps, sub, ownedHeal[0] || sub]).score })).sort((a, b) => b.score - a.score).slice(0, 3);
      const bestHeals = ownedHeal.filter(h => h !== dps).map(heal => ({ name: heal, score: scoreTeam([dps, bestSubs[0]?.name || heal, heal]).score })).sort((a, b) => b.score - a.score).slice(0, 3);
      for (const sub of bestSubs) { for (const heal of bestHeals) { if (sub.name === heal.name) continue; const members = [dps, sub.name, heal.name]; const { score, tags } = scoreTeam(members); customTeams.push({ text: members.join(' + '), members, score, tags, ownedCount: 3, allOwned: true }); } }
    }
    customTeams.sort((a, b) => b.score - a.score);
    const seenC = new Set(); const uniqCustom = customTeams.filter(t => { const k = [...t.members].sort().join(','); if (seenC.has(k)) return false; seenC.add(k); return true; });
    // Curated meta teams
    const metaTeams = [];
    [...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS].forEach(name => {
      (CHARACTER_DATA[name]?.teams || []).forEach(t => { const members = t.split('+').map(s => s.trim()).filter(Boolean); if (members.length < 2) return; const { score, tags } = scoreTeam(members); const oc = members.filter(m => ownedNames.has(m)).length; metaTeams.push({ text: t, members, score: score + oc * 8 + (oc === members.length ? 12 : 0), tags, ownedCount: oc, allOwned: oc === members.length }); });
    });
    metaTeams.sort((a, b) => b.score - a.score);
    const seenM = new Set(); const uniqMeta = metaTeams.filter(t => { const k = [...t.members].sort().join(','); if (seenM.has(k)) return false; seenM.add(k); return true; });
    const all = [];
    if (uniqCustom.length > 0) { all.push({ header: 'Built from your roster' }); uniqCustom.slice(0, 8).forEach(s => all.push(s)); }
    if (uniqMeta.length > 0) { all.push({ header: 'Curated teams' }); uniqMeta.slice(0, uniqCustom.length > 0 ? 7 : 15).forEach(s => all.push(s)); }
    return all;
  }, [collectionData]);

  return (
          <div role="tabpanel" id="tabpanel-teams" aria-labelledby="tab-teams" tabIndex="0">
          <TabErrorBoundary tabName="Teams">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="teams" />

            {(() => {
              const activeTeam = state.teams[state.activeTeamIndex] || state.teams[0];
              const teamSlots = activeTeam.slots;
              const openSelector = (slotIdx) => {
                setTeamSelectorSlot(slotIdx);
                setTeamSearch('');
                setTeamElementFilter('all');
                setTeamRarityFilter('all');
                setTeamBuffFilter('all');
                setTeamDebuffFilter('all');
                setTeamDmgFilter('all');
                setTeamRoleFilter('all');
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
                if (await confirm?.({ title: 'Remove Resonator', message: `Remove ${charName || 'this Resonator'} from the team?`, confirmLabel: 'Remove', destructive: true })) {
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

              // Compute recommended teammates from current team members' team suggestions
              const recommendedNames = new Set();
              teamSlots.filter(s => s).forEach(charInSlot => {
                const d = CHARACTER_DATA[charInSlot];
                if (!d?.teams) return;
                d.teams.forEach(teamStr => {
                  teamStr.split('+').map(m => m.trim()).forEach(m => {
                    if (m !== charInSlot && !usedInTeam.has(m)) recommendedNames.add(m);
                  });
                });
              });

              // Filter characters for selector
              const filteredChars = allCharNames.filter(name => {
                if (usedInTeam.has(name)) return false;
                if (teamSearch && !name.toLowerCase().includes(teamSearch.toLowerCase())) return false;
                const data = CHARACTER_DATA[name];
                if (!data) return false;
                if (teamElementFilter !== 'all' && data.element !== teamElementFilter) return false;
                if (teamRarityFilter !== 'all' && data.rarity !== Number(teamRarityFilter)) return false;
                if (teamBuffFilter !== 'all' && !(data.buffs || []).some(b => b.includes(teamBuffFilter))) return false;
                if (teamDebuffFilter !== 'all' && !(data.debuffs || []).some(b => b.includes(teamDebuffFilter))) return false;
                if (teamDmgFilter !== 'all' && !(data.dmgFocus || []).includes(teamDmgFilter)) return false;
                if (teamRoleFilter !== 'all' && data.role !== teamRoleFilter) return false;
                return true;
              }).sort((a, b) => {
                const aRec = recommendedNames.has(a) ? 0 : 1;
                const bRec = recommendedNames.has(b) ? 0 : 1;
                if (aRec !== bRec) return aRec - bRec;
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
                              toast?.addToast?.('Teams exported!', 'success');
                            } catch { toast?.addToast?.('Export failed', 'error'); }
                          }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5 whitespace-nowrap"
                          aria-label="Export team loadouts"
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
                                  if (!data.teams || !Array.isArray(data.teams)) throw new Error('Invalid format');
                                  if (data.teams.length !== 5) throw new Error(`Expected 5 teams, got ${data.teams.length}`);
                                  // Issue #102: Validate team structure before importing
                                  for (let i = 0; i < data.teams.length; i++) {
                                    const t = data.teams[i];
                                    if (!t || typeof t !== 'object') throw new Error(`Team ${i + 1} is not a valid object`);
                                    if (!Array.isArray(t.slots)) throw new Error(`Team ${i + 1} is missing slots array`);
                                    if (t.name !== undefined && typeof t.name !== 'string') throw new Error(`Team ${i + 1} has invalid name`);
                                    for (let j = 0; j < t.slots.length; j++) {
                                      if (t.slots[j] !== null && t.slots[j] !== '' && typeof t.slots[j] !== 'string') {
                                        throw new Error(`Team ${i + 1}, slot ${j + 1} has invalid value`);
                                      }
                                    }
                                  }
                                  dispatch({ type: 'IMPORT_TEAMS', teams: data.teams, activeTeamIndex: data.activeTeamIndex });
                                  if (data.equipment && typeof data.equipment === 'object') {
                                    setTeamEquipment(data.equipment);
                                    try { localStorage.setItem('ww-team-equipment', JSON.stringify(data.equipment)); } catch {}
                                  }
                                  toast?.addToast?.('Teams imported!', 'success');
                                } catch (err) { toast?.addToast?.('Invalid file: ' + err.message, 'error'); }
                              };
                              reader.readAsText(file);
                            };
                            input.click();
                          }}
                          className="kuro-btn kuro-btn-sm kuro-btn-primary text-sm px-2 py-1.5 whitespace-nowrap"
                          aria-label="Import team loadouts"
                        >
                          <Upload size={12} />
                        </button>
                        <button
                          onClick={() => {
                            try {
                              const team = state.teams[state.activeTeamIndex] || state.teams[0];
                              const slots = team.slots;
                              if (!slots.some(s => s)) return;
                              const stats = damageCalcRef.current?.calcTeamStats?.(slots, state.activeTeamIndex);
                              const charParts = slots.filter(s => s).map(name => {
                                const eqKey = state.activeTeamIndex + ':' + name;
                                const eq = teamEquipment[eqKey];
                                const d = CHARACTER_DATA[name];
                                const weapName = (eq?.weapon) || d?.bestWeapon || 'None';
                                return `${name} (${weapName})`;
                              });
                              const lines = [`Team: ${team.name || 'Team ' + (state.activeTeamIndex + 1)}`];
                              lines.push(charParts.join(' | '));
                              if (stats) {
                                lines.push(`Raw: ${stats.rawDps.toLocaleString('en-US')}/s | Full: ${stats.realDps.toLocaleString('en-US')}/s | Perfect: ${stats.perfectDps.toLocaleString('en-US')}/s`);
                              }
                              const text = lines.join('\n');
                              navigator.clipboard.writeText(text);
                              toast?.addToast?.('Team copied!', 'success');
                              haptic.light();
                            } catch { toast?.addToast?.('Share failed', 'error'); }
                          }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5 whitespace-nowrap"
                          aria-label="Copy team build to clipboard"
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
                            setTeamCompareEntries(prev => [...prev, { id: Date.now(), slots: clonedSlots, teamIdx: state.activeTeamIndex }]);
                            haptic.success();
                          }}
                          disabled={teamCompareEntries.length >= 5 || !(state.teams[state.activeTeamIndex] || state.teams[0]).slots.some(s => s)}
                          title={teamCompareEntries.length >= 5 ? 'Max 5 comparisons' : !(state.teams[state.activeTeamIndex] || state.teams[0]).slots.some(s => s) ? 'Add characters first' : 'Add to comparison'}
                          className="kuro-btn kuro-btn-sm kuro-btn-primary active-gold text-sm px-2 py-1.5 whitespace-nowrap"
                          aria-label="Add current team to comparison"
                        >
                          + Compare
                        </button>
                        <button
                          onClick={() => {
                            const name = window.prompt('Save loadout as:', `${activeTeam.name || 'Team ' + (state.activeTeamIndex + 1)} Loadout`);
                            if (!name || !name.trim()) return;
                            const preset = { name: name.trim(), teams: state.teams.map(t => ({ name: t.name, slots: [...t.slots] })), equipment: { ...teamEquipment } };
                            setEquipPresets(prev => [...prev.filter(p => p.name !== name.trim()), preset]);
                            toast?.addToast?.(`Loadout "${name.trim()}" saved!`, 'success');
                            haptic.success();
                          }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5"
                          aria-label="Save equipment loadout"
                          title="Save Loadout"
                        >
                          <BookmarkPlus size={12} />
                        </button>
                        <button
                          onClick={() => setShowPresetDropdown(prev => !prev)}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5"
                          aria-label="Load equipment loadout"
                          aria-expanded={showPresetDropdown}
                          title="Load Loadout"
                        >
                          <FolderOpen size={12} />
                        </button>
                        <button
                          onClick={async () => { if (await confirm?.({ title: 'Clear team', message: 'Remove all Resonators from this team?', confirmLabel: 'Clear', destructive: true })) { dispatch({ type: 'CLEAR_TEAM', teamIndex: state.activeTeamIndex }); haptic.medium(); } }}
                          className="kuro-btn kuro-btn-sm text-sm px-2 py-1.5 whitespace-nowrap"
                          aria-label="Clear all slots in current team"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    }>
                      <Users size={14} className="text-yellow-400" /> Team Builder
                    </CardHeader>
                    <CardBody>
                      {/* Team Selector Tabs — P6-FIX: ARIA tab pattern (F-P6-059) */}
                      <div className="flex gap-1 mb-3" role="tablist" aria-label="Team selector" onKeyDown={(e) => {
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
                                aria-label={`Rename team ${idx + 1}`}
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
                          <div className="absolute top-0 right-0 z-50 min-w-[200px] rounded-lg border border-[var(--border-medium)] bg-[var(--bg-card)] shadow-xl overflow-hidden">
                            {equipPresets.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">No saved loadouts</div>
                            ) : (
                              equipPresets.map((preset, i) => (
                                <div key={i} className="flex items-center border-b border-[var(--border-medium)] last:border-b-0">
                                  <button onClick={() => { setTeamEquipment(preset.equipment); try { localStorage.setItem('ww-team-equipment', JSON.stringify(preset.equipment)); } catch {} if (preset.teams?.[0]?.slots) { preset.teams.forEach((t, ti) => { if (t.slots) t.slots.forEach((char, si) => { dispatch({ type: 'SET_TEAM_SLOT', teamIndex: ti, slotIndex: si, character: char }); }); }); } setShowPresetDropdown(false); toast?.addToast?.(`Loadout "${preset.name}" loaded!`, 'success'); haptic.success(); }} className="flex-1 text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors">{preset.name}</button>
                                  <button onClick={(e) => { e.stopPropagation(); setEquipPresets(prev => prev.filter((_, idx) => idx !== i)); toast?.addToast?.(`Loadout "${preset.name}" deleted`, 'success'); }} className="px-2 py-2 text-gray-500 hover:text-red-400 transition-colors" aria-label={`Delete loadout ${preset.name}`}><X size={12} /></button>
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
                            <div className="text-gray-400 text-md mb-1">No characters assigned</div>
                            <p className="text-gray-600 text-sm">Tap an empty slot to add a Resonator</p>
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
                                aria-label={`Add resonator to slot ${slotIdx + 1}`}
                              >
                                <Plus size={24} className="text-yellow-500/50 group-hover:text-yellow-400 transition-colors" />
                                <span className="text-sm text-yellow-500/40 group-hover:text-yellow-400 font-medium transition-colors">Add Resonator</span>
                              </button>
                            );
                          }

                          const rarity5 = charData?.rarity === 5;
                          return (
                            <div
                              key={slotIdx}
                              className={`relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer group ${framingMode && editingImage === teamKey ? 'border-emerald-500 ring-2 ring-emerald-500/50' : rarity5 ? 'bg-yellow-500/10 border-yellow-500/30 holo-5star' : 'bg-purple-500/10 border-purple-500/30'}`}
                              style={{ height: '160px', contain: 'paint' }}
                              onClick={() => {
                                if (framingMode) {
                                  setEditingImage(teamKey);
                                } else {
                                  openSelector(slotIdx);
                                }
                              }}
                            >
                              {framingMode && editingImage === teamKey && (
                                <div className="absolute top-1 left-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
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
                              {/* P6-FIX: Increased from w-5 h-5 to w-[28px] h-[28px] for touch targets (F-P6-050) */}
                              {!framingMode && <button
                                onClick={(e) => { e.stopPropagation(); removeFromSlot(slotIdx); }}
                                className="action-btn absolute top-1 right-1 z-20 w-[28px] h-[28px] aspect-square p-0 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 btn-icon-square"
                                aria-label={`Remove ${charName} from slot ${slotIdx + 1}`}
                              >
                                <X size={12} />
                              </button>}
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
                              <div key={i} className="kuro-badge font-medium"
                                style={{ color: getElementColor(d.element), background: getElementBg(d.element), border: `1px solid ${getElementBorder(d.element)}` }}>
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
                    collectionImages={collectionImages}
                    teamCompareEntries={teamCompareEntries}
                    setTeamCompareEntries={setTeamCompareEntries}
                    confirm={confirm}
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
                  />

                  {/* Suggested Teams from Character Data — collapsible */}
                  <Card>
                    <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setSuggestionsCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSuggestionsCollapsed(p => !p); } }} aria-expanded={!suggestionsCollapsed}>
                      <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${suggestionsCollapsed ? '' : 'rotate-180'}`} />}><Target size={14} className="text-cyan-400" /> Team Suggestions</CardHeader>
                    </div>
                    {!suggestionsCollapsed && (
                    <CardBody>
                      <div className="space-y-2 team-suggestions-grid">
                        {(() => {
                          const ownedNames = new Set([
                            ...Object.keys(collectionData.chars5Counts),
                            ...Object.keys(collectionData.chars4Counts),
                          ]);
                          const ownedWeaps = new Set([
                            ...Object.keys(collectionData.weaps5Counts || {}),
                            ...Object.keys(collectionData.weaps4Counts || {}),
                          ]);
                          const TIER_SCORES = { 'T0': 40, 'T0.5': 35, 'T1': 28, 'T1.5': 22, 'T2': 16, 'T3': 8, 'T4': 0 };

                          // ── Score a team (shared logic) ──
                          const scoreTeam = (members) => {
                            let score = 0;
                            const roles = members.map(m => CHARACTER_DATA[m]?.role).filter(Boolean);
                            const tags = [];
                            // Tier
                            let tierSum = 0;
                            members.forEach(m => { const t = CHARACTER_DATA[m]?.tier?.toa; if (t) tierSum += (TIER_SCORES[t] ?? 10); });
                            score += tierSum;
                            // Meta = truly top-tier (needs ≥2 T0 members, ~115+ pts)
                            if (tierSum >= 115) tags.push('Meta');
                            else if (tierSum >= 95) tags.push('Strong');
                            // Roles
                            const hasMain = roles.includes('Main DPS'), hasSub = roles.includes('Sub DPS');
                            const hasHeal = roles.includes('Healer'), hasSupp = roles.includes('Support');
                            if (hasMain) score += 15; if (hasHeal || hasSupp) score += 10; if (hasSub) score += 8;
                            if (hasMain && (hasHeal || hasSupp) && hasSub) { score += 15; tags.push('Balanced'); }
                            // DPS power + buff synergy
                            const mainDps = members.find(m => CHARACTER_DATA[m]?.role === 'Main DPS');
                            if (mainDps) {
                              score += Math.min(25, Math.round((CHARACTER_DATA[mainDps]?.totalMult || 0) / 120));
                              const dpsFocus = CHARACTER_DATA[mainDps]?.dmgFocus || [];
                              members.forEach(m => {
                                if (m === mainDps) return;
                                const bt = CHAR_BUFF_TABLE[m]; if (!bt) return;
                                (bt.outroBuffs || []).forEach(b => {
                                  if (b.stat === 'deepen') score += 8;
                                  else if (b.stat === 'basicDmg' && dpsFocus.includes('Basic ATK')) { score += 10; tags.push('ATK Amp'); }
                                  else if (b.stat === 'heavyDmg' && dpsFocus.includes('Heavy ATK')) { score += 10; tags.push('Heavy Amp'); }
                                  else if (b.stat === 'echoDmg' && dpsFocus.includes('Echo')) { score += 10; tags.push('Echo Amp'); }
                                  else if (b.stat === 'skillDmg' && dpsFocus.includes('Skill')) score += 8;
                                  else if (b.stat === 'elemDmg') score += 6;
                                });
                                (bt.debuffs || []).forEach(db => {
                                  if (db.stat === 'defShred' || db.stat === 'resShred') { score += 6; tags.push('Shred'); }
                                  if (db.stat === 'frazzle') tags.push('Frazzle');
                                  if (db.stat === 'erosion') tags.push('Erosion');
                                });
                              });
                            }
                            // Element
                            const els = members.map(m => CHARACTER_DATA[m]?.element).filter(Boolean);
                            const elSet = new Set(els);
                            if (els.length > elSet.size) { score += 12; tags.push('Resonance'); }
                            if (elSet.size === 1) { score += 8; tags.push('Mono'); }
                            // BiS weapon
                            let hasBis = false;
                            members.forEach(m => { const d = CHARACTER_DATA[m]; if (d?.bestWeapon && ownedWeaps.has(d.bestWeapon)) { score += d.role === 'Main DPS' ? 12 : 4; hasBis = true; } });
                            if (hasBis) tags.push('BiS Weapon');
                            return { score, tags: [...new Set(tags)].slice(0, 3) };
                          };

                          // ═══ SECTION 1: Build custom teams from YOUR owned characters ═══
                          const customTeams = [];
                          const ownedArr = [...ownedNames].filter(n => CHARACTER_DATA[n]);
                          const ownedDps = ownedArr.filter(n => CHARACTER_DATA[n].role === 'Main DPS');
                          const ownedSub = ownedArr.filter(n => CHARACTER_DATA[n].role === 'Sub DPS');
                          const ownedHeal = ownedArr.filter(n => CHARACTER_DATA[n].role === 'Healer' || CHARACTER_DATA[n].role === 'Support');
                          const customSeen = new Set();
                          // For each owned DPS, find best sub + best healer/support
                          for (const dps of ownedDps) {
                            const dpsEl = CHARACTER_DATA[dps]?.element;
                            const dpsFocus = CHARACTER_DATA[dps]?.dmgFocus || [];
                            // Score each potential sub-DPS partner
                            const subCandidates = ownedSub.filter(s => s !== dps).map(sub => {
                              let fit = 0;
                              const bt = CHAR_BUFF_TABLE[sub];
                              if (bt) {
                                (bt.outroBuffs || []).forEach(b => {
                                  if (b.stat === 'deepen') fit += 10;
                                  else if (b.stat === 'elemDmg') { const cond = (b.condition || '').toLowerCase(); if (!cond || cond.includes((dpsEl || '').toLowerCase())) fit += 8; }
                                  else if (b.stat === 'basicDmg' && dpsFocus.includes('Basic ATK')) fit += 12;
                                  else if (b.stat === 'heavyDmg' && dpsFocus.includes('Heavy ATK')) fit += 12;
                                  else if (b.stat === 'echoDmg' && dpsFocus.includes('Echo')) fit += 12;
                                  else if (b.stat === 'skillDmg' && dpsFocus.includes('Skill')) fit += 10;
                                });
                                (bt.debuffs || []).forEach(db => { if (db.stat === 'defShred' || db.stat === 'resShred') fit += 6; });
                              }
                              if (CHARACTER_DATA[sub]?.element === dpsEl) fit += 5; // element resonance
                              const tier = CHARACTER_DATA[sub]?.tier?.toa;
                              fit += (TIER_SCORES[tier] ?? 5);
                              return { name: sub, fit };
                            }).sort((a, b) => b.fit - a.fit);
                            // Score each potential healer/support
                            const healCandidates = ownedHeal.filter(h => h !== dps).map(heal => {
                              let fit = 0;
                              const bt = CHAR_BUFF_TABLE[heal];
                              if (bt) {
                                (bt.outroBuffs || []).forEach(b => { if (b.stat === 'deepen') fit += 10; else if (b.stat === 'atkPct') fit += 6; });
                                (bt.libBuffs || []).forEach(b => { if (b.stat === 'critRate' || b.stat === 'critDmg') fit += 8; else if (b.stat === 'atkPct') fit += 6; });
                              }
                              const tier = CHARACTER_DATA[heal]?.tier?.toa;
                              fit += (TIER_SCORES[tier] ?? 5);
                              return { name: heal, fit };
                            }).sort((a, b) => b.fit - a.fit);
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
                                const { score, tags } = scoreTeam(members);
                                customTeams.push({ text: members.join(' + '), members, score, tags, ownedCount: 3, allOwned: true, custom: true });
                              }
                            }
                          }
                          customTeams.sort((a, b) => b.score - a.score);

                          // ═══ SECTION 2: Curated meta teams (from CHARACTER_DATA.teams) ═══
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
                              const { score, tags } = scoreTeam(members);
                              metaTeams.push({ text: t, members, score: score + ownedCount * 8 + (ownedCount === members.length ? 12 : 0), tags, ownedCount, allOwned: ownedCount === members.length });
                            }
                          }
                          metaTeams.sort((a, b) => b.score - a.score);

                          const allSuggestions = [];
                          // Show custom teams first (built from your roster), then meta
                          if (customTeams.length > 0) {
                            allSuggestions.push({ header: 'Built from your roster' });
                            customTeams.slice(0, 8).forEach(s => allSuggestions.push(s));
                          }
                          if (metaTeams.length > 0) {
                            allSuggestions.push({ header: 'Curated teams' });
                            metaTeams.slice(0, customTeams.length > 0 ? 7 : 15).forEach(s => allSuggestions.push(s));
                          }

                          if (allSuggestions.length === 0) {
                            return <p className="text-gray-500 text-sm text-center py-2">No team suggestions available</p>;
                          }
                          return allSuggestions.map((s, i) => {
                            if (s.header) return <div key={`h${i}`} className="text-xs text-gray-500 uppercase tracking-wider font-medium pt-2 pb-0.5 flex items-center gap-2"><span className="h-px flex-1 bg-white/5" />{s.header}<span className="h-px flex-1 bg-white/5" /></div>;
                            return (
                            <button
                              key={i}
                              onClick={() => {
                                s.members.slice(0, 3).forEach((m, idx) => {
                                  dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: idx, character: m });
                                });
                                haptic.success();
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-[var(--border-medium)] hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all text-left"
                              style={{ background: 'var(--bg-stat)' }}
                            >
                              <div className="flex gap-1 flex-shrink-0">
                                {s.members.slice(0, 3).map((m, j) => {
                                  const cd = CHARACTER_DATA[m];
                                  const sf = getImageFraming(`collection-${m}`) || { x: 0, y: 0, zoom: 100 };
                                  return (
                                    <div key={j} className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative${cd?.rarity === 5 ? ' holo-5star' : ''}`}
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
                                    const rc = role === 'Main DPS' ? 'text-red-400' : role === 'Sub DPS' ? 'text-orange-400' : role === 'Healer' ? 'text-emerald-400' : 'text-blue-400';
                                    return <span key={j} className={`text-2xs ${rc}`}>{role || '?'}</span>;
                                  })}
                                  {s.tags?.map((tag, j) => (
                                    <span key={`t${j}`} className={`text-2xs px-1 rounded ${tag === 'Meta' ? 'text-yellow-400 bg-yellow-500/10' : tag === 'Strong' ? 'text-orange-400 bg-orange-500/10' : tag === 'Balanced' ? 'text-emerald-400 bg-emerald-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}>{tag}</span>
                                  ))}
                                </div>
                              </div>
                              {s.allOwned ? (
                                <span className="kuro-badge kuro-badge-emerald flex-shrink-0 text-2xs">Ready</span>
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
                    activeTeam={activeTeam}
                    filteredChars={filteredChars}
                    recommendedNames={recommendedNames}
                    selectCharacter={selectCharacter}
                    collectionImages={collectionImages}
                    collectionData={collectionData}
                    state={state}
                  />

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
