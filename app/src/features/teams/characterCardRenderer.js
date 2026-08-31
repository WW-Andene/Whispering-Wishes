// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — characterCardRenderer.js
// Single-character "build card" canvas renderer for the Teams tab — parallel to
// features/profile/idCardRenderer.js, reusing the exact same drawing primitives
// (rr/drawPanel/drawShell/drawStat/gold accent bar) and native-vs-web save logic
// for visual/behavioral consistency with the existing Resonator ID card export.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_THEMES } from '../../data/banners.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { CHAIN_NODE_ICONS, SKILL_MULTIPLIERS, getSkillIcon } from '../../data/characters.js';
import { ECHO_DATA } from '../../data/echoes.js';
import { getElementColor, getElementIcon, getStatIcon, getSetIcon } from '../../shared/utils/elementVisuals.js';
import {
  ECHO_MAIN_STAT_VALUES,
  createStats, parsePassive, applyFullEchoSet, applyEchoStats,
  calcEnergyCycles, getSubstatGradeValue, getSubstatTier,
} from './calcEngine.js';

// Real Android launcher icon (same source as idCardRenderer.js's APP_ICON) used as a small
// brand watermark in this card's header — not the PWA icon or the currency icon.
const APP_ICON = './app-title-icon/Abby_app_home_icon.png';

// Roll-tier colors for echo substats, indexed by getSubstatTier's 0-3 result: Low/Medium/High/Max.
const SUBSTAT_TIER_COLORS = ['#4ade80', '#60a5fa', '#c084fc', '#edaf18'];

const loadImage = (src, timeoutMs = 3000) => new Promise((resolve) => {
  if (!src) { resolve(null); return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const t = setTimeout(() => resolve(null), timeoutMs);
  img.onload = () => { clearTimeout(t); resolve(img); };
  img.onerror = () => { clearTimeout(t); resolve(null); };
  img.src = src;
});

// Personal-build stat calc — the character's OWN gear only (weapon + echoes + their own worn
// echo set), no team buffs from teammates. This is deliberately different from calcTeamStats.js's
// mainDps-only "FULL tier" (which folds in every teammate's buffs and only ever exists for
// whichever member is the current Main DPS) — a "build card" is meant to show what THIS
// character's own equipment provides, the same way wuwaflex.com's build cards do, regardless of
// team role. Reuses the exact same stat-accumulator primitives calcTeamStats.js itself uses
// (createStats/applyFullEchoSet/applyEchoStats/calcEnergyCycles from calcEngine.js) so the math
// stays consistent with the rest of the app instead of being reimplemented from scratch.
function computeBuildStats(member, eq, teamIdx) {
  const d = member.d;
  const scaling = member.scaling;
  const scalingKey = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
  const stats = createStats();

  // Weapon substat
  const weapSubVal = parseFloat(member.weapSubVal) || 0;
  if (member.weapSubstat === 'Crit Rate') stats.cr += weapSubVal;
  else if (member.weapSubstat === 'Crit DMG') stats.cd += weapSubVal;
  else if (member.weapSubstat === scalingKey) stats.atkPct += weapSubVal;

  // Weapon passive (refinement-scaled), same fields calcTeamStats.js reads for its mainDps tier
  if (member.weapon) {
    const refLevel = eq?.refinement || 1;
    const refScale = WEAPON_REFINE_SCALE ? (WEAPON_REFINE_SCALE[refLevel - 1] || 1) : 1;
    const rawPv = member.weapon.pv || parsePassive(member.weapon.passive, d.element);
    const wp = Object.fromEntries(Object.entries(rawPv).map(([k, v]) => [k, typeof v === 'number' ? v * refScale : v]));
    if (scaling === 'ATK') stats.atkPct += (wp.atkPct || 0);
    else if (scaling === 'HP') stats.atkPct += (wp.hpPct || 0);
    else if (scaling === 'DEF') stats.atkPct += (wp.defPct || 0);
    stats.elemDmg += (wp.elemDmg || 0);
    stats.skillDmg += (wp.skillDmg || 0);
    stats.cr += (wp.critRate || 0);
    stats.cd += (wp.critDmg || 0);
  }

  // Worn echo set bonuses (personal only — the set this character themself has equipped)
  applyFullEchoSet(stats, member.echoSet, member.echoSet2, d.element, scaling);

  // Echo main stats + substats
  const baseStatsObj = { atk: member.totalBaseAtk, hp: d.baseHp || 0, def: d.baseDef || 0 };
  applyEchoStats(stats, eq?.echoes, d.element, scaling, baseStatsObj);

  // Energy Regen — reuse calcEnergyCycles verbatim (weapon substat + echo main/sub + set p2val +
  // main-slot echo skill buffs) instead of re-deriving it, so ER matches what the rest of the app
  // would compute for this exact loadout.
  const fakeTeamEquipment = { [teamIdx + ':' + member.name]: eq };
  const energyFactors = calcEnergyCycles([member], fakeTeamEquipment, teamIdx);
  const totalER = energyFactors[member.name]?.totalER ?? 100;

  const finalAtk = Math.round((member.baseStat || 0) * (1 + stats.atkPct / 100));
  return {
    finalAtk,
    finalHp: Math.round(d.baseHp || 0),
    finalDef: Math.round(d.baseDef || 0),
    cr: stats.cr,
    cd: stats.cd,
    er: Math.round(totalER),
    elemDmg: stats.elemDmg,
    skillDmg: stats.skillDmg,
  };
}

/**
 * Render and download a single-character build card as PNG.
 * @param {Object} params
 * @param {Object} params.member - one entry from DamageCalculator's `members` array (name, d, weapon, weapName, weapSubstat, weapSubVal, echoSet, echoSet2, scaling, baseStat, totalBaseAtk)
 * @param {Object} params.eq - that member's teamEquipment entry: { weapon, echoes, sequence, refinement }
 * @param {number} params.teamIdx - active team index (needed for the ER calc's teamEquipment key shape)
 * @param {Object} params.collectionImages - character/echo/weapon image URLs
 * @param {Function} params.getImageFraming - image framing function (per-character crop/zoom)
 * @param {Object} [params.profile] - the app's own player profile (username/uid), shown in the
 *   portrait's top overlay in place of the character's own name/level — same identity role the
 *   Resonator ID card's own portrait overlay plays (see idCardRenderer.js's drawHero)
 * @param {Object} [params.toast] - toast provider, for export-result notifications
 */
export async function renderCharacterCard({ member, eq, teamIdx, collectionImages, getImageFraming, profile, toast }) {
  const canvas = document.createElement('canvas');
  // Canvas resolution intentionally exceeds PerfectSuite's max primary (1024) — this is the
  // downloadable PNG's export resolution, not a UI element dimension, and the prior 1600x900
  // canvas didn't leave enough room for legible 4-quadrant text/icons (see task history). Every
  // font-size/icon-size/padding/gap/radius constant inside the card IS kept on the PerfectSuite
  // scale below.
  const W = 1920, H = 1440; // 4:3 — grown taller to fit the weapon/echo icons at 3x their prior size
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); };

  const d = member.d;
  const name = member.name;
  const element = d.element;
  const built = computeBuildStats(member, eq, teamIdx);

  // ── Preload images ──
  const bannerArt = CHARACTER_THEMES.find(th => th.name === name)?.bannerArt || null;
  const [bgImg, portraitImg, weaponImg, elIcon, appIco] = await Promise.all([
    loadImage(bannerArt),
    loadImage(collectionImages[name]),
    loadImage(eq?.weapon ? collectionImages[eq.weapon] : null),
    loadImage(getElementIcon(element)),
    loadImage(APP_ICON),
  ]);
  const echoSlots = [0, 1, 2, 3, 4].map(i => eq?.echoes?.[i] || null);
  const echoImgs = await Promise.all(echoSlots.map(entry => {
    const n = entry && typeof entry === 'object' ? entry.name : (typeof entry === 'string' ? entry : null);
    return n ? loadImage(collectionImages[n]) : Promise.resolve(null);
  }));
  const substatIconCache = {};
  const allSubstatTypes = new Set();
  echoSlots.forEach(entry => { if (entry && typeof entry === 'object') (entry.substats || []).forEach(s => allSubstatTypes.add(s)); });
  // Base-stat + weapon-row icons — reuse the app's own official stat-icon assets (elementVisuals.js's
  // getStatIcon) so this card shows HP/ATK/DEF/Crit Rate/Crit DMG/Energy Regen icons the same way
  // they're represented everywhere else in the app, instead of drawing new canvas glyphs.
  const baseStatIconKeys = ['HP', 'ATK', 'DEF', 'Crit Rate', 'Crit DMG', 'Energy Regen'];
  await Promise.all([...allSubstatTypes, ...baseStatIconKeys].map(async s => { substatIconCache[s] = await loadImage(getStatIcon(s)); }));
  const baseStatIcons = Object.fromEntries(baseStatIconKeys.map(k => [k, substatIconCache[k]]));

  // Resonance Chain (sequence) node icons — S1-S6, per-character; only some characters are
  // audited in CHAIN_NODE_ICONS (see that map's own comments), so this can legitimately be null.
  const chainRanks = ['s1', 's2', 's3', 's4', 's5', 's6'];
  const chainNodeMap = CHAIN_NODE_ICONS[name] || null;
  const chainNodeImgs = chainNodeMap
    ? await Promise.all(chainRanks.map(r => loadImage(chainNodeMap[r])))
    : chainRanks.map(() => null);

  // Skill row icons — one representative move per category (Normal/Skill/Forte/Liberation/
  // Intro), same real per-move icon assets CharacterDetailModal.jsx uses (getSkillIcon), picked
  // from this character's own SKILL_MULTIPLIERS entries rather than drawn as generic glyphs.
  const skillTypeToCategory = { 'Basic ATK': 'N', 'Skill': 'S', 'Forte': 'F', 'Liberation': 'L', 'Intro': 'I' };
  const skillIconUrls = { N: null, S: null, F: null, L: null, I: null };
  (SKILL_MULTIPLIERS[name] || []).forEach(([type, skillName]) => {
    const cat = skillTypeToCategory[type];
    if (cat && !skillIconUrls[cat]) skillIconUrls[cat] = getSkillIcon(name, skillName);
  });
  const skillIconImgs = Object.fromEntries(
    await Promise.all(Object.entries(skillIconUrls).map(async ([cat, url]) => [cat, await loadImage(url)]))
  );

  // Sonata (echo set) icons — one per equipped echo slot, keyed off that echo's own set(s) in
  // ECHO_DATA, falling back to the character's active forced/detected set (member.echoSet).
  const echoSetNames = echoSlots.map(entry => {
    const n = entry && typeof entry === 'object' ? entry.name : null;
    return (n && ECHO_DATA[n]?.sets?.[0]) || member.echoSet || null;
  });
  const setIconCache = {};
  await Promise.all([...new Set(echoSetNames.filter(Boolean))].map(async s => { setIconCache[s] = await loadImage(getSetIcon(s)); }));

  // ═══ DRAWING PRIMITIVES (copied from idCardRenderer.js for visual consistency) ═══
  const drawShell = (x, y, w, h) => {
    // Left un-filled (or filled by the caller before this runs): the banner shows through the
    // shell body itself, in the gaps between panels — only the panels/portrait are opaque cards.
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5; rr(x, y, w, h, 24); ctx.stroke();
    const il = ctx.createLinearGradient(x, y, x, y + 3); il.addColorStop(0, 'rgba(255,255,255,0.07)'); il.addColorStop(1, 'transparent');
    ctx.fillStyle = il; ctx.fillRect(x + 24, y + 1, w - 48, 2);
    const sh = ctx.createLinearGradient(x, 0, x + w, 0);
    sh.addColorStop(0, 'transparent'); sh.addColorStop(0.2, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.55)'); sh.addColorStop(0.8, 'rgba(255,255,255,0.35)'); sh.addColorStop(1, 'transparent');
    ctx.fillStyle = sh; ctx.fillRect(x + 24, y, w - 48, 1.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + w - 12 - 18, y + 12); ctx.lineTo(x + w - 12, y + 12); ctx.lineTo(x + w - 12, y + 12 + 18); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath(); ctx.moveTo(x + 12 + 18, y + h - 12); ctx.lineTo(x + 12, y + h - 12); ctx.lineTo(x + 12, y + h - 12 - 18); ctx.stroke();
  };

  const drawPanel = (x, y, w, h, label) => {
    ctx.fillStyle = 'rgba(10,14,22,0.75)'; rr(x, y, w, h, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5; rr(x, y, w, h, 16); ctx.stroke();
    const ps = ctx.createLinearGradient(x, 0, x + w, 0); ps.addColorStop(0, 'transparent'); ps.addColorStop(0.3, 'rgba(255,255,255,0.18)'); ps.addColorStop(0.5, 'rgba(255,255,255,0.3)'); ps.addColorStop(0.7, 'rgba(255,255,255,0.18)'); ps.addColorStop(1, 'transparent');
    ctx.fillStyle = ps; ctx.fillRect(x + 12, y, w - 24, 1.5);
    if (label) {
      const gb2 = ctx.createLinearGradient(0, y + 12, 0, y + 12 + 20); gb2.addColorStop(0, 'rgba(237,175,24,0.8)'); gb2.addColorStop(1, 'rgba(237,175,24,0.3)');
      ctx.fillStyle = gb2; rr(x + 15, y + 12, 3.5, 20, 1.5); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '600 17px sans-serif'; ctx.fillText(label, x + 26, y + 28);
      return 39;
    }
    return 9;
  };

  const drawStat = (x, y, w, h, val, lab, col, fs) => {
    ctx.fillStyle = 'rgba(10,14,22,0.75)'; rr(x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1; rr(x, y, w, h, 12); ctx.stroke();
    const ss = ctx.createLinearGradient(x, 0, x + w, 0); ss.addColorStop(0, 'transparent'); ss.addColorStop(0.5, 'rgba(255,255,255,0.40)'); ss.addColorStop(1, 'transparent');
    ctx.fillStyle = ss; ctx.fillRect(x + 6, y, w - 12, 1.5);
    const f = Math.round((fs || 24) * 1.1);
    ctx.fillStyle = col; ctx.font = `bold ${f}px monospace`; ctx.textAlign = 'center'; ctx.fillText(val, x + w / 2, y + h * 0.48);
    ctx.fillStyle = '#9ca3af'; ctx.font = `${Math.max(11, Math.round(f * 0.5))}px sans-serif`; ctx.fillText(lab, x + w / 2, y + h * 0.78); ctx.textAlign = 'left';
  };

  // ═══ RENDER ═══
  ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, W, H);
  // Precomputed cover-fit placement for the banner.
  let bgDrawX = 0, bgDrawY = 0, bgDrawW = W, bgDrawH = H;
  if (bgImg) {
    const imgAR = bgImg.naturalWidth / bgImg.naturalHeight, cardAR = W / H;
    let dw, dh;
    if (imgAR > cardAR) { dh = H; dw = H * imgAR; } else { dw = W; dh = W / imgAR; }
    bgDrawX = (W - dw) / 2; bgDrawY = (H - dh) / 2; bgDrawW = dw; bgDrawH = dh;
    // Exposed (undimmed) banner drawn across the whole canvas — this is what shows through the
    // shell body and the gaps between panels, which should read as the banner itself, not a flat
    // color. Each panel/portrait below draws its own OPAQUE card on top, hiding the banner only
    // inside its own bounds.
    ctx.drawImage(bgImg, bgDrawX, bgDrawY, bgDrawW, bgDrawH);
  }

  const M = 16, ox = M, oy = M, ow = W - M * 2, oh = H - M * 2; // PerfectSuite: 18 -> 16
  drawShell(ox, oy, ow, oh);
  const P = 16, bx = ox + P, bw = ow - P * 2, by = oy + P, bh = oh - P * 2; // PerfectSuite: 15 -> 16

  // ── Left: character portrait (large, object-contain framed) ──
  // NOTE: deliberately no dark panel/box drawn behind the portrait here — the character sprite
  // sits directly on the banner-art backdrop. The mask/fade + object-contain framing below is
  // untouched from the prior restyle, and the clip/crop math still uses the same bx/by/portraitW/bh
  // bounds so the portrait's position and framing do not shift.
  const portraitW = Math.floor(bw * 0.36);
  if (portraitImg) {
    ctx.save(); rr(bx + 2, by + 2, portraitW - 4, bh - 4, 14); ctx.clip();
    // Backing mask fill — matches the same rgba(10,14,22,0.75) mask used by the other 9 boxes
    // (Stats/Skills/Sequence/Weapon/5 Echoes) so all 10 boxes share the same mask opacity.
    ctx.fillStyle = 'rgba(10,14,22,0.75)'; ctx.fillRect(bx + 2, by + 2, portraitW - 4, bh - 4);
    const f = getImageFraming('collection-' + name);
    const sc = f.zoom / 100;
    const imgAR = portraitImg.naturalWidth / portraitImg.naturalHeight, cellAR = portraitW / bh;
    let bw2, bh2;
    if (imgAR > cellAR) { bw2 = portraitW; bh2 = portraitW / imgAR; } else { bh2 = bh; bw2 = bh * imgAR; }
    const dw2 = bw2 * sc, dh2 = bh2 * sc;
    const dx2 = bx + (portraitW - dw2) / 2 - (f.x / 100) * bw2 * sc;
    const dy2 = by + (bh - dh2) / 2 - (f.y / 100) * bh2 * sc;
    ctx.drawImage(portraitImg, dx2, dy2, dw2, dh2);
    ctx.restore();
    // Fade at the TOP of the portrait — the player identity overlay (username/UID) lives up
    // there. A second, smaller fade at the BOTTOM backs the character-name badge/plaque below.
    const fadeTop = ctx.createLinearGradient(0, by, 0, by + 96);
    fadeTop.addColorStop(0, 'rgba(8,12,18,0.9)'); fadeTop.addColorStop(1, 'rgba(8,12,18,0)');
    ctx.fillStyle = fadeTop; ctx.fillRect(bx + 2, by + 2, portraitW - 4, 94);
    const fadeBottom = ctx.createLinearGradient(0, by + bh - 96, 0, by + bh);
    fadeBottom.addColorStop(0, 'rgba(8,12,18,0)'); fadeBottom.addColorStop(1, 'rgba(8,12,18,0.9)');
    ctx.fillStyle = fadeBottom; ctx.fillRect(bx + 2, by + bh - 94, portraitW - 4, 92);
  }
  // Player identity overlay — username/UID, same role the Resonator ID card's own portrait
  // overlay plays (idCardRenderer.js's drawHero), swapped in here in place of the character's
  // own name/level (which moves to the bottom badge below) per user request: this card is a
  // player's build for a character, not the character's own ID, so the player identity belongs
  // in the primary (top) overlay slot.
  const elColor = getElementColor(element) || '#e2e8f0';
  const uname = profile?.username || 'Resonator';
  const uid = profile?.uid || '--';
  ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 34px sans-serif'; ctx.fillText(uname, bx + 18, by + 42);
  ctx.fillStyle = '#9ca3af'; ctx.font = '16px sans-serif'; ctx.fillText('UID ' + uid, bx + 18, by + 64);
  if (elIcon) ctx.drawImage(elIcon, bx + 18, by + 76, 20, 20);
  ctx.fillStyle = elColor; ctx.font = '600 18px sans-serif'; ctx.fillText(`${element || ''} · ${d.role || ''}`, bx + (elIcon ? 44 : 18), by + 93);

  // Character name badge/plaque — bottom-center of the portrait, sitting in the bottom fade
  // drawn above. A pill same style as the Weapon panel's refinement pill (gold-tinted fill +
  // border) — the same neutral dark mask/border every other block on this card uses (drawBannerPanel's
  // rgba(10,14,22,0.75) fill + rgba(255,255,255,0.16) border), not a gold treatment.
  {
    ctx.font = 'bold 26px sans-serif';
    const textW = ctx.measureText(name).width;
    const padX = 24, plaqueH = 44;
    const plaqueW = textW + padX * 2;
    const plaqueX = bx + portraitW / 2 - plaqueW / 2, plaqueY = by + bh - 18 - plaqueH;
    ctx.fillStyle = 'rgba(10,14,22,0.75)'; rr(plaqueX, plaqueY, plaqueW, plaqueH, plaqueH / 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5; rr(plaqueX, plaqueY, plaqueW, plaqueH, plaqueH / 2); ctx.stroke();
    ctx.fillStyle = '#f1f5f9'; ctx.textAlign = 'center';
    ctx.fillText(name, bx + portraitW / 2, plaqueY + plaqueH / 2 + 9);
    ctx.textAlign = 'left';
  }

  // ── Right column: left stack = Stats / Skills / Sequence, right stack = Weapon / Echoes ──
  // (per user's follow-up: swap Weapon and Sequence from the original 2x2, and insert a new
  // Skills row between Stats and Sequence in the left column). No bordered panel boxes — thin
  // divider lines separate sections, consistent with the rest of this restyle.
  const gap = 16; // PerfectSuite primary
  const rx = bx + portraitW + gap, rw = bw - portraitW - gap;
  const ry = by, rh = bh;

  const NEUTRAL = '#e2e8f0';
  const GOLD = '#edaf18';
  const DIM = 'rgba(255,255,255,0.12)';

  const qGap = 16; // PerfectSuite primary
  const qw = Math.floor((rw - qGap) / 2);
  const qw2 = rw - qw - qGap;
  const q1x = rx, q2x = rx + qw + qGap;
  const midX = rx + qw + qGap / 2;

  // Left column: Stats / Skills / Sequence, split into equal thirds.
  const leftH = Math.floor((rh - 2 * qGap) / 3);
  const statsH = leftH, skillsH = leftH, seqH = rh - statsH - skillsH - 2 * qGap;
  const statsY = ry, skillsY = statsY + statsH + qGap, seqY = skillsY + skillsH + qGap;

  // Right column: Weapon (fixed height, just enough for its 3x-larger icon) / Echoes (the rest).
  const weaponH = 384; // PerfectSuite secondary
  const echoesH = rh - weaponH - qGap;
  const weaponY = ry, echoesY = weaponY + weaponH + qGap;

  // Each block is its own rounded-corner panel — clipped to a rounded rect, with the SAME
  // banner+dim "mask" drawn inside it (so the background still shows through, just bounded to
  // that block's own shape) and a border stroke around it. This replaces the earlier "cut" gaps
  // between blocks entirely: a real bordered box is a cleaner, more legible separator than trying
  // to carve gaps out of a continuous background.
  const drawBannerPanel = (x, y, w, h, label) => {
    // Plain solid dark card, NOT a cropped window into the banner: since the banner's own
    // character figure spans most of its frame, windowing it per-panel duplicated the same
    // face/torso across Stats/Weapon/Skills/Sequence instead of showing varied art. The banner
    // stays visible only behind the portrait, where it belongs as a backdrop.
    ctx.save(); rr(x, y, w, h, 16); ctx.clip();
    ctx.fillStyle = 'rgba(10,14,22,0.75)'; ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5; rr(x, y, w, h, 16); ctx.stroke();
    if (!label) return 12;
    const gb = ctx.createLinearGradient(0, y + 12, 0, y + 12 + 16);
    gb.addColorStop(0, 'rgba(237,175,24,0.85)'); gb.addColorStop(1, 'rgba(237,175,24,0.35)');
    ctx.fillStyle = gb; rr(x + 14, y + 12, 4, 16, 2); ctx.fill();
    ctx.fillStyle = '#9ca3af'; ctx.font = '600 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(label.toUpperCase(), x + 26, y + 25);
    return 40; // header height offset — PerfectSuite secondary
  };
  // Portrait gets the same border treatment for visual consistency with the panels beside it —
  // its own clip/fade/framing stays exactly as it was, this only adds the outline on top. Radius
  // must match the clip rect above (14) — a mismatched radius here left the border's corners
  // cutting across the sprite's clipped rounded corner instead of tracing it, making the portrait's
  // mask box look incomplete/cut off.
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5; rr(bx + 2, by + 2, portraitW - 4, bh - 4, 14); ctx.stroke();

  // Small inset padding applied inside every block below, so each quadrant reads as its own
  // padded card/block instead of content sitting flush against the thin divider lines.
  const PAD = 16; // PerfectSuite primary

  // ── Q1 (top-left): character stat rows — icon-led, vertical list ──
  {
    drawBannerPanel(q1x, statsY, qw, statsH, 'Stats');
    const qx = q1x + PAD, qy = statsY + PAD, qh = statsH - 2 * PAD, cw = qw - 2 * PAD;
    const hOff = 40;
    const elDmgLabel = element ? `${element} DMG` : 'DMG Bonus';
    const statRows = [
      { icon: baseStatIcons['HP'], v: built.finalHp.toLocaleString('en-US'), l: 'HP', c: NEUTRAL },
      { icon: baseStatIcons['ATK'], v: built.finalAtk.toLocaleString('en-US'), l: 'ATK', c: NEUTRAL },
      { icon: baseStatIcons['DEF'], v: built.finalDef.toLocaleString('en-US'), l: 'DEF', c: NEUTRAL },
      { icon: baseStatIcons['Crit Rate'], v: built.cr.toFixed(1) + '%', l: 'Crit Rate', c: GOLD },
      { icon: baseStatIcons['Crit DMG'], v: built.cd.toFixed(1) + '%', l: 'Crit DMG', c: GOLD },
      { icon: baseStatIcons['Energy Regen'], v: built.er + '%', l: 'Energy Regen', c: NEUTRAL },
      { icon: elIcon, v: '+' + built.elemDmg.toFixed(0) + '%', l: elDmgLabel, c: GOLD },
    ];
    const rowH = Math.floor((qh - hOff) / statRows.length);
    statRows.forEach((s, i) => {
      const sy = qy + hOff + i * rowH;
      if (i > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(qx, sy); ctx.lineTo(qx + cw, sy); ctx.stroke(); }
      const midYr = sy + rowH / 2;
      let ix = qx;
      if (s.icon) { ctx.drawImage(s.icon, ix, midYr - 12, 24, 24); ix += 32; }
      // Label in white (was grey) — and the value sits right after the label with a fixed gap
      // instead of being pinned to the box's right edge, so it reads as close to its stat name
      // even when a longer/dynamic label (e.g. the element DMG row) is shown.
      ctx.fillStyle = '#f1f5f9'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(s.l, ix, midYr + 6);
      const labelW = ctx.measureText(s.l).width;
      ctx.fillStyle = s.c; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(s.v, ix + labelW + 16, midYr + 9);
    });
  }

  // ── Skills (new, per user's request — sits between Stats and Sequence in the left column):
  // horizontal row of the 5 combat skill types. This app doesn't track individual skill levels
  // anywhere in its data model (checked calcEngine.js/DamageCalculator.jsx — every skill is
  // simply assumed maxed, same as the wuwaflex.com reference this card follows), so each shows
  // a fixed "Lv. 10". Each badge shows that category's real move icon (skillIconImgs, resolved
  // above from this character's own SKILL_MULTIPLIERS) when one exists, falling back to the type
  // initial for characters/categories with no audited icon asset.
  {
    drawBannerPanel(q1x, skillsY, qw, skillsH, 'Skills');
    const qx = q1x + PAD, qy = skillsY + PAD, qh = skillsH - 2 * PAD, cw = qw - 2 * PAD;
    const hOff = 40;
    const skillTypes = [
      { k: 'N', l: 'Normal' }, { k: 'S', l: 'Skill' }, { k: 'F', l: 'Forte' },
      { k: 'L', l: 'Liberation' }, { k: 'I', l: 'Intro' },
    ];
    const n = skillTypes.length;
    const badgeSz = 62; // PerfectSuite tertiary — matches the Sequence row's icon size below
    const iGap = 16; // PerfectSuite primary
    const totalW = n * badgeSz + (n - 1) * iGap;
    let ix = qx + Math.max(0, (cw - totalW) / 2);
    const iy = qy + hOff + (qh - hOff - badgeSz - 24) / 2;
    skillTypes.forEach(s => {
      ctx.fillStyle = 'rgba(237,175,24,0.14)';
      ctx.beginPath(); ctx.arc(ix + badgeSz / 2, iy + badgeSz / 2, badgeSz / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(237,175,24,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ix + badgeSz / 2, iy + badgeSz / 2, badgeSz / 2, 0, Math.PI * 2); ctx.stroke();
      const icon = skillIconImgs[s.k];
      if (icon) {
        const pad = 10; const iconD = badgeSz - pad * 2;
        ctx.save(); ctx.beginPath(); ctx.arc(ix + badgeSz / 2, iy + badgeSz / 2, iconD / 2, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(icon, ix + pad, iy + pad, iconD, iconD);
        ctx.restore();
      } else {
        ctx.fillStyle = GOLD; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.k, ix + badgeSz / 2, iy + badgeSz / 2 + 8); ctx.textAlign = 'left';
      }
      ctx.fillStyle = NEUTRAL; ctx.font = '600 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Lv. 10', ix + badgeSz / 2, iy + badgeSz + 24);
      ctx.textAlign = 'left';
      ix += badgeSz + iGap;
    });
  }

  // ── Sequence (now bottom-left, per user's swap-with-weapon request): 2 rows x 3 columns
  // (S1-S3 top, S4-S6 bottom) instead of a single row of 6, so each node can render bigger ──
  {
    drawBannerPanel(q1x, seqY, qw, seqH, 'Sequence');
    const qx = q1x + PAD, qy = seqY + PAD, qh = seqH - 2 * PAD, cw = qw - 2 * PAD;
    const hOff = 40;
    const seq = eq?.sequence || 0;
    const hasChainIcons = chainNodeImgs.some(Boolean);
    const cols = 3, rows = 2;
    const iGap = 16; // PerfectSuite primary
    const labelH = 24; // PerfectSuite secondary — room for the "S#" caption under each node
    const availW = cw, availH = qh - hOff;
    const cellW = (availW - (cols - 1) * iGap) / cols;
    const cellH = (availH - (rows - 1) * iGap) / rows;
    const iconSz = Math.min(96, Math.floor(cellW), Math.floor(cellH - labelH)); // PerfectSuite primary
    const gridW = cols * iconSz + (cols - 1) * iGap, gridH = rows * (iconSz + labelH) + (rows - 1) * iGap;
    const gx0 = qx + Math.max(0, (availW - gridW) / 2), gy0 = qy + hOff + Math.max(0, (availH - gridH) / 2);
    for (let i = 0; i < 6; i++) {
      const rank = i + 1;
      const col = i % cols, row = Math.floor(i / cols);
      const ix = gx0 + col * (iconSz + iGap);
      const iy = gy0 + row * (iconSz + labelH + iGap);
      const unlocked = rank <= seq;
      const img = chainNodeImgs[i];
      if (hasChainIcons && img) {
        ctx.save();
        if (!unlocked) ctx.globalAlpha = 0.32;
        rr(ix, iy, iconSz, iconSz, 12); ctx.clip(); ctx.drawImage(img, ix, iy, iconSz, iconSz);
        ctx.restore();
        if (!unlocked) { ctx.fillStyle = 'rgba(8,8,16,0.45)'; rr(ix, iy, iconSz, iconSz, 12); ctx.fill(); }
      } else {
        ctx.fillStyle = unlocked ? 'rgba(237,175,24,0.18)' : 'rgba(255,255,255,0.06)';
        rr(ix, iy, iconSz, iconSz, 12); ctx.fill();
        ctx.strokeStyle = unlocked ? 'rgba(237,175,24,0.5)' : 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
        rr(ix, iy, iconSz, iconSz, 12); ctx.stroke();
        ctx.fillStyle = unlocked ? GOLD : '#6b7280'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(String(rank), ix + iconSz / 2, iy + iconSz / 2 + 8); ctx.textAlign = 'left';
      }
      ctx.fillStyle = unlocked ? NEUTRAL : '#6b7280';
      ctx.font = '600 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('S' + rank, ix + iconSz / 2, iy + iconSz + 18);
      ctx.textAlign = 'left';
    }
  }

  // ── Weapon (now top-right, per user's swap-with-sequence request): vertical stack, icon on
  // level/stat/refinement ──
  {
    drawBannerPanel(q2x, weaponY, qw2, weaponH, 'Weapon');
    const qx = q2x + PAD, qy = weaponY + PAD, qh = weaponH - 2 * PAD;
    const hOff = 40;
    const equippedWeap = member.weapon;
    // Icon sized to fill the whole quadrant's available height (not a fixed small size sitting
    // in a mostly-empty box) — per user feedback the weapon section must actually use its case.
    const availH = qh - hOff - 16;
    const iconSz = availH >= 256 ? 256 : availH >= 192 ? 192 : 128; // snapped to PerfectSuite primaries
    const iconY = qy + hOff + (qh - hOff - iconSz) / 2;
    if (weaponImg) { ctx.save(); rr(qx, iconY, iconSz, iconSz, 62); ctx.clip(); ctx.drawImage(weaponImg, qx, iconY, iconSz, iconSz); ctx.restore(); }
    // Info block sits to the RIGHT of the icon (not below it), vertically centered against the
    // icon's own height — same "icon | centered info block" arrangement as the Echoes rows.
    // Font sizes scaled up to match the larger icon instead of looking small next to it.
    const infoX = qx + iconSz + 32;
    const vRowH = 40; // PerfectSuite secondary
    const blockH = vRowH * 4;
    let vy = iconY + (iconSz - blockH) / 2 + vRowH - 10;
    // Name row — refinement pill now sits on the SAME line, to the right of the name (was its
    // own row at the bottom). Both the name and the pill's own label are vertically centered
    // against this row's own line height (vy - rowCenterOffset) instead of bottom-anchored.
    const nameRowCenter = vy - 8;
    ctx.fillStyle = equippedWeap ? GOLD : '#6b7280';
    ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(eq?.weapon || 'No Weapon Equipped', infoX, vy);
    const nameW = ctx.measureText(eq?.weapon || 'No Weapon Equipped').width;
    const pillW = 62, pillH = 32;
    const pillX = infoX + nameW + 16, pillY = nameRowCenter - pillH / 2;
    ctx.fillStyle = 'rgba(237,175,24,0.16)'; rr(pillX, pillY, pillW, pillH, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(237,175,24,0.5)'; ctx.lineWidth = 1; rr(pillX, pillY, pillW, pillH, 8); ctx.stroke();
    ctx.fillStyle = GOLD; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`R${eq?.refinement || 1}`, pillX + pillW / 2, pillY + pillH / 2 + 8); ctx.textAlign = 'left';
    vy += vRowH;
    // Level row — small "level meter" glyph (3 ascending bars) drawn in-canvas since no dedicated
    // level icon asset exists elsewhere in the app to reuse (checked DamageCalculator/EchoSelector).
    // Bars and text centered against this row's own line, not bottom-anchored to the baseline.
    ctx.fillStyle = '#9ca3af';
    [0, 1, 2].forEach(bi => {
      const bw3 = 6, bh3 = 8 + bi * 8;
      ctx.fillRect(infoX + bi * (bw3 + 3), vy - 4 - bh3, bw3, bh3);
    });
    ctx.font = '24px sans-serif'; ctx.fillText('Lv. 90/90', infoX + 32, vy);
    vy += vRowH;
    // Stat row — reuse the weapon's own stat icon (getStatIcon convention, same as Q1)
    if (equippedWeap) {
      const statVal = `${equippedWeap.subStatValue ? equippedWeap.subStatValue : '★'.repeat(equippedWeap.rarity || 0)}`.trim();
      const critIcon = baseStatIcons['ATK'];
      let tx = infoX;
      if (critIcon) { ctx.drawImage(critIcon, tx, vy - 24, 32, 32); tx += 40; }
      ctx.fillStyle = NEUTRAL; ctx.font = '24px sans-serif'; ctx.fillText(statVal, tx, vy);
      vy += vRowH;
      if (equippedWeap.stat) {
        const sIcon = baseStatIcons[equippedWeap.stat] || null;
        let tx2 = infoX;
        if (sIcon) { ctx.drawImage(sIcon, tx2, vy - 24, 32, 32); tx2 += 40; }
        ctx.fillStyle = GOLD; ctx.font = '24px sans-serif';
        ctx.fillText(`${equippedWeap.stat} ${equippedWeap.subStatValue || ''}`.trim(), tx2, vy);
        vy += vRowH;
      }
    }
  }

  // ── Echoes (bottom-right, unchanged column, shifted down below Weapon): 5 stacked, EACH its
  // own bordered rounded box (its own drawBannerPanel call) — not one big panel with hairlines,
  // per user feedback each echo needs its own visually distinct card.
  {
    // Section title drawn directly above the stack (no longer a wrapping panel of its own,
    // since each echo below now gets its own individual bordered box).
    const gb3 = ctx.createLinearGradient(0, echoesY, 0, echoesY + 16);
    gb3.addColorStop(0, 'rgba(237,175,24,0.85)'); gb3.addColorStop(1, 'rgba(237,175,24,0.35)');
    ctx.fillStyle = gb3; rr(q2x, echoesY, 4, 16, 2); ctx.fill();
    ctx.fillStyle = '#9ca3af'; ctx.font = '600 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('ECHOES', q2x + 12, echoesY + 13);
    const titleH = 24; // PerfectSuite secondary — reserves space for the title row above the boxes
    const echoGap = PAD; // matches the Weapon box's own inner padding above, so the gap between
    // echo boxes reads evenly with the weapon panel's padding instead of looking tighter
    const echoBoxH = (echoesH - titleH - 4 * echoGap) / 5;
    echoSlots.forEach((entry, i) => {
      const boxY = echoesY + titleH + i * (echoBoxH + echoGap);
      const n = entry && typeof entry === 'object' ? entry.name : null;
      drawBannerPanel(q2x, boxY, qw2, echoBoxH, null);
      const qx = q2x + PAD, qy = boxY + PAD, qh = echoBoxH - 2 * PAD, cw2 = qw2 - 2 * PAD;
      if (!n) {
        ctx.fillStyle = '#4b5563'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Empty', qx, qy + qh / 2 + 5);
        return;
      }
      const iconSize = Math.min(192, Math.floor(qh)); // PerfectSuite primary, capped to the box's own height
      const iy = qy + (qh - iconSize) / 2;
      // Info block is two rows: row 1 = sonata icon + echo name, row 2 = mainstat + substats.
      // Substats are laid out as a 2-column grid (was a single narrow column) so each one gets
      // more width and can render at a bigger font instead of being cramped into one column.
      const subs = (entry.substats || []).slice(0, 5);
      const subRows = Math.ceil(subs.length / 2);
      const subRowH = 26;
      const blockH = 16 + 8 + 24 + 8 + subRows * subRowH; // name row / gap / mainstat row / gap / substat grid rows
      const blockY = iy + (iconSize - blockH) / 2;
      if (echoImgs[i]) { ctx.save(); rr(qx, iy, iconSize, iconSize, 30); ctx.clip(); ctx.drawImage(echoImgs[i], qx, iy, iconSize, iconSize); ctx.restore(); }
      const infoX = qx + iconSize + 12;
      const infoW = cw2 - iconSize - 12;
      // Row 1: sonata (set) icon + echo name
      const setName = echoSetNames[i];
      const setIcon = setName ? setIconCache[setName] : null;
      let nx = infoX;
      if (setIcon) { ctx.drawImage(setIcon, nx, blockY, 16, 16); nx += 20; }
      ctx.fillStyle = '#e5e7eb'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left';
      const nameMaxLen = Math.max(6, Math.floor((infoW - (setIcon ? 20 : 0)) / 8.5));
      ctx.fillText(n.length > nameMaxLen ? n.slice(0, nameMaxLen - 1) + '.' : n, nx, blockY + 14);
      // Row 2a: main stat — underlined instead of gold-colored, so it reads as a highlighted
      // label rather than competing with the substat roll-tier colors below.
      let mainStatText = '';
      if (entry.mainStat) {
        const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
        const mv = ECHO_MAIN_STAT_VALUES[cost]?.[entry.mainStat];
        mainStatText = `${entry.mainStat}${mv ? ' ' + mv : ''}`;
      }
      const mainStatY = blockY + 16 + 8 + 18;
      ctx.fillStyle = NEUTRAL; ctx.font = 'bold 24px sans-serif';
      ctx.fillText(mainStatText, infoX, mainStatY);
      if (mainStatText) {
        const mw = ctx.measureText(mainStatText).width;
        ctx.strokeStyle = NEUTRAL; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(infoX, mainStatY + 4); ctx.lineTo(infoX + mw, mainStatY + 4); ctx.stroke();
      }
      // Row 2b: substats — 2-column grid, colored by roll tier (Low=green/Medium=blue/High=purple/
      // Max=gold) using each substat's own recorded roll grade (falls back to the averaged value,
      // shown as Max/gold, for echoes saved before per-roll tracking existed).
      const subColW = infoW / 2;
      subs.forEach((sub, si) => {
        const col = si % 2, row = Math.floor(si / 2);
        const sx = infoX + col * subColW;
        const sy = mainStatY + 24 + row * subRowH;
        const icon = substatIconCache[sub];
        let tx = sx;
        if (icon) { ctx.drawImage(icon, tx, sy - 14, 18, 18); tx += 22; }
        const grade = entry.substatRolls?.[sub];
        const sv = getSubstatGradeValue(sub, grade);
        const tier = getSubstatTier(sub, grade);
        const isFlat = sub === 'ATK' || sub === 'HP' || sub === 'DEF';
        ctx.fillStyle = SUBSTAT_TIER_COLORS[tier]; ctx.font = '600 16px sans-serif';
        const label = `${sub}${sv ? ' +' + sv + (isFlat ? '' : '%') : ''}`;
        const maxChars = Math.max(8, Math.floor((subColW - 22) / 9));
        ctx.fillText(label.length > maxChars ? label.slice(0, maxChars - 1) + '.' : label, tx, sy);
      });
    });
  }

  // Footer — small app-icon brand mark (16px, PerfectSuite primary) beside the site text
  ctx.fillStyle = '#4b5563'; ctx.font = '14px monospace';
  ctx.fillText('Generated ' + new Date().toLocaleDateString(), bx, by + bh + 6);
  ctx.textAlign = 'right'; ctx.fillText('whisperingwishes.app', bx + bw, by + bh + 6); ctx.textAlign = 'left';
  if (appIco) { ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(appIco, bx + bw / 2 - 8, by + bh - 12, 16, 16); ctx.restore(); }

  // Every export gets a unique filename (timestamp suffix) — see idCardRenderer.js for why: a
  // fixed path can collide with a stale/locked file from an earlier export on native Android and
  // fail Filesystem.writeFile with a scoped-storage permission error.
  const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-build-' + Date.now() + '.png';
  try {
    canvas.toBlob(async blob => {
      if (!blob) { toast?.addToast?.('Build card export failed — image may be blocked by CORS', 'error'); return; }
      if (window.Capacitor?.isNativePlatform?.()) {
        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const { Filesystem, Directory } = await import('@capacitor/filesystem');
          await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Documents });
          toast?.addToast?.('Build card saved to Documents!', 'success');
        } catch (e) {
          console.error('Build card export failed (native Filesystem write):', e);
          toast?.addToast?.(`Failed to save build card${e?.message ? ': ' + e.message : ''}`, 'error');
        }
        return;
      }
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = filename;
      a.click(); setTimeout(() => URL.revokeObjectURL(url), 100); toast?.addToast?.('Build card saved!', 'success');
    }, 'image/png');
  } catch (e) {
    console.error('Build card export failed (possible CORS tainted canvas):', e);
    throw e;
  }
}
