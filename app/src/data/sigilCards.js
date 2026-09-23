// Sigil Card catalog for the header settings-button customization feature —
// direct user request. Source images live in app/public/sigil-cards/ (from the
// user-supplied Sigil_Cards.zip); id is a stable key stored in visualSettings,
// name is the UI label, file is the filename under that folder.

export const SIGIL_CARDS = [
  { id: 'battle-skills-i', name: 'Battle Skills I', file: 'Sigil_Card_Battle_Skills_I.png' },
  { id: 'battle-skills-ii', name: 'Battle Skills II', file: 'Sigil_Card_Battle_Skills_II.png' },
  { id: 'breeze', name: 'Breeze', file: 'Sigil_Card_Breeze.png' },
  { id: 'crimson-fury', name: 'Crimson Fury', file: 'Sigil_Card_Crimson_Fury.png' },
  { id: 'echo-collection', name: 'Echo Collection', file: 'Sigil_Card_Echo_Collection.png' },
  { id: 'en-route', name: 'En Route', file: 'Sigil_Card_En_Route.png' },
  { id: 'exploration', name: 'Exploration', file: 'Sigil_Card_Exploration.png' },
  { id: 'fairytale', name: 'Fairytale', file: 'Sigil_Card_Fairytale.png' },
  { id: 'falling-snow', name: 'Falling Snow', file: 'Sigil_Card_Falling_Snow.png' },
  { id: 'fangs', name: 'Fangs', file: 'Sigil_Card_Fangs.png' },
  { id: 'fiamma', name: 'Fiamma', file: 'Sigil_Card_Fiamma.png' },
  { id: 'fiery-dance', name: 'Fiery Dance', file: 'Sigil_Card_Fiery_Dance.png' },
  { id: 'footprints-in-huanlong-i', name: 'Footprints In Huanlong I', file: 'Sigil_Card_Footprints_In_Huanlong_I.png' },
  { id: 'healthy-lifestyle', name: 'Healthy Lifestyle', file: 'Sigil_Card_Healthy_Lifestyle.png' },
  { id: 'jinzhou-records', name: 'Jinzhou Records', file: 'Sigil_Card_Jinzhou_Records.png' },
  { id: 'justice-served', name: 'Justice Served', file: 'Sigil_Card_Justice_Served.png' },
  { id: 'mirrors-of-clarity', name: 'Mirrors Of Clarity', file: 'Sigil_Card_Mirrors_Of_Clarity.png' },
  { id: 'napping-time', name: 'Napping Time', file: 'Sigil_Card_Napping_Time.png' },
  { id: 'perceptive-eyes', name: 'Perceptive Eyes', file: 'Sigil_Card_Perceptive_Eyes.png' },
  { id: 'qingloong', name: 'Qingloong', file: 'Sigil_Card_Qingloong.png' },
  { id: 'rhythmic-echoes', name: 'Rhythmic Echoes', file: 'Sigil_Card_Rhythmic_Echoes.png' },
  { id: 'youtan', name: 'Youtan', file: 'Sigil_Card_Youtan.png' },
  { id: 'zapstring', name: 'Zapstring', file: 'Sigil_Card_Zapstring.png' },
];

export function getSigilCard(id) {
  return SIGIL_CARDS.find((c) => c.id === id) || null;
}
