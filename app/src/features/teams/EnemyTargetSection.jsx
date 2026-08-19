// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/EnemyTargetSection.jsx (extracted from DamageCalculator.jsx)
// Target-enemy picker card (level input + MonsterCard preview) and its
// matching echo-selector modal. Pure UI — all target state (enemyEcho,
// enemyLevel, filters) lives in DamageCalculator.jsx since it also feeds
// calcTeamStats, and is passed in here as props.
// ═══════════════════════════════════════════════════════════════════════════════

import { Sword } from 'lucide-react';
import { Card, CardBody } from '../../shared/components/Card.jsx';
import MonsterCard from '../../shared/components/MonsterCard.jsx';
import EnemyEchoSelectorModal from './EnemyEchoSelectorModal.jsx';
import { ECHO_DATA } from '../../data/echoes.js';

export function EnemyTargetCard({ enemyEcho, enemyLevel, setEnemyLevel, collectionImages, setEnemyEchoSearch, setEnemyEchoModalOpen }) {
  const enemyTargetEd = enemyEcho ? ECHO_DATA[enemyEcho] : null;
  // monsterIconUrl (the boss's own portrait) must win over collectionImages — see the matching fix
  // and full explanation in EnemyEchoSelectorModal.jsx's icon priority.
  const enemyTargetIcon = enemyEcho ? (enemyTargetEd?.monsterIconUrl || collectionImages[enemyEcho] || enemyTargetEd?.iconUrl) : null;
  // Display only — the actual damage calc (calcTeamStats.js) computes its own generic
  // level-based DEF baseline independently of this card, so leaving `def` null here when
  // no target is selected doesn't affect DPS numbers, only what MonsterCard renders. It
  // used to carry that generic DEF value for display too, which made a lone "DEF" row
  // show up with no HP/ATK next to it — looking like a target was silently selected.
  const enemyTargetStats = enemyEcho
    ? enemyTargetEd?.enemyStats
    : { level: enemyLevel, hp: null, atk: null, def: null, res: {} };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 mb-2">
          <Sword size={12} className="text-red-400 shrink-0" />
          <span className="text-gray-400 text-sm font-medium shrink-0">Target</span>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-gray-500 text-sm">Lv.</span>
            <input type="text" inputMode="numeric" value={enemyLevel}
              onFocus={e => e.target.select()}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v === '') { setEnemyLevel(''); return; } const n = parseInt(v, 10); setEnemyLevel(Number.isNaN(n) ? 90 : Math.max(1, Math.min(120, n))); }}
              onBlur={e => { if (!e.target.value || isNaN(parseInt(e.target.value, 10))) setEnemyLevel(90); }}
              className="kuro-input w-14 text-sm px-1 py-0.5 text-center" />
            <span className="text-gray-600 text-sm">/ 120</span>
          </div>
        </div>
        <MonsterCard
          name={enemyEcho || 'No Target Selected (Default)'}
          rank={enemyTargetEd?.rank}
          iconUrl={enemyTargetIcon}
          enemyStats={enemyTargetStats}
          level={enemyLevel}
          onClick={() => { setEnemyEchoSearch(''); setEnemyEchoModalOpen(true); }}
        />
      </CardBody>
    </Card>
  );
}

export function EnemyTargetModal({
  isOpen, onClose,
  enemyEcho, setEnemyEcho,
  enemyLevel, setEnemyLevel,
  collectionImages,
  search, setSearch,
  rankFilter, setRankFilter,
  setFilter, setSetFilter,
  buffFilter, setBuffFilter,
}) {
  return (
    <EnemyEchoSelectorModal
      isOpen={isOpen} onClose={onClose}
      enemyEcho={enemyEcho} setEnemyEcho={setEnemyEcho}
      enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
      collectionImages={collectionImages}
      search={search} setSearch={setSearch}
      rankFilter={rankFilter} setRankFilter={setRankFilter}
      setFilter={setFilter} setSetFilter={setSetFilter}
      buffFilter={buffFilter} setBuffFilter={setBuffFilter}
    />
  );
}
