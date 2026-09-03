// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/textFormat.js
// splitIntoParagraphs() — shared by CharacterDetailModal and RotationGuideCard.
// ═══════════════════════════════════════════════════════════════════════════════

// Long-form kit/note prose in the data files is written as one dense run-on paragraph (audit-trail
// style, not reader-facing) — often just a handful of very long compound sentences packed with
// parentheticals, colons, and em-dashes. Grouping by a fixed sentence COUNT still produces a wall of
// text whenever those sentences are individually long, so this splits by an actual length budget
// instead: walk sentence-by-sentence (". "/"; " before a capital letter or digit — avoids breaking on
// "e.g." "vs." decimals, etc.) and start a new paragraph once the running paragraph would exceed
// maxChars. A single sentence that alone exceeds the budget is further broken on its own secondary
// clause boundaries (" — "/"; ") so no one paragraph is still an unreadable block.
export function splitIntoParagraphs(text, maxChars = 200) {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+(?:['"’»]?\s+|$)/g) || [text];
  const paragraphs = [];
  let current = '';
  const pushCurrent = () => { if (current.trim()) paragraphs.push(current.trim()); current = ''; };
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length > maxChars) {
      pushCurrent();
      // Oversized single sentence: break on its own em-dash/semicolon clause boundaries instead.
      const clauses = sentence.split(/(?<=[;])\s+|\s+—\s+/);
      let clausePara = '';
      for (const clause of clauses) {
        if (clausePara && (clausePara.length + clause.length + 3) > maxChars) {
          paragraphs.push(clausePara.trim());
          clausePara = clause;
        } else {
          clausePara = clausePara ? `${clausePara} — ${clause}` : clause;
        }
      }
      if (clausePara.trim()) paragraphs.push(clausePara.trim());
      continue;
    }
    if (current && (current.length + sentence.length + 1) > maxChars) pushCurrent();
    current = current ? `${current} ${sentence}` : sentence;
  }
  pushCurrent();
  return paragraphs.filter(Boolean);
}
