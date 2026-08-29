// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — characterCardRenderer.js
// Single-character "build card" canvas renderer for the Teams tab — parallel to
// features/profile/idCardRenderer.js, reusing the exact same drawing primitives
// (rr/drawPanel/drawShell/drawStat/gold accent bar) and native-vs-web save logic
// for visual/behavioral consistency with the existing Resonator ID card export.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_THEMES } from '../../data/banners.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { CHAIN_NODE_ICONS } from '../../data/characters.js';
import { ECHO_DATA } from '../../data/echoes.js';
import { getElementColor, getElementIcon, getStatIcon, getSetIcon } from '../../shared/utils/elementVisuals.js';
import {
  ECHO_MAIN_STAT_VALUES, ECHO_SUB_STAT_VALUES,
  createStats, parsePassive, applyFullEchoSet, applyEchoStats,
  calcEnergyCycles,
} from './calcEngine.js';

// Real Android launcher icon (same source as idCardRenderer.js's APP_ICON) used as a small
// brand watermark in this card's header — not the PWA icon or the currency icon.
const APP_ICON = './app-title-icon/app_home_icon.png';

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
 * @param {Object} [params.toast] - toast provider, for export-result notifications
 */
export async function renderCharacterCard({ member, eq, teamIdx, collectionImages, getImageFraming, toast }) {
  const canvas = document.createElement('canvas');
  const W = 1600, H = 900;
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
    ctx.fillStyle = 'rgba(12,16,24,0.8)'; rr(x, y, w, h, 24); ctx.fill();
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
    ctx.fillStyle = 'rgba(10,14,22,0.55)'; rr(x, y, w, h, 16); ctx.fill();
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
    ctx.fillStyle = 'rgba(10,14,22,0.8)'; rr(x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1; rr(x, y, w, h, 12); ctx.stroke();
    const ss = ctx.createLinearGradient(x, 0, x + w, 0); ss.addColorStop(0, 'transparent'); ss.addColorStop(0.5, 'rgba(255,255,255,0.40)'); ss.addColorStop(1, 'transparent');
    ctx.fillStyle = ss; ctx.fillRect(x + 6, y, w - 12, 1.5);
    const f = Math.round((fs || 24) * 1.1);
    ctx.fillStyle = col; ctx.font = `bold ${f}px monospace`; ctx.textAlign = 'center'; ctx.fillText(val, x + w / 2, y + h * 0.48);
    ctx.fillStyle = '#9ca3af'; ctx.font = `${Math.max(11, Math.round(f * 0.5))}px sans-serif`; ctx.fillText(lab, x + w / 2, y + h * 0.78); ctx.textAlign = 'left';
  };

  // ═══ RENDER ═══
  ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, W, H);
  if (bgImg) {
    const imgAR = bgImg.naturalWidth / bgImg.naturalHeight, cardAR = W / H;
    let dw, dh;
    if (imgAR > cardAR) { dh = H; dw = H * imgAR; } else { dw = W; dh = W / imgAR; }
    ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    // Lighter full-bleed dim (see idCardRenderer.js for the full reasoning): the shell and every
    // panel drawn on top already darken this further, so a heavy dim here on top of THAT made the
    // banner read as swallowed under the shell/panels — visible only as a thin strip in the
    // undrawn margin outside the shell, i.e. "in the card" rather than "behind" it.
    ctx.fillStyle = 'rgba(8,8,16,0.45)'; ctx.fillRect(0, 0, W, H);
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
    const fade = ctx.createLinearGradient(0, by + bh - 90, 0, by + bh);
    fade.addColorStop(0, 'rgba(8,12,18,0)'); fade.addColorStop(1, 'rgba(8,12,18,0.9)');
    ctx.fillStyle = fade; ctx.fillRect(bx + 2, by + bh - 90, portraitW - 4, 88);
  }
  // Name + element/role overlay on portrait
  const elColor = getElementColor(element) || '#e2e8f0';
  ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 34px sans-serif'; ctx.fillText(name, bx + 18, by + bh - 48);
  if (elIcon) ctx.drawImage(elIcon, bx + 18, by + bh - 34, 20, 20);
  ctx.fillStyle = elColor; ctx.font = '600 18px sans-serif'; ctx.fillText(`${element || ''} · ${d.role || ''}`, bx + (elIcon ? 44 : 18), by + bh - 17);

  // ── Right column: a literal 2×2 quadrant grid (per user feedback) ──
  // Q1 top-left = character stats (vertical), Q2 top-right = Resonance Chain sequence (horizontal),
  // Q3 bottom-left = weapon (vertical), Q4 bottom-right = echoes (vertical). Thin divider lines
  // separate the quadrants — no bordered panel boxes, consistent with the rest of this restyle.
  const gap = 12; // PerfectSuite secondary
  const rx = bx + portraitW + gap, rw = bw - portraitW - gap;
  const ry = by, rh = bh;

  const NEUTRAL = '#e2e8f0';
  const GOLD = '#edaf18';
  const DIM = 'rgba(255,255,255,0.12)';

  const qGap = 12; // PerfectSuite secondary
  const qw = Math.floor((rw - qGap) / 2);
  const qw2 = rw - qw - qGap;
  const topH = 192; // PerfectSuite secondary — fits the 7-row stat list (Q1) with room to breathe
  const bottomH = rh - topH - qGap;
  const q1x = rx, q2x = rx + qw + qGap;
  const q3y = ry + topH + qGap;
  const midX = rx + qw + qGap / 2;
  const midY = ry + topH + qGap / 2;

  // Divider lines between the four quadrants (thin, not boxes)
  ctx.strokeStyle = DIM; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(midX, ry); ctx.lineTo(midX, ry + rh); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rx, midY); ctx.lineTo(rx + rw, midY); ctx.stroke();

  // Small gold-tick quadrant header, matching the app's existing label convention but with no
  // background box behind it (see drawPanel's label for the box version used elsewhere).
  const drawQuadLabel = (x, y, label) => {
    const gb = ctx.createLinearGradient(0, y, 0, y + 14);
    gb.addColorStop(0, 'rgba(237,175,24,0.85)'); gb.addColorStop(1, 'rgba(237,175,24,0.35)');
    ctx.fillStyle = gb; rr(x, y, 3, 14, 1.5); ctx.fill();
    ctx.fillStyle = '#9ca3af'; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(label.toUpperCase(), x + 10, y + 11);
    return 24; // header height offset
  };

  // ── Q1 (top-left): character stat rows — icon-led, vertical list ──
  {
    const qx = q1x, qy = ry, qh = topH;
    const hOff = drawQuadLabel(qx, qy, 'Stats');
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
      if (i > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(qx, sy); ctx.lineTo(qx + qw, sy); ctx.stroke(); }
      const midYr = sy + rowH / 2;
      let ix = qx;
      if (s.icon) { ctx.drawImage(s.icon, ix, midYr - 8, 16, 16); ix += 24; }
      ctx.fillStyle = '#9ca3af'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(s.l, ix, midYr + 4);
      ctx.fillStyle = s.c; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(s.v, qx + qw, midYr + 5);
      ctx.textAlign = 'left';
    });
  }

  // ── Q2 (top-right): Resonance Chain sequence — horizontal S1-S6, white=unlocked / grey=locked ──
  {
    const qx = q2x, qy = ry, qh = topH;
    const hOff = drawQuadLabel(qx, qy, 'Sequence');
    const seq = eq?.sequence || 0;
    const hasChainIcons = chainNodeImgs.some(Boolean);
    const n = 6;
    if (hasChainIcons) {
      const iconSz = 48; // PerfectSuite primary
      const iGap = 8; // PerfectSuite primary
      const totalW = n * iconSz + (n - 1) * iGap;
      let ix = qx + Math.max(0, (qw2 - totalW) / 2);
      const iy = qy + hOff + (qh - hOff - iconSz - 16) / 2;
      chainNodeImgs.forEach((img, i) => {
        const rank = i + 1;
        const unlocked = rank <= seq;
        if (img) {
          ctx.save();
          if (!unlocked) ctx.globalAlpha = 0.32;
          rr(ix, iy, iconSz, iconSz, 8); ctx.clip(); ctx.drawImage(img, ix, iy, iconSz, iconSz);
          ctx.restore();
          if (!unlocked) { ctx.fillStyle = 'rgba(8,8,16,0.45)'; rr(ix, iy, iconSz, iconSz, 8); ctx.fill(); }
        } else {
          ctx.fillStyle = unlocked ? 'rgba(237,175,24,0.18)' : 'rgba(255,255,255,0.06)';
          rr(ix, iy, iconSz, iconSz, 8); ctx.fill();
        }
        ctx.fillStyle = unlocked ? NEUTRAL : '#6b7280';
        ctx.font = '600 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('S' + rank, ix + iconSz / 2, iy + iconSz + 14);
        ctx.textAlign = 'left';
        ix += iconSz + iGap;
      });
    } else {
      // Fallback: plain numbered pips when this character has no audited chain-node assets yet.
      const pipSz = 30; // PerfectSuite tertiary
      const iGap = 8;
      const totalW = n * pipSz + (n - 1) * iGap;
      let ix = qx + Math.max(0, (qw2 - totalW) / 2);
      const iy = qy + hOff + (qh - hOff - pipSz) / 2;
      for (let i = 0; i < n; i++) {
        const rank = i + 1;
        const unlocked = rank <= seq;
        ctx.fillStyle = unlocked ? 'rgba(237,175,24,0.22)' : 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.arc(ix + pipSz / 2, iy + pipSz / 2, pipSz / 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = unlocked ? 'rgba(237,175,24,0.6)' : 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ix + pipSz / 2, iy + pipSz / 2, pipSz / 2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = unlocked ? GOLD : '#6b7280'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(String(rank), ix + pipSz / 2, iy + pipSz / 2 + 5);
        ctx.textAlign = 'left';
        ix += pipSz + iGap;
      }
    }
  }

  // ── Q3 (bottom-left): weapon — vertical stack, icon on level/stat/refinement ──
  {
    const qx = q1x, qy = q3y, qh = bottomH;
    const hOff = drawQuadLabel(qx, qy, 'Weapon');
    const equippedWeap = member.weapon;
    const iconSz = 48; // PerfectSuite primary
    if (weaponImg) { ctx.save(); rr(qx, qy + hOff, iconSz, iconSz, 8); ctx.clip(); ctx.drawImage(weaponImg, qx, qy + hOff, iconSz, iconSz); ctx.restore(); }
    ctx.fillStyle = equippedWeap ? GOLD : '#6b7280';
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(eq?.weapon || 'No Weapon Equipped', qx, qy + hOff + iconSz + 20);
    let vy = qy + hOff + iconSz + 44;
    const vRowH = 24; // PerfectSuite secondary
    // Level row — small "level meter" glyph (3 ascending bars) drawn in-canvas since no dedicated
    // level icon asset exists elsewhere in the app to reuse (checked DamageCalculator/EchoSelector).
    ctx.fillStyle = '#9ca3af';
    [0, 1, 2].forEach(bi => {
      const bw3 = 3, bh3 = 4 + bi * 4;
      ctx.fillRect(qx + bi * (bw3 + 2), vy - bh3, bw3, bh3);
    });
    ctx.font = '12px sans-serif'; ctx.fillText('Lv. 90/90', qx + 18, vy);
    vy += vRowH;
    // Stat row — reuse the weapon's own stat icon (getStatIcon convention, same as Q1)
    if (equippedWeap) {
      const statVal = `${equippedWeap.subStatValue ? equippedWeap.subStatValue : '★'.repeat(equippedWeap.rarity || 0)}`.trim();
      const critIcon = baseStatIcons['ATK'];
      let tx = qx;
      if (critIcon) { ctx.drawImage(critIcon, tx, vy - 12, 14, 14); tx += 18; }
      ctx.fillStyle = NEUTRAL; ctx.font = '12px sans-serif'; ctx.fillText(statVal, tx, vy);
      vy += vRowH;
      if (equippedWeap.stat) {
        const sIcon = baseStatIcons[equippedWeap.stat] || null;
        let tx2 = qx;
        if (sIcon) { ctx.drawImage(sIcon, tx2, vy - 12, 14, 14); tx2 += 18; }
        ctx.fillStyle = GOLD; ctx.font = '12px sans-serif';
        ctx.fillText(`${equippedWeap.stat} ${equippedWeap.subStatValue || ''}`.trim(), tx2, vy);
        vy += vRowH;
      }
    }
    // Refinement — pill badge (existing app convention, see DamageCalculator's own R1-R5 pills)
    const pillW = 30, pillH = 16;
    ctx.fillStyle = 'rgba(237,175,24,0.16)'; rr(qx, vy - 12, pillW, pillH, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(237,175,24,0.5)'; ctx.lineWidth = 1; rr(qx, vy - 12, pillW, pillH, 8); ctx.stroke();
    ctx.fillStyle = GOLD; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`R${eq?.refinement || 1}`, qx + pillW / 2, vy - 1); ctx.textAlign = 'left';
  }

  // ── Q4 (bottom-right): echoes — vertical, 5 stacked rows: icon, name, sonata icon, main+sub stats ──
  {
    const qx = q2x, qy = q3y, qh = bottomH;
    const hOff = drawQuadLabel(qx, qy, 'Echoes');
    const echoRowH = (qh - hOff) / 5;
    echoSlots.forEach((entry, i) => {
      const ey = qy + hOff + i * echoRowH;
      if (i > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(qx, ey); ctx.lineTo(qx + qw2, ey); ctx.stroke(); }
      const n = entry && typeof entry === 'object' ? entry.name : null;
      if (!n) {
        ctx.fillStyle = '#4b5563'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Empty', qx, ey + echoRowH / 2 + 4);
        return;
      }
      const iconSize = 32; // PerfectSuite primary
      // Vertically center the whole info block (icon + name + main stat + 2 rows of substats)
      // within the generous ~120px row height instead of anchoring everything to the top.
      const blockH = 14 + 4 + 12 + 6 + 12 + 4 + 12; // name / gap / mainstat / gap / sub-row1 / gap / sub-row2
      const blockY = ey + Math.max(6, (echoRowH - Math.max(blockH, iconSize)) / 2);
      const iy = ey + (echoRowH - iconSize) / 2;
      if (echoImgs[i]) { ctx.save(); rr(qx, iy, iconSize, iconSize, 6); ctx.clip(); ctx.drawImage(echoImgs[i], qx, iy, iconSize, iconSize); ctx.restore(); }
      const infoX = qx + iconSize + 8;
      const infoW = qw2 - iconSize - 8;
      // Name + sonata (set) icon
      const setName = echoSetNames[i];
      const setIcon = setName ? setIconCache[setName] : null;
      let nx = infoX;
      if (setIcon) { ctx.drawImage(setIcon, nx, blockY, 12, 12); nx += 15; }
      ctx.fillStyle = '#e5e7eb'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      const nameMaxLen = Math.max(6, Math.floor((infoW - (setIcon ? 15 : 0)) / 6.5));
      ctx.fillText(n.length > nameMaxLen ? n.slice(0, nameMaxLen - 1) + '.' : n, nx, blockY + 10);
      // Main stat
      let mainStatText = '';
      if (entry.mainStat) {
        const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
        const mv = ECHO_MAIN_STAT_VALUES[cost]?.[entry.mainStat];
        mainStatText = `${entry.mainStat}${mv ? ' ' + mv : ''}`;
      }
      const mainStatY = blockY + 14 + 4 + 10;
      ctx.fillStyle = GOLD; ctx.font = '12px sans-serif';
      ctx.fillText(mainStatText, infoX, mainStatY);
      // Substats — small icon + abbreviated value, wrapped across 2 rows (3 then 2) within the row
      const subs = (entry.substats || []).slice(0, 5);
      const subColW = Math.max(60, infoW / 3);
      const subRowH = 16;
      subs.forEach((sub, si) => {
        const col = si % 3, line = Math.floor(si / 3);
        const sx = infoX + col * subColW;
        const sy = mainStatY + 14 + line * subRowH;
        const icon = substatIconCache[sub];
        let tx = sx;
        if (icon) { ctx.drawImage(icon, tx, sy - 9, 12, 12); tx += 14; }
        const sv = ECHO_SUB_STAT_VALUES[sub];
        ctx.fillStyle = '#9ca3af'; ctx.font = '10px sans-serif';
        const label = `${sub}${sv ? ' +' + sv : ''}`;
        const maxChars = 12;
        ctx.fillText(label.length > maxChars ? label.slice(0, maxChars - 1) + '.' : label, tx, sy);
      });
    });
  }

  // Footer — small app-icon brand mark (16px, PerfectSuite primary) beside the site text
  ctx.fillStyle = '#4b5563'; ctx.font = '13px monospace';
  ctx.fillText('Generated ' + new Date().toLocaleDateString(), bx, by + bh + 4);
  ctx.textAlign = 'right'; ctx.fillText('whisperingwishes.app', bx + bw, by + bh + 4); ctx.textAlign = 'left';
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
