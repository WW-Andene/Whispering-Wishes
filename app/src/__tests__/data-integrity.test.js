/**
 * Data Integrity Tests
 * Verifies all game data is complete, consistent, and correctly structured.
 */
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, ALL_CHARACTERS, findSkillMultiplierRow } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { ECHO_DATA, ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES } from '../data/echoes.js';
import { CURRENT_BANNERS } from '../data/banners.js';
import { WEAPON_REFINE_SCALE, ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS } from '../data/constants.js';

describe('CHARACTER_DATA integrity', () => {
  const chars = Object.entries(CHARACTER_DATA);

  it('has at least 40 characters', () => {
    expect(chars.length).toBeGreaterThanOrEqual(40);
  });

  it('every character has required fields', () => {
    chars.forEach(([name, data]) => {
      expect(data.rarity, `${name} missing rarity`).toBeDefined();
      expect([4, 5]).toContain(data.rarity);
      expect(data.element, `${name} missing element`).toBeDefined();
      expect(['Glacio', 'Fusion', 'Electro', 'Aero', 'Spectro', 'Havoc']).toContain(data.element);
      expect(data.weapon, `${name} missing weapon type`).toBeDefined();
      expect(['Sword', 'Broadblade', 'Pistols', 'Gauntlets', 'Rectifier']).toContain(data.weapon);
      expect(data.role, `${name} missing role`).toBeDefined();
      expect(['Main DPS', 'Sub DPS', 'Support', 'Healer', 'Support/Healer']).toContain(data.role);
      expect(data.skills, `${name} missing skills`).toBeDefined();
      expect(data.skills.length, `${name} should have 4 skills`).toBe(4);
    });
  });

  it('every character has base stats', () => {
    // Jingran (v3.6) is a genuine exception: his kit passive "Nether to Light" fixes his combat DEF
    // to 0 outright (confirmed via the source/the wiki) — 0 is his real value, not
    // a missing-data placeholder, so he's excluded from the baseDef > 0 assertion below.
    const ZERO_DEF_BY_KIT = new Set(['Jingran']);
    chars.forEach(([name, data]) => {
      expect(data.baseHp, `${name} missing baseHp`).toBeGreaterThan(0);
      expect(data.baseAtk, `${name} missing baseAtk`).toBeGreaterThan(0);
      if (!ZERO_DEF_BY_KIT.has(name)) {
        expect(data.baseDef, `${name} missing baseDef`).toBeGreaterThan(0);
      } else {
        expect(data.baseDef, `${name} baseDef should be exactly 0 (kit-fixed)`).toBe(0);
      }
      expect(data.maxEnergy, `${name} missing maxEnergy`).toBeGreaterThan(0);
    });
  });

  it('every character has rotation data', () => {
    chars.forEach(([name, data]) => {
      expect(data.totalMult, `${name} missing totalMult`).toBeGreaterThan(0);
      expect(data.rotTime, `${name} missing rotTime`).toBeGreaterThan(0);
      expect(data.onField, `${name} missing onField`).toBeGreaterThan(0);
      expect(data.onField, `${name} onField > rotTime`).toBeLessThanOrEqual(data.rotTime);
    });
  });

  it('every character has ascension materials', () => {
    chars.forEach(([name, data]) => {
      expect(data.ascension, `${name} missing ascension`).toBeDefined();
      expect(data.ascension.boss, `${name} missing boss material`).toBeTruthy();
      expect(data.ascension.specialty, `${name} missing specialty`).toBeTruthy();
      expect(data.ascension.common, `${name} missing common material`).toBeTruthy();
    });
  });

  it('5-star characters have bestWeapon defined', () => {
    chars.filter(([, d]) => d.rarity === 5).forEach(([name, data]) => {
      expect(data.bestWeapon, `${name} missing bestWeapon`).toBeTruthy();
      expect(WEAPON_DATA[data.bestWeapon], `${name}'s bestWeapon "${data.bestWeapon}" not in WEAPON_DATA`).toBeDefined();
    });
  });

  it('bestWeapon type matches character weapon type', () => {
    chars.filter(([, d]) => d.bestWeapon).forEach(([name, data]) => {
      const weapon = WEAPON_DATA[data.bestWeapon];
      if (weapon) {
        expect(weapon.type, `${name}: weapon type mismatch (${weapon.type} vs ${data.weapon})`).toBe(data.weapon);
      }
    });
  });
});

// PHASE2_PLAN.md backlog item 4: "the zero-damage rotation-step bug class." CharacterDetailModal.jsx
// (and, historically, several one-off hand audits across characters.js's own comments — Roccia,
// Jiyan, Yinlin among them) resolve each CHARACTER_ROTATIONS step against a SKILL_MULTIPLIERS row
// via findSkillMultiplierRow() (exact type+name match, falling back to the historical fuzzy
// substring match). That lookup silently returns undefined instead of erroring when a step's
// `skill` string doesn't actually match anything for that character — which is exactly how this bug
// class kept recurring: a data edit renames a row, or introduces a step string, without the two
// staying in sync, and nothing catches it except a human happening to notice a step showing no DMG.
// This test runs the SAME lookup against the full roster so a future mismatch fails CI instead of
// waiting for a manual audit to find it.
describe('CHARACTER_ROTATIONS / SKILL_MULTIPLIERS lookup integrity', () => {
  const rotations = Object.entries(CHARACTER_ROTATIONS);

  it('has rotation data for at least 40 characters', () => {
    expect(rotations.length).toBeGreaterThanOrEqual(40);
  });

  // NOT a "must be zero" assertion: plenty of steps legitimately have no SKILL_MULTIPLIERS row —
  // stance swaps, descriptive multi-move labels ("Vining Waltz 1-4 / Blazing Waltz"), Forte
  // continuations, etc. — and telling those apart from an actual naming-mismatch bug requires
  // per-step, per-character judgment this test can't make automatically (that finer-grained
  // classification is the larger, not-yet-done "stable id field" migration PHASE2_PLAN.md's
  // backlog item 4 itself defers). What this test CAN do without that: snapshot the current set of
  // unresolved steps as a known baseline, then fail if a NEW one appears that wasn't already known
  // — so a future data edit that silently breaks a PREVIOUSLY-RESOLVING step (the actual bug class
  // this item targets: a row gets renamed, a step string gets typo'd, and nothing else notices) is
  // caught by CI instead of waiting for a manual audit. Shrinking this list (an existing entry
  // getting fixed, not just re-labeled) is always fine — only growth needs re-approving here.
  const KNOWN_UNRESOLVED_BASELINE = new Set([
    'Cantarella[0] "Intro: Cruise"',
    'Cantarella[1] "Basic ATK: Illusion Collapse Stage 3"',
    'Cantarella[2] "Skill: Dance with Shadows"',
    'Cantarella[3] "Liberation: Beneath the Sea"',
    'Brant[2] "Mid-air: Stage 2-3 + Charged Attack + Flip"',
    'Carlotta[6] "Liberation: Death Knell ×4"',
    'Carlotta[8] "Skill: Art of Violence → Chromatic Splendor"',
    'Camellya[2] "Skill: Vining Waltz 1-4 / Blazing Waltz"',
    'Camellya[4] "Basic ATK: Vining Waltz 1"',
    'Camellya[6] "Skill: Vining Waltz 1-4 / Blazing Waltz"',
    'Camellya[7] "Skill: Floral Ravage"',
    // Jinhsi[3]/[4] now both resolve — fixed 2026-09-03 against a real browser snapshot:
    // SKILL_MULTIPLIERS['Jinhsi']'s combined 'Incarnation → Illuminous Epiphany' Forte row (a stale
    // "source table failed to render" TODO) was split into individually-named rows exactly matching
    // both rotation steps' own skill strings, and 2 previously-missing moves (Incarnation - Heavy
    // Attack, Incarnation - Dodge Counter) were added for kit completeness.
    'Calcharo[4] "Basic ATK: Hounds Roar"',
    'Calcharo[6] "Basic ATK: Hounds Roar"',
    'Lucilla[5] "Echo: Use Echo"',
    // Rebecca[3] "Forte: Rat-tat-tat!: Huntress" now resolves — fixed 2026-09-02, its SKILL_MULTIPLIERS
    // row's type was 'Heavy ATK' instead of 'Forte' (a silent lookup mismatch, previously missing this
    // baseline entirely; unrelated to the category fix on the same row).
    // Lucy[3]/[5]/[6]/[8] now all resolve — fixed 2026-09-02 against a real browser snapshot:
    // SKILL_MULTIPLIERS['Lucy'] was rebuilt with real per-move rows (previously a truncated/collapsed
    // table missing Thread Shredding Stage 1-4 and Dual Threading entirely, and naming 'Locked Thread
    // Stage 1-4'/'Netrunner: Override' instead of the rotation's own 'Locked Thread Stage 2-4'/
    // 'Old Net Deep Dive' step names).
    'Sigrika[1] "Basic ATK: Stage 2-4"',
    'Sigrika[3] "Forte: Heavy ATK: Schemata of Runes (Chain Whip)"',
    'Sigrika[5] "Basic ATK: Stage 2-4"',
    'Sigrika[7] "Forte: Heavy ATK: Schemata of Runes (Runic Outburst)"',
    'Luuk Herssen[1] "Mid-air: Jump: Scythe Resection Stage 2-3"',
    'Luuk Herssen[2] "Skill: Aureole of Execution: Ring"',
    'Luuk Herssen[3] "Basic ATK: Golden Impale"',
    'Luuk Herssen[4] "Mid-air: Basic 1 → Jump: Resection 2-3"',
    'Luuk Herssen[5] "Skill: Aureole of Execution: Breach"',
    'Luuk Herssen[6] "Basic ATK: Golden Impale"',
    'Luuk Herssen[7] "Mid-air: Basic 1 → Jump: Resection 2-3"',
    'Luuk Herssen[8] "Skill: Aureole of Execution: Glare"',
    'Luuk Herssen[9] "Forte: Mid-air Attack: Gavel of Earthshaker"',
    'Yangyang: Xuanling[1] "Basic ATK: Azure Sword Stance Stage 1-4"',
    'Yangyang: Xuanling[3] "Heavy ATK: Heavy Attack: Feather Sword Stance"',
    'Yangyang: Xuanling[5] "Basic ATK: Havoc in Bloom Stage 1-3"',
    'Yangyang: Xuanling[8] "Heavy ATK: Heavy Attack: Azure Sword Stance"',
    'Aemeath[0] "Skill: Form Switch"',
    'Aemeath[2] "Basic ATK: Mech Stage 3-4"',
    'Aemeath[3] "Liberation: Heavenfall Edict: Overdrive"',
    'Aemeath[4] "Basic ATK: Mech Stage 2-4"',
    'Aemeath[5] "Skill: Seraphic Duet: Encore"',
    'Aemeath[6] "Basic ATK: Aemeath Stage 2-4"',
    'Aemeath[7] "Skill: Seraphic Duet: Overture"',
    'Aemeath[9] "Liberation: Heavenfall Edict: Finale"',
    'Aemeath[10] "Skill: Form Switch"',
    'Lynae[3] "Heavy ATK: Spark Collision (full charge)"',
    // Lynae[4] "Basic ATK: Polychrome Leap ×3" now resolves — fixed 2026-09-02, a real zero-damage
    // rotation-step bug (SKILL_MULTIPLIERS row added, previously entirely missing).
    'Lynae[5] "Forte: Mid-air Attack: Visual Impact"',
    'Mornye[1] "Basic ATK: Wide Field Observation Mode Stage 1-3"',
    'Mornye[3] "Forte: Heavy Attack: Inversion"',
    'Chisa[1] "Basic ATK: Stage 2, Rending Lunge, Death Snip"',
    'Chisa[4] "Forte: Sawring - Blitz 2-3"',
    'Cartethyia[7] "Skill: Fleurdelys 2"',
    // Zani[1]/[2]/[3]/[5]/[6]/[7]/[8] now all resolve — fixed 2026-09-03 against a real browser
    // snapshot: SKILL_MULTIPLIERS['Zani'] added the missing Standard Defense Protocol row and a
    // dedicated Stage 3 row, and renamed 'Targeted Action'/'Heavy Slash <Name>' to match the rotation
    // steps' own longer/colon-bearing skill strings exactly (findSkillMultiplierRow's fuzzy match
    // requires the row name to CONTAIN the step string, which none of the old names did).
    'Augusta[1] "Heavy ATK: Thunderoar: Backstep"',
    'Augusta[2] "Heavy ATK: Thunderoar: Spinslash"',
    'Augusta[4] "Heavy ATK: Thunderoar: Backstep → Spinslash"',
    'Augusta[6] "Skill: Undying Sunlight: Strike"',
    'Augusta[7] "Skill: Undying Sunlight: Leap"',
    'Augusta[8] "Skill: Undying Sunlight: Plunge"',
    'Augusta[9] "Liberation: Sublime is the Sun"',
    'Augusta[10] "Liberation: Sublime is the Sun: Sunborne ×9"',
    'Augusta[11] "Liberation: Sublime is the Sun: Everbright Protector"',
    'Phrolova[1] "Basic ATK: Stage 3"',
    // Phrolova[2]/[4]/[6]: added real 'Forte' rows for both moves 2026-09-02 (were previously
    // skipped entirely — no Forte type existed in SKILL_MULTIPLIERS at all). The rotation step is a
    // combined "X / Y" player-choice string (either move can be used), same shape as Camellya's
    // "Vining Waltz 1-4 / Blazing Waltz" steps — never resolves to either single-move row by design,
    // display correctly shows no dmg number for this kind of step.
    'Phrolova[2] "Forte: Movement of Fate and Finality / Murmurs in a Haunting Dream"',
    'Phrolova[3] "Skill: Whispers in a Fleeting Dream"',
    'Phrolova[4] "Forte: Movement of Fate and Finality / Murmurs in a Haunting Dream"',
    'Phrolova[6] "Forte: Movement of Fate and Finality / Murmurs in a Haunting Dream"',
    'Phrolova[9] "Liberation: Waltz of Forsaken Depths"',
    'Qiuyuan[1] "Basic ATK: Inkwash Stage 3-4"',
    'Rover: Electro[1] "Basic ATK: Deterrence 1-4"',
    // Added 2026-09-02 alongside the new 'Mid-air'/'Attack' SKILL_MULTIPLIERS row (sourced from the
    // pasted the source text, previously missing entirely): the rotation step's own skill string is
    // "Plunging Attack" (repositioning-only per its note, no damage focus), which doesn't
    // substring-match the row name "Attack" or "Customary Greetings" — correctly stays unresolved,
    // matching the step's own intentionally-no-damage framing.
    'Carlotta[3] "Mid-air: Plunging Attack"',
  ]);

  it('no NEW rotation step fails to resolve against SKILL_MULTIPLIERS (baseline-tracked, see comment above)', () => {
    const unresolved = [];
    rotations.forEach(([name, steps]) => {
      // Only check characters/types this file actually has SKILL_MULTIPLIERS rows for — a
      // character or type with none isn't a lookup failure, it's simply undocumented yet.
      const rows = SKILL_MULTIPLIERS[name];
      if (!rows || !rows.length) return;
      const typesWithRows = new Set(rows.map(([t]) => t));
      steps.forEach((step, i) => {
        if (!step.skill || !typesWithRows.has(step.type)) return;
        const row = findSkillMultiplierRow(name, step);
        if (!row) unresolved.push(`${name}[${i}] "${step.type}: ${step.skill}"`);
      });
    });
    const newlyUnresolved = unresolved.filter(u => !KNOWN_UNRESOLVED_BASELINE.has(u));
    expect(newlyUnresolved, `NEW unresolved rotation steps not in the known baseline (would silently show 0 DMG) — if these are genuinely non-damage steps, add them to KNOWN_UNRESOLVED_BASELINE with a reason; if they're a real mismatch, fix the step's skill string or the SKILL_MULTIPLIERS row name:\n${newlyUnresolved.join('\n')}`).toEqual([]);
  });
});

describe('WEAPON_DATA integrity', () => {
  const weapons = Object.entries(WEAPON_DATA);

  it('has at least 100 weapons', () => {
    expect(weapons.length).toBeGreaterThanOrEqual(100);
  });

  it('every weapon has required fields', () => {
    weapons.forEach(([name, data]) => {
      expect(data.rarity, `${name} missing rarity`).toBeDefined();
      expect(data.rarity).toBeGreaterThanOrEqual(1);
      expect(data.rarity).toBeLessThanOrEqual(5);
      expect(data.type, `${name} missing type`).toBeDefined();
      expect(['Sword', 'Broadblade', 'Pistols', 'Gauntlets', 'Rectifier']).toContain(data.type);
      expect(data.baseAtk, `${name} missing baseAtk`).toBeGreaterThan(0);
    });
  });

  it('5-star weapons have passive and pv', () => {
    weapons.filter(([, d]) => d.rarity === 5).forEach(([name, data]) => {
      expect(data.passive, `${name} missing passive`).toBeTruthy();
      expect(data.pv, `${name} missing pv (parsed passive values)`).toBeDefined();
    });
  });

  // weaponLists.js maintains ALL_*STAR_WEAPONS as hand-curated arrays (display order
  // matters — used to render collection grids — so they aren't derived from WEAPON_DATA
  // at import time). This cross-check catches drift between the two without touching
  // that curated order: every weapon's rarity-list membership must match its
  // WEAPON_DATA.rarity, and every list must be exhaustive (no weapon missing).
  it('ALL_*STAR_WEAPONS lists match WEAPON_DATA.rarity exactly', () => {
    const rarityLists = { 5: ALL_5STAR_WEAPONS, 4: ALL_4STAR_WEAPONS, 3: ALL_3STAR_WEAPONS, 2: ALL_2STAR_WEAPONS, 1: ALL_1STAR_WEAPONS };
    weapons.forEach(([name, data]) => {
      const list = rarityLists[data.rarity];
      expect(list, `${name} has unknown rarity ${data.rarity}`).toBeDefined();
      expect(list, `${name} (rarity ${data.rarity}) missing from ALL_${data.rarity}STAR_WEAPONS`).toContain(name);
    });
    Object.entries(rarityLists).forEach(([rarity, list]) => {
      list.forEach(name => {
        expect(WEAPON_DATA[name], `ALL_${rarity}STAR_WEAPONS has "${name}" but WEAPON_DATA doesn't`).toBeDefined();
        expect(WEAPON_DATA[name].rarity, `"${name}" is in ALL_${rarity}STAR_WEAPONS but WEAPON_DATA says rarity ${WEAPON_DATA[name].rarity}`).toBe(Number(rarity));
      });
    });
  });
});

describe('ECHO_DATA integrity', () => {
  it('all echo lists reference valid echoes', () => {
    [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES].forEach(name => {
      expect(ECHO_DATA[name], `Echo "${name}" in list but not in ECHO_DATA`).toBeDefined();
    });
  });

  it('every echo has cost and sets (where applicable)', () => {
    Object.entries(ECHO_DATA).forEach(([name, data]) => {
      // Some echoes have dmg-only data (boss echoes) without cost/sets
      if (data.cost !== undefined) {
        expect([1, 3, 4]).toContain(data.cost);
      }
      if (data.sets !== undefined) {
        expect(data.sets.length, `${name} has empty sonata sets`).toBeGreaterThan(0);
      }
    });
  });

  it('echo sets reference valid set names', () => {
    Object.entries(ECHO_DATA).forEach(([name, data]) => {
      data.sets.forEach(setName => {
        expect(ECHO_SETS[setName], `Echo "${name}" references unknown set "${setName}"`).toBeDefined();
      });
    });
  });
});

describe('ECHO_SETS integrity', () => {
  it('every set has element and at least one bonus tier', () => {
    Object.entries(ECHO_SETS).forEach(([name, data]) => {
      expect(data.element, `${name} missing element`).toBeDefined();
      // Sets have p2/p5 OR p3 format (newer sets use 3-piece bonuses)
      const hasTierBonuses = (data.p2val || data.p3val || data.p5val);
      expect(hasTierBonuses, `${name} has no bonus values`).toBeTruthy();
    });
  });
});

describe('CHAR_BUFF_TABLE integrity', () => {
  it('every character has a buff table entry or is a simple DPS', () => {
    const chars5Star = Object.entries(CHARACTER_DATA).filter(([, d]) => d.rarity === 5);
    chars5Star.forEach(([name]) => {
      // At minimum, every 5-star should have SOME buff/debuff data
      const bt = CHAR_BUFF_TABLE[name];
      expect(bt, `${name} missing from CHAR_BUFF_TABLE`).toBeDefined();
    });
  });

  it('buff values are reasonable', () => {
    Object.entries(CHAR_BUFF_TABLE).forEach(([name, bt]) => {
      (bt.outroBuffs || []).forEach(b => {
        expect(b.value, `${name} outro buff value`).toBeGreaterThan(0);
        expect(b.value, `${name} outro buff value too high`).toBeLessThanOrEqual(200);
        expect(b.target, `${name} outro buff missing target`).toBeDefined();
      });
      (bt.libBuffs || []).forEach(b => {
        expect(b.value, `${name} lib buff value`).toBeGreaterThan(0);
        expect(b.target, `${name} lib buff missing target`).toBeDefined();
      });
    });
  });
});

describe('RESONANCE_CHAIN_DATA integrity', () => {
  it('has data for all 5-star characters', () => {
    Object.entries(CHARACTER_DATA).filter(([, d]) => d.rarity === 5).forEach(([name]) => {
      expect(RESONANCE_CHAIN_DATA[name], `${name} missing from RESONANCE_CHAIN_DATA`).toBeDefined();
    });
  });

  it('chains have s1-s6 with valid stats', () => {
    const validStats = new Set(['atkPct', 'critRate', 'critDmg', 'elemDmg', 'skillDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'deepen', 'defIgnore', 'defShred', 'resShred', 'totalMult', 'coordDmg', 'allDmg']);
    Object.entries(RESONANCE_CHAIN_DATA).forEach(([name, chain]) => {
      for (let s = 1; s <= 6; s++) {
        const lvl = chain['s' + s];
        if (lvl) {
          Object.keys(lvl).forEach(stat => {
            expect(validStats.has(stat), `${name} S${s} has unknown stat "${stat}"`).toBe(true);
          });
        }
      }
    });
  });
});

describe('SKILL_MULTIPLIERS integrity', () => {
  it('has data for all characters', () => {
    Object.keys(CHARACTER_DATA).forEach(name => {
      expect(SKILL_MULTIPLIERS[name], `${name} missing from SKILL_MULTIPLIERS`).toBeDefined();
    });
  });

  it('every entry is [type, name, mult, desc?] format', () => {
    Object.entries(SKILL_MULTIPLIERS).forEach(([charName, skills]) => {
      expect(Array.isArray(skills), `${charName} skills is not array`).toBe(true);
      skills.forEach((entry, i) => {
        expect(Array.isArray(entry), `${charName}[${i}] is not array`).toBe(true);
        expect(entry.length, `${charName}[${i}] should have 3 or 4 elements`).toBeGreaterThanOrEqual(3);
        expect(entry.length, `${charName}[${i}] should have 3 or 4 elements`).toBeLessThanOrEqual(4);
        expect(typeof entry[0], `${charName}[${i}][0] type`).toBe('string');
        expect(typeof entry[1], `${charName}[${i}][1] name`).toBe('string');
        expect(typeof entry[2], `${charName}[${i}][2] mult`).toBe('string');
        if (entry.length === 4) {
          expect(typeof entry[3], `${charName}[${i}][3] desc`).toBe('string');
        }
      });
    });
  });
});

describe('WEAPON_REFINE_SCALE', () => {
  it('has 5 levels', () => {
    expect(WEAPON_REFINE_SCALE).toHaveLength(5);
  });
  it('scales from 1 to 2', () => {
    expect(WEAPON_REFINE_SCALE[0]).toBe(1);
    expect(WEAPON_REFINE_SCALE[4]).toBe(2);
  });
  it('is monotonically increasing', () => {
    for (let i = 1; i < 5; i++) {
      expect(WEAPON_REFINE_SCALE[i]).toBeGreaterThan(WEAPON_REFINE_SCALE[i - 1]);
    }
  });
});

describe('Cross-reference consistency', () => {
  it('ALL_CHARACTERS matches CHARACTER_DATA keys', () => {
    const dataKeys = Object.keys(CHARACTER_DATA).sort();
    const allChars = [...ALL_CHARACTERS].sort();
    expect(allChars).toEqual(dataKeys);
  });

  it('CURRENT_BANNERS reference valid characters/weapons', () => {
    // CURRENT_BANNERS.characters may be objects with .name or strings
    const charNames = (CURRENT_BANNERS.characters || []).map(c => typeof c === 'string' ? c : c?.name).filter(Boolean);
    const weapNames = (CURRENT_BANNERS.weapons || []).map(w => typeof w === 'string' ? w : w?.name).filter(Boolean);
    charNames.forEach(name => {
      expect(CHARACTER_DATA[name], `Banner character "${name}" not in CHARACTER_DATA`).toBeDefined();
    });
    weapNames.forEach(name => {
      expect(WEAPON_DATA[name], `Banner weapon "${name}" not in WEAPON_DATA`).toBeDefined();
    });
  });
});

// the wiki/Damage (official, fetched 2026-08-19): "For most enemies in the
// game, the base resistance is equal to 0.1 (10%). Bosses with element-specific resistances have an
// additional 0.3 (30%) resistance, for a total of 0.4 (40%)." — every tracked enemy's RES map
// (built in echoes.js from the source's real per-boss data) should honor that exact rule: every
// element sits at the 10% baseline except the boosted one(s), which sit at exactly 40%. If this ever
// fails, either the enemy-stats pipeline drifted from its source or the wiki's own stated rule
// changed for a patch — either way it's the actual game's data disagreeing with what this app models.
describe('Enemy RES data matches the wiki\'s documented baseline rule', () => {
  const enemiesWithRes = Object.entries(ECHO_DATA).filter(([, d]) => d.enemyStats?.res);

  it('found tracked enemies to check', () => {
    expect(enemiesWithRes.length).toBeGreaterThan(100);
  });

  it('every RES value is the 10% baseline, 40% boss-signature, or 100% elemental immunity', () => {
    // 100% is real, not a data bug: WW's "Prism" enemies (Fusion Prism, Glacio Prism, etc.) are a
    // documented gimmick — fully immune to their own element by design, meant to be hit with a
    // different one. Confirmed directly in the source's raw base_stats (damage_resistance_element = 10000
    // exactly, i.e. 100.00%) for exactly the 5 Prism enemies, nothing else.
    const offenders = [];
    for (const [name, d] of enemiesWithRes) {
      for (const [el, val] of Object.entries(d.enemyStats.res)) {
        if (val !== 10 && val !== 40 && val !== 100) offenders.push(`${name}.${el}=${val}`);
      }
    }
    expect(offenders, offenders.join(', ')).toEqual([]);
  });

  it('100% RES is only ever a Prism enemy resisting its own name-matching element', () => {
    const offenders = [];
    for (const [name, d] of enemiesWithRes) {
      for (const [el, val] of Object.entries(d.enemyStats.res)) {
        if (val !== 100) continue;
        const isPrism = name.endsWith('Prism') && name.toLowerCase().startsWith(el);
        if (!isPrism) offenders.push(`${name}.${el}=100`);
      }
    }
    expect(offenders, offenders.join(', ')).toEqual([]);
  });

  it('every tracked enemy has all 7 elements present (Physical + 6 attributes)', () => {
    const expected = ['physical', 'glacio', 'fusion', 'electro', 'aero', 'spectro', 'havoc'].sort();
    for (const [name, d] of enemiesWithRes) {
      expect(Object.keys(d.enemyStats.res).sort(), name).toEqual(expected);
    }
  });
});
