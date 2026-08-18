// ═══════════════════════════════════════════════════════════════════════════════
// MonsterCard — Boss/monster stat card (icon, level, HP/ATK/DEF, elemental RES%)
// Used by EnemyEchoSelectorModal (target picker), EchoDetailModal ("Boss Stats"
// section for 4-cost boss echoes), and anywhere else a boss's combat stats need
// a compact, reusable presentation.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Skull } from 'lucide-react';
import { getElementIcon, getStatIcon } from '../../utils/helpers.js';
import { hideOnError } from '../utils/imageHelpers.js';

const ELEMENT_ORDER = ['glacio', 'fusion', 'electro', 'aero', 'spectro', 'havoc'];
const ELEMENT_LABEL = { glacio: 'Glacio', fusion: 'Fusion', electro: 'Electro', aero: 'Aero', spectro: 'Spectro', havoc: 'Havoc' };

function resBadgeClass(val) {
  if (val > 0) return 'kuro-badge-red';   // higher enemy RES = worse for the player, flag it
  if (val < 0) return 'kuro-badge-emerald'; // negative RES = weakness, good for the player
  return 'kuro-badge-amber';
}

function StatRow({ icon, label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <span className="inline-flex items-center gap-1.5 text-gray-400">
        {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
        {label}
      </span>
      <span className="text-white font-semibold tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

/**
 * name: echo/boss name
 * iconUrl: boss icon (falls back to a Skull glyph)
 * enemyStats: { level, hp, atk, def, res: { glacio, fusion, ... } } | null
 * compact: smaller footprint for grid/list contexts
 */
export default function MonsterCard({ name, iconUrl, enemyStats, compact = false, selected = false, onClick }) {
  const level = enemyStats?.level ?? 90;
  const res = enemyStats?.res || {};
  const hasResData = Object.values(res).some(v => v);
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`kuro-card text-left w-full transition-all ${compact ? 'p-2' : 'p-3'} ${onClick ? 'hover:scale-[1.01] cursor-pointer' : ''} ${selected ? 'border-2 border-yellow-400/60 bg-yellow-500/10' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        {iconUrl ? (
          <div className={`${compact ? 'w-9 h-9' : 'w-12 h-12'} rounded-lg overflow-hidden flex-shrink-0 border border-red-500/30 bg-red-500/8`}>
            <img src={iconUrl} alt={name} className="w-full h-full object-cover" onError={hideOnError} />
          </div>
        ) : (
          <div className={`${compact ? 'w-9 h-9' : 'w-12 h-12'} rounded-lg flex items-center justify-center border border-red-500/30 bg-red-500/5 flex-shrink-0`}>
            <Skull size={compact ? 14 : 18} className="text-red-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">{name}</div>
          <div className="text-2xs text-gray-500">Lv. {level}</div>
        </div>
      </div>

      {enemyStats && (enemyStats.hp || enemyStats.atk || enemyStats.def) && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <StatRow icon={getStatIcon('HP')} label="HP" value={enemyStats.hp} />
          <StatRow icon={getStatIcon('ATK')} label="ATK" value={enemyStats.atk} />
          <StatRow icon={getStatIcon('DEF')} label="DEF" value={enemyStats.def} />
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-1">
        {hasResData ? ELEMENT_ORDER.filter(el => res[el]).map(el => {
          const icon = getElementIcon(ELEMENT_LABEL[el]);
          return (
            <span key={el} className={`kuro-badge ${resBadgeClass(res[el])} inline-flex items-center gap-1`}>
              {icon && <img src={icon} alt="" className="w-3 h-3" onError={hideOnError} />}
              {ELEMENT_LABEL[el]} {res[el] > 0 ? '+' : ''}{res[el]}%
            </span>
          );
        }) : (
          <span className="text-2xs text-gray-500">No elemental RES data</span>
        )}
      </div>
    </Wrapper>
  );
}
