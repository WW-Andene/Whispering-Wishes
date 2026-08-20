// @ts-check
// French localization overlay for echo data — data/echoes.js.
// Keyed by the exact same names as ECHO_SETS / ECHO_DATA in echoes.js so it
// can be shallow-merged in at render time based on the active locale.
//
// Terminology sourced from wutheringwaves.kurogames.com/fr (official — takes
// precedence) and wutheringwaves.fandom.com/fr (community wiki, secondary).
// Element names (Glacio, Fusion, Electro, Aero, Spectro, Havoc) are kept
// untranslated per the official French Play Store listing and site, which
// use them as-is even in French copy (e.g. "Qingxiao (Aero, Sabre)").
// "Intro"/"Outro" skill triggers: fandom.com/fr confirms "compétence d'intro"
// / "compétence d'outro" as the translated form; kept short as "Intro"/"Outro"
// in terse mechanical strings (matches how the rest of this app's fr locale
// keeps short mechanical tokens untranslated, e.g. teams.json).
//
// NOTE: elemental debuff proc names (Frazzle, Bane, Chafe, Flare, Burst) have
// no confirmed official French term from either source above — left in
// English rather than inventing one. "Erosion" is translated to "Érosion"
// since it's a plain French cognate, not a stylized proper noun.

/** @type {Record<string, { p2?: string, p3?: string, p5?: string }>} */
export const ECHO_SETS_FR = {
  'Freezing Frost': { p2: '+10 % DGT Glacio', p5: 'Attaque Basique/Lourde → +10 % DGT Glacio (max x3)' },
  'Molten Rift': { p2: '+10 % DGT Fusion', p5: 'Compétence de Résonance → +30 % DGT Fusion' },
  'Void Thunder': { p2: '+10 % DGT Electro', p5: 'Lourde/Compétence → +15 % DGT Electro (max x2)' },
  'Sierra Gale': { p2: '+10 % DGT Aero', p5: "Compétence d'Intro → +30 % DGT Aero" },
  'Celestial Light': { p2: '+10 % DGT Spectro', p5: "Compétence d'Intro → +30 % DGT Spectro" },
  'Havoc Eclipse': { p2: '+10 % DGT Havoc', p5: 'Basique/Lourde → +7,5 % DGT Havoc (max x4)' },
  'Rejuvenating Glow': { p2: '+10 % Soins', p5: "Soigner un allié → +15 % ATQ pour l'équipe" },
  'Moonlit Clouds': { p2: "+10 % Régén. d'Énergie", p5: 'Outro → +22,5 % ATQ pour le suivant' },
  'Lingering Tunes': { p2: '+10 % ATQ', p5: 'ATQ +5 %/1,5 s (max x4), Outro +60 %' },
  'Frosty Resolve': { p2: '+12 % DGT de Compétence de Résonance', p5: 'Compétence → +22,5 % Glacio ; Libération → +18 % Compétence (x2)' },
  'Eternal Radiance': { p2: '+10 % DGT Spectro', p5: 'Frazzle → +20 % Taux Critique ; à 10 cumuls → +15 % Spectro' },
  'Midnight Veil': { p2: '+10 % DGT Havoc', p5: 'Outro → 480 % Havoc + 15 % Havoc pour le suivant' },
  'Empyrean Anthem': { p2: "+10 % Régén. d'Énergie", p5: 'ATQ Coordonnée +80 % ; sur critique → +20 % ATQ' },
  'Tidebreaking Courage': { p2: "+10 % Régén. d'Énergie", p5: '+15 % ATQ ; ≥250 % Régén. Énergie → +30 % tous DGT' },
  'Gusts of Welkin': { p2: '+10 % DGT Aero', p5: "Érosion Aero → DGT Aero de l'équipe +15 %, +15 % de plus pour le déclencheur (20 s)" },
  'Windward Pilgrimage': { p2: '+10 % DGT Aero', p5: 'Toucher une cible en Érosion Aero → Taux Critique personnel +10 %, DGT Aero +30 % (10 s)' },
  'Flaming Clawprint': { p2: '+10 % DGT Fusion', p5: "Libération → +15 % Fusion pour l'équipe, +20 % DGT de Libération pendant 35 s" },
  'Crown of Valor': { p3: 'Bouclier → ATQ +6 %, Dégâts Critiques +4 % pendant 4 s (recharge 0,5 s, max x5)' },
  'Law of Harmony': { p3: "Compétence d'Écho → +30 % DGT d'Attaque Lourde pendant 4 s ; DGT de Compétence d'Écho de l'équipe +4 % pendant 30 s (max x4)" },
  "Flamewing's Shadow": { p3: "Compétence d'Écho → +20 % Taux Critique d'Attaque Lourde ; Attaque Lourde → +20 % Taux Critique de Compétence d'Écho ; les deux → +16 % DGT Fusion" },
  'Thread of Severed Fate': { p3: 'Havoc Bane → +20 % ATQ, +30 % DGT de Libération pendant 5 s' },
  'Dream of the Lost': { p3: "0 Énergie de Résonance → +20 % Taux Critique, +35 % DGT de Compétence d'Écho" },
  'Pact of Neonlight Leap': { p2: '+10 % DGT Spectro', p5: 'Outro → +15 % ATQ pour le suivant ; par point de Tune Break Boost +0,3 % ATQ (max +15 %)' },
  'Rite of Gilded Revelation': { p2: '+10 % DGT Spectro', p5: 'Attaque Basique → +10 % DGT Spectro (max x3) ; à 3 cumuls + Libération → +40 % DGT d\'Attaque Basique' },
  'Halo of Starry Radiance': { p2: '+10 % Soins', p5: "Soigner → par 1 % de Off-Tune Rate, +0,2 % ATQ pour l'équipe (max +25 %)" },
  'Trailblazing Star': { p2: '+10 % DGT Fusion', p5: 'Fusion Burst/Tune Rupture → +20 % Taux Critique, +20 % DGT Fusion pendant 8 s' },
  'Chromatic Foam': { p2: '+10 % DGT Fusion', p5: 'Fusion Burst → +10 % DGT Fusion pendant 15 s ; Outro → +25 % DGT Fusion pour le suivant pendant 15 s' },
  'Sound of True Name': { p2: '+10 % DGT Aero', p5: "DGT de Compétence d'Écho → +20 % Taux Critique d'Écho, +15 % DGT Aero pendant 5 s" },
  'Song of Feathered Trace': {
    p2: "+10 % Régén. d'Énergie",
    p5: "Havoc Bane → soi-même +20 % Taux Critique, +35 % DGT d'Attaque Lourde pendant 15 s (Plume de Xuanling) ; Glacio Chafe → ATQ de l'équipe +0,1 % par 1 % de Régén. d'Énergie, jusqu'à +25 %, pendant 10 s (Plume de Chongming)",
  },
  "Heart of Evil's Purge": { p2: '+10 % DGT Aero', p5: 'Tune Strain - Shifting → +20 % Dégâts Critiques, +30 % DGT Aero pendant 15 s' },
  'Lamp of Nether Road': { p2: '+10 % PV', p5: 'Obtenir un Bouclier → +5 % Taux Critique pendant 5 s (max x4, recharge 0,5 s) ; au maximum de cumuls → +15 % DGT Fusion' },
  'Reel of Spliced Memories': { p2: '+10 % ATQ', p5: "Tune Rupture - Shifting ou Tune Strain - Shifting → Tune Break Boost de l'équipe +20 pendant 30 s (les effets de même nom ne se cumulent pas)" },
  'Wishes of Quiet Snowfall': {
    p2: '+10 % DGT Glacio',
    p5: 'Glacio Chafe → soi-même +10 % DGT Glacio (15 s) ; Snowfall (recharge 25 s) : DGT de Libération → +25 % Taux Critique (6 s, prolongeable) ou Outro → +25 % DGT Glacio pour l\'entrant (15 s)',
  },
  'Shadow of Shattered Dreams': { p2: '1 pièce : Hack - Shifting → soi-même +35 % DGT d\'Attaque Basique, +35 % DGT d\'Attaque Lourde pendant 15 s' },
};

// Short mechanical stat/element-DMG tags used as `buff` on ECHO_DATA entries
// (e.g. "Spectro DMG", "Shield", "Support"). These follow a small fixed
// vocabulary, so a dictionary substitution is accurate here (unlike `desc`,
// which is free narrative prose and is translated by hand, entry by entry).
const BUFF_WORD_MAP = [
  [/\bDMG\b/g, 'DGT'],
  [/\bShield\b/g, 'Bouclier'],
  [/\bSupport\b/g, 'Soutien'],
  [/\bHeal\b/g, 'Soins'],
];

/** @param {string|string[]} buff */
export function translateBuffFr(buff) {
  const one = (s) => BUFF_WORD_MAP.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
  return Array.isArray(buff) ? buff.map(one) : one(buff);
}
