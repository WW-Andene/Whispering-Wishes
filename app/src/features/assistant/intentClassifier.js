// Facet-intent classification for Abby's query engine — which part(s) of an
// already-resolved character's data the query is asking for (weapon/echoes/
// team/materials/matchup/profile). Separate from entity resolution
// (searchIndex.js) and from answer templating (answerTemplates.js) so each
// concern has one file.
//
// A query can ask about more than one facet at once ("best weapon AND team
// for X", "materials et contre-attaque pour X") - classifyIntents returns
// every facet whose keywords appear, in priority order, so answerQuery can
// combine them into one answer instead of only ever answering the first
// facet it happens to recognize.

import { normalize } from './textNormalize.js';

const INTENT_KEYWORDS = {
  // Checked before 'team' so a weapon-only question gets the focused
  // weapon-only answer instead of the full team/weapon/echo dump - a "best
  // weapon" query is a real facet of its own, not just a keyword that
  // happens to also appear inside the team answer.
  weapon: ['weapon', 'arme', 'best weapon', 'meilleure arme', 'quelle arme'],
  echoes: ['echo', 'écho', 'echoes', 'échos', 'best echo', 'meilleur écho', 'meilleurs échos'],
  team: [
    'team', 'équipe', 'equipe', 'synergie', 'synergise', 'synergy', 'compo', 'partner', 'pair with', 'squad',
    'good with', 'works well', 'pairs well', 'best comp', 'who should i use', 'teammate', 'coéquipier',
    'qui va bien avec', 'bien avec',
  ],
  materials: [
    'matériau', 'materiau', 'material', 'farm', 'ascension', 'mats', 'level up', 'leveling', 'upgrade',
    'how to build', 'how to level', 'how to ascend', 'what do i need', 'comment build', 'comment monter',
    'comment améliorer', 'comment farmer',
  ],
  matchup: [
    'counter', 'contre', 'faible contre', 'weak against', 'strong against', 'matchup', ' vs ', ' vs.',
    'weakness', 'faiblesse',
  ],
  // Deliberately no generic "what is"/"what's" here - those appear inside
  // plenty of facet-specific questions ("what is the best weapon for X")
  // and would wrongly tack on a redundant profile blurb to every one of
  // them once combined with the matched facet below.
  profile: [
    'who is', "who's", 'whos', 'tell me about', "c'est qui", 'qui est', 'parle moi de', 'infos sur',
  ],
};

const INTENT_ORDER = Object.keys(INTENT_KEYWORDS);

// Every facet the query's keywords touch, in a stable priority order (never
// duplicated, never dependent on which keyword happened to appear first in
// the sentence) - a combined sentence like "best team and weapon" or
// "matériaux et contre pour X" resolves to every facet it names.
export function classifyIntents(query) {
  const q = normalize(query);
  const matched = new Set();
  for (const intent of INTENT_ORDER) {
    if (INTENT_KEYWORDS[intent].some(k => q.includes(normalize(k)))) matched.add(intent);
  }
  return [...matched];
}

// Single-facet convenience wrapper, kept for callers that only ever want one
// answer - returns the highest-priority matched facet, or null if none
// matched (answerQuery defaults that case to 'profile' itself).
export function classifyIntent(query) {
  return classifyIntents(query)[0] ?? null;
}
