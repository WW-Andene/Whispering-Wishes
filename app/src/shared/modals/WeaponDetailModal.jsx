// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/modals/WeaponDetailModal.jsx
// WeaponDetailModal
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Swords, Star, TrendingUp, X } from 'lucide-react';
import { WEAPON_DATA } from '../../data/weapons.js';
import { COMMON_MAT_TIERS, FORGERY_MAT_TIERS, WEAPON_ASCENSION_COSTS_5, WEAPON_ASCENSION_COSTS_4, WEAPON_EXP_COSTS_5, WEAPON_EXP_COSTS_4, WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { FocusTrapModal } from '../components/FocusTrapModal.jsx';
import { getWeaponTypeIcon, getStatIcon } from '../../utils/helpers.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { MaterialItem } from '../components/MaterialItem.jsx';

const WEAPON_RARITY_COLORS = {
  5: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  4: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  3: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  2: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  1: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
};
const WeaponDetailModal = ({ name, onClose, imageUrl, collectionData }) => {
  const data = WEAPON_DATA[name];
  if (!data) return null;

  const ownsChar = (n) => {
    if (!collectionData) return true;
    return (collectionData.chars5Counts?.[n] || 0) + (collectionData.chars4Counts?.[n] || 0) > 0;
  };

  const colors = WEAPON_RARITY_COLORS[data.rarity] ?? WEAPON_RARITY_COLORS[4];

  return (
    <FocusTrapModal isOpen={true} onClose={onClose} className="" onClick={onClose} ariaLabel={`${name} weapon details`} centered>
      <div
        className={`kuro-card relative w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border ${colors.border}`}
        onClick={e => e.stopPropagation()}
      >
       <div className="overflow-y-auto flex-1" data-sheet-scroll>
        {/* Header */}
        <div className={`relative h-40 overflow-hidden rounded-t-2xl${data.rarity === 5 ? ' holo-5star' : ''}`} style={{ contain: 'paint' }} data-sheet-header>
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          {imageUrl && (
            <img src={imageUrl} alt={name} className="absolute right-2 top-1/2 -translate-y-1/2 h-36 object-contain opacity-90" onError={hideOnError} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 modal-close-btn" aria-label="Close weapon details">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`kuro-badge ${colors.bg} ${colors.text} ${colors.border} inline-flex items-center gap-1`}>
                {getWeaponTypeIcon(data.type) && <img src={getWeaponTypeIcon(data.type)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                {data.type}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-white">{name}</h2>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(data.rarity)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* 1. Stats bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.baseAtk && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30">
                {getStatIcon('ATK') && <img src={getStatIcon('ATK')} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                <span className="text-sm text-gray-400">ATK</span>
                <span className="text-base font-bold text-red-400">{data.baseAtk}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-[var(--border-medium)]">
              {getStatIcon(data.stat) && <img src={getStatIcon(data.stat)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
              <span className="text-sm text-gray-400">{data.stat}</span>
              <span className="text-base font-bold text-white">{data.subStatValue || ''}</span>
            </div>
            {data.bestFor && data.bestFor.length > 0 && data.bestFor.map((char, i) => {
              const owned = ownsChar(char);
              return <span key={i} className={`kuro-badge ${owned ? 'kuro-badge-yellow' : 'kuro-badge-gray'}`}>{char}{!owned && ' ✗'}</span>;
            })}
          </div>

          {/* 2. Description */}
          {data.desc && (() => {
            const sig = data.desc.match(/^(\w+ signature)\.\s*/);
            const rest = sig ? data.desc.slice(sig[0].length) : data.desc;
            const dot = rest.indexOf('. ');
            const lore = dot > 0 ? rest.slice(0, dot + 1) : null;
            const effect = dot > 0 ? rest.slice(dot + 2) : rest;
            return (
              <div className="text-md space-y-1">
                {sig && <div className="kuro-section-label">{sig[1]}</div>}
                {lore && <p className="text-gray-400 italic">{lore}</p>}
                <p className="text-gray-300">{effect}</p>
              </div>
            );
          })()}

          {/* 3. Passive */}
          <div className={`p-3 rounded-xl border ${colors.border}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="kuro-section-label mb-1">Passive</div>
            <div className={`text-base font-medium ${colors.text}`}>{data.passive}</div>
          </div>

          {/* 4. Refinement Scaling */}
          {data.pv && Object.keys(data.pv).length > 0 && (
            <div className="kuro-detail-box">
              <div className="kuro-section-label mb-2">Refinement Scaling</div>
              <div className="grid grid-cols-5 gap-1">
                {WEAPON_REFINE_SCALE.map((scale, i) => (
                  <div key={i} className={`text-center p-1.5 rounded ${i === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5 border border-[var(--border-medium)]'}`}>
                    <div className={`text-sm mb-0.5 ${i === 0 ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>R{i + 1}</div>
                    {Object.entries(data.pv).map(([stat, val]) => (
                      <div key={stat} className="text-sm text-gray-300">
                        <span className="text-white font-medium">{Math.round(val * scale * 10) / 10}%</span>
                        <div className="text-gray-500 text-2xs">{stat.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Ascension Materials */}
          {data.ascensionMaterials && (() => {
            const costs = data.rarity === 5 ? WEAPON_ASCENSION_COSTS_5 : WEAPON_ASCENSION_COSTS_4;
            const forgeryTiers = FORGERY_MAT_TIERS[data.ascensionMaterials.forgery];
            const commonTiers = COMMON_MAT_TIERS[data.ascensionMaterials.common];
            return (
              <div>
                <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                  <Swords size={14} className="text-orange-400" /> Ascension Materials
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {forgeryTiers && <>
                    <MaterialItem name={forgeryTiers[0]} qty={costs.forgeryT3} />
                    <MaterialItem name={forgeryTiers[1]} qty={costs.forgeryT4} />
                  </>}
                  {commonTiers && <>
                    <MaterialItem name={commonTiers[0]} qty={costs.commonT3} />
                    <MaterialItem name={commonTiers[1]} qty={costs.commonT4} />
                  </>}
                </div>
              </div>
            );
          })()}

          {/* 6. EXP Materials */}
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" /> EXP Materials
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(data.rarity === 5 ? WEAPON_EXP_COSTS_5 : WEAPON_EXP_COSTS_4).filter(([, qty]) => qty > 0).map(([mat, qty]) => (
                <MaterialItem key={mat} name={mat} qty={qty} />
              ))}
            </div>
          </div>
        </div>
       </div>
      </div>
    </FocusTrapModal>
  );
};

export { WeaponDetailModal };
