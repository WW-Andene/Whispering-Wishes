// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — CollectionTab (extracted from App.jsx)
// Gacha collection gallery with filtering, sorting, and image framing
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSessionState } from '../../utils/useSessionState.js';
import { Archive, Calendar, Crown, Filter, MapPin, RefreshCcw, Search, Shield, Sparkles, Sword, Swords, Target, X, Zap } from 'lucide-react';
import {
  CHARACTER_DATA, WEAPON_DATA, ECHO_DATA, ECHO_SETS, CHAR_BUFF_TABLE,
  RELEASE_ORDER, WEAPON_RELEASE_ORDER,
  ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS,
  ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS,
  ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES,
  ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES,
  ALL_CHARACTERS,
} from '../../appcore-data.js';
import {
  generateVerticalMaskGradient,
  Card, CardHeader, CardBody, TabBackground, TabErrorBoundary,
  KuroSelect, CollectionGridSection,
} from '../../appcore-components.jsx';

export default function CollectionTab({
  state,
  collectionData,
  collectionImages,
  visualSettings,
  setActiveTab,
  setDetailModal,
  framingMode,
  editingImage,
  setEditingImage,
  activeBanners,
  withCacheBuster,
  getImageFraming,
  refreshImages,
  handleSetProfilePic,
}) {
  // ── Tab-local state (persisted across tab switches via sessionStorage) ────────
  const [collectionSort, setCollectionSort] = useSessionState('ww-coll-sort', 'copies');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionCategoryFilter, setCollectionCategoryFilter] = useSessionState('ww-coll-cat', 'all');
  const [collectionWeaponFilter, setCollectionWeaponFilter] = useSessionState('ww-coll-weap', 'all');
  const [collectionElementFilter, setCollectionElementFilter] = useSessionState('ww-coll-elem', 'all');
  const [collectionStatFilter, setCollectionStatFilter] = useSessionState('ww-coll-stat', 'all');
  const [collectionDamageFilter, setCollectionDamageFilter] = useSessionState('ww-coll-dmg', 'all');
  const [collectionRoleFilter, setCollectionRoleFilter] = useSessionState('ww-coll-role', 'all');
  const [collectionRegionFilter, setCollectionRegionFilter] = useSessionState('ww-coll-region', 'all');
  const [collectionTierFilter, setCollectionTierFilter] = useSessionState('ww-coll-tier', 'all');
  const [collectionEchoSetFilter, setCollectionEchoSetFilter] = useSessionState('ww-coll-eset', 'all');
  const [collectionEchoBuffFilter, setCollectionEchoBuffFilter] = useSessionState('ww-coll-ebuf', 'all');
  const [collectionView, setCollectionView] = useSessionState('ww-coll-view', 'items');
  const [collectionOwnedFilter, setCollectionOwnedFilter] = useSessionState('ww-coll-owned', 'all');

  // ── Owned characters tracking (persisted to localStorage) ────────────────────
  const [ownedChars, setOwnedChars] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ww-owned-chars') || '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('ww-owned-chars', JSON.stringify(ownedChars)); } catch {} }, [ownedChars]);
  const toggleOwned = useCallback((name) => setOwnedChars(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]), []);

  // ── Derived / computed ────────────────────────────────────────────────────────

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
            if (b.stat === 'deepen') tags.push('deepen', 'buff');
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
      if (collectionOwnedFilter === 'owned' && !ownedChars.includes(name)) return false;
      if (collectionOwnedFilter === 'not-owned' && ownedChars.includes(name)) return false;
      if (collectionCategoryFilter === 'character' && !isCharacter) return false;
      if (collectionCategoryFilter === 'weapon' && isCharacter) return false;
      if (collectionSearch) {
        const searchLower = collectionSearch.toLowerCase();
        const searchTags = getSearchTags(name, isCharacter);
        if (!searchTags.includes(searchLower)) return false;
      }
      if (isCharacter) {
        const data = CHARACTER_DATA[name];
        if (data) {
          if (collectionElementFilter !== 'all' && data.element !== collectionElementFilter) return false;
          if (collectionWeaponFilter !== 'all' && data.weapon !== collectionWeaponFilter) return false;
          if (collectionRoleFilter !== 'all' && data.role !== collectionRoleFilter) return false;
          if (collectionStatFilter !== 'all' && !charMatchesStat(name, collectionStatFilter)) return false;
          if (collectionDamageFilter !== 'all' && !charMatchesDamage(name, collectionDamageFilter)) return false;
          if (collectionRegionFilter !== 'all' && data.region !== collectionRegionFilter) return false;
          if (collectionTierFilter !== 'all' && !(data.tier && (data.tier.toa === collectionTierFilter || data.tier.ww === collectionTierFilter))) return false;
        }
      } else {
        const data = WEAPON_DATA[name];
        if (data) {
          if (collectionWeaponFilter !== 'all' && data.type !== collectionWeaponFilter) return false;
          if (collectionStatFilter !== 'all' && data.stat !== collectionStatFilter) return false;
        }
      }
      return true;
    });
  }, [collectionSearch, collectionCategoryFilter, collectionElementFilter, collectionWeaponFilter, collectionStatFilter, collectionDamageFilter, collectionRoleFilter, collectionRegionFilter, collectionTierFilter, collectionOwnedFilter, ownedChars, getSearchTags, charMatchesStat, charMatchesDamage]);

  const clearCollectionFilters = useCallback(() => {
    setCollectionSearch('');
    setCollectionCategoryFilter('all');
    setCollectionWeaponFilter('all');
    setCollectionElementFilter('all');
    setCollectionStatFilter('all');
    setCollectionDamageFilter('all');
    setCollectionRoleFilter('all');
    setCollectionRegionFilter('all');
    setCollectionTierFilter('all');
    setCollectionEchoSetFilter('all');
    setCollectionEchoBuffFilter('all');
    setCollectionOwnedFilter('all');
  }, []);

  const filterEchoes = useCallback((echoNames) => {
    return echoNames.filter(name => {
      if (collectionSearch) {
        const searchLower = collectionSearch.toLowerCase();
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
      if (collectionEchoSetFilter !== 'all' && !data.sets.includes(collectionEchoSetFilter)) return false;
      if (collectionEchoBuffFilter !== 'all' && !(Array.isArray(data.buff) ? data.buff.includes(collectionEchoBuffFilter) : data.buff === collectionEchoBuffFilter)) return false;
      return true;
    });
  }, [collectionSearch, collectionEchoSetFilter, collectionEchoBuffFilter]);

  const hasActiveFilters = useMemo(() =>
    !!(collectionSearch || collectionCategoryFilter !== 'all' || collectionElementFilter !== 'all' || collectionWeaponFilter !== 'all' || collectionStatFilter !== 'all' || collectionDamageFilter !== 'all' || collectionRoleFilter !== 'all' || collectionRegionFilter !== 'all' || collectionTierFilter !== 'all' || collectionEchoSetFilter !== 'all' || collectionEchoBuffFilter !== 'all' || collectionOwnedFilter !== 'all'),
    [collectionSearch, collectionCategoryFilter, collectionElementFilter, collectionWeaponFilter, collectionStatFilter, collectionDamageFilter, collectionRoleFilter, collectionRegionFilter, collectionTierFilter, collectionEchoSetFilter, collectionEchoBuffFilter, collectionOwnedFilter]
  );

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
    <TabErrorBoundary tabName="Collection">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="gathering" />

      {!state.profile.importedAt ? (
        <Card>
          <CardBody className="text-center py-8">
            <Archive size={32} className="mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400 text-sm">Awaiting Convene data transmission</p>
            <p className="text-gray-500 text-xs mt-1 mb-3">Import via Profile to initialize your archive</p>
            <button onClick={() => setActiveTab('profile')} className="kuro-btn active-cyan text-xs px-4 py-2">Open Profile to import</button>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Overall Collection Summary */}
          {(() => {
            try {
            const ownedChars5 = Object.keys(collectionData.chars5Counts).length;
            const ownedChars4 = Object.keys(collectionData.chars4Counts).length;
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
                  <span className="text-white text-xs font-medium">Collection Progress</span>
                  <span className="text-yellow-400 text-sm font-bold">{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-stat)' }}>
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-[width] duration-300" style={{width: `${pct}%`}} />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center text-[10px]">
                  <div><div className="text-yellow-400 font-bold">{ownedChars5}<span className="text-gray-500 font-normal">/{ALL_5STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">5★ Res</div></div>
                  <div><div className="text-purple-400 font-bold">{ownedChars4}<span className="text-gray-500 font-normal">/{ALL_4STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">4★ Res</div></div>
                  <div><div className="text-yellow-400 font-bold">{ownedWeaps5}<span className="text-gray-500 font-normal">/{ALL_5STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">5★ Wep</div></div>
                  <div><div className="text-purple-400 font-bold">{ownedWeaps4}<span className="text-gray-500 font-normal">/{ALL_4STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">4★ Wep</div></div>
                  <div><div className="text-blue-400 font-bold">{ownedWeaps3}<span className="text-gray-500 font-normal">/{ALL_3STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">3★ Wep</div></div>
                  <div><div className="text-green-400 font-bold">{ownedWeaps2}<span className="text-gray-500 font-normal">/{ALL_2STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">2★ Wep</div></div>
                  <div><div className="text-gray-400 font-bold">{ownedWeaps1}<span className="text-gray-500 font-normal">/{ALL_1STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">1★ Wep</div></div>
                </div>
              </CardBody></Card>
            );
            } catch (e) { return null; }
          })()}

          {/* Search & Filters */}
          <div className="space-y-2" style={{position: 'relative', zIndex: 10}}>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                placeholder="Search by name, DPS, Electro, Broadblade..."
                className="w-full px-3 py-2 pl-8 rounded-lg text-xs border border-[var(--border-medium)] text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
                style={{ background: 'var(--bg-btn)' }}
                aria-label="Search collection by keyword"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              {collectionSearch && (
                <button onClick={() => setCollectionSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" aria-label="Clear search">
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
                      onClick={() => { setCollectionView('items'); setCollectionEchoSetFilter('all'); setCollectionEchoBuffFilter('all'); }}
                      className={`kuro-btn flex-1 ${collectionView === 'items' ? 'active-gold' : ''}`}
                      title="Characters"
                      aria-label="View characters"
                      aria-pressed={collectionView === 'items'}
                    >
                      <Crown size={12} className="inline mr-1" />Characters
                    </button>
                    <button
                      onClick={() => { setCollectionView('weapons'); setCollectionElementFilter('all'); setCollectionDamageFilter('all'); setCollectionRoleFilter('all'); setCollectionRegionFilter('all'); setCollectionTierFilter('all'); setCollectionEchoSetFilter('all'); setCollectionEchoBuffFilter('all'); setCollectionOwnedFilter('all'); if (collectionSort === 'dps' || collectionSort === 'tier') setCollectionSort('copies'); }}
                      className={`kuro-btn flex-1 ${collectionView === 'weapons' ? 'active-pink' : ''}`}
                      title="Weapons"
                      aria-label="View weapons"
                      aria-pressed={collectionView === 'weapons'}
                    >
                      <Sword size={12} className="inline mr-1" />Weapons
                    </button>
                    <button
                      onClick={() => { setCollectionView('echoes'); setCollectionCategoryFilter('all'); setCollectionWeaponFilter('all'); setCollectionElementFilter('all'); setCollectionStatFilter('all'); setCollectionDamageFilter('all'); setCollectionRoleFilter('all'); setCollectionRegionFilter('all'); setCollectionTierFilter('all'); setCollectionOwnedFilter('all'); if (collectionSort === 'dps' || collectionSort === 'tier') setCollectionSort('copies'); }}
                      className={`kuro-btn flex-1 ${collectionView === 'echoes' ? 'active-cyan' : ''}`}
                      title="Echoes"
                      aria-label="View echoes"
                      aria-pressed={collectionView === 'echoes'}
                    >
                      <Sparkles size={12} className="inline mr-1" />Echoes
                    </button>
                  </div>
                </CardBody>
              </Card>
              {/* Filter + Sort Controls — compact icon buttons */}
              {(() => {
                const iconBtn = (active, onClick, title, icon, ariaLabel) => (
                  <button onClick={onClick} className={`kuro-btn flex items-center justify-center w-[28px] h-[28px] !p-0 !rounded-lg transition-all ${active ? 'active-gold' : 'text-gray-400'}`} title={title} aria-label={ariaLabel || title} aria-pressed={active}>{icon}</button>
                );
                const cycleFilter = (current, options, setter) => {
                  const idx = options.indexOf(current);
                  setter(options[(idx + 1) % options.length]);
                };
                const weapTypes = ['all', 'Broadblade', 'Sword', 'Pistols', 'Gauntlets', 'Rectifier'];
                const elements = ['all', 'Aero', 'Glacio', 'Electro', 'Fusion', 'Spectro', 'Havoc'];
                const roles = ['all', 'Main DPS', 'Sub DPS', 'Support', 'Healer'];
                const stats = ['all', 'ATK', 'HP', 'DEF', 'Crit Rate', 'Crit DMG', 'Energy Regen'];
                const regions = ['all', 'Huanglong', 'Rinascita', 'Black Shores', 'Septimont', 'Lahai-Roi'];
                const owned = ['all', 'owned', 'not-owned'];
                const weapStats = ['all', 'ATK%', 'HP%', 'DEF%', 'Crit Rate', 'Crit DMG', 'Energy Regen'];
                return (
                  <div className="flex gap-1 items-center flex-wrap justify-end">
                    {/* Filters — character view */}
                    {collectionView === 'items' && (<>
                      {iconBtn(collectionWeaponFilter !== 'all', () => cycleFilter(collectionWeaponFilter, weapTypes, setCollectionWeaponFilter), `Weapon: ${collectionWeaponFilter}`, <Sword size={12} />)}
                      {iconBtn(collectionElementFilter !== 'all', () => cycleFilter(collectionElementFilter, elements, setCollectionElementFilter), `Element: ${collectionElementFilter}`, <Zap size={12} />)}
                      {iconBtn(collectionRoleFilter !== 'all', () => cycleFilter(collectionRoleFilter, roles, setCollectionRoleFilter), `Role: ${collectionRoleFilter}`, <Shield size={12} />)}
                      {iconBtn(collectionStatFilter !== 'all', () => cycleFilter(collectionStatFilter, stats, setCollectionStatFilter), `Stat: ${collectionStatFilter}`, <Target size={12} />)}
                      {iconBtn(collectionDamageFilter !== 'all', () => cycleFilter(collectionDamageFilter, ['all', 'Basic ATK', 'Heavy ATK', 'Skill', 'Liberation', 'Echo', 'Coordinated'], setCollectionDamageFilter), `Damage: ${collectionDamageFilter}`, <Swords size={12} />)}
                      {iconBtn(collectionRegionFilter !== 'all', () => cycleFilter(collectionRegionFilter, regions, setCollectionRegionFilter), `Region: ${collectionRegionFilter}`, <MapPin size={12} />)}
                      {iconBtn(collectionOwnedFilter !== 'all', () => cycleFilter(collectionOwnedFilter, owned, setCollectionOwnedFilter), `Owned: ${collectionOwnedFilter}`, <Crown size={12} />)}
                    </>)}
                    {/* Filters — weapons view */}
                    {collectionView === 'weapons' && (<>
                      {iconBtn(collectionWeaponFilter !== 'all', () => cycleFilter(collectionWeaponFilter, weapTypes, setCollectionWeaponFilter), `Weapon: ${collectionWeaponFilter}`, <Sword size={12} />)}
                      {iconBtn(collectionStatFilter !== 'all', () => cycleFilter(collectionStatFilter, weapStats, setCollectionStatFilter), `Sub-stat: ${collectionStatFilter}`, <Target size={12} />)}
                    </>)}
                    {/* Filters — echoes view */}
                    {collectionView === 'echoes' && (<>
                      {iconBtn(collectionEchoSetFilter !== 'all', () => cycleFilter(collectionEchoSetFilter, ['all', ...ALL_ECHO_SONATA_SETS], setCollectionEchoSetFilter), `Set: ${collectionEchoSetFilter}`, <Sparkles size={12} />)}
                      {iconBtn(collectionEchoBuffFilter !== 'all', () => cycleFilter(collectionEchoBuffFilter, ['all', ...ALL_ECHO_BUFF_TYPES], setCollectionEchoBuffFilter), `Buff: ${collectionEchoBuffFilter}`, <Zap size={12} />)}
                    </>)}
                    {/* Clear filters */}
                    {hasActiveFilters && iconBtn(true, clearCollectionFilters, 'Clear all filters', <X size={12} />, 'Clear all filters')}
                    {/* Separator */}
                    <div className="w-px h-5 bg-gray-700/50 mx-0.5" />
                    {/* Sort controls */}
                    {iconBtn(collectionSort === 'copies', () => setCollectionSort('copies'), 'Sort by copies', <span className="text-[11px] font-bold">#</span>)}
                    {iconBtn(collectionSort === 'release', () => setCollectionSort('release'), 'Sort by release', <Calendar size={12} />)}
                    {iconBtn(collectionSort === 'name', () => setCollectionSort('name'), 'Sort A-Z', <span className="text-[10px] font-bold">Az</span>)}
                    {iconBtn(false, refreshImages, 'Refresh images', <RefreshCcw size={12} />)}
                  </div>
                );
              })()}
            </div>
          </div>

          {collectionView === 'echoes' && (<>
          {/* 4-Cost Echoes */}
          <Card>
            <CardHeader>
              <span className="text-yellow-400">4</span> Cost Echoes
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={filterEchoes(ALL_4COST_ECHOES).map(name => [name, 0])}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                countColor="text-yellow-400" countPrefix="" totalCount={ALL_4COST_ECHOES.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 4 })}
                dataLookup={ECHO_DATA} dataType="echo" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 3-Cost Echoes */}
          <Card>
            <CardHeader>
              <span className="text-purple-400">3</span> Cost Echoes
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={filterEchoes(ALL_3COST_ECHOES).map(name => [name, 0])}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                countColor="text-purple-400" countPrefix="" totalCount={ALL_3COST_ECHOES.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 3 })}
                dataLookup={ECHO_DATA} dataType="echo" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 1-Cost Echoes */}
          <Card>
            <CardHeader>
              <span className="text-cyan-400">1</span> Cost Echoes
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={filterEchoes(ALL_1COST_ECHOES).map(name => [name, 0])}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-cyan-500/10" ownedBorder="border-cyan-500/30"
                countColor="text-cyan-400" countPrefix="" totalCount={ALL_1COST_ECHOES.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 1 })}
                dataLookup={ECHO_DATA} dataType="echo" isCharacter={false}
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
              <span className="text-yellow-400">★★★★★</span> Resonators
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={applySortOverride(collectionData.sortItems(filterCollectionItems(ALL_5STAR_RESONATORS, collectionData.chars5Counts, true).map(name => [name, collectionData.chars5Counts[name] || 0]), collectionSort))}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                countColor="text-yellow-400" countPrefix="S" totalCount={ALL_5STAR_RESONATORS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={CHARACTER_DATA} dataType="character" isCharacter={true}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                ownedChars={ownedChars} toggleOwned={toggleOwned}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 4★ Resonators */}
          <Card>
            <CardHeader>
              <span className="text-purple-400">★★★★</span> Resonators
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={applySortOverride(collectionData.sortItems(filterCollectionItems(ALL_4STAR_RESONATORS, collectionData.chars4Counts, true).map(name => [name, collectionData.chars4Counts[name] || 0]), collectionSort))}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                countColor="text-purple-400" countPrefix="S" totalCount={ALL_4STAR_RESONATORS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={CHARACTER_DATA} dataType="character" isCharacter={true}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                ownedChars={ownedChars} toggleOwned={toggleOwned}
                collapsible
              />
            </CardBody>
          </Card>
          </>)}

          {collectionView === 'weapons' && (<>
          {/* 5★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-yellow-400">★★★★★</span> Weapons
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_5STAR_WEAPONS, collectionData.weaps5Counts, false).map(name => [name, collectionData.weaps5Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                countColor="text-yellow-400" countPrefix="R" totalCount={ALL_5STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 4★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-purple-400">★★★★</span> Weapons
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_4STAR_WEAPONS, collectionData.weaps4Counts, false).map(name => [name, collectionData.weaps4Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                countColor="text-purple-400" countPrefix="R" totalCount={ALL_4STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 3★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-blue-400">★★★</span> Weapons
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_3STAR_WEAPONS, collectionData.weaps3Counts, false).map(name => [name, collectionData.weaps3Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-blue-500/10" ownedBorder="border-blue-500/30"
                countColor="text-blue-400" countPrefix="R" totalCount={ALL_3STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 2★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-green-400">★★</span> Weapons
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_2STAR_WEAPONS, collectionData.weaps2Counts, false).map(name => [name, collectionData.weaps2Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-green-500/10" ownedBorder="border-green-500/30"
                countColor="text-green-400" countPrefix="R" totalCount={ALL_2STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>

          {/* 1★ Weapons */}
          <Card>
            <CardHeader>
              <span className="text-gray-400">★</span> Weapons
            </CardHeader>
            <CardBody>
              <CollectionGridSection
                items={collectionData.sortItems(filterCollectionItems(ALL_1STAR_WEAPONS, collectionData.weaps1Counts, false).map(name => [name, collectionData.weaps1Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                glowClass="" ownedBg="bg-gray-500/10" ownedBorder="border-gray-500/30"
                countColor="text-gray-400" countPrefix="R" totalCount={ALL_1STAR_WEAPONS.length}
                hasActiveFilters={hasActiveFilters} onClearFilters={clearCollectionFilters} collectionImages={collectionImages}
                withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                activeBanners={activeBanners} setDetailModal={setDetailModal}
                dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                collapsible
              />
            </CardBody>
          </Card>
          </>)}
        </>
      )}
    </div>
    </TabErrorBoundary>
    </div>
  );
}
