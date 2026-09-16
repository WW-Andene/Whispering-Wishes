// Abby's "AI-like" answer engine: an entity-first resolver + keyword
// intent classifier over the existing static game data, not a real LLM.
// This file is the orchestrator only — resolution lives in searchIndex.js
// (findEntityInIndex), facet classification in intentClassifier.js, and
// text templating in answerTemplates.js.
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
//   3. Template a text answer from that character's own recorded fields
//      (answerTemplates.js) - never fabricated.

import { getLocalizedCharacterData } from '../../data/characters.js';
import { findEntityInIndex } from './searchIndex.js';
import { classifyIntent } from './intentClassifier.js';
import { ANSWER_BUILDERS } from './answerTemplates.js';

export function answerQuery(query, locale, index) {
  const q = query.trim();
  if (!q) return null;

  const entity = findEntityInIndex(index, q, { types: ['character'] });
  if (!entity) return null; // not about a character at all - let the plain results list handle it (could be a weapon/echo)

  const name = entity.name;
  const data = getLocalizedCharacterData(locale)[name];
  const intent = classifyIntent(q) || 'profile';

  return ANSWER_BUILDERS[intent](name, data);
}
