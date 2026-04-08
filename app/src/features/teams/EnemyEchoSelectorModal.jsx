// ═══════════════════════════════════════════════════════════════════════════════
// EnemyEchoSelectorModal — Echo picker modal for enemy target selection
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Diamond, X } from 'lucide-react';
import { ECHO_DATA, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES } from '../../data/echoes.js';
import { haptic } from '../../utils/helpers.js';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';

export default function EnemyEchoSelectorModal({
  isOpen, onClose,
  enemyEcho, setEnemyEcho,
  collectionImages,
  search, setSearch,
  costFilter, setCostFilter,
  setFilter, setSetFilter,
  buffFilter, setBuffFilter,
}) {

  const costList = costFilter === '4' ? ALL_4COST_ECHOES : costFilter === '3' ? ALL_3COST_ECHOES : costFilter === '1' ? ALL_1COST_ECHOES : [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES];
  const filtered = costList.filter(n => {
    if (search && !n.toLowerCase().includes(search.toLowerCase())) return false;
    const ed = ECHO_DATA[n];
    if (!ed) return false;
    if (setFilter !== 'all' && !ed.sets?.includes(setFilter)) return false;
    if (buffFilter !== 'all' && !(Array.isArray(ed.buff) ? ed.buff.includes(buffFilter) : ed.buff === buffFilter)) return false;
    return true;
  });

  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} className="" onClick={onClose} centered>
      <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
          <div>
            <h3 className="text-white font-semibold text-md">Select Target Enemy</h3>
            <p className="text-gray-400 text-base">All echoes — select an enemy to fight against</p>
          </div>
          <button onClick={onClose} className="modal-close-btn min-w-[44px] min-h-[44px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" aria-label="Close"><X size={16} className="text-gray-400" /></button>
        </div>

        {/* Search + Filters */}
        <div className="p-2 border-b border-[var(--border-subtle)] flex-shrink-0 space-y-1.5">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search echoes…" className="kuro-input w-full text-base" />
          <div className="flex gap-1">
            {[['all', 'All'], ['4', '4-Cost'], ['3', '3-Cost'], ['1', '1-Cost']].map(([val, label]) => (
              <button key={val} onClick={() => setCostFilter(val)}
                className={`flex-1 text-base py-1 rounded ${costFilter === val ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-[var(--border-medium)] text-gray-500'} border`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <KuroSelect value={setFilter} onChange={v => setSetFilter(v)} small
              options={[{ value: 'all', label: 'All Sets' }, ...ALL_ECHO_SONATA_SETS.map(s => ({ value: s, label: s }))]}
              className="flex-1 text-base" />
            <KuroSelect value={buffFilter} onChange={v => setBuffFilter(v)} small
              options={[{ value: 'all', label: 'All Types' }, ...ALL_ECHO_BUFF_TYPES.map(b => ({ value: b, label: b }))]}
              className="flex-1 text-base" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          <div className="space-y-1">
            <button onClick={() => { setEnemyEcho(''); onClose(); haptic.light(); }}
              className={`w-full p-2 rounded-lg border text-left transition-all ${!enemyEcho ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-[var(--border-medium)] hover:border-white/20'}`}>
              <div className="text-base font-semibold text-white">Default Enemy</div>
              <div className="text-base text-gray-400">10% all element RES · No special mechanics</div>
            </button>
            {filtered.map(name => {
              const ed = ECHO_DATA[name];
              const isActive = enemyEcho === name;
              const resEntries = ed?.enemyRes ? Object.entries(ed.enemyRes) : [];
              const cost = ALL_4COST_ECHOES.includes(name) ? 4 : ALL_3COST_ECHOES.includes(name) ? 3 : 1;
              const costColor = cost === 4 ? 'yellow' : cost === 3 ? 'purple' : 'cyan';
              return (
                <button key={name} onClick={() => { setEnemyEcho(name); onClose(); haptic.success(); }}
                  className={`w-full p-2 rounded-lg border text-left transition-all hover:scale-[1.01] ${isActive ? `border-2 border-${costColor}-400 bg-${costColor}-500/10` : `border-[var(--border-medium)] hover:border-${costColor}-500/30`}`}
                  style={isActive ? { boxShadow: `0 0 12px rgba(234,179,8,0.3)` } : {}}>
                  <div className="flex items-center gap-2">
                    {collectionImages[name] ? (
                      <div className={`w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-${costColor}-500/30 bg-${costColor}-500/8`}>
                        <img src={collectionImages[name]} alt={name} className="w-full h-full object-contain" onError={hideOnError} />
                      </div>
                    ) : (
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border border-${costColor}-500/30 bg-${costColor}-500/5`}>
                        <Diamond size={14} className={`text-${costColor}-400`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-semibold text-white truncate">{name}</span>
                        <span className={`text-base px-1 py-0.5 rounded bg-${costColor}-500/15 text-${costColor}-400 border border-${costColor}-500/25`}>{cost}C</span>
                      </div>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {resEntries.length > 0 ? resEntries.map(([el, val]) => (
                          <span key={el} className="kuro-badge kuro-badge-red">
                            {el.charAt(0).toUpperCase() + el.slice(1)} {val}%
                          </span>
                        )) : (
                          <span className="text-base text-gray-500">10% all RES</span>
                        )}
                        {ed?.element && ed.element !== 'Healing' && (
                          <span className="text-base text-gray-500">· {ed.element}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </FocusTrapModal>
  );
}
