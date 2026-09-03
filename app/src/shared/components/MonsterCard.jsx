// ═══════════════════════════════════════════════════════════════════════════════
// MonsterCard — Enemy stat card (icon, level, HP/ATK/DEF, elemental RES%)
// Used by EnemyEchoSelectorModal (target picker — up to 181 of these render at once,
// hence memo() below), EchoDetailModal's "Enemy Stats" section, and anywhere else an
// enemy's combat stats need a compact, reusable presentation.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, memo } from 'react';
import { Skull } from 'lucide-react';
import { getElementIcon, getStatIcon } from '../utils/elementVisuals.js';
import { t } from '../../utils/i18n.js';
import { hideOnError } from '../utils/imageHelpers.js';
import { getEnemyStatsAtLevel, getEnemyStaggerStatsAtLevel } from '../../data/echoes.js';

const ELEMENT_ORDER = ['physical', 'glacio', 'fusion', 'electro', 'aero', 'spectro', 'havoc'];
const ELEMENT_LABEL = { physical: 'Physical', glacio: 'Glacio', fusion: 'Fusion', electro: 'Electro', aero: 'Aero', spectro: 'Spectro', havoc: 'Havoc' };
const BASELINE_RES = 10; // every tracked boss's flat non-signature-element RES — see echoes.js
const RANK_BADGE_CLASS = { Calamity: 'kuro-badge-red', Overlord: 'kuro-badge-amber', Elite: 'kuro-badge-emerald', Common: '' };

function resBadgeClass(val) {
  if (val > BASELINE_RES) return 'kuro-badge-red';    // boosted RES on this element = worse for the player, flag it
  if (val < BASELINE_RES) return 'kuro-badge-emerald'; // below baseline = weakness, good for the player
  return 'kuro-badge-amber';                           // flat baseline, nothing notable
}

function StatRow({ icon, label, value, suffix = '' }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <span className="inline-flex items-center gap-1.5 text-gray-400">
        {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
        {label}
      </span>
      <span className="text-white font-semibold tabular-nums">{value.toLocaleString()}{suffix}</span>
    </div>
  );
}

/**
 * name: echo/boss name
 * iconUrl: boss icon (falls back to a Skull glyph)
 * enemyStats: { level, hp, atk, def, res: { glacio, fusion, ... } } | null — base snapshot (level 90)
 * level / onLevelChange: controlled level (1-120) — if passed, hp/atk/def are recomputed live from
 *   getEnemyStatsAtLevel(name, level) instead of enemyStats' fixed level-90 snapshot
 * showLevelControl: renders an inline Lv. stepper. Uncontrolled (no level/onLevelChange given) it
 *   manages its own local level state, starting from enemyStats.level ?? 90 — for standalone contexts
 *   (e.g. EchoDetailModal's Boss Stats card) that shouldn't touch any shared app-level enemy level.
 * compact: smaller footprint for grid/list contexts
 * rank: optional classification badge (Common/Elite/Overlord/Calamity — see ECHO_DATA[name].rank)
 * onClick / onSelect: onClick fires with no args (for one-off usage); onSelect(name) fires with the
 *   card's name — prefer onSelect in a big list (EnemyEchoSelectorModal's 181 cards) so the parent can
 *   pass one stable useCallback instead of a fresh arrow function per card per render, letting memo()
 *   actually skip re-rendering cards whose other props didn't change.
 */
function MonsterCard({
  name, iconUrl, enemyStats, compact = false, selected = false, onClick, onSelect,
  level: controlledLevel, onLevelChange, showLevelControl = false, rank,
}) {
  const handleClick = onSelect ? () => onSelect(name) : onClick;
  const [localLevel, setLocalLevel] = useState(enemyStats?.level ?? 90);
  const isControlled = controlledLevel != null;
  const level = isControlled ? controlledLevel : localLevel;
  const setLevel = isControlled ? onLevelChange : setLocalLevel;

  const scaled = (isControlled || showLevelControl) ? getEnemyStatsAtLevel(name, level) : null;
  const hp = scaled ? scaled.hp : enemyStats?.hp;
  const atk = scaled ? scaled.atk : enemyStats?.atk;
  const def = scaled ? scaled.def : enemyStats?.def;

  // Interruption RES / its Recovery are flat per-boss constants; Vibration Strength, its Recovery,
  // Rage, and its Recovery genuinely scale with level (the wiki's own Module:Enemy
  // Stats render logic — see getEnemyStaggerStatsAtLevel in echoes.js).
  const staggerScaled = (isControlled || showLevelControl) ? getEnemyStaggerStatsAtLevel(name, level) : null;
  const interruptRes = staggerScaled ? staggerScaled.interruptRes : enemyStats?.interruptRes;
  const interruptResRecover = staggerScaled ? staggerScaled.interruptResRecover : enemyStats?.interruptResRecover;
  const vibration = staggerScaled ? staggerScaled.vibration : enemyStats?.vibration;
  const vibrationRecover = staggerScaled ? staggerScaled.vibrationRecover : enemyStats?.vibrationRecover;
  const rage = staggerScaled ? staggerScaled.rage : enemyStats?.rage;
  const rageRecover = staggerScaled ? staggerScaled.rageRecover : enemyStats?.rageRecover;

  const res = enemyStats?.res || {};
  const hasResData = Object.values(res).some(v => v);
  const Wrapper = handleClick ? 'button' : 'div';

  const clampLevel = v => Math.max(1, Math.min(120, v));
  const stepLevel = delta => setLevel?.(clampLevel((Number(level) || 90) + delta));

  return (
    <Wrapper
      onClick={handleClick}
      className={`kuro-card text-left w-full transition-all ${compact ? 'p-2' : 'p-3'} ${handleClick ? 'hover:scale-[1.01] cursor-pointer' : ''} ${selected ? 'border-2 border-yellow-400/60 bg-yellow-500/10' : ''}`}
    >
      <div className="flex items-center gap-3">
        {iconUrl ? (
          <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg overflow-hidden flex-shrink-0 border border-red-500/30 bg-red-500/8`}>
            <img src={iconUrl} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={hideOnError} />
          </div>
        ) : (
          <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg flex items-center justify-center border border-red-500/30 bg-red-500/5 flex-shrink-0`}>
            <Skull size={compact ? 14 : 18} className="text-red-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-white font-semibold truncate">{name}</div>
            {rank && <span className={`kuro-badge ${RANK_BADGE_CLASS[rank] || ''} shrink-0 text-2xs`}>{rank}</span>}
          </div>
          {showLevelControl && enemyStats ? (
            <div className="flex items-center gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => stepLevel(-1)} className="w-4 h-4 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-gray-400 text-2xs leading-none">−</button>
              <input
                type="number" min={1} max={120} value={level}
                onFocus={e => e.target.select()}
                onChange={e => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) setLevel?.(clampLevel(n)); }}
                onBlur={e => { if (e.target.value === '' || Number.isNaN(parseInt(e.target.value, 10))) setLevel?.(90); }}
                className="w-12 text-2xs text-center bg-transparent text-gray-400 border border-[var(--border-subtle)] rounded px-0.5 py-px"
              />
              <button type="button" onClick={() => stepLevel(1)} className="w-4 h-4 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-gray-400 text-2xs leading-none">+</button>
              <span className="text-2xs text-gray-500">/ 120</span>
            </div>
          ) : (
            <div className="text-2xs text-gray-500">Lv. {level}</div>
          )}
        </div>
      </div>

      {enemyStats && (hp || atk || def) && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <StatRow icon={getStatIcon('HP')} label="HP" value={hp} />
          <StatRow icon={getStatIcon('ATK')} label="ATK" value={atk} />
          <StatRow icon={getStatIcon('DEF')} label="DEF" value={def} />
        </div>
      )}

      {/* Stagger system — Interruption RES/Recovery are flat; Vibration Strength/Recovery and
          Rage/Recovery scale with level just like HP/ATK/DEF above (see staggerScaled). */}
      {enemyStats && (interruptRes != null || vibration != null || rage != null) && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <StatRow label="Interruption RES" value={interruptRes} />
          <StatRow label="Interruption RES Recovery" value={interruptResRecover} />
          <StatRow label="Vibration Strength" value={vibration} />
          <StatRow label="Vibration Strength Recovery" value={vibrationRecover} />
          <StatRow label="Rage" value={rage} />
          <StatRow label="Rage Recovery" value={rageRecover} />
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-1">
        {hasResData ? ELEMENT_ORDER.map(el => {
          const icon = getElementIcon(ELEMENT_LABEL[el]);
          const val = res[el] ?? BASELINE_RES;
          return (
            <span key={el} className={`kuro-badge ${resBadgeClass(val)} inline-flex items-center gap-1`}>
              {icon && <img src={icon} alt="" className="w-3 h-3" onError={hideOnError} />}
              {ELEMENT_LABEL[el]} {val}%
            </span>
          );
        }) : (
          <span className="text-2xs text-gray-500">{t('teams.monsterCard.noResData')}</span>
        )}
      </div>
    </Wrapper>
  );
}

export default memo(MonsterCard);
