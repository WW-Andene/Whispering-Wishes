// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/index.js
// The name -> TriggerBlock[] lookup calcTeamStats.js calls the engine per-member with.
// Statically imports every converted character's `.blocks.js` file and maps it by the
// exact name CHARACTER_DATA/CHARACTER_ROTATIONS use as their own key, so callers can do
// `BLOCKS_BY_CHARACTER[name]` directly.
//
// A name absent from this map (not yet converted — currently just Jingran, unreleased with no
// CHARACTER_ROTATIONS to derive engine steps from either) is a real, expected case every caller must
// handle, not an error: `BLOCKS_BY_CHARACTER[name]` is simply `undefined` for them, same as any other
// plain-object lookup miss.
//
// Every character's block array is schema-validated HERE, at module load — see
// engine/schema/validate.js and engine/characterBlocks/CONTRIBUTING.md. This means a future edit to
// any one character's file (remaking their kit, fixing a value, adding a block) that breaks the
// canonical shape throws immediately on import, in every test and in the running app, rather than
// silently shipping a malformed block that some resolver path quietly no-ops on. Layer 4 of the
// engine rewrite deliberately left this unwired until all 57 characters passed validation — now
// that they do, the schema is a real, enforced contract for every character touched from here on.
// ═══════════════════════════════════════════════════════════════════════════════

import { expectValidBlockFile } from '../schema/validate.js';

import { AALTO_BLOCKS } from './aalto.blocks.js';
import { AEMEATH_BLOCKS } from './aemeath.blocks.js';
import { AUGUSTA_BLOCKS } from './augusta.blocks.js';
import { BAIZHI_BLOCKS } from './baizhi.blocks.js';
import { BRANT_BLOCKS } from './brant.blocks.js';
import { BULING_BLOCKS } from './buling.blocks.js';
import { CALCHARO_BLOCKS } from './calcharo.blocks.js';
import { CAMELLYA_BLOCKS } from './camellya.blocks.js';
import { CANTARELLA_BLOCKS } from './cantarella.blocks.js';
import { CARLOTTA_BLOCKS } from './carlotta.blocks.js';
import { CARTETHYIA_BLOCKS } from './cartethyia.blocks.js';
import { CHANGLI_BLOCKS } from './changli.blocks.js';
import { CHISA_BLOCKS } from './chisa.blocks.js';
import { CHIXIA_BLOCKS } from './chixia.blocks.js';
import { CIACCONA_BLOCKS } from './ciaccona.blocks.js';
import { DANJIN_BLOCKS } from './danjin.blocks.js';
import { DENIA_BLOCKS } from './denia.blocks.js';
import { ENCORE_BLOCKS } from './encore.blocks.js';
import { GALBRENA_BLOCKS } from './galbrena.blocks.js';
import { HIYUKI_BLOCKS } from './hiyuki.blocks.js';
import { IUNO_BLOCKS } from './iuno.blocks.js';
import { JIANXIN_BLOCKS } from './jianxin.blocks.js';
import { JINGRAN_BLOCKS } from './jingran.blocks.js';
import { JINHSI_BLOCKS } from './jinhsi.blocks.js';
import { JIYAN_BLOCKS } from './jiyan.blocks.js';
import { LINGYANG_BLOCKS } from './lingyang.blocks.js';
import { LUCILLA_BLOCKS } from './lucilla.blocks.js';
import { LUCY_BLOCKS } from './lucy.blocks.js';
import { LUMI_BLOCKS } from './lumi.blocks.js';
import { LUPA_BLOCKS } from './lupa.blocks.js';
import { LUUK_HERSSEN_BLOCKS } from './luukherssen.blocks.js';
import { LYNAE_BLOCKS } from './lynae.blocks.js';
import { MORNYE_BLOCKS } from './mornye.blocks.js';
import { MORTEFI_BLOCKS } from './mortefi.blocks.js';
import { PHOEBE_BLOCKS } from './phoebe.blocks.js';
import { PHROLOVA_BLOCKS } from './phrolova.blocks.js';
import { QINGXIAO_BLOCKS } from './qingxiao.blocks.js';
import { QIUYUAN_BLOCKS } from './qiuyuan.blocks.js';
import { REBECCA_BLOCKS } from './rebecca.blocks.js';
import { ROCCIA_BLOCKS } from './roccia.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from './roverElectro.blocks.js';
import { ROVER_AERO_BLOCKS } from './roveraero.blocks.js';
import { ROVER_HAVOC_BLOCKS } from './roverhavoc.blocks.js';
import { ROVER_SPECTRO_BLOCKS } from './roverspectro.blocks.js';
import { SANHUA_BLOCKS } from './sanhua.blocks.js';
import { SHOREKEEPER_BLOCKS } from './shorekeeper.blocks.js';
import { SIGRIKA_BLOCKS } from './sigrika.blocks.js';
import { SUISUI_BLOCKS } from './suisui.blocks.js';
import { TAOQI_BLOCKS } from './taoqi.blocks.js';
import { VERINA_BLOCKS } from './verina.blocks.js';
import { XIANGLI_YAO_BLOCKS } from './xianglyao.blocks.js';
import { YANGYANG_BLOCKS } from './yangyang.blocks.js';
import { YANGYANG_XUANLING_BLOCKS } from './yangyangxuanling.blocks.js';
import { YINLIN_BLOCKS } from './yinlin.blocks.js';
import { YOUHU_BLOCKS } from './youhu.blocks.js';
import { YUANWU_BLOCKS } from './yuanwu.blocks.js';
import { ZANI_BLOCKS } from './zani.blocks.js';
import { ZHEZHI_BLOCKS } from './zhezhi.blocks.js';

/** @type {Object<string, import('../schema/block.schema.js').TriggerBlock[]>} */
export const BLOCKS_BY_CHARACTER = {
  'Aalto': AALTO_BLOCKS,
  'Aemeath': AEMEATH_BLOCKS,
  'Augusta': AUGUSTA_BLOCKS,
  'Baizhi': BAIZHI_BLOCKS,
  'Brant': BRANT_BLOCKS,
  'Buling': BULING_BLOCKS,
  'Calcharo': CALCHARO_BLOCKS,
  'Camellya': CAMELLYA_BLOCKS,
  'Cantarella': CANTARELLA_BLOCKS,
  'Carlotta': CARLOTTA_BLOCKS,
  'Cartethyia': CARTETHYIA_BLOCKS,
  'Changli': CHANGLI_BLOCKS,
  'Chisa': CHISA_BLOCKS,
  'Chixia': CHIXIA_BLOCKS,
  'Ciaccona': CIACCONA_BLOCKS,
  'Danjin': DANJIN_BLOCKS,
  'Denia': DENIA_BLOCKS,
  'Encore': ENCORE_BLOCKS,
  'Galbrena': GALBRENA_BLOCKS,
  'Hiyuki': HIYUKI_BLOCKS,
  'Iuno': IUNO_BLOCKS,
  'Jianxin': JIANXIN_BLOCKS,
  // 'Jingran' deliberately NOT keyed here — see jingran.blocks.js's own header comment. He has a
  // real blocks file (JINGRAN_BLOCKS, imported above) but no CHARACTER_ROTATIONS entry yet
  // (unreleased, no sourced rotation), and calcTeamStats.js's allMembersConverted gate requires
  // both. Adding him to this map with no matching CHARACTER_ROTATIONS entry would make
  // BLOCKS_BY_CHARACTER['Jingran'] truthy while chooseOnFieldOrder/buildTeamSteps (which read
  // CHARACTER_ROTATIONS[m.name] unconditionally once a member passes the blocks-only half of that
  // check) crash on the missing rotation — worse than the current, correct "stays on the legacy
  // per-member RAW path" behavior. Re-key him here once his real CHARACTER_ROTATIONS is sourced.
  'Jinhsi': JINHSI_BLOCKS,
  'Jiyan': JIYAN_BLOCKS,
  'Lingyang': LINGYANG_BLOCKS,
  'Lucilla': LUCILLA_BLOCKS,
  'Lucy': LUCY_BLOCKS,
  'Lumi': LUMI_BLOCKS,
  'Lupa': LUPA_BLOCKS,
  'Luuk Herssen': LUUK_HERSSEN_BLOCKS,
  'Lynae': LYNAE_BLOCKS,
  'Mornye': MORNYE_BLOCKS,
  'Mortefi': MORTEFI_BLOCKS,
  'Phoebe': PHOEBE_BLOCKS,
  'Phrolova': PHROLOVA_BLOCKS,
  'Qingxiao': QINGXIAO_BLOCKS,
  'Qiuyuan': QIUYUAN_BLOCKS,
  'Rebecca': REBECCA_BLOCKS,
  'Roccia': ROCCIA_BLOCKS,
  'Rover: Electro': ROVER_ELECTRO_BLOCKS,
  'Rover: Aero': ROVER_AERO_BLOCKS,
  'Rover: Havoc': ROVER_HAVOC_BLOCKS,
  'Rover: Spectro': ROVER_SPECTRO_BLOCKS,
  'Sanhua': SANHUA_BLOCKS,
  'Shorekeeper': SHOREKEEPER_BLOCKS,
  'Sigrika': SIGRIKA_BLOCKS,
  'Suisui': SUISUI_BLOCKS,
  'Taoqi': TAOQI_BLOCKS,
  'Verina': VERINA_BLOCKS,
  'Xiangli Yao': XIANGLI_YAO_BLOCKS,
  'Yangyang': YANGYANG_BLOCKS,
  'Yangyang: Xuanling': YANGYANG_XUANLING_BLOCKS,
  'Yinlin': YINLIN_BLOCKS,
  'Youhu': YOUHU_BLOCKS,
  'Yuanwu': YUANWU_BLOCKS,
  'Zani': ZANI_BLOCKS,
  'Zhezhi': ZHEZHI_BLOCKS,
};

// Enforced at load time — see this file's own header comment above for why.
for (const [name, blocks] of Object.entries(BLOCKS_BY_CHARACTER)) {
  expectValidBlockFile(blocks, name);
}

// Jingran validated here too, same hard-failure contract as every BLOCKS_BY_CHARACTER entry —
// just not keyed into that map (see the 'Jianxin'/'Jinhsi' gap comment above for why). Re-exported
// so a caller that genuinely wants his real-but-incomplete blocks (e.g. a future rotation-derived
// path once CHARACTER_ROTATIONS['Jingran'] exists) doesn't need a second import path.
export { JINGRAN_BLOCKS };
expectValidBlockFile(JINGRAN_BLOCKS, 'Jingran');
