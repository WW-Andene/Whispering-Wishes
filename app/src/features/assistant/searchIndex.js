// Abby assistant's search index — characters/weapons/echoes only for v1
// (per CLAUDE.md scope decision: static game data, no user progression data).

import Fuse from 'fuse.js';
import { getLocalizedCharacterData } from '../../data/characters.js';
import { getLocalizedWeaponData } from '../../data/weapons.js';
import { getLocalizedEchoData, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES } from '../../data/echoes.js';
import { normalize, stripQuestionWords } from './textNormalize.js';

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
  // A dedicated Fuse instance over just names, for findEntityInIndex's fuzzy
  // fallback (typos) - matching a short cleaned query against bare names
  // needs a tighter threshold than the general name+subtitle+desc search,
  // which would otherwise happily "fuzzy match" an unrelated character.
  const nameFuse = new Fuse(items, { keys: ['name'], threshold: 0.3, ignoreLocation: true });
  return { items, fuse: new Fuse(items, FUSE_OPTIONS), nameFuse };
}

// Does the query actually CONTAIN a real item name? This is the primary,
// most reliable resolution strategy - robust to arbitrary surrounding
// phrasing ("who should I pair with Jinhsi", "tell me about Ages of
// Harvest") without needing every possible filler word enumerated, since
// it doesn't care what else is in the sentence. Picks the longest matching
// name so "Rover: Havoc" wins over a bare "Rover" false positive, and so a
// longer, more specific item name wins over a shorter one that happens to
// be a substring of it.
export function findEntityInIndex(index, query, { types } = {}) {
  const q = normalize(query);
  if (!q) return null;
  let best = null;
  for (const item of index.items) {
    if (types && !types.includes(item.type)) continue;
    if (q.includes(normalize(item.name)) && (!best || item.name.length > best.name.length)) best = item;
  }
  if (best) return best;

  // Fallback: fuzzy-match the query after stripping known question words,
  // for typos/partial names the substring check above won't catch.
  const cleaned = stripQuestionWords(query);
  if (!cleaned) return null;
  const hits = index.nameFuse.search(cleaned, { limit: 1 });
  const hit = hits[0]?.item;
  if (hit && (!types || types.includes(hit.type))) return hit;
  return null;
}

export function searchAssistant(index, query, limit = 8) {
  const q = query.trim();
  if (!q) return [];

  // Entity-first: if the query clearly names a real item, lead with it
  // instead of running the whole (possibly noisy) sentence through fuzzy
  // search against short name/subtitle/desc fields.
  const entity = findEntityInIndex(index, q);
  if (entity) return [entity];

  const cleaned = stripQuestionWords(q) || q;
  return index.fuse.search(cleaned, { limit }).map(r => r.item);
}
