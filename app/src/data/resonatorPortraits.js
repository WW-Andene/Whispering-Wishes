// Resonator portrait catalog for the header settings-button customization
// feature's "Portrait" picker — direct user request. Source images live in
// app/public/resonator-portraits/ (from the user-supplied
// Icon_Character_Portrait.zip); id is a stable key stored in visualSettings,
// name is the UI label, file is the filename under that folder.
//
// Ordered by rarity (5★ band, then 4★ band) and, within each band, newest
// release first — same release order as data/characters.js, reversed, with
// each skin placed immediately before its base outfit.

export const RESONATOR_PORTRAITS = [
  // 5★, newest → oldest
  { id: 'jingran', name: 'Jingran', file: 'Jingran.png' },
  { id: 'qingxiao', name: 'Qingxiao', file: 'Qingxiao.png' },
  { id: 'suisui', name: 'Suisui', file: 'Suisui.png' },
  { id: 'hiyuki', name: 'Hiyuki', file: 'Hiyuki.webp' },
  { id: 'denia', name: 'Denia', file: 'Denia.png' },
  { id: 'yangyang-xuanling', name: 'Yangyang Xuanling', file: 'Yangyang Xuanling.png' },
  { id: 'lucy-cyberpunk-collab', name: 'Lucy (Cyberpunk Collab)', file: 'Lucy (Cyberpunk Collab).webp' },
  { id: 'lucilla', name: 'Lucilla', file: 'Lucilla.webp' },
  { id: 'rebecca-cyberpunk-collab', name: 'Rebecca (Cyberpunk Collab)', file: 'Rebecca (Cyberpunk Collab).webp' },
  { id: 'sigrika', name: 'Sigrika', file: 'Sigrika.webp' },
  { id: 'aemeath', name: 'Aemeath', file: 'Aemeath.webp' },
  { id: 'luuk', name: 'Luuk', file: 'Luuk.png' },
  { id: 'mornye', name: 'Mornye', file: 'Mornye.webp' },
  { id: 'lynae', name: 'Lynae', file: 'Lynae.webp' },
  { id: 'chisa', name: 'Chisa', file: 'Chisa.webp' },
  { id: 'qiuyuan', name: 'Qiuyuan', file: 'Qiuyuan.webp' },
  { id: 'galbrena', name: 'Galbrena', file: 'Galbrena.webp' },
  { id: 'iuno', name: 'Iuno', file: 'Iuno.webp' },
  { id: 'augusta', name: 'Augusta', file: 'Augusta.png' },
  { id: 'phrolova', name: 'Phrolova', file: 'Phrolova.webp' },
  { id: 'lupa', name: 'Lupa', file: 'Lupa.webp' },
  { id: 'cartethyia', name: 'Cartethyia', file: 'Cartethyia.png' },
  { id: 'ciaccona', name: 'Ciaccona', file: 'Ciaccona.png' },
  { id: 'zani', name: 'Zani', file: 'Zani.png' },
  { id: 'cantarella', name: 'Cantarella', file: 'Cantarella.png' },
  { id: 'brant', name: 'Brant', file: 'Brant.png' },
  { id: 'phoebe', name: 'Phoebe', file: 'Phoebe.png' },
  { id: 'roccia', name: 'Roccia', file: 'Roccia.png' },
  { id: 'carlotta-splashing-summer', name: 'Carlotta - Splashing Summer', file: 'Carlotta - Splashing Summer.png' },
  { id: 'carlotta', name: 'Carlotta', file: 'Carlotta.png' },
  { id: 'camellya', name: 'Camellya', file: 'Camellya.png' },
  { id: 'the-shorekeeper', name: 'The Shorekeeper', file: 'The Shorekeeper.png' },
  { id: 'xiangli-yao', name: 'Xiangli Yao', file: 'Xiangli Yao.png' },
  { id: 'zhezhi', name: 'Zhezhi', file: 'Zhezhi.png' },
  { id: 'changli-laurel-nymph', name: 'Changli - Laurel Nymph', file: 'Changli - Laurel Nymph.png' },
  { id: 'changli', name: 'Changli', file: 'Changli.png' },
  { id: 'jinhsi-peach-blossom', name: 'Jinhsi - Peach Blossom', file: 'Jinhsi - Peach Blossom.png' },
  { id: 'jinhsi', name: 'Jinhsi', file: 'Jinhsi.png' },
  { id: 'yinlin', name: 'Yinlin', file: 'Yinlin.png' },
  { id: 'verina', name: 'Verina', file: 'Verina.png' },
  { id: 'lingyang', name: 'Lingyang', file: 'Lingyang.png' },
  { id: 'jianxin', name: 'Jianxin', file: 'Jianxin.png' },
  { id: 'encore', name: 'Encore', file: 'Encore.png' },
  { id: 'calcharo', name: 'Calcharo', file: 'Calcharo.png' },
  { id: 'jiyan', name: 'Jiyan', file: 'Jiyan.png' },
  { id: 'm-rover', name: 'M.Rover', file: 'M.Rover.png' },
  { id: 'f-rover', name: 'F.Rover', file: 'F.Rover.png' },
  // 4★, newest → oldest
  { id: 'buling', name: 'Buling', file: 'Buling.webp' },
  { id: 'lumi', name: 'Lumi', file: 'Lumi.png' },
  { id: 'youhu', name: 'Youhu', file: 'Youhu.png' },
  { id: 'mortifi', name: 'Mortifi', file: 'Mortifi.png' },
  { id: 'yuanwu', name: 'Yuanwu', file: 'Yuanwu.png' },
  { id: 'taoqi', name: 'Taoqi', file: 'Taoqi.png' },
  { id: 'sanhua-exorcistic-adjuration', name: 'Sanhua - Exorcistic Adjuration', file: 'Sanhua - Exorcistic Adjuration.png' },
  { id: 'sanhua', name: 'Sanhua', file: 'Sanhua.png' },
  { id: 'yangyang', name: 'Yangyang', file: 'Yangyang.png' },
  { id: 'danjin', name: 'Danjin', file: 'Danjin.webp' },
  { id: 'chixia', name: 'Chixia', file: 'Chixia.png' },
  { id: 'baizhi', name: 'Baizhi', file: 'Baizhi.png' },
  { id: 'aalto', name: 'Aalto', file: 'Aalto.png' },
];

export function getResonatorPortrait(id) {
  return RESONATOR_PORTRAITS.find((p) => p.id === id) || null;
}
