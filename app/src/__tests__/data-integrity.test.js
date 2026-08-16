/**
 * Data Integrity Tests
 * Verifies all game data is complete, consistent, and correctly structured.
 */
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS, ALL_CHARACTERS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { ECHO_DATA, ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES } from '../data/echoes.js';
import { CURRENT_BANNERS } from '../data/banners.js';
import { WEAPON_REFINE_SCALE } from '../data/constants.js';

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
    chars.forEach(([name, data]) => {
      expect(data.baseHp, `${name} missing baseHp`).toBeGreaterThan(0);
      expect(data.baseAtk, `${name} missing baseAtk`).toBeGreaterThan(0);
      expect(data.baseDef, `${name} missing baseDef`).toBeGreaterThan(0);
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
