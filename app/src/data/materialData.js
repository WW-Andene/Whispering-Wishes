// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/materialData.js (split from constants.js)
// Material icon URLs, common/forgery material tier maps, and resonator/weapon
// ascension + EXP + skill-upgrade material costs.
// ═══════════════════════════════════════════════════════════════════════════════

// Local fallback image for materials with no licensed icon source yet — kept separate from
// banners.js's PLACEHOLDER_IMAGE to avoid coupling these two leaf data modules together.
const MATERIAL_PLACEHOLDER_IMAGE = './materials/cK3h3qFh-Abby-Card2.webp';

// [SECTION:MATERIAL_IMAGES] — Material icon URLs for collection detail modals
const MATERIAL_IMAGES = {
  // === Resonator EXP Materials ===
  'Premium Resonance Potion': './materials/SDQV30L4-Item-Premium-Resonance-Potion.webp',
  'Advanced Resonance Potion': './materials/wF8LHQJf-Item-Advanced-Resonance-Potion.webp',
  'Medium Resonance Potion': './materials/PGyHmDwL-Item-Medium-Resonance-Potion.webp',
  'Basic Resonance Potion': './materials/fzp86xSn-Item-Basic-Resonance-Potion.webp',
  // === Weapon EXP Materials ===
  'Premium Energy Core': './materials/Q78ZjCnM-Item-Premium-Energy-Core.webp',
  'Advanced Energy Core': './materials/kszzpmL6-Item-Advanced-Energy-Core.webp',
  'Medium Energy Core': './materials/SCnNSyP-Item-Medium-Energy-Core.webp',
  'Basic Energy Core': './materials/997Z6yzN-Item-Basic-Energy-Core.webp',
  // === Ascension Specialty Materials ===
  'Bloodleaf Viburnum': './materials/LDbtRXx6-Item-Bloodleaf-Viburnum.webp',
  'Belle Poppy': './materials/NgHsDS5m-Item-Belle-Poppy.webp',
  'Coriolus': './materials/CpcGDyf1-Item-Coriolus.webp',
  'Firecracker Jewelweed': './materials/Xf1KJhB4-Item-Firecracker-Jewelweed.webp',
  'Golden Fleece': './materials/9HLsgFqC-Item-Golden-Fleece.webp',
  'Gemini Spore': './materials/s9xFvSf5-Item-Gemini-Spore.webp',
  'Iris': './materials/W4kqf8qT-Item-Iris.webp',
  "Loong's Pearl": './materials/rGdWf2nQ-Item-Loong-s-Pearl.webp',
  'Lanternberry': './materials/GQggKLyn-Item-Lanternberry.webp',
  'Luminous Calendula': './materials/JFjCvHGt-Item-Luminous-Calendula.webp',
  'Pavo Plum': './materials/XQM1xvb-Item-Pavo-Plum.webp',
  'Nova': './materials/JW1wBHkc-Item-Nova.webp',
  'Pecok Flower': './materials/NgPxmXd7-Item-Pecok-Flower.webp',
  'Seaside Cendrelis': './materials/xSvNnzLR-Item-Seaside-Cendrelis.webp',
  'Rimewisp': './materials/zHhDjLrv-Item-Rimewisp.webp',
  'Sliverglow Bloom': './materials/3YTkb3Wz-Item-Sliverglow-Bloom.webp',
  'Stone Rose': './materials/Qv7NBDpC-Item-Stone-Rose.webp',
  'Summer Flower': './materials/JRBk9Bpx-Item-Summer-Flower.webp',
  'Sword Acorus': './materials/kTjDBX0-Item-Sword-Acorus.webp',
  'Violet Coral': './materials/XZJrgXPg-Item-Violet-Coral.webp',
  'Terraspawn Fungus': './materials/qLpxtGkG-Item-Terraspawn-Fungus.webp',
  'Bamboo Iris': './materials/Y4bDQWMX-Item-Bamboo-Iris.webp',
  'Wintry Bell': './materials/FpDwxqW-Item-Wintry-Bell.webp',
  'Arithmetic Shell': './materials/7x2b0KH1-Item-Arithmetic-Shell.webp',
  'Afterlife': './materials/Kp3YWmGF-Afterlife.webp',
  'Moss Amber': './materials/7tNWkRfj-1771262854560.png',
  'Edelschnee': './materials/gbXc1QYD-T-Icon-C-074-UI.webp',
  // === Skill Upgrade — Weekly Boss Drops ===
  'Monument Bell': './materials/S4194zWY-Item-Monument-Bell.webp',
  'Unending Destruction': './materials/gFghm5L6-Item-Unending-Destruction.webp',
  'Dreamless Feather': './materials/PGrzxBN5-Item-Dreamless-Feather.webp',
  "Sentinel's Dagger": './materials/6c0RFrwJ-Item-Sentinel-s-Dagger.webp',
  "The Netherworld's Stare": './materials/rRhTq6Cz-Item-The-Netherworld-s-Stare.webp',
  'When Irises Bloom': './materials/Kx4BQHTM-Item-When-Irises-Bloom.webp',
  'Curse of the Abyss': './materials/hFJXnrfW-Item-Curse-of-the-Abyss.webp',
  'Gold in Memory': './materials/Nd4ZcnLg-Item-Gold-in-Memory.webp',
  // === Resonator Ascension — Boss Drops ===
  'Mysterious Code': './materials/Fj3xgMk-Item-Mysterious-Code.webp',
  'Blazing Bone': './materials/BVtC1vQH-Item-Blazing-Bone.webp',
  'Abyssal Husk': './materials/gMN2M1bB-Item-Abyssal-Husk.webp',
  'Burning Judgment': './materials/WvfTNf8p-Item-Burning-Judgment.webp',
  'Blighted Crown of Puppet King': './materials/Mk2gByGM-Item-Blighted-Crown-of-Puppet-King.webp',
  'Cleansing Conch': './materials/pvnfc6NX-Item-Cleansing-Conch.webp',
  'Gold-Dissolving Feather': './materials/gZvq6RHR-Item-Gold-Dissolving-Feather.webp',
  'Elegy Tacet Core': './materials/CRC5JMb-Item-Elegy-Tacet-Core.webp',
  'Group Abomination Tacet Core': './materials/JjMq0vLM-Item-Group-Abomination-Tacet-Core.webp',
  'Our Choice': './materials/9mNkyQkg-Item-Our-Choice.webp',
  'Hidden Thunder Tacet Core': './materials/mC3ZDJxd-Item-Hidden-Thunder-Tacet-Core.webp',
  'Platinum Core': './materials/Ng5kzZ26-Item-Platinum-Core.webp',
  'Roaring Rock Fist': './materials/DPR6qBV8-Item-Roaring-Rock-Fist.webp',
  'Rage Tacet Core': './materials/gb03xrp2-Item-Rage-Tacet-Core.webp',
  "Suncoveter's Reach": './materials/TBsX7XRX-Item-Suncoveter-s-Reach.webp',
  'Strife Tacet Core': './materials/ynnMKtQz-Item-Strife-Tacet-Core.webp',
  'Sound-Keeping Tacet Core': './materials/KcQwmx2C-Item-Sound-Keeping-Tacet-Core.webp',
  'Thundering Tacet Core': './materials/VcwxDM37-Item-Thundering-Tacet-Core.webp',
  'Topological Confinement': './materials/zD50HfX-Item-Topological-Confinement.webp',
  'Unfading Glory': './materials/ZzS375yW-Item-Unfading-Glory.webp',
  'Truth in Lies': './materials/H93NgjR-Item-Truth-in-Lies.webp',
  // Qingxiao & Jingran's shared v3.6 boss-drop ascension material, confirmed via
  // wutheringwaves.fandom.com (both characters' Ascension Materials tables list "46 Forged
  // Empyrean's Sigh"). Real icon sourced 2026-08-20 from fandom's own
  // File:Item_Forged_Empyrean's_Sigh.png via the MediaWiki API (bypasses Cloudflare), uploaded
  // to imgbb 2026-08-20.
  "Forged Empyrean's Sigh": './materials/9mZJHrQ4-forged-empyreans-sigh.webp',
  // === Common Enemy Drops (all 4 tiers) ===
  // Fixed 2026-08-21 (Planner audit): tiers 1-2 (LF/MF, or the family's own real name where it isn't
  // LF-/MF- prefixed) were entirely missing before this pass. Most icons pulled from the user's own
  // pre-existing "Wuthering Waves - Weapon & Skills materials" imgbb album (already uploaded there);
  // a handful not in that album (Adagio Helix, Monowing Polarizer, Broken String) were freshly
  // sourced via the wiki's rarity field + Recipe synthesis chain (e.g. MF Mech Core's own recipe
  // reads "LF Mech Core×3"), not guessed.
  // Whisperin Core family
  'LF-Whisperin Core': './materials/39gtHhnL-Item-LF-Whisperin-Core.webp',
  'MF-Whisperin Core': './materials/qLRN9Vhf-Item-MF-Whisperin-Core.webp',
  'HF-Whisperin Core': './materials/5XdgF3vt-Item-HF-Whisperin-Core.webp',
  'FF-Whisperin Core': './materials/qL2Mqr1B-Item-FF-Whisperin-Core.webp',
  // Ring family — real tier1/tier2 names, not LF-/MF- prefixed: Crude Ring -> Basic Ring -> Improved Ring -> Tailored Ring
  'Crude Ring': './materials/Sww9p81n-Item-Crude-Ring.webp',
  'Basic Ring': './materials/1pWNT3H-Item-Basic-Ring.webp',
  'Improved Ring': './materials/Txdrg5sZ-Item-Improved-Ring.webp',
  'Tailored Ring': './materials/d0S363jr-Item-Tailored-Ring.webp',
  // Howler Core family
  'LF-Howler Core': './materials/rfG5TWmV-Item-LF-Howler-Core.webp',
  'MF-Howler Core': './materials/cS5dwh4N-Item-MF-Howler-Core.webp',
  'HF-Howler Core': './materials/99xC7ZSb-Item-HF-Howler-Core.webp',
  'FF-Howler Core': './materials/GrrFvb5-Item-FF-Howler-Core.webp',
  // Tidal Residuum family
  'LF-Tidal Residuum': './materials/j9MGh3HB-Item-LF-Tidal-Residuum.webp',
  'MF-Tidal Residuum': './materials/V0gT9S4z-Item-MF-Tidal-Residuum.webp',
  'HF-Tidal Residuum': './materials/xqCsrnT1-Item-HF-Tidal-Residuum.webp',
  'FF-Tidal Residuum': './materials/Y7MHV4rp-Item-FF-Tidal-Residuum.webp',
  // Polygon Core family
  'LF-Polygon Core': './materials/4nbS5BZM-Item-LF-Polygon-Core.webp',
  'MF-Polygon Core': './materials/xq8XFg5V-Item-MF-Polygon-Core.webp',
  'HF-Polygon Core': './materials/5xBVprhn-Item-HF-Polygon-Core.webp',
  'FF-Polygon Core': './materials/VWBm757q-Item-FF-Polygon-Core.webp',
  // Mech Core family
  'LF-Mech Core': './materials/n5MWWmt-Item-LF-Mech-Core.webp',
  'MF-Mech Core': './materials/yBZk8JTw-Item-MF-Mech-Core.webp',
  'HF-Mech Core': './materials/SDmhhqSY-Item-HF-Mech-Core.webp',
  'FF-Mech Core': './materials/Ld5RwwQN-Item-FF-Mech-Core.webp',
  // Carved Crystal family
  'LF-Carved Crystal': './materials/CpvjfQjF-Item-LF-Carved-Crystal.webp',
  'MF-Carved Crystal': './materials/93fxzhLD-Item-MF-Carved-Crystal.webp',
  'HF-Carved Crystal': './materials/FqLcmHhR-Item-HF-Carved-Crystal.webp',
  'FF-Carved Crystal': './materials/cST0C2KY-Item-FF-Carved-Crystal.webp',
  // Exoswarm Core family
  'LF-Exoswarm Core': './materials/1tty3DZY-Item-LF-Exoswarm-Core.webp',
  'MF-Exoswarm Core': './materials/0ykkst0B-Item-MF-Exoswarm-Core.webp',
  'HF-Exoswarm Core': './materials/gbM0KFHq-Item-HF-Exoswarm-Core.webp',
  'FF-Exoswarm Core': './materials/ZyjbXDK-Item-FF-Exoswarm-Core.webp',
  // Exoswarm Pendant (separate drop family) — real tier1/2 names: Worn -> Fractured -> Chipped -> Intact
  'Worn Exoswarm Pendant': './materials/gMtqfsHH-Item-Worn-Exoswarm-Pendant.webp',
  'Fractured Exoswarm Pendant': './materials/67hG6z0R-Item-Fractured-Exoswarm-Pendant.webp',
  'Chipped Exoswarm Pendant': './materials/F4sHk3f9-Item-Chipped-Exoswarm-Pendant.webp',
  'Intact Exoswarm Pendant': './materials/Gy3PM1Q-Item-Intact-Exoswarm-Pendant.webp',
  // === Forgery Materials (skill/weapon upgrade, all 4 tiers) ===
  'Waveworn Residue 210': './materials/xqdYwmJD-Item-Waveworn-Residue-210.webp',
  'Waveworn Residue 226': './materials/6RzrrNzX-Item-Waveworn-Residue-226.webp',
  'Waveworn Residue 235': './materials/N6b1m8VT-Item-Waveworn-Residue-235.webp',
  'Waveworn Residue 239': './materials/Xfwt09MV-Item-Waveworn-Residue-239.webp',
  // Waveworn Shard family — added 2026-08-17 while auditing Luuk Herssen: FORGERY_MAT_TIERS already
  // pointed to these two tier names, but neither had an icon URL here, so his (and Mornye's, and the
  // Waveworn Shard-forged weapons') skill-material row rendered with no picture.
  'HF-Waveworn Shard': './materials/KpS51SLv-Item-HF-Waveworn-Shard.webp',
  'FF-Waveworn Shard': './materials/TxB4P0Cp-Item-FF-Waveworn-Shard.webp',
  // String family — real tier names: Broken String (T1) → Spliced String (T2) → Solidified String
  // (T3) → Melodic String (T4), per fandom's own item pages.
  'Broken String': './materials/XxQdg8mq-Broken-String.webp',
  'Spliced String': './materials/hFLktLwq-Item-Spliced-String.webp',
  'Solidified String': './materials/8D4cwT2p-Item-Solidified-String.webp',
  'Melodic String': './materials/pH17NjG-Item-Melodic-String.webp',
  'Incomplete Combustor': './materials/Ngkpc65b-Item-Incomplete-Combustor.webp',
  'Aftertune Combustor': './materials/zVF2SSJ2-Item-Aftertune-Combustor.webp',
  'Remnant Combustor': './materials/prsfDV7Y-Item-Remnant-Combustor.webp',
  'Reverb Combustor': './materials/jkt3qd95-Item-Reverb-Combustor.webp',
  'Inert Metallic Drip': './materials/TxTMJWKS-Item-Inert-Metallic-Drip.webp',
  'Reactive Metallic Drip': './materials/spt0sxj5-Item-Reactive-Metallic-Drip.webp',
  'Polarized Metallic Drip': './materials/xSVsWyKd-Item-Polarized-Metallic-Drip.webp',
  'Heterized Metallic Drip': './materials/WRXhhfR-Item-Heterized-Metallic-Drip.webp',
  'Impure Phlogiston': './materials/9kdPKXSN-Item-Impure-Phlohiston.webp',
  'Extracted Phlogiston': './materials/R4dGRr6q-Item-Extracted-Phlogiston.webp',
  'Refined Phlogiston': './materials/HTJ13kQy-Item-Refined-Phlogiston.webp',
  'Flawless Phlogiston': './materials/gZmPFYzP-Item-Flawless-Phlogiston.webp',
  // Mask family — verified via wiki rarity fields (Constraint r2, Erosion r3, Distortion r4, Insanity r5)
  // and Distortion's own Recipe ("Mask of Erosion×3"), confirming this exact tier order.
  'Mask of Constraint': './materials/MDzkHzLK-Item-Mask-of-Constraint.webp',
  'Mask of Erosion': './materials/RpbfQLKL-Item-Mask-of-Erosion.webp',
  'Mask of Distortion': './materials/QjX7YFy2-Item-Mask-of-Distortion.webp',
  'Mask of Insanity': './materials/spmvhjxs-Item-Mask-of-Insanity.webp',
  'Lento Helix': './materials/sJ5bb73v-Item-Lento-Helix.webp',
  'Adagio Helix': './materials/Zz6yyrYY-Adagio-Helix.webp',
  'Andante Helix': './materials/676tpkpg-Item-Andante-Helix.webp',
  'Presto Helix': './materials/pgMdH2f-Item-Presto-Helix.webp',
  'Cadence Seed': './materials/Y7krgCtG-Item-Cadence-Seed.webp',
  'Cadence Bud': './materials/C5JmLnCF-Item-Cadence-Bud.webp',
  'Cadence Leaf': './materials/35qhTRg8-Item-Cadence-Leaf.webp',
  'Cadence Blossom': './materials/MxztnSJ9-Item-Cadence-Blossom.webp',
  // Polarizer family
  'Broken Wing Polarizer': './materials/xqt9n28Y-Item-Broken-Wing-Polarizer.webp',
  'Monowing Polarizer': './materials/b0GGQKk-Monowing-Polarizer.webp',
  'Polywing Polarizer': './materials/wuwatracker.com-api-item-icons-file-polywing-polarizer.webp',
  'Layered Wing Polarizer': './materials/wuwatracker.com-api-item-icons-file-layered-wing-polarizer.webp',
  // Autopuppet Kernel family (Land of Xuanfang common drop — Suisui, Yangyang: Xuanling, Azure Oath)
  'LF-Autopuppet Kernel': './materials/hRDdCtzW-LF-Autopuppet-Kernel.webp',
  'MF-Autopuppet Kernel': './materials/LXC4qpr4-MF-Autopuppet-Kernel.webp',
  'HF-Autopuppet Kernel': './materials/Pv1RwHvF-HF-Autopuppet-Kernel.webp',
  'FF-Autopuppet Kernel': './materials/39PtWdsP-FF-Autopuppet-Kernel.webp',
  // v3.4/3.5 ascension specialty / weekly-boss-drop materials
  'Cloudperch Seed': './materials/k2QZsk8X-Item-Cloudperch-Seed.webp',
  'Dream of Stars': './materials/CK0t9WqH-Dream-of-Stars.webp',
  'Flowborne Dream': './materials/spwJrnR9-Item-Flowborne-Dream.webp',
  'Blade Blossom': './materials/q8w9h0j-Item-Blade-Blossom.webp',
  'Forget-Me-Not': './materials/G4HnvwVb-Forget-Me-Not.webp',
  'Nightmare Flashdrive': './materials/3yMLGMRv-Nightmare-Flashdrive.webp',
  'Past Reveries': './materials/SDBLk5fS-Past-Reveries.webp',
  'Redbell': './materials/G3P7bGDB-Redbell.webp',
  'Skyward Glazed Heart': './materials/FLn7WRQ2-Skyward-Glazed-Heart.webp',
  "Solidarity's Loneflame": './materials/YBhv4RYk-Solidaritys-Loneflame.webp',
  'We Who Question': './materials/G3Jd0prs-We-Who-Question.webp',
};

// [SECTION:COMMON_MAT_TIERS] — Maps common material family name → [tier1, tier2, tier3, tier4] names
// Fixed 2026-08-21 (Planner audit): was [tier3, tier4] only — real names for tiers 1-2 sourced via
// the wiki's rarity field + Recipe synthesis chain for every family below.
const COMMON_MAT_TIERS = {
  'Whisperin Core': ['LF-Whisperin Core', 'MF-Whisperin Core', 'HF-Whisperin Core', 'FF-Whisperin Core'],
  'Ring': ['Crude Ring', 'Basic Ring', 'Improved Ring', 'Tailored Ring'],
  'Howler Core': ['LF-Howler Core', 'MF-Howler Core', 'HF-Howler Core', 'FF-Howler Core'],
  'Tidal Residuum': ['LF-Tidal Residuum', 'MF-Tidal Residuum', 'HF-Tidal Residuum', 'FF-Tidal Residuum'],
  'Polygon Core': ['LF-Polygon Core', 'MF-Polygon Core', 'HF-Polygon Core', 'FF-Polygon Core'],
  'Mech Core': ['LF-Mech Core', 'MF-Mech Core', 'HF-Mech Core', 'FF-Mech Core'],
  'Carved Crystal': ['LF-Carved Crystal', 'MF-Carved Crystal', 'HF-Carved Crystal', 'FF-Carved Crystal'],
  'Exoswarm Core': ['LF-Exoswarm Core', 'MF-Exoswarm Core', 'HF-Exoswarm Core', 'FF-Exoswarm Core'],
  'Exoswarm Pendant': ['Worn Exoswarm Pendant', 'Fractured Exoswarm Pendant', 'Chipped Exoswarm Pendant', 'Intact Exoswarm Pendant'],
  'Autopuppet Kernel': ['LF-Autopuppet Kernel', 'MF-Autopuppet Kernel', 'HF-Autopuppet Kernel', 'FF-Autopuppet Kernel'],
};

// [SECTION:FORGERY_MAT_TIERS] — Maps forgery family name → [tier1, tier2, tier3, tier4] names
// Fixed 2026-08-21 (Planner audit): same tier1/tier2 gap as COMMON_MAT_TIERS above, same sourcing.
// 'Waveworn Shard' remains 2-tier — no confirmed real tier1/2 names sourced yet for that family; the
// consuming code degrades gracefully (skips T1/T2 addition) rather than guessing.
const FORGERY_MAT_TIERS = {
  'Helix': ['Lento Helix', 'Adagio Helix', 'Andante Helix', 'Presto Helix'],
  'Cadence': ['Cadence Seed', 'Cadence Bud', 'Cadence Leaf', 'Cadence Blossom'],
  'Metallic Drip': ['Inert Metallic Drip', 'Reactive Metallic Drip', 'Polarized Metallic Drip', 'Heterized Metallic Drip'],
  'Phlogiston': ['Impure Phlogiston', 'Extracted Phlogiston', 'Refined Phlogiston', 'Flawless Phlogiston'],
  'Combustor': ['Incomplete Combustor', 'Aftertune Combustor', 'Remnant Combustor', 'Reverb Combustor'],
  'Mask': ['Mask of Constraint', 'Mask of Erosion', 'Mask of Distortion', 'Mask of Insanity'],
  'Waveworn Residue': ['Waveworn Residue 210', 'Waveworn Residue 226', 'Waveworn Residue 235', 'Waveworn Residue 239'],
  'Polarizer': ['Broken Wing Polarizer', 'Monowing Polarizer', 'Polywing Polarizer', 'Layered Wing Polarizer'],
  'Carved Crystal': ['LF-Carved Crystal', 'MF-Carved Crystal', 'HF-Carved Crystal', 'FF-Carved Crystal'],
  'Waveworn Shard': ['HF-Waveworn Shard', 'FF-Waveworn Shard'],
  // Fixed 2026-08-17: real tier names are Broken String (T1) / Spliced String (T2) / Solidified
  // String (T3) / Melodic String (T4), not the placeholder "HF-String"/"FF-String" — those never
  // matched any MATERIAL_IMAGES entry, so Lucilla's (and Freeze Frame/Fusion Accretion's)
  // skill-material row rendered with no picture at all.
  'String': ['Broken String', 'Spliced String', 'Solidified String', 'Melodic String'],
};

// [SECTION:MATERIAL_COSTS] — Total materials to max level
// Fixed 2026-08-21 (Planner audit): every cost below previously tracked only 2 of the game's real 4
// material tiers per family (T3/T4, the two most expensive), silently omitting T1/T2 entirely — a
// 30-50% undercount on every material total the app has ever shown. Re-derived from
// wutheringwaves.fandom.com's own live Lua rendering code (Module:Character Ascensions and Stats,
// Module:Weapon Ascensions and Stats — the exact formulas used to generate every character/weapon
// page's "Total Cost" figures) plus cross-verification against Lucilla's real rendered total on
// nanoka.cc (170,000 / 4 / 12 / 12 / 4 / 46 / 60 matches exactly). commonT1/commonT2 and
// forgeryT1/forgeryT2 are the newly-added tiers.

// Resonator Lv 1→90 ascension costs (all 6 phases). Per-phase (wiki Module:Character Ascensions and
// Stats asc_costs, A0-1 through A5-6): shell 5k/10k/15k/20k/40k/80k; commonT1 x4 (A0-1); specialty
// x4/8/12/16/20 (A1-2..A5-6, total 60); commonT2 x4/8 (A1-2,A2-3, total 12); boss x3/6/9/12/16
// (A1-2..A5-6, total 46); commonT3 x4/8 (A3-4,A4-5, total 12); commonT4 x4 (A5-6).
const RESONATOR_ASCENSION_COSTS = {
  boss: 46,
  commonT1: 4, commonT2: 12, commonT3: 12, commonT4: 4,
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

// All Forte nodes maxed (5 skills + inherent skills + stat bonuses). Verified against Lucilla's real
// rendered "Skill Materials" total on nanoka.cc: 2,030,000 shell / 25 / 28 / 40 / 57 / 26 / 25 / 28 /
// 55 / 67 — the commonT1(25)/commonT2(28)/forgeryT1(25)/forgeryT2(28) entries below were the ones
// previously missing.
const SKILL_UPGRADE_COSTS = {
  forgeryT1: 25, forgeryT2: 28, forgeryT3: 55, forgeryT4: 67,
  commonT1: 25, commonT2: 28, commonT3: 40, commonT4: 57,
  weeklyDrop: 26,
  shell: 2030000,
};

// Weapon refinement scaling — R1 = base (pv values), R2-R5 multiply pv values by these factors
// Standard WuWa scaling: each refinement adds 25% of base passive bonus
const WEAPON_REFINE_SCALE = [1, 1.25, 1.5, 1.75, 2];

// 5★ Weapon Lv 1→90 ascension costs (all 6 phases). Per-phase (wiki Module:Weapon Ascensions and
// Stats getAscensionCosts, rarity==5): shell 10k/20k/40k/60k/80k/120k; commonT1 x6; forgeryT1 x6,
// commonT2 x6; forgeryT2 x8, commonT3 x4; forgeryT3 x6, commonT3 x6 (commonT3 total 10); forgeryT4
// x8, commonT4 x4; forgeryT4 x12, commonT4 x8 (forgeryT4 total 20, commonT4 total 12).
const WEAPON_ASCENSION_COSTS_5 = {
  forgeryT1: 6, forgeryT2: 8, forgeryT3: 6, forgeryT4: 20,
  commonT1: 6, commonT2: 6, commonT3: 10, commonT4: 12,
  shell: 330000,
};

// 4★ Weapon Lv 1→90 ascension costs (same wiki module, rarity==4)
const WEAPON_ASCENSION_COSTS_4 = {
  forgeryT1: 5, forgeryT2: 7, forgeryT3: 5, forgeryT4: 17,
  commonT1: 5, commonT2: 5, commonT3: 9, commonT4: 11,
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
