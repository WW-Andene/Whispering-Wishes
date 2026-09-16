// Abby assistant's search index — characters/weapons/echoes only for v1
// (per CLAUDE.md scope decision: static game data, no user progression data).

import Fuse from 'fuse.js';
import { getLocalizedCharacterData } from '../../data/characters.js';
import { getLocalizedWeaponData } from '../../data/weapons.js';
import { getLocalizedEchoData, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES } from '../../data/echoes.js';

function echoCost(name) {
  if (ALL_4COST_ECHOES.includes(name)) return 4;
  if (ALL_3COST_ECHOES.includes(name)) return 3;
  if (ALL_1COST_ECHOES.includes(name)) return 1;
  return null;
}

export function buildAssistantIndexItems(locale) {
  const items = [];

  const characterData = getLocalizedCharacterData(locale);
  for (const [name, c] of Object.entries(characterData)) {
    items.push({
      id: `character:${name}`,
      type: 'character',
      name,
      subtitle: [c.element, c.weapon, c.role].filter(Boolean).join(' · '),
      desc: c.desc || '',
      cost: null,
    });
  }

  const weaponData = getLocalizedWeaponData(locale);
  for (const [name, w] of Object.entries(weaponData)) {
    items.push({
      id: `weapon:${name}`,
      type: 'weapon',
      name,
      subtitle: [w.type, w.stat].filter(Boolean).join(' · '),
      desc: w.desc || '',
      cost: null,
    });
  }

  const echoData = getLocalizedEchoData(locale);
  for (const [name, e] of Object.entries(echoData)) {
    items.push({
      id: `echo:${name}`,
      type: 'echo',
      name,
      subtitle: [e.buff, ...(e.sets || [])].filter(Boolean).join(' · '),
      desc: e.desc || '',
      cost: echoCost(name),
    });
  }

  return items;
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'subtitle', weight: 0.25 },
    { name: 'desc', weight: 0.25 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function buildAssistantIndex(locale) {
  const items = buildAssistantIndexItems(locale);
  return { items, fuse: new Fuse(items, FUSE_OPTIONS) };
}

export function searchAssistant(index, query, limit = 8) {
  const q = query.trim();
  if (!q) return [];
  return index.fuse.search(q, { limit }).map(r => r.item);
}
