// Shared text-normalization helpers for Abby's search/query engine.
// \p{Diacritic} (not a literal combining-mark character-range string) so
// this survives any editor/tool re-encoding the file - a literal
// combining-mark range embedded in source is exactly the kind of thing
// that silently mangles on save (it already happened once in this file's
// history).
export function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

// Common question/filler words to strip before fuzzy-matching a query
// against short name fields - without this, "tell me about Jinhsi" or
// "c'est quoi la meilleure team pour Jinhsi" gets fuzzy-matched as a whole
// noisy sentence against a 6-letter name field and can fall outside the
// match threshold even though the intent is obvious to a human reader.
const QUESTION_WORDS = [
  'best', 'meilleure', 'meilleur', 'meilleurs', 'meilleures', 'for', 'pour', 'de', 'du', 'des', 'la', 'le', 'les',
  'what', 'whats', "what's", "c'est", 'quoi', 'is', 'are', 'the', 'quelle', 'quel', 'qui', 'who', 'whos', "who's",
  'tell', 'me', 'about', 'info', 'information', 'infos', 'sur', 'parle', 'moi', 'de',
  'team', 'équipe', 'equipe', 'synergie', 'synergy', 'compo', 'weapon', 'weapons', 'arme', 'armes',
  'material', 'materiau', 'matériau', 'materials', 'matériaux', 'farm', 'ascension',
  'counter', 'contre', 'matchup', 'against', 'vs', 'a', 'an', 'of', "d'", 'un', 'une', 'et', 'and',
  'should', 'i', 'use', 'with', 'avec', 'pair', 'partner',
];

const QUESTION_STEMS = new Set(QUESTION_WORDS.map(w => normalize(w).replace(/[sx]$/, '')));

// Strip a trailing s/x before comparing so plurals (matériaux vs matériau,
// materials vs material) match the singular forms above too.
export function stripQuestionWords(query) {
  const words = query.split(/\s+/).filter(Boolean);
  const kept = words.filter(w => !QUESTION_STEMS.has(normalize(w.replace(/[?!.,]/g, '')).replace(/[sx]$/, '')));
  return kept.join(' ').trim();
}
