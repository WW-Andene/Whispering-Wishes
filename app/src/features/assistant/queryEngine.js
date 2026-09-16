// Abby's "AI-like" answer engine: a keyword/intent classifier + entity
// resolver over the existing static game data, not a real LLM. A query is
// classified into an intent (team/materials/matchup/plain-search) by
// keyword matching, the character it's about is resolved via fuzzy search
// against character names, and a text answer is templated from that
// character's own recorded fields - never fabricated. Intents with no
// backing data (elemental counters - Wuthering Waves doesn't use a
// rock-paper-scissors system, and no such data exists anywhere in
// characters.js) say so honestly instead of inventing an answer.

import Fuse from 'fuse.js';
import { getLocalizedCharacterData } from '../../data/characters.js';
import { t } from '../../utils/i18n.js';

const INTENT_KEYWORDS = {
  team: ['team', 'équipe', 'equipe', 'synergie', 'synergy', 'compo', 'partner', 'pair with', 'squad'],
  materials: ['matériau', 'materiau', 'material', 'farm', 'ascension', 'mats', 'level up', 'leveling'],
  matchup: ['counter', 'contre', 'faible contre', 'weak against', 'strong against', 'matchup', ' vs ', ' vs.'],
};

const FILLER_WORDS = [
  'best', 'meilleure', 'meilleur', 'meilleurs', 'meilleures', 'for', 'pour', 'de', 'du', 'des', 'la', 'le', 'les',
  'what', 'whats', "what's", "c'est", 'quoi', 'is', 'the', 'quelle', 'quel', 'team', 'équipe', 'equipe',
  'synergie', 'synergy', 'compo', 'material', 'materiau', 'matériau', 'materials', 'matériaux', 'farm', 'ascension',
  'counter', 'contre', 'matchup', 'against', 'vs', 'a', 'of', "d'", 'un', 'une',
];

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');
function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
}

export function classifyIntent(query) {
  const q = normalize(query);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(k => q.includes(normalize(k)))) return intent;
  }
  return 'search';
}

const FILLER_STEMS = new Set(FILLER_WORDS.map(w => normalize(w).replace(/[sx]$/, '')));

function stripFillerWords(query) {
  const words = query.split(/\s+/).filter(Boolean);
  // Strip a trailing s/x before comparing so plurals (matériaux vs matériau,
  // materials vs material) match the singular forms in FILLER_WORDS too.
  const kept = words.filter(w => !FILLER_STEMS.has(normalize(w.replace(/[?!.,]/g, '')).replace(/[sx]$/, '')));
  return kept.join(' ').trim();
}

let _charFuse = null;
let _charFuseLocale = null;
function getCharacterFuse(locale) {
  if (_charFuse && _charFuseLocale === locale) return _charFuse;
  const data = getLocalizedCharacterData(locale);
  const items = Object.keys(data).map(name => ({ name }));
  _charFuse = new Fuse(items, { keys: ['name'], threshold: 0.4, ignoreLocation: true });
  _charFuseLocale = locale;
  return _charFuse;
}

export function resolveCharacterName(query, locale) {
  const cleaned = stripFillerWords(query);
  if (!cleaned) return null;
  const hits = getCharacterFuse(locale).search(cleaned, { limit: 1 });
  return hits.length ? hits[0].item.name : null;
}

function joinOr(list) {
  if (!list || list.length === 0) return null;
  return list.join(' | ');
}

export function answerQuery(query, locale) {
  const q = query.trim();
  if (!q) return null;

  const intent = classifyIntent(q);
  if (intent === 'search') return null; // let the plain fuzzy-search results list handle it

  const name = resolveCharacterName(q, locale);
  if (!name) return { kind: 'text', text: t('assistant.entityNotFound', { query: q }) };

  const data = getLocalizedCharacterData(locale)[name];

  if (intent === 'team') {
    const teams = joinOr(data.teams);
    if (!teams && !data.bestWeapon && !(data.bestEchoes && data.bestEchoes.length)) {
      return { kind: 'text', text: t('assistant.answerTeamNoData', { name }), name };
    }
    return {
      kind: 'text',
      name,
      text: t('assistant.answerTeam', {
        name,
        teams: teams || '—',
        weapon: data.bestWeapon || '—',
        echoes: (data.bestEchoes || []).join(', ') || '—',
      }),
    };
  }

  if (intent === 'materials') {
    const asc = data.ascension;
    const skill = data.skillMaterials;
    if (!asc && !skill) {
      return { kind: 'text', text: t('assistant.answerMaterialsNoData', { name }), name };
    }
    const ascText = asc ? [asc.boss, asc.common, asc.specialty].filter(Boolean).join(', ') : '—';
    const skillText = skill ? [skill.weeklyDrop, skill.forgery].filter(Boolean).join(', ') : '—';
    return {
      kind: 'text',
      name,
      text: t('assistant.answerMaterials', { name, ascension: ascText, skillMaterials: skillText }),
    };
  }

  if (intent === 'matchup') {
    return {
      kind: 'text',
      name,
      text: t('assistant.answerMatchup', { name, element: data.element || '—', role: data.role || '—' }),
    };
  }

  return null;
}
