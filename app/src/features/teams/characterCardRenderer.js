// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — characterCardRenderer.js
// Single-character "build card" canvas renderer for the Teams tab — parallel to
// features/profile/idCardRenderer.js, reusing the exact same drawing primitives
// (rr/drawPanel/drawShell/drawStat/gold accent bar) and native-vs-web save logic
// for visual/behavioral consistency with the existing Resonator ID card export.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_THEMES } from '../../data/banners.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { getElementColor, getElementIcon, getStatIcon } from '../../shared/utils/elementVisuals.js';
import {
  ECHO_MAIN_STAT_VALUES, ECHO_SUB_STAT_VALUES,
  createStats, parsePassive, applyFullEchoSet, applyEchoStats,
  calcEnergyCycles,
} from './calcEngine.js';

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
  const [bgImg, portraitImg, weaponImg, elIcon] = await Promise.all([
    loadImage(bannerArt),
    loadImage(collectionImages[name]),
    loadImage(eq?.weapon ? collectionImages[eq.weapon] : null),
    loadImage(getElementIcon(element)),
  ]);
  const echoSlots = [0, 1, 2, 3, 4].map(i => eq?.echoes?.[i] || null);
  const echoImgs = await Promise.all(echoSlots.map(entry => {
    const n = entry && typeof entry === 'object' ? entry.name : (typeof entry === 'string' ? entry : null);
    return n ? loadImage(collectionImages[n]) : Promise.resolve(null);
  }));
  const substatIconCache = {};
  const allSubstatTypes = new Set();
  echoSlots.forEach(entry => { if (entry && typeof entry === 'object') (entry.substats || []).forEach(s => allSubstatTypes.add(s)); });
  await Promise.all([...allSubstatTypes].map(async s => { substatIconCache[s] = await loadImage(getStatIcon(s)); }));

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
    ctx.fillStyle = 'rgba(10,14,22,0.55)'; rr(x, y, w, h, 15); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5; rr(x, y, w, h, 15); ctx.stroke();
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
    ctx.fillStyle = 'rgba(8,8,16,0.72)'; ctx.fillRect(0, 0, W, H);
  }

  const M = 18, ox = M, oy = M, ow = W - M * 2, oh = H - M * 2;
  drawShell(ox, oy, ow, oh);
  const P = 15, bx = ox + P, bw = ow - P * 2, by = oy + P, bh = oh - P * 2;

  // ── Left: character portrait (large, object-contain framed) ──
  const portraitW = Math.floor(bw * 0.36);
  ctx.fillStyle = 'rgba(8,12,18,0.95)'; rr(bx, by, portraitW, bh, 15); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; rr(bx, by, portraitW, bh, 15); ctx.stroke();
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

  // ── Right column ──
  const gap = 12;
  const rx = bx + portraitW + gap, rw = bw - portraitW - gap;
  let ry = by;

  // Weapon + progression panel
  const wpH = 96;
  const wpOff = drawPanel(rx, ry, rw, wpH, 'Weapon & Progression');
  const equippedWeap = member.weapon;
  if (weaponImg) { ctx.save(); rr(rx + 15, ry + wpOff, 56, 56, 10); ctx.clip(); ctx.drawImage(weaponImg, rx + 15, ry + wpOff, 56, 56); ctx.restore(); }
  const wtx = rx + 15 + (weaponImg ? 68 : 0);
  ctx.fillStyle = equippedWeap ? (equippedWeap.rarity === 5 ? '#facc15' : '#c084fc') : '#6b7280';
  ctx.font = 'bold 20px sans-serif'; ctx.fillText(eq?.weapon || 'No Weapon Equipped', wtx, ry + wpOff + 18);
  ctx.fillStyle = '#9ca3af'; ctx.font = '14px sans-serif';
  ctx.fillText(equippedWeap ? `${'★'.repeat(equippedWeap.rarity)} · ${equippedWeap.stat} ${equippedWeap.subStatValue}` : '', wtx, ry + wpOff + 38);
  ctx.fillStyle = '#edaf18'; ctx.font = '14px monospace';
  ctx.fillText(`S${eq?.sequence || 0}  R${eq?.refinement || 1}`, wtx, ry + wpOff + 56);
  ry += wpH + gap;

  // Stat block
  const statH = 60;
  drawPanel(rx, ry, rw, statH * 2 + 8 + 39, 'Build Stats');
  const statCellY = ry + 39;
  const elDmgLabel = element ? `${element} DMG` : 'DMG';
  const statList = [
    { v: built.finalHp.toLocaleString('en-US'), l: 'HP', c: '#4ade80' },
    { v: built.finalAtk.toLocaleString('en-US'), l: 'ATK', c: '#f87171' },
    { v: built.finalDef.toLocaleString('en-US'), l: 'DEF', c: '#60a5fa' },
    { v: built.cr.toFixed(1) + '%', l: 'Crit Rate', c: '#22d3ee' },
    { v: built.cd.toFixed(1) + '%', l: 'Crit DMG', c: '#22d3ee' },
    { v: built.er + '%', l: 'Energy Regen', c: '#a78bfa' },
    { v: '+' + built.elemDmg.toFixed(0) + '%', l: elDmgLabel, c: elColor },
  ];
  const scCols = 4, scGap = 8, scW = (rw - 30 - (scCols - 1) * scGap) / scCols;
  statList.forEach((s, i) => {
    const col = i % scCols, row = Math.floor(i / scCols);
    drawStat(rx + 15 + col * (scW + scGap), statCellY + row * (statH + scGap), scW, statH, s.v, s.l, s.c, 20);
  });
  ry += statH * 2 + 8 + 39 + gap;

  // ── Echo panel (fills remaining height) ──
  const echoPanelH = by + bh - ry;
  const echoOff = drawPanel(rx, ry, rw, echoPanelH, 'Equipped Echoes');
  const echoGap = 8, echoCols = 5;
  const echoCellW = (rw - 30 - (echoCols - 1) * echoGap) / echoCols;
  const echoCellH = echoPanelH - echoOff - 12;
  echoSlots.forEach((entry, i) => {
    const ex = rx + 15 + i * (echoCellW + echoGap);
    const ey = ry + echoOff;
    ctx.fillStyle = 'rgba(10,14,22,0.8)'; rr(ex, ey, echoCellW, echoCellH, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; rr(ex, ey, echoCellW, echoCellH, 10); ctx.stroke();
    const n = entry && typeof entry === 'object' ? entry.name : null;
    if (!n) {
      ctx.fillStyle = '#4b5563'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Empty', ex + echoCellW / 2, ey + echoCellH / 2);
      ctx.textAlign = 'left';
      return;
    }
    const iconSize = Math.min(44, echoCellW * 0.55);
    if (echoImgs[i]) { ctx.save(); rr(ex + (echoCellW - iconSize) / 2, ey + 8, iconSize, iconSize, 8); ctx.clip(); ctx.drawImage(echoImgs[i], ex + (echoCellW - iconSize) / 2, ey + 8, iconSize, iconSize); ctx.restore(); }
    ctx.fillStyle = '#e5e7eb'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    const ml = Math.floor(echoCellW / 5.2);
    ctx.fillText(n.length > ml ? n.slice(0, ml - 1) + '..' : n, ex + echoCellW / 2, ey + 8 + iconSize + 13);
    ctx.textAlign = 'left';
    // Main stat
    const mainStatY = ey + 8 + iconSize + 28;
    if (entry.mainStat) {
      const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
      const mv = ECHO_MAIN_STAT_VALUES[cost]?.[entry.mainStat];
      ctx.fillStyle = '#edaf18'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${entry.mainStat}${mv ? ' ' + mv : ''}`, ex + echoCellW / 2, mainStatY);
      ctx.textAlign = 'left';
    }
    // Substats (up to 5), small icon + label rows
    const subs = entry.substats || [];
    const rowH = Math.max(13, (echoCellH - (mainStatY - ey) - 6) / 5);
    subs.slice(0, 5).forEach((sub, si) => {
      const sy = mainStatY + 10 + si * rowH;
      const icon = substatIconCache[sub];
      let tx = ex + 6;
      if (icon) { ctx.drawImage(icon, tx, sy - 9, 12, 12); tx += 15; }
      const sv = ECHO_SUB_STAT_VALUES[sub];
      ctx.fillStyle = '#cbd5e1'; ctx.font = '10px sans-serif';
      const label = `${sub}${sv ? ' +' + sv : ''}`;
      ctx.fillText(label.length > 16 ? label.slice(0, 15) + '.' : label, tx, sy);
    });
  });

  // Footer
  ctx.fillStyle = '#4b5563'; ctx.font = '13px monospace';
  ctx.fillText('Generated ' + new Date().toLocaleDateString(), bx, by + bh + 4);
  ctx.textAlign = 'right'; ctx.fillText('whisperingwishes.app', bx + bw, by + bh + 4); ctx.textAlign = 'left';

  const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-build.png';
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
