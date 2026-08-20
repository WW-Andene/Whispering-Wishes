// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/materialData.js (split from constants.js)
// Material icon URLs, common/forgery material tier maps, and resonator/weapon
// ascension + EXP + skill-upgrade material costs.
// ═══════════════════════════════════════════════════════════════════════════════

// Local fallback image for materials with no licensed icon source yet — kept separate from
// banners.js's PLACEHOLDER_IMAGE to avoid coupling these two leaf data modules together.
const MATERIAL_PLACEHOLDER_IMAGE = 'https://i.ibb.co/cK3h3qFh/Abby-Card2.webp';

// [SECTION:MATERIAL_IMAGES] — Material icon URLs for collection detail modals
const MATERIAL_IMAGES = {
  // === Resonator EXP Materials ===
  'Premium Resonance Potion': 'https://i.ibb.co/SDQV30L4/Item-Premium-Resonance-Potion.webp',
  'Advanced Resonance Potion': 'https://i.ibb.co/wF8LHQJf/Item-Advanced-Resonance-Potion.webp',
  'Medium Resonance Potion': 'https://i.ibb.co/PGyHmDwL/Item-Medium-Resonance-Potion.webp',
  'Basic Resonance Potion': 'https://i.ibb.co/fzp86xSn/Item-Basic-Resonance-Potion.webp',
  // === Weapon EXP Materials ===
  'Premium Energy Core': 'https://i.ibb.co/Q78ZjCnM/Item-Premium-Energy-Core.webp',
  'Advanced Energy Core': 'https://i.ibb.co/kszzpmL6/Item-Advanced-Energy-Core.webp',
  'Medium Energy Core': 'https://i.ibb.co/SCnNSyP/Item-Medium-Energy-Core.webp',
  'Basic Energy Core': 'https://i.ibb.co/997Z6yzN/Item-Basic-Energy-Core.webp',
  // === Ascension Specialty Materials ===
  'Bloodleaf Viburnum': 'https://i.ibb.co/LDbtRXx6/Item-Bloodleaf-Viburnum.webp',
  'Belle Poppy': 'https://i.ibb.co/NgHsDS5m/Item-Belle-Poppy.webp',
  'Coriolus': 'https://i.ibb.co/CpcGDyf1/Item-Coriolus.webp',
  'Firecracker Jewelweed': 'https://i.ibb.co/Xf1KJhB4/Item-Firecracker-Jewelweed.webp',
  'Golden Fleece': 'https://i.ibb.co/9HLsgFqC/Item-Golden-Fleece.webp',
  'Gemini Spore': 'https://i.ibb.co/s9xFvSf5/Item-Gemini-Spore.webp',
  'Iris': 'https://i.ibb.co/W4kqf8qT/Item-Iris.webp',
  "Loong's Pearl": 'https://i.ibb.co/rGdWf2nQ/Item-Loong-s-Pearl.webp',
  'Lanternberry': 'https://i.ibb.co/GQggKLyn/Item-Lanternberry.webp',
  'Luminous Calendula': 'https://i.ibb.co/JFjCvHGt/Item-Luminous-Calendula.webp',
  'Pavo Plum': 'https://i.ibb.co/XQM1xvb/Item-Pavo-Plum.webp',
  'Nova': 'https://i.ibb.co/JW1wBHkc/Item-Nova.webp',
  'Pecok Flower': 'https://i.ibb.co/NgPxmXd7/Item-Pecok-Flower.webp',
  'Seaside Cendrelis': 'https://i.ibb.co/xSvNnzLR/Item-Seaside-Cendrelis.webp',
  'Rimewisp': 'https://i.ibb.co/zHhDjLrv/Item-Rimewisp.webp',
  'Sliverglow Bloom': 'https://i.ibb.co/3YTkb3Wz/Item-Sliverglow-Bloom.webp',
  'Stone Rose': 'https://i.ibb.co/Qv7NBDpC/Item-Stone-Rose.webp',
  'Summer Flower': 'https://i.ibb.co/JRBk9Bpx/Item-Summer-Flower.webp',
  'Sword Acorus': 'https://i.ibb.co/kTjDBX0/Item-Sword-Acorus.webp',
  'Violet Coral': 'https://i.ibb.co/XZJrgXPg/Item-Violet-Coral.webp',
  'Terraspawn Fungus': 'https://i.ibb.co/qLpxtGkG/Item-Terraspawn-Fungus.webp',
  'Bamboo Iris': 'https://i.ibb.co/Y4bDQWMX/Item-Bamboo-Iris.webp',
  'Wintry Bell': 'https://i.ibb.co/FpDwxqW/Item-Wintry-Bell.webp',
  'Arithmetic Shell': 'https://i.ibb.co/7x2b0KH1/Item-Arithmetic-Shell.webp',
  'Afterlife': 'https://i.ibb.co/Kp3YWmGF/Afterlife.webp',
  'Moss Amber': 'https://i.ibb.co/7tNWkRfj/1771262854560.png',
  'Edelschnee': 'https://i.ibb.co/gbXc1QYD/T-Icon-C-074-UI.webp',
  // === Skill Upgrade — Weekly Boss Drops ===
  'Monument Bell': 'https://i.ibb.co/S4194zWY/Item-Monument-Bell.webp',
  'Unending Destruction': 'https://i.ibb.co/gFghm5L6/Item-Unending-Destruction.webp',
  'Dreamless Feather': 'https://i.ibb.co/PGrzxBN5/Item-Dreamless-Feather.webp',
  "Sentinel's Dagger": 'https://i.ibb.co/6c0RFrwJ/Item-Sentinel-s-Dagger.webp',
  "The Netherworld's Stare": 'https://i.ibb.co/rRhTq6Cz/Item-The-Netherworld-s-Stare.webp',
  'When Irises Bloom': 'https://i.ibb.co/Kx4BQHTM/Item-When-Irises-Bloom.webp',
  'Curse of the Abyss': 'https://i.ibb.co/hFJXnrfW/Item-Curse-of-the-Abyss.webp',
  'Gold in Memory': 'https://i.ibb.co/Nd4ZcnLg/Item-Gold-in-Memory.webp',
  // === Resonator Ascension — Boss Drops ===
  'Mysterious Code': 'https://i.ibb.co/Fj3xgMk/Item-Mysterious-Code.webp',
  'Blazing Bone': 'https://i.ibb.co/BVtC1vQH/Item-Blazing-Bone.webp',
  'Abyssal Husk': 'https://i.ibb.co/gMN2M1bB/Item-Abyssal-Husk.webp',
  'Burning Judgment': 'https://i.ibb.co/WvfTNf8p/Item-Burning-Judgment.webp',
  'Blighted Crown of Puppet King': 'https://i.ibb.co/Mk2gByGM/Item-Blighted-Crown-of-Puppet-King.webp',
  'Cleansing Conch': 'https://i.ibb.co/pvnfc6NX/Item-Cleansing-Conch.webp',
  'Gold-Dissolving Feather': 'https://i.ibb.co/gZvq6RHR/Item-Gold-Dissolving-Feather.webp',
  'Elegy Tacet Core': 'https://i.ibb.co/CRC5JMb/Item-Elegy-Tacet-Core.webp',
  'Group Abomination Tacet Core': 'https://i.ibb.co/JjMq0vLM/Item-Group-Abomination-Tacet-Core.webp',
  'Our Choice': 'https://i.ibb.co/9mNkyQkg/Item-Our-Choice.webp',
  'Hidden Thunder Tacet Core': 'https://i.ibb.co/mC3ZDJxd/Item-Hidden-Thunder-Tacet-Core.webp',
  'Platinum Core': 'https://i.ibb.co/Ng5kzZ26/Item-Platinum-Core.webp',
  'Roaring Rock Fist': 'https://i.ibb.co/DPR6qBV8/Item-Roaring-Rock-Fist.webp',
  'Rage Tacet Core': 'https://i.ibb.co/gb03xrp2/Item-Rage-Tacet-Core.webp',
  "Suncoveter's Reach": 'https://i.ibb.co/TBsX7XRX/Item-Suncoveter-s-Reach.webp',
  'Strife Tacet Core': 'https://i.ibb.co/ynnMKtQz/Item-Strife-Tacet-Core.webp',
  'Sound-Keeping Tacet Core': 'https://i.ibb.co/KcQwmx2C/Item-Sound-Keeping-Tacet-Core.webp',
  'Thundering Tacet Core': 'https://i.ibb.co/VcwxDM37/Item-Thundering-Tacet-Core.webp',
  'Topological Confinement': 'https://i.ibb.co/zD50HfX/Item-Topological-Confinement.webp',
  'Unfading Glory': 'https://i.ibb.co/ZzS375yW/Item-Unfading-Glory.webp',
  'Truth in Lies': 'https://i.ibb.co/H93NgjR/Item-Truth-in-Lies.webp',
  // Qingxiao & Jingran's shared v3.6 boss-drop ascension material, confirmed via
  // wutheringwaves.fandom.com (both characters' Ascension Materials tables list "46 Forged
  // Empyrean's Sigh"). Real icon sourced 2026-08-20 from fandom's own
  // File:Item_Forged_Empyrean's_Sigh.png via the MediaWiki API (bypasses Cloudflare), uploaded
  // to imgbb 2026-08-20.
  "Forged Empyrean's Sigh": 'https://i.ibb.co/9mZJHrQ4/forged-empyreans-sigh.webp',
  // === Common Enemy Drops (HF = tier 3, FF = tier 4) ===
  // Whisperin Core family
  'HF-Whisperin Core': 'https://i.ibb.co/5XdgF3vt/Item-HF-Whisperin-Core.webp',
  'FF-Whisperin Core': 'https://i.ibb.co/qL2Mqr1B/Item-FF-Whisperin-Core.webp',
  // Ring family
  'Improved Ring': 'https://i.ibb.co/Txdrg5sZ/Item-Improved-Ring.webp',
  'Tailored Ring': 'https://i.ibb.co/d0S363jr/Item-Tailored-Ring.webp',
  // Howler Core family
  'HF-Howler Core': 'https://i.ibb.co/99xC7ZSb/Item-HF-Howler-Core.webp',
  'FF-Howler Core': 'https://i.ibb.co/GrrFvb5/Item-FF-Howler-Core.webp',
  // Tidal Residuum family
  'HF-Tidal Residuum': 'https://i.ibb.co/xqCsrnT1/Item-HF-Tidal-Residuum.webp',
  'FF-Tidal Residuum': 'https://i.ibb.co/Y7MHV4rp/Item-FF-Tidal-Residuum.webp',
  // Polygon Core family
  'HF-Polygon Core': 'https://i.ibb.co/5xBVprhn/Item-HF-Polygon-Core.webp',
  'FF-Polygon Core': 'https://i.ibb.co/VWBm757q/Item-FF-Polygon-Core.webp',
  // Mech Core family
  'HF-Mech Core': 'https://i.ibb.co/SDmhhqSY/Item-HF-Mech-Core.webp',
  'FF-Mech Core': 'https://i.ibb.co/Ld5RwwQN/Item-FF-Mech-Core.webp',
  // Carved Crystal family
  'HF-Carved Crystal': 'https://i.ibb.co/FqLcmHhR/Item-HF-Carved-Crystal.webp',
  'FF-Carved Crystal': 'https://i.ibb.co/cST0C2KY/Item-FF-Carved-Crystal.webp',
  // Exoswarm Core family
  'HF-Exoswarm Core': 'https://i.ibb.co/gbM0KFHq/Item-HF-Exoswarm-Core.webp',
  'FF-Exoswarm Core': 'https://i.ibb.co/ZyjbXDK/Item-FF-Exoswarm-Core.webp',
  // Exoswarm Pendant (separate drop family)
  'Chipped Exoswarm Pendant': 'https://i.ibb.co/F4sHk3f9/Item-Chipped-Exoswarm-Pendant.webp',
  'Intact Exoswarm Pendant': 'https://i.ibb.co/Gy3PM1Q/Item-Intact-Exoswarm-Pendant.webp',
  // === Forgery Materials (skill/weapon upgrade) ===
  'Waveworn Residue 235': 'https://i.ibb.co/N6b1m8VT/Item-Waveworn-Residue-235.webp',
  'Waveworn Residue 239': 'https://i.ibb.co/Xfwt09MV/Item-Waveworn-Residue-239.webp',
  // Waveworn Shard family — added 2026-08-17 while auditing Luuk Herssen: FORGERY_MAT_TIERS already
  // pointed to these two tier names, but neither had an icon URL here, so his (and Mornye's, and the
  // Waveworn Shard-forged weapons') skill-material row rendered with no picture.
  'HF-Waveworn Shard': 'https://i.ibb.co/KpS51SLv/Item-HF-Waveworn-Shard.webp',
  'FF-Waveworn Shard': 'https://i.ibb.co/TxB4P0Cp/Item-FF-Waveworn-Shard.webp',
  // String family — added 2026-08-17 while auditing Luuk Herssen/Freeze Frame's shared skill-material
  // pool. Real tier names, unlike this app's placeholder "HF-String"/"FF-String": Broken String (LF) →
  // Spliced String (MF) → Solidified String (HF) → Melodic String (FF), per fandom's own item pages.
  'Solidified String': 'https://i.ibb.co/8D4cwT2p/Item-Solidified-String.webp',
  'Melodic String': 'https://i.ibb.co/pH17NjG/Item-Melodic-String.webp',
  'Remnant Combustor': 'https://i.ibb.co/prsfDV7Y/Item-Remnant-Combustor.webp',
  'Reverb Combustor': 'https://i.ibb.co/jkt3qd95/Item-Reverb-Combustor.webp',
  'Polarized Metallic Drip': 'https://i.ibb.co/xSVsWyKd/Item-Polarized-Metallic-Drip.webp',
  'Heterized Metallic Drip': 'https://i.ibb.co/WRXhhfR/Item-Heterized-Metallic-Drip.webp',
  'Refined Phlogiston': 'https://i.ibb.co/HTJ13kQy/Item-Refined-Phlogiston.webp',
  'Flawless Phlogiston': 'https://i.ibb.co/gZmPFYzP/Item-Flawless-Phlogiston.webp',
  'Mask of Distortion': 'https://i.ibb.co/QjX7YFy2/Item-Mask-of-Distortion.webp',
  'Mask of Insanity': 'https://i.ibb.co/spmvhjxs/Item-Mask-of-Insanity.webp',
  'Andante Helix': 'https://i.ibb.co/676tpkpg/Item-Andante-Helix.webp',
  'Presto Helix': 'https://i.ibb.co/pgMdH2f/Item-Presto-Helix.webp',
  'Cadence Leaf': 'https://i.ibb.co/35qhTRg8/Item-Cadence-Leaf.webp',
  'Cadence Blossom': 'https://i.ibb.co/MxztnSJ9/Item-Cadence-Blossom.webp',
  // Polarizer family
  'Polywing Polarizer': 'https://wuwatracker.com/api/item-icons/file/polywing-polarizer.webp',
  'Layered Wing Polarizer': 'https://wuwatracker.com/api/item-icons/file/layered-wing-polarizer.webp',
  // Autopuppet Kernel family (Land of Xuanfang common drop — Suisui, Yangyang: Xuanling, Azure Oath)
  'HF-Autopuppet Kernel': 'https://i.ibb.co/Pv1RwHvF/HF-Autopuppet-Kernel.webp',
  'FF-Autopuppet Kernel': 'https://i.ibb.co/39PtWdsP/FF-Autopuppet-Kernel.webp',
  // v3.4/3.5 ascension specialty / weekly-boss-drop materials
  'Cloudperch Seed': 'https://i.ibb.co/k2QZsk8X/Item-Cloudperch-Seed.webp',
  'Dream of Stars': 'https://i.ibb.co/CK0t9WqH/Dream-of-Stars.webp',
  'Flowborne Dream': 'https://i.ibb.co/spwJrnR9/Item-Flowborne-Dream.webp',
  'Blade Blossom': 'https://i.ibb.co/q8w9h0j/Item-Blade-Blossom.webp',
  'Forget-Me-Not': 'https://i.ibb.co/G4HnvwVb/Forget-Me-Not.webp',
  'Nightmare Flashdrive': 'https://i.ibb.co/3yMLGMRv/Nightmare-Flashdrive.webp',
  'Past Reveries': 'https://i.ibb.co/SDBLk5fS/Past-Reveries.webp',
  'Redbell': 'https://i.ibb.co/G3P7bGDB/Redbell.webp',
  'Skyward Glazed Heart': 'https://i.ibb.co/FLn7WRQ2/Skyward-Glazed-Heart.webp',
  "Solidarity's Loneflame": 'https://i.ibb.co/YBhv4RYk/Solidaritys-Loneflame.webp',
  'We Who Question': 'https://i.ibb.co/G3Jd0prs/We-Who-Question.webp',
};

// [SECTION:COMMON_MAT_TIERS] — Maps common material family name → [tier3, tier4] display names
const COMMON_MAT_TIERS = {
  'Whisperin Core': ['HF-Whisperin Core', 'FF-Whisperin Core'],
  'Ring': ['Improved Ring', 'Tailored Ring'],
  'Howler Core': ['HF-Howler Core', 'FF-Howler Core'],
  'Tidal Residuum': ['HF-Tidal Residuum', 'FF-Tidal Residuum'],
  'Polygon Core': ['HF-Polygon Core', 'FF-Polygon Core'],
  'Mech Core': ['HF-Mech Core', 'FF-Mech Core'],
  'Carved Crystal': ['HF-Carved Crystal', 'FF-Carved Crystal'],
  'Exoswarm Core': ['HF-Exoswarm Core', 'FF-Exoswarm Core'],
  'Exoswarm Pendant': ['Chipped Exoswarm Pendant', 'Intact Exoswarm Pendant'],
  'Autopuppet Kernel': ['HF-Autopuppet Kernel', 'FF-Autopuppet Kernel'],
};

// [SECTION:FORGERY_MAT_TIERS] — Maps forgery family name → [tier3, tier4] display names
const FORGERY_MAT_TIERS = {
  'Helix': ['Andante Helix', 'Presto Helix'],
  'Cadence': ['Cadence Leaf', 'Cadence Blossom'],
  'Metallic Drip': ['Polarized Metallic Drip', 'Heterized Metallic Drip'],
  'Phlogiston': ['Refined Phlogiston', 'Flawless Phlogiston'],
  'Combustor': ['Remnant Combustor', 'Reverb Combustor'],
  'Mask': ['Mask of Distortion', 'Mask of Insanity'],
  'Waveworn Residue': ['Waveworn Residue 235', 'Waveworn Residue 239'],
  'Polarizer': ['Polywing Polarizer', 'Layered Wing Polarizer'],
  'Carved Crystal': ['HF-Carved Crystal', 'FF-Carved Crystal'],
  'Waveworn Shard': ['HF-Waveworn Shard', 'FF-Waveworn Shard'],
  // Fixed 2026-08-17: real tier names are Solidified String (HF) / Melodic String (FF), not the
  // placeholder "HF-String"/"FF-String" — those never matched any MATERIAL_IMAGES entry, so Lucilla's
  // (and Freeze Frame/Fusion Accretion's) skill-material row rendered with no picture at all.
  'String': ['Solidified String', 'Melodic String'],
};

// [SECTION:MATERIAL_COSTS] — Total materials to max level
// Resonator Lv 1→90 ascension costs (all 6 phases)
const RESONATOR_ASCENSION_COSTS = {
  boss: 46,
  commonT3: 12, commonT4: 4,
  specialty: 60,
  shell: 170000,
};

// Resonator EXP to Lv 90 — total 2,438,000 EXP
const RESONATOR_EXP_COSTS = {
  'Basic Resonance Potion': 0,
  'Medium Resonance Potion': 0,
  'Advanced Resonance Potion': 0,
  'Premium Resonance Potion': 122,
};

// All Forte nodes maxed (5 skills + inherent skills + stat bonuses)
const SKILL_UPGRADE_COSTS = {
  forgeryT3: 55, forgeryT4: 67,
  commonT3: 40, commonT4: 57,
  weeklyDrop: 26,
  shell: 2030000,
};

// Weapon refinement scaling — R1 = base (pv values), R2-R5 multiply pv values by these factors
// Standard WuWa scaling: each refinement adds 25% of base passive bonus
const WEAPON_REFINE_SCALE = [1, 1.25, 1.5, 1.75, 2];

// 5★ Weapon Lv 1→90 ascension costs (all 6 phases)
const WEAPON_ASCENSION_COSTS_5 = {
  forgeryT3: 6, forgeryT4: 20,
  commonT3: 10, commonT4: 12,
  shell: 330000,
};

// 4★ Weapon Lv 1→90 ascension costs
const WEAPON_ASCENSION_COSTS_4 = {
  forgeryT3: 5, forgeryT4: 17,
  commonT3: 9, commonT4: 11,
  shell: 264000,
};

// Weapon EXP to Lv 90 5★ — total 2,692,400 EXP
const WEAPON_EXP_COSTS_5 = {
  'Basic Energy Core': 0,
  'Medium Energy Core': 0,
  'Advanced Energy Core': 0,
  'Premium Energy Core': 135,
};

// Weapon EXP to Lv 90 4★ — total 2,289,200 EXP
const WEAPON_EXP_COSTS_4 = {
  'Basic Energy Core': 0,
  'Medium Energy Core': 0,
  'Advanced Energy Core': 0,
  'Premium Energy Core': 115,
};

export {
  MATERIAL_IMAGES,
  COMMON_MAT_TIERS,
  FORGERY_MAT_TIERS,
  RESONATOR_ASCENSION_COSTS,
  RESONATOR_EXP_COSTS,
  SKILL_UPGRADE_COSTS,
  WEAPON_REFINE_SCALE,
  WEAPON_ASCENSION_COSTS_5,
  WEAPON_ASCENSION_COSTS_4,
  WEAPON_EXP_COSTS_5,
  WEAPON_EXP_COSTS_4,
};
