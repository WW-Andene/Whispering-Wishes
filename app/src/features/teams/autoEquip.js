// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/autoEquip.js (extracted from DamageCalculator.jsx)
// Auto-equip echo/weapon selection logic for a team member.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_DATA } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA } from '../../data/echoes.js';
import { isHealerRole, isSupportRole } from './calcEngine.js';

// Extracted from the per-character "Auto Equip" button's onClick so both that button and the
// team-wide "Full Auto Build" button (which needs to run this for every member in one pass, with
// each member's 4-cost pick visible to the next member's collision check) share one implementation
// instead of drifting. Pure w.r.t. its inputs — takes an explicit teamEquipmentSnapshot rather than
// reading component state directly, so a caller can thread an in-progress snapshot across multiple
// sequential calls before committing a single setTeamEquipment update.
function computeAutoEquipEntry(memberName, teamEquipmentSnapshot, activeTeamIndex, allMemberNames, mainDpsOverrideName) {
  const d = CHARACTER_DATA[memberName];
  if (!d) return null;
  const aeqKey = activeTeamIndex + ':' + memberName;
  const weapon = d.bestWeapon && WEAPON_DATA[d.bestWeapon] ? d.bestWeapon : null;
  const recSets = new Map();
  const rawDirectEchoes = new Set();
  (d.bestEchoes || []).forEach(entry => {
    [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES].forEach(en => {
      if (entry.toLowerCase().includes(en.toLowerCase())) rawDirectEchoes.add(en);
    });
    entry.split('+').forEach(part => {
      const trimmed = part.trim();
      const pcMatch = trimmed.match(/^(.+?)\s+(\d+)pc$/i);
      if (pcMatch && ECHO_SETS[pcMatch[1].trim()]) {
        recSets.set(pcMatch[1].trim(), parseInt(pcMatch[2], 10));
      } else {
        const plain = trimmed.replace(/\s+\d+pc$/i, '').trim();
        if (ECHO_SETS[plain]) recSets.set(plain, 5);
      }
    });
  });
  const isTeamMainDps = mainDpsOverrideName === memberName;
  if (isTeamMainDps && d.role !== 'Main DPS') {
    const allTierEchoes = [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES];
    const ownElementSet = [...recSets.keys()].find(s => ECHO_SETS[s]?.element === d.element)
      || Object.keys(ECHO_SETS).find(s => ECHO_SETS[s].element === d.element
        && allTierEchoes.some(n => ECHO_DATA[n]?.sets?.includes(s)));
    if (ownElementSet) {
      recSets.clear();
      recSets.set(ownElementSet, 5);
    }
  }
  const directEchoes = new Set(
    [...rawDirectEchoes].filter(name => (ECHO_DATA[name]?.sets || []).some(s => recSets.has(s)))
  );
  const currentEq = teamEquipmentSnapshot[aeqKey];
  const roleDefaultPreset = isTeamMainDps ? 'default'
    : (isHealerRole(d.role) || isSupportRole(d.role)) ? 'support' : 'default';
  const preset = currentEq?.echoPreset || roleDefaultPreset;
  const scaling = d.statScaling || 'ATK';
  const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
  const elDmgKey = d.element ? d.element.charAt(0).toUpperCase() + d.element.slice(1).toLowerCase() + ' DMG' : '';
  const getMainStat = (cost) => {
    if (preset === 'er') {
      if (cost === 4) return 'Energy Regen';
      if (cost === 3) return 'Energy Regen';
      return scalingStat;
    }
    if (preset === 'support') {
      if (cost === 4) return isHealerRole(d.role) ? 'Healing Bonus' : 'Energy Regen';
      if (cost === 3) return elDmgKey || scalingStat;
      return scaling === 'HP' ? 'HP%' : scalingStat;
    }
    if (cost === 4) return 'Crit Rate';
    if (cost === 3) return elDmgKey || scalingStat;
    return scalingStat;
  };
  const getSubstats = () => {
    if (preset === 'er') return ['Energy Regen', scalingStat, 'Crit Rate', 'Crit DMG', scalingStat];
    if (preset === 'support') return [scalingStat, 'Energy Regen', 'Crit Rate'];
    return [scalingStat, 'Crit Rate', 'Crit DMG', scalingStat, 'Crit DMG'];
  };
  const defaultSubs = getSubstats();
  const newEchoes = [null, null, null, null, null];
  const usedNames = new Set();
  allMemberNames.forEach(otherName => {
    if (otherName === memberName) return;
    const teammateEq = teamEquipmentSnapshot[activeTeamIndex + ':' + otherName];
    const teammate4Cost = teammateEq?.echoes?.[0]?.name;
    if (teammate4Cost) usedNames.add(teammate4Cost);
  });
  const assignedCounts = new Map();
  const markAssigned = (name, setPrefs) => {
    (ECHO_DATA[name]?.sets || []).forEach(s => {
      if (setPrefs.has(s)) assignedCounts.set(s, (assignedCounts.get(s) || 0) + 1);
    });
  };
  const pickEcho = (tierList, setPrefs) => {
    for (const name of tierList) {
      if (!usedNames.has(name) && directEchoes.has(name)) {
        usedNames.add(name); markAssigned(name, setPrefs); return name;
      }
    }
    const wanted = new Set(setPrefs.keys());
    const charEl = (d.element || '').toLowerCase();
    const isRoleForHealing = isHealerRole(d.role);
    const matchesElement = (ed) => {
      const buffs = ed?.buff ? (Array.isArray(ed.buff) ? ed.buff : [ed.buff]) : [];
      if (buffs.length === 0) return true;
      return buffs.every(b => {
        if (b === 'Healing') return isRoleForHealing;
        if (b === 'Shield' || b === 'Physical DMG') return true;
        if (/ DMG$/.test(b)) return b.toLowerCase().startsWith(charEl);
        return true;
      });
    };
    const isDeadWeight = (ed) => {
      const buffs = ed?.buff ? (Array.isArray(ed.buff) ? ed.buff : [ed.buff]) : [];
      return buffs.length > 0 && buffs.every(b => b === 'Healing') && !isRoleForHealing;
    };
    for (const [setName, targetPc] of setPrefs) {
      if ((assignedCounts.get(setName) || 0) >= targetPc) continue;
      let bestElemMatch = null, bestPure = null, bestLive = null, anyMatch = null;
      for (const name of tierList) {
        if (usedNames.has(name)) continue;
        const ed = ECHO_DATA[name];
        if (!ed?.sets?.includes(setName)) continue;
        if (!anyMatch) anyMatch = name;
        if (!bestLive && !isDeadWeight(ed)) bestLive = name;
        const elemOk = matchesElement(ed);
        const pure = ed.sets.every(s => wanted.has(s));
        if (elemOk && pure) { usedNames.add(name); markAssigned(name, setPrefs); return name; }
        if (elemOk && !bestElemMatch) bestElemMatch = name;
        if (!elemOk && pure && !bestPure) bestPure = name;
      }
      const chosen = bestElemMatch || bestPure || bestLive || anyMatch;
      if (chosen) { usedNames.add(chosen); markAssigned(chosen, setPrefs); return chosen; }
    }
    return null;
  };
  const e0 = pickEcho(ALL_4COST_ECHOES, recSets);
  if (e0) newEchoes[0] = { name: e0, mainStat: getMainStat(4), substats: defaultSubs.slice(0, 5) };
  for (let i = 1; i <= 2; i++) { const e = pickEcho(ALL_3COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: getMainStat(3), substats: defaultSubs.slice(0, 5) }; }
  for (let i = 3; i <= 4; i++) { const e = pickEcho(ALL_1COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: getMainStat(1), substats: defaultSubs.slice(0, 5) }; }
  let echoSetVal = '';
  let echoSet2Val = '';
  const recSetKeys = [...recSets.keys()];
  if (recSetKeys.length > 0) echoSetVal = recSetKeys[0];
  if (recSetKeys.length > 1) echoSet2Val = recSetKeys[1];
  const entry = { ...(currentEq || {}), weapon: weapon || (currentEq?.weapon || null), echoes: newEchoes, echoSet: echoSetVal, echoSet2: echoSet2Val, echoPreset: preset, sequence: currentEq?.sequence || 0 };
  return { aeqKey, entry };
}

export { computeAutoEquipEntry };
