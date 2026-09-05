// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — CollectionTab (extracted from App.jsx)
// Gacha collection gallery with filtering, sorting, and image framing
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSessionState } from '../../hooks/useSessionState.js';
import { toCanvasSpace, CANVAS_WIDTH } from '../../shared/scaling/canvasScale.js';
import { ArrowRight, Calendar, Crown, RefreshCcw, Search, Sparkles, Sword, Upload, X } from 'lucide-react';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS } from '../../data/characters.js';
import { isHealerRole, isSupportRole } from '../teams/calcEngine.js';
import { WEAPON_DATA, getLocalizedWeaponData } from '../../data/weapons.js';
import { ECHO_DATA, ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES, getLocalizedEchoData } from '../../data/echoes.js';
import { WEAPON_RELEASE_ORDER, ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS } from '../../data/constants.js';
import { generateVerticalMaskGradient } from '../../shared/utils/maskGradient.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { CollectionGridSection } from './CollectionGrid.jsx';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { getElementIcon, getWeaponTypeIcon, getStatIcon, getSetIcon, getRegionIcon, getCombatRoleIcon, COMBAT_ROLE_ICONS } from '../../shared/utils/elementVisuals.js';
import { t, getLocale } from '../../utils/i18n.js';

// ECHO_SETS is declared oldest-first (each block of sets is commented with its game version, e.g.
// "v3.5 — Land of Xuanfang") — reversed so the newest sonata sets sort first, matching the same
// newest-first convention already applied to the Team tab's own set filters.
const SET_RELEASE_ORDER_INDEX = new Map([...Object.keys(ECHO_SETS)].reverse().map((name, i) => [name, i]));
const SORTED_ECHO_SONATA_SETS = [...ALL_ECHO_SONATA_SETS].sort((a, b) =>
  (SET_RELEASE_ORDER_INDEX.get(a) ?? 999) - (SET_RELEASE_ORDER_INDEX.get(b) ?? 999)
);

function CollectionTab({
  state,
  collectionData,
  collectionImages,
  visualSettings,
  setActiveTab,
  setDetailModal,
  activeBanners,
  withCacheBuster,
  refreshImages,
  handleSetProfilePic,
  ownedChars,
  setOwnedChars,
  manualCounts,
  setManualCounts,
}) {
  const { framingMode, editingImage, setEditingImage, getImageFraming } = useImageFramingContext();
  // Localized weapon names for grid card display — dataLookup passed to the grid is otherwise the
  // raw English-keyed WEAPON_DATA, whose `name` isn't itself translated for French. Locale switches
  // reload the app (see setAppLocale in i18n.js), so this doesn't need to react to locale changes
  // within a single render lifetime — recomputed each render like getLocalizedWeaponData() calls
  // elsewhere (e.g. WeaponDetailModal.jsx).
  const localizedWeaponData = getLocalizedWeaponData(getLocale());
  const localizedEchoData = getLocalizedEchoData(getLocale());

  // ── Tab-local state (persisted across tab switches via sessionStorage) ────────
  const [collectionSort, setCollectionSort] = useSessionState('ww-coll-sort', 'release');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef(null);
  const handleSearchChange = useCallback((val) => {
    setCollectionSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 150);
  }, []);
  const [collectionCategoryFilter, setCollectionCategoryFilter] = useSessionState('ww-coll-cat', 'all');
  const [collectionWeaponFilter, setCollectionWeaponFilter] = useSessionState('ww-coll-weap', 'all');
  const [collectionElementFilter, setCollectionElementFilter] = useSessionState('ww-coll-elem', 'all');
  const [collectionStatFilter, setCollectionStatFilter] = useSessionState('ww-coll-stat', 'all');
  // Weapons view has its own Type/Sub-stat dropdowns that look like the Resonators view's
  // weapon-type/stat-scaling ones but mean something different (weapon type vs. resonator's
  // weapon type, weapon sub-stat vs. resonator stat scaling) — kept in separate state so
  // picking e.g. "Broadblade" in one tab never silently filters the other tab too.
  const [weaponsTypeFilter, setWeaponsTypeFilter] = useSessionState('ww-coll-wtype', 'all');
  const [weaponsStatFilter, setWeaponsStatFilter] = useSessionState('ww-coll-wstat', 'all');
  const [collectionDamageFilter, setCollectionDamageFilter] = useSessionState('ww-coll-dmg', 'all');
  const [collectionRoleFilter, setCollectionRoleFilter] = useSessionState('ww-coll-role', 'all');
  const [collectionCombatRoleFilter, setCollectionCombatRoleFilter] = useSessionState('ww-coll-crole', 'all');
  const [collectionRegionFilter, setCollectionRegionFilter] = useSessionState('ww-coll-region', 'all');
  const [collectionTierFilter, setCollectionTierFilter] = useSessionState('ww-coll-tier', 'all');
  const [collectionEchoSetFilter, setCollectionEchoSetFilter] = useSessionState('ww-coll-eset', 'all');
  const [collectionEchoBuffFilter, setCollectionEchoBuffFilter] = useSessionState('ww-coll-ebuf', 'all');
  const [collectionView, setCollectionView] = useSessionState('ww-coll-view', 'items');
  const [collectionOwnedFilter, setCollectionOwnedFilter] = useSessionState('ww-coll-owned', 'all');

  // ── Initial loading skeleton (shown briefly while collection data is computed) ──
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ── Owned characters tracking + manual copy count overrides ─────────────────
  // Both now lifted to App.jsx (single `usePersistedState` instance per key) so collectionData —
  // computed once in App.jsx and consumed by every tab, not just this one — sees manually-added
  // characters as owned too (e.g. Team tab's "only owned" auto-team was ignoring them before).
  const toggleOwned = useCallback((name) => setOwnedChars(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]), []);
  // Floating +/- counter widget (replaces long-press +1 only)
  const [counterWidget, setCounterWidget] = useState(null); // { name, isCharacter, x, y }
  const [dismissedImport, setDismissedImport] = useState(false);
  const counterWidgetRef = useRef(null);
  const showCounterWidget = useCallback((name, isCharacter, event) => {
    const touch = event?.touches?.[0] || event;
    // clientX/clientY are always REAL screen-space coordinates — convert to
    // canvas-local space since this widget renders `position: fixed` inside
    // ScaledCanvas.jsx's transformed box (see canvasScale.js's own comment).
    const { x, y } = toCanvasSpace(touch?.clientX || 0, touch?.clientY || 0);
    setCounterWidget({ name, isCharacter, x, y });
  }, []);
  const adjustManualCount = useCallback((name, isCharacter, delta) => {
    setManualCounts(prev => {
      const current = prev[name] || 0;
      const max = isCharacter ? 7 : 5;
      const next = Math.max(0, Math.min(max, current + delta));
      if (next === 0) { const { [name]: _, ...rest } = prev; return rest; }
      return { ...prev, [name]: next };
    });
    if (isCharacter && delta > 0) {
      setOwnedChars(prev => prev.includes(name) ? prev : [...prev, name]);
    }
    haptic.light();
  }, []);
  // Dismiss widget on outside click
  useEffect(() => {
    if (!counterWidget) return;
    const dismiss = (e) => { if (counterWidgetRef.current && !counterWidgetRef.current.contains(e.target)) setCounterWidget(null); };
    const timer = setTimeout(() => setCounterWidget(null), 5000); // auto-dismiss after 5s
    document.addEventListener('pointerdown', dismiss);
    return () => { document.removeEventListener('pointerdown', dismiss); clearTimeout(timer); };
  }, [counterWidget]);

  // Merge pull history counts with manual overrides (take the higher value)
  const mergeCount = useCallback((name, historyCount) => Math.max(historyCount || 0, manualCounts[name] || 0), [manualCounts]);

  // ── Derived / computed ────────────────────────────────────────────────────────

  // Combat Role filter options — only tags actually used by at least one character (not the full
  // ~38-tag COMBAT_ROLE_ICONS set, which includes tags no current resonator has).
  // COMBAT_ROLE_ICONS's own key order IS the wiki's fixed, game-wide Combat Role ordering (see its
  // comment in elementVisuals.js) — sorting by that index instead of alphabetically is what makes
  // this list read as a coherent, curated ordering rather than a shuffled A-Z one (same fix already
  // applied to the Team Selector's own Combat Role filter).
  const COMBAT_ROLE_ORDER_INDEX = useMemo(() => new Map(Object.keys(COMBAT_ROLE_ICONS).map((tag, i) => [tag, i])), []);
  const allCombatRoleTags = useMemo(() => {
    const tags = new Set();
    Object.values(CHARACTER_DATA).forEach(d => d.combatRoles?.forEach(t => tags.add(t)));
    return [...tags].sort((a, b) => (COMBAT_ROLE_ORDER_INDEX.get(a) ?? 999) - (COMBAT_ROLE_ORDER_INDEX.get(b) ?? 999));
  }, [COMBAT_ROLE_ORDER_INDEX]);

  // Keyword tags for search matching
  const getSearchTags = useCallback((name, isCharacter) => {
    const tags = [name.toLowerCase()];
    if (isCharacter) {
      const data = CHARACTER_DATA[name];
      if (data) {
        tags.push(data.element?.toLowerCase());
        if (data.elements) data.elements.forEach(e => tags.push(e.toLowerCase()));
        tags.push(data.weapon?.toLowerCase());
        tags.push(data.role?.toLowerCase());
        if (data.role === 'Main DPS' || data.role === 'Sub DPS') tags.push('dps');
        if (data.role === 'Healer') tags.push('heal', 'healing');
        if (data.role === 'Support') tags.push('buff', 'buffer', 'utility');
        if (data.role === 'Sub DPS') tags.push('sub', 'off-field', 'coordinated');
        if (data.desc) tags.push(data.desc.toLowerCase());
        if (data.dmgFocus) data.dmgFocus.forEach(d => tags.push(d.toLowerCase()));
        if (data.statScaling) tags.push(data.statScaling.toLowerCase(), data.statScaling.toLowerCase() + ' scaling');
        const buffs = CHAR_BUFF_TABLE[name];
        if (buffs) {
          const allBuffs = [...(buffs.outroBuffs || []), ...(buffs.libBuffs || []), ...(buffs.selfBuffs || [])];
          allBuffs.forEach(b => {
            if (b.stat) tags.push(b.stat.toLowerCase());
            if (b.stat === 'basicDmg') tags.push('basic atk', 'basic attack');
            if (b.stat === 'heavyDmg') tags.push('heavy atk', 'heavy attack', 'charged');
            if (b.stat === 'libDmg') tags.push('liberation');
            if (b.stat === 'echoDmg') tags.push('echo');
            if (b.stat === 'skillDmg') tags.push('skill');
            if (b.stat === 'coordDmg') tags.push('coordinated');
            if (b.stat === 'amplify') tags.push('amplify', 'buff');
            if (b.stat === 'atkPct') tags.push('atk', 'buff');
            if (b.stat === 'critRate' || b.stat === 'critDmg') tags.push('crit', 'buff');
            if (b.stat === 'resShred' || b.stat === 'defShred') tags.push('shred', 'debuff');
          });
          if (buffs.debuffs?.length) tags.push('debuff', 'shred');
        }
      }
    } else {
      const data = WEAPON_DATA[name];
      if (data) {
        tags.push(data.type?.toLowerCase());
        tags.push(data.stat?.toLowerCase());
        if (data.desc) tags.push(data.desc.toLowerCase());
        if (data.stat === 'Crit Rate') tags.push('crit');
        if (data.stat === 'Crit DMG') tags.push('crit');
        if (data.stat === 'ATK%') tags.push('atk', 'attack');
        if (data.stat === 'HP%') tags.push('hp', 'health');
        if (data.stat === 'DEF%') tags.push('def', 'defense');
        if (data.stat === 'Energy Regen') tags.push('energy', 'er');
        if (data.bestFor) data.bestFor.forEach(c => tags.push(c.toLowerCase()));
      }
    }
    return tags.filter(Boolean).join(' ');
  }, []);

  const charMatchesDamage = useCallback((name, damageType) => {
    const data = CHARACTER_DATA[name];
    const focus = data?.dmgFocus;
    if (!focus) return false;
    const mapping = {
      'Basic ATK': 'Basic ATK',
      'Heavy ATK': 'Heavy ATK',
      'Skill': 'Skill',
      'Liberation': 'Liberation',
      'Echo': 'Echo',
      'Coordinated': 'Coordinated ATK',
    };
    return focus.includes(mapping[damageType] || damageType);
  }, []);

  const charMatchesStat = useCallback((name, statType) => {
    const data = CHARACTER_DATA[name];
    if (!data || !data.statScaling) return false;
    return data.statScaling === statType;
  }, []);

  const filterCollectionItems = useCallback((items, countsObj, isCharacter = true) => {
    return items.filter(name => {
      const isOwned = ownedChars.includes(name) || (countsObj && countsObj[name] > 0);
      if (collectionOwnedFilter === 'owned' && !isOwned) return false;
      if (collectionOwnedFilter === 'not-owned' && isOwned) return false;
      if (collectionCategoryFilter === 'character' && !isCharacter) return false;
      if (collectionCategoryFilter === 'weapon' && isCharacter) return false;
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const searchTags = getSearchTags(name, isCharacter);
        if (!searchTags.includes(searchLower)) return false;
      }
      if (isCharacter) {
        const data = CHARACTER_DATA[name];
        if (data) {
          if (collectionElementFilter !== 'all' && data.element !== collectionElementFilter) return false;
          if (collectionWeaponFilter !== 'all' && data.weapon !== collectionWeaponFilter) return false;
          if (collectionRoleFilter === 'Healer' && !isHealerRole(data.role)) return false;
          if (collectionRoleFilter === 'Support' && !isSupportRole(data.role)) return false;
          if ((collectionRoleFilter === 'Main DPS' || collectionRoleFilter === 'Sub DPS') && data.role !== collectionRoleFilter) return false;
          if (collectionStatFilter !== 'all' && !charMatchesStat(name, collectionStatFilter)) return false;
          if (collectionDamageFilter !== 'all' && !charMatchesDamage(name, collectionDamageFilter)) return false;
          if (collectionRegionFilter !== 'all' && data.region !== collectionRegionFilter) return false;
          if (collectionTierFilter !== 'all' && !(data.tier && (data.tier.toa === collectionTierFilter || data.tier.ww === collectionTierFilter))) return false;
          if (collectionCombatRoleFilter !== 'all' && !data.combatRoles?.includes(collectionCombatRoleFilter)) return false;
        }
      } else {
        const data = WEAPON_DATA[name];
        if (data) {
          if (weaponsTypeFilter !== 'all' && data.type !== weaponsTypeFilter) return false;
          if (weaponsStatFilter !== 'all' && data.stat !== weaponsStatFilter) return false;
        }
      }
      return true;
    });
  }, [debouncedSearch, collectionCategoryFilter, collectionElementFilter, collectionWeaponFilter, collectionStatFilter, collectionDamageFilter, collectionRoleFilter, collectionCombatRoleFilter, collectionRegionFilter, collectionTierFilter, collectionOwnedFilter, weaponsTypeFilter, weaponsStatFilter, ownedChars, getSearchTags, charMatchesStat, charMatchesDamage]);

  // "Clear all" only touches the filters shown on the CURRENT view — each view's dropdowns
  // are their own independent state (Resonators' weapon-type/stat-scaling filters are separate
  // from Weapons' type/sub-stat filters), so clearing shouldn't reach into other tabs either.
  const clearCollectionFilters = useCallback(() => {
    handleSearchChange('');
    if (collectionView === 'items') {
      setCollectionCategoryFilter('all');
      setCollectionWeaponFilter('all');
      setCollectionElementFilter('all');
      setCollectionStatFilter('all');
      setCollectionDamageFilter('all');
      setCollectionRoleFilter('all');
      setCollectionCombatRoleFilter('all');
      setCollectionRegionFilter('all');
      setCollectionTierFilter('all');
      setCollectionOwnedFilter('all');
    } else if (collectionView === 'weapons') {
      setWeaponsTypeFilter('all');
      setWeaponsStatFilter('all');
    } else if (collectionView === 'echoes') {
      setCollectionEchoSetFilter('all');
      setCollectionEchoBuffFilter('all');
    }
  }, [collectionView]);

  const filterEchoes = useCallback((echoNames) => {
    return echoNames.filter(name => {
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const nameLower = name.toLowerCase();
        const data = ECHO_DATA[name];
        const matchesName = nameLower.includes(searchLower);
        const matchesSet = data?.sets?.some(s => s.toLowerCase().includes(searchLower));
        const matchesBuff = Array.isArray(data?.buff)
          ? data.buff.some(b => b.toLowerCase().includes(searchLower))
          : data?.buff?.toLowerCase().includes(searchLower);
        const matchesElement = data?.sets?.some(s => ECHO_SETS[s]?.element?.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesSet && !matchesBuff && !matchesElement) return false;
      }
      const data = ECHO_DATA[name];
      if (!data) return true;
      if (collectionEchoSetFilter !== 'all' && !(data.sets || []).includes(collectionEchoSetFilter)) return false;
      if (collectionEchoBuffFilter !== 'all' && !(Array.isArray(data.buff) ? data.buff.includes(collectionEchoBuffFilter) : data.buff === collectionEchoBuffFilter)) return false;
      return true;
    });
  }, [debouncedSearch, collectionEchoSetFilter, collectionEchoBuffFilter]);

  // View-scoped: only reflects filters visible on the current tab, so switching tabs doesn't
  // show a stale "Filters active" badge for filters that live on a different tab.
  const hasActiveFilters = useMemo(() => {
    if (collectionView === 'items') {
      return !!(debouncedSearch || collectionCategoryFilter !== 'all' || collectionElementFilter !== 'all' || collectionWeaponFilter !== 'all' || collectionStatFilter !== 'all' || collectionDamageFilter !== 'all' || collectionRoleFilter !== 'all' || collectionCombatRoleFilter !== 'all' || collectionRegionFilter !== 'all' || collectionTierFilter !== 'all' || collectionOwnedFilter !== 'all');
    }
    if (collectionView === 'weapons') {
      return !!(debouncedSearch || weaponsTypeFilter !== 'all' || weaponsStatFilter !== 'all');
    }
    return !!(debouncedSearch || collectionEchoSetFilter !== 'all' || collectionEchoBuffFilter !== 'all');
  }, [collectionView, debouncedSearch, collectionCategoryFilter, collectionElementFilter, collectionWeaponFilter, collectionStatFilter, collectionDamageFilter, collectionRoleFilter, collectionCombatRoleFilter, collectionRegionFilter, collectionTierFilter, collectionOwnedFilter, weaponsTypeFilter, weaponsStatFilter, collectionEchoSetFilter, collectionEchoBuffFilter]);

  // Extended sort: apply DPS/name/tier sorting on top of the base sortItems result
  const applySortOverride = useCallback((items) => {
    if (collectionSort === 'dps') {
      return [...items].sort((a, b) => {
        const dA = CHARACTER_DATA[a[0]];
        const dB = CHARACTER_DATA[b[0]];
        return ((dB?.totalMult || 0) / (dB?.rotTime || 25)) - ((dA?.totalMult || 0) / (dA?.rotTime || 25));
      });
    } else if (collectionSort === 'name') {
      return [...items].sort((a, b) => a[0].localeCompare(b[0]));
    } else if (collectionSort === 'nameDesc') {
      return [...items].sort((a, b) => b[0].localeCompare(a[0]));
    } else if (collectionSort === 'tier') {
      const tierOrder = { 'T0': 0, 'T0.5': 1, 'T1': 2, 'T1.5': 3, 'T2': 4, 'T3': 5, 'T4': 6 };
      return [...items].sort((a, b) => (tierOrder[CHARACTER_DATA[a[0]]?.tier?.toa] ?? 99) - (tierOrder[CHARACTER_DATA[b[0]]?.tier?.toa] ?? 99));
    }
    return items;
  }, [collectionSort]);

  const collectionMaskData = useMemo(() => ({
    collMask: generateVerticalMaskGradient(visualSettings.collectionFadePosition ?? 50, visualSettings.collectionFadeIntensity ?? 50, visualSettings.collectionFadeDirection || 'down'),
    collOpacity: (visualSettings.collectionOpacity ?? 100) / 100,
  }), [visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection, visualSettings.collectionOpacity]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div role="tabpanel" id="tabpanel-gathering" aria-labelledby="tab-gathering" tabIndex="0">
    <TabErrorBoundary tabName={t('tabs.collection')}>
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="gathering" />

      {initialLoading && state.profile.importedAt ? (
        <div className="space-y-2">
          <div className="kuro-skeleton kuro-skeleton-stat rounded-lg" />
          <div className="kuro-skeleton kuro-skeleton-row rounded-lg" />
          <div className="kuro-skeleton kuro-skeleton-row rounded-lg" />
          <div className="kuro-skeleton kuro-skeleton-stat rounded-lg" />
        </div>
      ) : (
        <>
          {/* Import prompt toast — non-blocking, dismissible */}
          {!state.profile.importedAt && !dismissedImport && setActiveTab && (
            <div className="flex items-center gap-3 rounded-lg border border-cyan-500/25 bg-cyan-500/5 px-3 py-3 content-layer">
              <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <Upload size={14} className="text-cyan-400 flex-shrink-0" />
                <span className="text-cyan-300/90 text-sm">{t('collection.importPromptPre')} <strong>{t('collection.importPromptTab')}</strong> {t('collection.importPromptPost')}</span>
                <ArrowRight size={12} className="text-cyan-400/60 flex-shrink-0" />
              </button>
              <button onClick={() => setDismissedImport(true)} className="kuro-btn kuro-btn-sm flex-shrink-0 p-1.5" aria-label={t('collection.dismiss')}><X size={14} /></button>
            </div>
          )}
          {/* Overall Collection Summary */}
          {(() => {
            try {
            // Include both pull-history ownership AND manual toggles
            const manualOwned5 = ownedChars.filter(n => ALL_5STAR_RESONATORS.includes(n) && !collectionData.chars5Counts[n]);
            const manualOwned4 = ownedChars.filter(n => ALL_4STAR_RESONATORS.includes(n) && !collectionData.chars4Counts[n]);
            const ownedChars5 = Object.keys(collectionData.chars5Counts).length + manualOwned5.length;
            const ownedChars4 = Object.keys(collectionData.chars4Counts).length + manualOwned4.length;
            const ownedWeaps5 = Object.keys(collectionData.weaps5Counts).length;
            const ownedWeaps4 = Object.keys(collectionData.weaps4Counts).length;
            const ownedWeaps3 = Object.keys(collectionData.weaps3Counts).length;
            const ownedWeaps2 = Object.keys(collectionData.weaps2Counts).length;
            const ownedWeaps1 = Object.keys(collectionData.weaps1Counts).length;
            const totalOwned = ownedChars5 + ownedChars4 + ownedWeaps5 + ownedWeaps4 + ownedWeaps3 + ownedWeaps2 + ownedWeaps1;
            const totalItems = ALL_5STAR_RESONATORS.length + ALL_4STAR_RESONATORS.length + ALL_5STAR_WEAPONS.length + ALL_4STAR_WEAPONS.length + ALL_3STAR_WEAPONS.length + ALL_2STAR_WEAPONS.length + ALL_1STAR_WEAPONS.length;
            const pct = totalItems > 0 ? Math.round((totalOwned / totalItems) * 100) : 0;
            return (
              <Card><CardBody>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-base font-medium">{t('collection.progress.title')}</span>
                  <span className="text-yellow-400 text-xl font-bold kuro-number">{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-stat)' }}>
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-[width] duration-300 progress-fill" style={{width: `${pct}%`}} />
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-sm">
                  <div><div className="text-yellow-400 font-bold">{ownedChars5}<span className="text-gray-500 font-normal">/{ALL_5STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.resonator5')}</div></div>
                  <div><div className="text-purple-400 font-bold">{ownedChars4}<span className="text-gray-500 font-normal">/{ALL_4STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.resonator4')}</div></div>
                  <div><div className="text-yellow-400 font-bold">{ownedWeaps5}<span className="text-gray-500 font-normal">/{ALL_5STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.weapon5')}</div></div>
                  <div><div className="text-purple-400 font-bold">{ownedWeaps4}<span className="text-gray-500 font-normal">/{ALL_4STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.weapon4')}</div></div>
                  <div><div className="text-blue-400 font-bold">{ownedWeaps3}<span className="text-gray-500 font-normal">/{ALL_3STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.weapon3')}</div></div>
                  <div><div className="text-green-400 font-bold">{ownedWeaps2}<span className="text-gray-500 font-normal">/{ALL_2STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.weapon2')}</div></div>
                  <div><div className="text-gray-400 font-bold">{ownedWeaps1}<span className="text-gray-500 font-normal">/{ALL_1STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">{t('collection.progress.weapon1')}</div></div>
                </div>
              </CardBody></Card>
            );
            } catch (e) { return null; }
          })()}

          {/* Search & Filters */}
          <div className="space-y-2" style={{position: 'relative', zIndex: 10}}>
            {/* Search Input */}
            <div className="relative kuro-search-wrap">
              <input
                type="text"
                value={collectionSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('collection.search.placeholder')}
                className="kuro-input w-full text-base"
                style={{ paddingLeft: 32 }}
                aria-label={t('collection.search.ariaLabel')}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              {collectionSearch && (
                <button onClick={() => handleSearchChange('')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors" aria-label={t('collection.search.clear')}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="space-y-1.5">
              {/* View Toggle */}
              <Card style={{ position: 'relative', zIndex: 20 }}>
                <CardBody>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCollectionView('items')}
                      className={`kuro-btn flex-1 flex items-center justify-center gap-1 ${collectionView === 'items' ? 'active-gold' : ''}`}
                      title={t('collection.view.resonators')}
                      aria-label={t('collection.view.viewResonators')}
                      aria-pressed={collectionView === 'items'}
                    >
                      <Crown size={12} className="inline mr-1" />{t('collection.view.resonators')}
                    </button>
                    <button
                      onClick={() => { setCollectionView('weapons'); if (collectionSort === 'dps' || collectionSort === 'tier') setCollectionSort('copies'); }}
                      className={`kuro-btn flex-1 flex items-center justify-center gap-1 ${collectionView === 'weapons' ? 'active-pink' : ''}`}
                      title={t('collection.view.weapons')}
                      aria-label={t('collection.view.viewWeapons')}
                      aria-pressed={collectionView === 'weapons'}
                    >
                      <Sword size={12} className="inline mr-1" />{t('collection.view.weapons')}
                    </button>
                    <button
                      onClick={() => { setCollectionView('echoes'); if (collectionSort === 'dps' || collectionSort === 'tier') setCollectionSort('copies'); }}
                      className={`kuro-btn flex-1 flex items-center justify-center gap-1 ${collectionView === 'echoes' ? 'active-cyan' : ''}`}
                      title={t('collection.view.echoes')}
                      aria-label={t('collection.view.viewEchoes')}
                      aria-pressed={collectionView === 'echoes'}
                    >
                      <Sparkles size={12} className="inline mr-1" />{t('collection.view.echoes')}
                    </button>
                  </div>
                </CardBody>
              </Card>
              {/* Filter Dropdowns — context-sensitive per view */}
              <Card>
                <CardBody>
              {hasActiveFilters && (
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="kuro-badge kuro-badge-yellow font-medium" style={{ borderRadius: 'var(--radius-pill)' }}>
                      {t('collection.filters.active')}
                    </span>
                  </div>
                  <button onClick={clearCollectionFilters} className="text-sm text-gray-400 hover:text-white underline">
                    {t('collection.filters.clearAll')}
                  </button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1.5">

                {/* ── Resonators view: Type, Elements, Stat Scaling, Damage, Rôle ── */}
                {collectionView === 'items' && (<>
                  <KuroSelect
                    value={collectionWeaponFilter}
                    onChange={setCollectionWeaponFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allTypes') },
                      ...['Broadblade', 'Sword', 'Pistols', 'Gauntlets', 'Rectifier'].map(wt => ({
                        value: wt,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getWeaponTypeIcon(wt)} alt="" width={14} height={14} className="shrink-0" /> {wt}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.byWeaponType')}
                  />
                  <KuroSelect
                    value={collectionElementFilter}
                    onChange={setCollectionElementFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allElements') },
                      ...['Aero', 'Glacio', 'Electro', 'Fusion', 'Spectro', 'Havoc'].map(el => ({
                        value: el,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getElementIcon(el)} alt="" width={14} height={14} className="shrink-0" /> {el}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.byElement')}
                  />
                  <KuroSelect
                    value={collectionStatFilter}
                    onChange={setCollectionStatFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.statScaling') },
                      ...[
                        ['ATK', 'ATK%'], ['HP', 'HP%'], ['DEF', 'DEF%'],
                        ['Crit Rate', 'Crit Rate'], ['Crit DMG', 'Crit DMG'], ['Energy Regen', 'Energy Regen'],
                      ].map(([val, text]) => ({
                        value: val,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getStatIcon(val)} alt="" width={14} height={14} className="shrink-0" /> {text}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.byStatScaling')}
                  />
                  <KuroSelect
                    value={collectionDamageFilter}
                    onChange={setCollectionDamageFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allDamage') },
                      ...[
                        ['Basic ATK', t('collection.damage.basicAtk')], ['Heavy ATK', t('collection.damage.heavyAtk')],
                        ['Skill', t('collection.damage.skill')], ['Liberation', t('collection.damage.liberation')],
                        ['Echo', t('collection.damage.echo')], ['Coordinated', t('collection.damage.coordinated')],
                      ].map(([val, tag]) => ({
                        value: val,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getCombatRoleIcon(val)} alt="" width={14} height={14} className="shrink-0" /> {tag}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.byDamageType')}
                  />
                  <KuroSelect
                    value={collectionRoleFilter}
                    onChange={setCollectionRoleFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allRoles') },
                      // 'Main Damage Dealer'/'Support and Healer' are real Combat Role icons
                      // (COMBAT_ROLE_ICONS) lining up exactly with Main DPS/Support/Healer — no
                      // equivalent exists for Sub DPS, left icon-less rather than guessing one
                      // (same treatment already applied to the Team Selector's Role filter).
                      { value: 'Main DPS', label: <span className="inline-flex items-center gap-1.5"><img src={getCombatRoleIcon('Main Damage Dealer')} alt="" width={14} height={14} className="shrink-0" /> {t('collection.filters.mainDps')}</span> },
                      { value: 'Sub DPS', label: t('collection.filters.subDps') },
                      { value: 'Support', label: <span className="inline-flex items-center gap-1.5"><img src={getCombatRoleIcon('Support and Healer')} alt="" width={14} height={14} className="shrink-0" /> {t('collection.filters.support')}</span> },
                      { value: 'Healer', label: <span className="inline-flex items-center gap-1.5"><img src={getCombatRoleIcon('Support and Healer')} alt="" width={14} height={14} className="shrink-0" /> {t('collection.filters.healer')}</span> },
                    ]}
                    ariaLabel={t('collection.filters.byRole')}
                  />
                  <KuroSelect
                    value={collectionCombatRoleFilter}
                    onChange={setCollectionCombatRoleFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allCombatRoles') },
                      ...allCombatRoleTags.map(tag => {
                        const icon = getCombatRoleIcon(tag);
                        return {
                          value: tag,
                          label: <span className="inline-flex items-center gap-1.5"><img src={icon} alt="" width={14} height={14} className="shrink-0" /> {tag}</span>,
                        };
                      }),
                    ]}
                    ariaLabel={t('collection.filters.byCombatRole')}
                  />
                  <KuroSelect
                    value={collectionRegionFilter}
                    onChange={setCollectionRegionFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allRegions') },
                      ...['Huanglong', 'Rinascita', 'Black Shores', 'Lahai-Roi', 'Night City'].map(r => ({
                        value: r,
                        // Night City has no REGION_ICONS entry yet (no sourced emblem) — guard so it falls
                        // back to text-only instead of rendering a broken <img>. Septimont dropped: no
                        // character's region field actually holds it (folded into Rinascita).
                        label: <span className="inline-flex items-center gap-1.5">{getRegionIcon(r) && <img src={getRegionIcon(r)} alt="" width={14} height={14} className="shrink-0" />} {r}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.byRegion')}
                  />
                  <KuroSelect
                    value={collectionTierFilter}
                    onChange={setCollectionTierFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allTiers') },
                      { value: 'T0', label: 'T0' },
                      { value: 'T0.5', label: 'T0.5' },
                      { value: 'T1', label: 'T1' },
                      { value: 'T1.5', label: 'T1.5' },
                      { value: 'T2', label: 'T2' },
                      { value: 'T3', label: 'T3' },
                      { value: 'T4', label: 'T4' },
                    ]}
                    ariaLabel={t('collection.filters.byTier')}
                  />
                  <KuroSelect
                    value={collectionOwnedFilter}
                    onChange={setCollectionOwnedFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.ownership') },
                      { value: 'owned', label: t('collection.filters.owned') },
                      { value: 'not-owned', label: t('collection.filters.notOwned') },
                    ]}
                    ariaLabel={t('collection.filters.byOwnedStatus')}
                  />
                </>)}

                {/* ── Weapons view: Type, Sub-stat ── */}
                {collectionView === 'weapons' && (<>
                  <KuroSelect
                    value={weaponsTypeFilter}
                    onChange={setWeaponsTypeFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allTypes') },
                      ...['Broadblade', 'Sword', 'Pistols', 'Gauntlets', 'Rectifier'].map(wt => ({
                        value: wt,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getWeaponTypeIcon(wt)} alt="" width={14} height={14} className="shrink-0" /> {wt}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.byWeaponType')}
                  />
                  <KuroSelect
                    value={weaponsStatFilter}
                    onChange={setWeaponsStatFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allSubstats') },
                      ...['ATK%', 'HP%', 'DEF%', 'Crit Rate', 'Crit DMG', 'Energy Regen'].map(s => ({
                        value: s,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getStatIcon(s)} alt="" width={14} height={14} className="shrink-0" /> {s}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.bySubstat')}
                  />
                </>)}

                {/* ── Echoes view: Set, Buff ── */}
                {collectionView === 'echoes' && (<>
                  <KuroSelect
                    value={collectionEchoSetFilter}
                    onChange={setCollectionEchoSetFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allSets') },
                      ...SORTED_ECHO_SONATA_SETS.map(s => ({
                        value: s,
                        label: <span className="inline-flex items-center gap-1.5"><img src={getSetIcon(s)} alt="" width={14} height={14} className="shrink-0" /> {s}</span>,
                      })),
                    ]}
                    ariaLabel={t('collection.filters.bySonataSet')}
                  />
                  <KuroSelect
                    value={collectionEchoBuffFilter}
                    onChange={setCollectionEchoBuffFilter}
                    options={[
                      { value: 'all', label: t('collection.filters.allBuffs') },
                      ...ALL_ECHO_BUFF_TYPES.map(b => {
                        const icon = getElementIcon(b.replace(/ DMG$/, ''));
                        return {
                          value: b,
                          label: icon
                            ? <span className="inline-flex items-center gap-1.5"><img src={icon} alt="" width={14} height={14} className="shrink-0" /> {b}</span>
                            : b,
                        };
                      }),
                    ]}
                    ariaLabel={t('collection.filters.byBuffType')}
                  />
                </>)}

                {/* Clear Filters — single button at top of filter area (line 358) */}
              </div>
                </CardBody>
              </Card>
              {/* Sort Controls */}
              <div className="flex gap-1.5 items-center justify-end">
                <button
                  onClick={refreshImages}
                  className="kuro-btn flex items-center justify-center w-[30px] h-[30px] !p-0 !rounded-lg text-gray-400 hover:text-emerald-400 transition-all"
                  title={t('collection.sort.refresh')}
                  aria-label={t('collection.sort.refreshAria')}
                >
                  <RefreshCcw size={12} />
                </button>
                <button
                  onClick={() => setCollectionSort('copies')}
                  className={`kuro-btn flex items-center justify-center w-[30px] h-[30px] !p-0 !rounded-lg text-base font-bold transition-all ${collectionSort === 'copies' ? 'active-gold' : 'text-gray-400'}`}
                  title={t('collection.sort.byCopies')}
                  aria-label={t('collection.sort.byCopies')}
                  aria-pressed={collectionSort === 'copies'}
                >
                  #
                </button>
                <button
                  onClick={() => setCollectionSort('release')}
                  className={`kuro-btn flex items-center justify-center w-[30px] h-[30px] !p-0 !rounded-lg transition-all ${collectionSort === 'release' ? 'active-gold' : 'text-gray-400'}`}
                  title={t('collection.sort.byRelease')}
                  aria-label={t('collection.sort.byRelease')}
                  aria-pressed={collectionSort === 'release'}
                >
                  <Calendar size={12} />
                </button>
                {collectionView === 'items' && (
                  <button
                    onClick={() => setCollectionSort(prev => prev === 'name' ? 'nameDesc' : 'name')}
                    className={`kuro-btn flex items-center justify-center w-[30px] h-[30px] !p-0 !rounded-lg text-sm font-bold transition-all ${collectionSort === 'name' || collectionSort === 'nameDesc' ? 'active-gold' : 'text-gray-400'}`}
                    title={collectionSort === 'nameDesc' ? t('collection.sort.za') : t('collection.sort.az')}
                    aria-label={collectionSort === 'nameDesc' ? t('collection.sort.sortedZA') : t('collection.sort.sortAlpha')}
                    aria-pressed={collectionSort === 'name' || collectionSort === 'nameDesc'}
                  >
                    {collectionSort === 'nameDesc' ? 'A↑' : 'A↓'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {collectionView === 'echoes' && (<>
          {/* 4-Cost Echoes */}
          <Card>
            <CardHeader>
              <span className="text-yellow-400">4</span> {t('collection.sections.costEchoes')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={filterEchoes(ALL_4COST_ECHOES).map(name => [name, 1])}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                countColor="text-yellow-400" countPrefix="" totalCount={ALL_4COST_ECHOES.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 4 })}
                dataLookup={localizedEchoData} dataType="echo" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 3-Cost Echoes */}
          <Card>
            <CardHeader>
              <span className="text-purple-400">3</span> {t('collection.sections.costEchoes')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={filterEchoes(ALL_3COST_ECHOES).map(name => [name, 1])}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                countColor="text-purple-400" countPrefix="" totalCount={ALL_3COST_ECHOES.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 3 })}
                dataLookup={localizedEchoData} dataType="echo" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 1-Cost Echoes */}
          <Card>
            <CardHeader>
              <span className="text-cyan-400">1</span> {t('collection.sections.costEchoes')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={filterEchoes(ALL_1COST_ECHOES).map(name => [name, 1])}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-cyan-500/10" ownedBorder="border-cyan-500/30"
                countColor="text-cyan-400" countPrefix="" totalCount={ALL_1COST_ECHOES.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 1 })}
                dataLookup={localizedEchoData} dataType="echo" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>
          </>)}

          {collectionView === 'items' && (<>
          {/* 5★ Resonators */}
          <Card>
            <CardHeader>
              <span className="text-yellow-400">★★★★★</span> {t('collection.sections.resonators')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={applySortOverride(collectionData.sortItems(filterCollectionItems(ALL_5STAR_RESONATORS, collectionData.chars5Counts, true).map(name => [name, mergeCount(name, collectionData.chars5Counts[name])]), collectionSort))}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                countColor="text-yellow-400" countPrefix="S" totalCount={ALL_5STAR_RESONATORS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={CHARACTER_DATA} dataType="character" isCharacter={true}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                ownedChars={ownedChars} toggleOwned={toggleOwned}
                onLongPress={showCounterWidget}
                isFullAnim={visualSettings?.animationsEnabled === 'full'}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 4★ Resonators */}
          <Card>
            <CardHeader>
              <span className="text-purple-400">★★★★</span> {t('collection.sections.resonators')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={applySortOverride(collectionData.sortItems(filterCollectionItems(ALL_4STAR_RESONATORS, collectionData.chars4Counts, true).map(name => [name, mergeCount(name, collectionData.chars4Counts[name])]), collectionSort))}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                countColor="text-purple-400" countPrefix="S" totalCount={ALL_4STAR_RESONATORS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={CHARACTER_DATA} dataType="character" isCharacter={true}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                ownedChars={ownedChars} toggleOwned={toggleOwned}
                onLongPress={showCounterWidget}
                isFullAnim={visualSettings?.animationsEnabled === 'full'}
                collapsible
              />
            </CardBody>
          </Card>
          </>)}

          {collectionView === 'weapons' && (<>
          {/* 5★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-yellow-400">★★★★★</span> {t('collection.sections.weapons')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_5STAR_WEAPONS, collectionData.weaps5Counts, false).map(name => [name, mergeCount(name, collectionData.weaps5Counts[name])]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                countColor="text-yellow-400" countPrefix="R" totalCount={ALL_5STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={localizedWeaponData} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                onLongPress={showCounterWidget}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 4★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-purple-400">★★★★</span> {t('collection.sections.weapons')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_4STAR_WEAPONS, collectionData.weaps4Counts, false).map(name => [name, mergeCount(name, collectionData.weaps4Counts[name])]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                countColor="text-purple-400" countPrefix="R" totalCount={ALL_4STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={localizedWeaponData} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                onLongPress={showCounterWidget}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 3★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-blue-400">★★★</span> {t('collection.sections.weapons')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_3STAR_WEAPONS, collectionData.weaps3Counts, false).map(name => [name, mergeCount(name, collectionData.weaps3Counts[name])]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-blue-500/10" ownedBorder="border-blue-500/30"
                countColor="text-blue-400" countPrefix="R" totalCount={ALL_3STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={localizedWeaponData} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                onLongPress={showCounterWidget}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 2★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-green-400">★★</span> {t('collection.sections.weapons')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_2STAR_WEAPONS, collectionData.weaps2Counts, false).map(name => [name, mergeCount(name, collectionData.weaps2Counts[name])]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-green-500/10" ownedBorder="border-green-500/30"
                countColor="text-green-400" countPrefix="R" totalCount={ALL_2STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={localizedWeaponData} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                onLongPress={showCounterWidget}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 1★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-gray-400">★</span> {t('collection.sections.weapons')}
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_1STAR_WEAPONS, collectionData.weaps1Counts, false).map(name => [name, mergeCount(name, collectionData.weaps1Counts[name])]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-gray-500/10" ownedBorder="border-gray-500/30"
                countColor="text-gray-400" countPrefix="R" totalCount={ALL_1STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={localizedWeaponData} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                onLongPress={showCounterWidget}
                collapsible
              />
            </CardBody>
          </Card>
          </>)}
        </>
      )}
    </div>

    {/* Floating -/+ counter widget (appears on long-press of collection card) */}
    {counterWidget && (
      <div ref={counterWidgetRef}
        className="kuro-card fixed z-50 flex items-center gap-1.5 p-1.5"
        style={{
          left: Math.min(counterWidget.x - 60, CANVAS_WIDTH - 140),
          top: Math.max(counterWidget.y - 50, 10),
        }}>
        <button
          className="kuro-btn w-12 h-12 flex items-center justify-center text-lg font-bold text-red-400 hover:bg-red-500/20"
          onClick={() => adjustManualCount(counterWidget.name, counterWidget.isCharacter, -1)}
          aria-label={t('collection.widget.removeOne')}
        >−</button>
        <div className="text-center min-w-[48px] px-1">
          <div className="text-white text-base font-bold kuro-number">{manualCounts[counterWidget.name] || 0}</div>
          <div className="text-gray-500 text-2xs truncate max-w-[62px]">{counterWidget.name.split(' ')[0]}</div>
        </div>
        <button
          className="kuro-btn w-12 h-12 flex items-center justify-center text-lg font-bold text-emerald-400 hover:bg-emerald-500/20"
          onClick={() => adjustManualCount(counterWidget.name, counterWidget.isCharacter, +1)}
          aria-label={t('collection.widget.addOne')}
        >+</button>
      </div>
    )}

    </TabErrorBoundary>
    </div>
  );
}

export default React.memo(CollectionTab, (prev, next) =>
  prev.state.profile === next.state.profile && prev.collectionData === next.collectionData &&
  prev.collectionImages === next.collectionImages && prev.visualSettings === next.visualSettings &&
  prev.activeBanners === next.activeBanners
);
