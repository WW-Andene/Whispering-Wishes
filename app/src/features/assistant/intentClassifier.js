// Facet-intent classification for Abby's query engine — which part of an
// already-resolved character's data the query is asking for (team/materials/
// matchup/profile). Separate from entity resolution (searchIndex.js) and from
// answer templating (answerTemplates.js) so each concern has one file.

import { normalize } from './textNormalize.js';

const INTENT_KEYWORDS = {
  // Checked before 'team' so a weapon-specific question gets the focused
  // weapon-only answer instead of the full team/weapon/echo dump - a "best
  // weapon" query is a real facet of its own, not just a keyword that
  // happens to also appear inside the team answer.
  weapon: ['weapon', 'arme', 'best weapon', 'meilleure arme', 'quelle arme'],
  team: [
    'team', 'équipe', 'equipe', 'synergie', 'synergise', 'synergy', 'compo', 'partner', 'pair with', 'squad',
    'good with', 'works well', 'pairs well', 'best comp', 'who should i use',
    'qui va bien avec', 'bien avec',
  ],
  materials: [
    'matériau', 'materiau', 'material', 'farm', 'ascension', 'mats', 'level up', 'leveling',
    'how to build', 'how to level', 'how to ascend', 'what do i need', 'comment build',
  ],
  matchup: ['counter', 'contre', 'faible contre', 'weak against', 'strong against', 'matchup', ' vs ', ' vs.'],
  profile: ['who is', "who's", 'whos', 'tell me about', "c'est qui", 'qui est', 'parle moi de', 'infos sur', 'about'],
};

// Defaults to null (not 'profile') so callers decide their own fallback -
// answerQuery treats "no specific facet keyword matched" as still-answerable
// via a general profile answer, rather than this module hardcoding that policy.
export function classifyIntent(query) {
  const q = normalize(query);
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(k => q.includes(normalize(k)))) return intent;
  }
  return null;
}
