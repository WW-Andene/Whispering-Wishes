import React from 'react';
import { Sword, X } from 'lucide-react';
import { CHARACTER_DATA } from '../../data/characters.js';
import { WEAPON_DATA, getLocalizedWeaponData } from '../../data/weapons.js';
import { BANNER_HISTORY } from '../../data/banners.js';
import { haptic } from '../../utils/haptics.js';
import { getStatIcon, getWeaponTypeIcon } from '../../shared/utils/elementVisuals.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { getLocale, t } from '../../utils/i18n.js';

const LOCALIZED_WEAPON_DATA = getLocalizedWeaponData(getLocale());
// BANNER_HISTORY is declared newest-first (v3.6-p2 first, all the way back to v1.0-p1) — a weapon can
// appear in multiple entries (its debut banner plus any later rerun banners), so its real release rank
// is its LAST/deepest occurrence in this list, not its first — a rerun must never be mistaken for a
// debut. Weapons with no banner appearance at all (3★/starter/permanent weapons) get no entry here and
// sort after every dated weapon within their rarity tier, via the `?? Infinity` fallback below.
const WEAPON_RELEASE_ORDER_INDEX = new Map();
BANNER_HISTORY.forEach((entry, i) => {
  (entry.weapons || []).forEach(name => { WEAPON_RELEASE_ORDER_INDEX.set(name, i); });
});

export default function WeaponSelector({
  weaponSelectorOpen,
  setWeaponSelectorOpen,
  weaponSelectorTarget,
  weaponSearch,
  setWeaponSearch,
  setTeamEquipment,
  collectionImages,
}) {
  return (
                  <FocusTrapModal isOpen={weaponSelectorOpen} onClose={() => setWeaponSelectorOpen(false)} className="" onClick={() => setWeaponSelectorOpen(false)} centered padding="p-3">
                      <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
                          <div>
                            <h3 className="text-white font-semibold text-xl">{t('teams.weaponSelector.title')}</h3>
                            <p className="text-gray-400 text-sm inline-flex items-center gap-1">
                              {weaponSelectorTarget.charName} —
                              {getWeaponTypeIcon(CHARACTER_DATA[weaponSelectorTarget.charName]?.weapon) && <img src={getWeaponTypeIcon(CHARACTER_DATA[weaponSelectorTarget.charName]?.weapon)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                              {CHARACTER_DATA[weaponSelectorTarget.charName]?.weapon || 'Any'}
                            </p>
                          </div>
                          <button onClick={() => setWeaponSelectorOpen(false)} className="p-3 min-w-[calc(48px*var(--ui-scale,1))] min-h-[calc(48px*var(--ui-scale,1))] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Close weapon selector"><X size={16} /></button>
                        </div>
                        <div className="p-2 border-b border-[var(--border-subtle)] flex-shrink-0">
                          <input
                            value={weaponSearch}
                            onChange={e => setWeaponSearch(e.target.value)}
                            placeholder="Search weapons…"
                            className="kuro-input w-full text-base"
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                          <div className="space-y-1">
                            {/* Unequip option */}
                            <button
                              onClick={() => {
                                const eqKey = weaponSelectorTarget.teamIdx + ':' + weaponSelectorTarget.charName;
                                setTeamEquipment(prev => {
                                  const n = { ...prev };
                                  if (n[eqKey]) n[eqKey] = { ...n[eqKey], weapon: null };
                                  else n[eqKey] = { weapon: null, echoes: [null, null, null, null, null] };
                                  try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                  return n;
                                });
                                setWeaponSelectorOpen(false);
                                haptic.light();
                              }}
                              className="w-full p-2 rounded-lg border border-dashed border-white/15 text-sm text-gray-400 hover:border-red-500/30 hover:text-red-400 transition-all text-left"
                              style={{ background: 'var(--bg-btn)' }}
                            >
                              ✕ Unequip weapon
                            </button>
                            {/* Filtered weapons */}
                            {(() => {
                              const charWeapType = CHARACTER_DATA[weaponSelectorTarget.charName]?.weapon;
                              return Object.entries(WEAPON_DATA)
                                .filter(([name, w]) => {
                                  if (charWeapType && w.type !== charWeapType) return false;
                                  if (weaponSearch && !name.toLowerCase().includes(weaponSearch.toLowerCase())) return false;
                                  return true;
                                })
                                .sort((a, b) => b[1].rarity - a[1].rarity
                                  || (WEAPON_RELEASE_ORDER_INDEX.get(a[0]) ?? Infinity) - (WEAPON_RELEASE_ORDER_INDEX.get(b[0]) ?? Infinity)
                                  || b[1].baseAtk - a[1].baseAtk)
                                .map(([name, w]) => {
                                  const rarity5 = w.rarity === 5;
                                  const isBest = name === CHARACTER_DATA[weaponSelectorTarget.charName]?.bestWeapon;
                                  return (
                                    <button
                                      key={name}
                                      onClick={() => {
                                        const eqKey = weaponSelectorTarget.teamIdx + ':' + weaponSelectorTarget.charName;
                                        setTeamEquipment(prev => {
                                          const n = { ...prev };
                                          if (n[eqKey]) n[eqKey] = { ...n[eqKey], weapon: name };
                                          else n[eqKey] = { weapon: name, echoes: [null, null, null, null, null] };
                                          try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                          return n;
                                        });
                                        setWeaponSelectorOpen(false);
                                        haptic.success();
                                      }}
                                      className={`w-full p-2 rounded-lg border text-left transition-all hover:scale-[1.01] ${rarity5 ? 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10' : 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {collectionImages[name] ? (
                                          <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border ${rarity5 ? 'kuro-rarity-frame-5 holo-5star' : 'kuro-rarity-frame-4'}`} style={{ position: 'relative' }}>
                                            <img src={collectionImages[name]} alt={name} className="w-full h-full object-cover" onError={hideOnError} />
                                          </div>
                                        ) : (
                                          <Sword size={14} className={rarity5 ? 'text-yellow-400' : 'text-purple-400'} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-white text-base font-semibold truncate">{LOCALIZED_WEAPON_DATA[name]?.displayName || name}</span>
                                            <span className={`text-2xs ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                                            {isBest && <span className="kuro-badge kuro-badge-emerald">{t('teams.weaponSelector.bis')}</span>}
                                          </div>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-sm text-gray-400">ATK {w.baseAtk}</span>
                                            <span className="text-sm text-cyan-400/80 inline-flex items-center gap-1">
                                              {getStatIcon(w.stat) && <img src={getStatIcon(w.stat)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                                              {w.stat} {w.subStatValue}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                });
                            })()}
                          </div>
                        </div>
                      </div>
                  </FocusTrapModal>
  );
}
