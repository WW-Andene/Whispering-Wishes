// Abby's "AI-like" answer engine: an entity-first resolver + keyword
// intent classifier over the existing static game data, not a real LLM.
//
// Resolution order (this is the important part - intent keywords are a
// REFINEMENT of the answer, not a gate on whether one is given):
//   1. Does the query name a real character at all (searchIndex.js's
//      findEntityInIndex - substring match first, fuzzy fallback for
//      typos)? If not, return null and let the plain multi-type
//      fuzzy-search results list (which also covers weapons/echoes)
//      handle it.
//   2. A character WAS found - which facet did they ask for (team/
//      materials/matchup keyword)? Defaults to a general profile answer
//      if no specific facet keyword matched, so finding a real character
//      always produces a real answer instead of silently doing nothing
//      just because the exact keyword wasn't on the list.
//   3. Template a text answer from that character's own recorded fields -
//      never fabricated. Matchup/counter questions get an honest "not
//      tracked" answer instead of an invented one: Wuthering Waves has no
//      elemental rock-paper-scissors system and no such data exists
//      anywhere in characters.js.

import { getLocalizedCharacterData } from '../../data/characters.js';
import { findEntityInIndex } from './searchIndex.js';
import { normalize } from './textNormalize.js';
import { t } from '../../utils/i18n.js';

const INTENT_KEYWORDS = {
  // weapon/arme lands here (not a separate intent) because bestWeapon is
  // already part of the team answer.
  team: [
    'team', 'équipe', 'equipe', 'synergie', 'synergise', 'synergy', 'compo', 'partner', 'pair with', 'squad',
    'weapon', 'arme', 'good with', 'works well', 'pairs well', 'best comp', 'who should i use',
    'qui va bien avec', 'bien avec',
  ],
  materials: [
    'matériau', 'materiau', 'material', 'farm', 'ascension', 'mats', 'level up', 'leveling',
    'how to build', 'how to level', 'how to ascend', 'what do i need', 'comment build',
  ],
  matchup: ['counter', 'contre', 'faible contre', 'weak against', 'strong against', 'matchup', ' vs ', ' vs.'],
  profile: ['who is', "who's", 'whos', 'tell me about', "c'est qui", 'qui est', 'parle moi de', 'infos sur', 'about'],
};

function classifyIntent(query) {
  const q = normalize(query);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(k => q.includes(normalize(k)))) return intent;
  }
  return null; // no specific facet keyword - answerQuery defaults to 'profile' once a character is found
}

function joinOr(list) {
  if (!list || list.length === 0) return null;
  return list.join(' | ');
}

export function answerQuery(query, locale, index) {
  const q = query.trim();
  if (!q) return null;

  const entity = findEntityInIndex(index, q, { types: ['character'] });
  if (!entity) return null; // not about a character at all - let the plain results list handle it (could be a weapon/echo)

  const name = entity.name;
  const data = getLocalizedCharacterData(locale)[name];
  const intent = classifyIntent(q) || 'profile';

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

  // profile: general "who is X" / "tell me about X" / no specific facet
  // keyword matched at all - still a real answer, just the character's own
  // element/weapon/role/desc instead of guessing which facet they meant.
  return {
    kind: 'text',
    name,
    text: t('assistant.answerProfile', {
      name,
      rarity: data.rarity ?? '—',
      element: data.element || '—',
      weapon: data.weapon || '—',
      role: data.role || '—',
      desc: data.desc || '',
    }),
  };
}
