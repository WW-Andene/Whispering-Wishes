// @ts-check
// French localization overlay for weapon data — data/weapons.js.
// Keyed by the exact same names as WEAPON_DATA so it can be shallow-merged
// in at render time based on the active locale. Same policy as echoes.fr.js:
// element names kept untranslated (official precedent), bespoke unconfirmed
// mechanic proper nouns (Frazzle, Bane, Chafe, Flare, Burst, Tune Break/
// Rupture/Strain, Off-Tune Rate) kept in English, everything else translated.
// "Sword" -> "Épée" and "Broadblade" -> "Sabre" are CONFIRMED official terms
// (Kuro's own French Play Store listing: "Qingxiao (Aero, Sabre)",
// "Jingran (Fusion, Épée)"). Pistols/Gauntlets/Rectifier -> Pistolets/
// Gantelets/Rectificateur are common, low-risk descriptive nouns (unconfirmed
// officially, but only ever used here in flavor-text prose, not as data keys).
//
// IMPORTANT: `passive` here is DISPLAY TEXT ONLY. calcEngine.js's
// parsePassive() regex-parses the raw English WEAPON_DATA[name].passive
// string as a fallback whenever WEAPON_DATA[name].pv is absent (36 of 122
// weapons lack pv). That code path always imports WEAPON_DATA directly and
// never this overlay, so translating passive here is safe — but never wire
// this file into calcEngine.js/calcTeamStats.js.

/** @type {Record<string, { name?: string, desc?: string, passive?: string }>} */
export const WEAPON_DATA_FR = {
  'Skull Thrasher': {
    name: 'Trancheur de Crânes',
    desc: "Arme signature de Rebecca (« Solitaire Éveillée »). Lancer la Compétence d'Intro confère un Bonus DGT d'Attaque Basique ; infliger Hack - Shifting confère un Bonus DGT d'Attaque Basique plus un buff d'ATQ pour toute l'équipe.",
    passive: "ATQ +12 %. Compétence d'Intro : DGT d'Attaque Basique personnels +24 % (14 s). Hack - Shifting : DGT d'Attaque Basique personnels +12 % (14 s), ATQ d'équipe +24 % (30 s). Les effets de même nom ne se cumulent pas.",
  },
  'Freeze Frame': {
    name: 'Image Figée',
    desc: "Arme signature de Lucilla (« Offrande de Lumière »). Infliger Glacio Chafe confère un Bonus DGT Glacio personnel et un buff d'ATQ pour toute l'équipe.",
    passive: "ATQ +12 %. Après avoir infligé Glacio Chafe : DGT Glacio personnels +30 % (12 s), ATQ d'équipe +24 % (30 s). Les effets de même nom ne peuvent pas se cumuler.",
  },
  'Spectral Trigger': {
    name: 'Gâchette Spectrale',
    desc: "Arme signature de Lucy (« Rêve Englouti »). La Compétence de Résonance confère un Bonus DGT Spectro personnel cumulable ; Hack - Shifting confère une Amplification DGT d'Attaque Lourde personnelle et Ignore DÉF.",
    passive: "ATQ +12 %. Compétence de Résonance : DGT Spectro personnels +20 % (14 s, jusqu'à 2 cumuls). Hack - Shifting : DGT d'Attaque Lourde personnels +30 %, Ignore DÉF +10 % (14 s).",
  },
  'Azure Oath': {
    name: 'Serment Azur',
    desc: "Arme signature de Yangyang : Xuanling (« Inflexible »). Infliger Havoc Bane confère une Amplification DGT d'Attaque Lourde personnelle et Ignore DÉF.",
    passive: "DGT tous éléments +12 %. Après avoir infligé Havoc Bane : DGT d'Attaque Lourde personnels +36 %, Ignore DÉF +12 % (8 s).",
  },
  'Frostburn': {
    name: 'Brûlure de Givre',
    desc: "Arme signature de Hiyuki (« Plus Moi-même »). Appliquer Glacio Chafe amplifie les DGT Glacio personnels et l'Ignore DÉF de Libération, plus une amplification de zone des DGT de Glacio Chafe sur le terrain.",
    passive: "ATQ +12 %. Après avoir appliqué Glacio Chafe : DGT Glacio personnels +28 %, Ignore DÉF de Libération de Résonance +10 %. Sur le terrain : DGT de Glacio Chafe à proximité +20 % (6 s, jusqu'à 1x/0,1 s). L'effet de même nom le plus fort s'applique.",
  },
  'Forged Dwarf Star': {
    name: 'Naine Forgée',
    desc: "Arme signature de Denia (« Dissolution »). Infliger Fusion Burst/Tune Strain confère un Bonus DGT de Libération personnel, s'étendant à un buff d'ATQ d'équipe pour de nouveaux déclenchements de Fusion Burst/Tune Strain.",
    passive: "ATQ +12 %. Après avoir infligé Fusion Burst/Tune Strain : DGT de Libération de Résonance personnels +36 % (5 s) ; pendant cette fenêtre, les membres de l'équipe infligeant Fusion Burst/Tune Strain gagnent ATQ +24 % (15 s). Les effets de même nom ne peuvent pas se cumuler.",
  },
  'Thousandfold Deliverance': {
    name: 'Délivrance Millénaire',
    desc: "Arme signature de Jingran (« Écoutez, Esprits et Étoiles »). Lancer la Compétence d'Intro ou obtenir un Bouclier accumule Dégâts Critiques et Ignore DÉF d'Attaque Lourde personnels, adapté à son kit centré sur le Bouclier et le scaling PV.",
    passive: "DGT tous éléments +12 %. Compétence d'Intro ou obtenir un Bouclier : Dégâts Critiques personnels +4 % (jusqu'à 6 cumuls/24 % ; à 6 cumuls, Taux Critique d'Attaque Lourde +12 %). Lancer une Attaque Lourde consomme jusqu'à 2 cumuls pour Ignore DÉF d'Attaque Lourde +15 % chacun (jusqu'à 30 %, 2 s).",
  },
  'Glint of Clouds': {
    name: 'Lueur des Nuages',
    desc: "Arme signature de Qingxiao. Lame de jade enveloppée de brume et de nuages. Bonus DGT Aero cumulable en infligeant Tune Strain - Shifting, ignorant la DÉF au maximum de cumuls.",
    passive: "ATQ +12 %. Infliger Tune Strain - Shifting confère un Bonus DGT Aero de 11,2 % (2 s, cumuls ×5, TRI 0,5 s) ; au maximum de cumuls, la durée s'étend à 30 s et les DGT Aero ignorent 10 % de DÉF.",
  },
  "Firstlight's Herald": {
    name: 'Héraut de la Première Lumière',
    desc: "Arme signature de Suisui. Rectificateur forgé à l'aube, gravé de la légende de l'oiseau divin. Confère des PV Max et une régénération d'énergie de Libération, culminant en un buff d'ATQ d'équipe.",
    passive: "PV Max +12 %. La Libération restaure 8 Énergie de Concerto (TRI 20 s). Infliger Glacio Chafe + appliquer un soin sur le terrain confère les deux effets au prochain Outro (6 s) ; avec les deux actifs, ATQ d'équipe +20 %.",
  },
  'Verdant Summit': {
    name: "Sommet verdoyant",    desc: "Arme signature de Jiyan. Lame verdoyante qui commande le vent. La Compétence d'Intro/Libération cumule les DGT d'Attaque Lourde.",
    passive: "Épée Assermentée : Bonus DGT tous éléments +12 %. Compétence d'Intro/Libération → DGT d'Attaque Lourde personnels +24 % (cumuls x2, 14 s).",
  },
  'Lustrous Razor': {
    name: "Lame lustrée",    desc: "5★ Standard. Lame affûtée jusqu'à un éclat lustré. Régén. d'Énergie avec DGT de Libération cumulables à l'usage de la Compétence.",
    passive: "Résolution Orageuse : Régén. d'Énergie +12,8 %. Compétence de Résonance → DGT de Libération de Résonance personnels +7 % (cumuls x3, 12 s).",
  },
  'Emerald of Genesis': {
    name: "Émeraude éternelle",    desc: "5★ Standard. Épée de jade d'origine ancienne. Régén. d'Énergie avec buff d'ATQ cumulable à l'usage de la Compétence.",
    passive: "Résolution Orageuse : Régén. d'Énergie +12,8 %. Compétence de Résonance → ATQ personnelle +6 % (cumuls x2, 10 s).",
  },
  'Static Mist': {
    name: "Brouillard stable",    desc: "5★ Standard. Pistolets enveloppés d'une brume persistante. Régén. d'Énergie avec buff d'ATQ pour le Résonateur entrant après l'Outro.",
    passive: "Résolution Orageuse : Régén. d'Énergie +12,8 %. Compétence d'Outro → ATQ du personnage entrant +10 % (14 s).",
  },
  'Abyss Surges': {
    name: 'Ressacs de l\'Abysse',
    desc: "5★ Standard. Gantelets chargés d'un pouvoir abyssal. Régén. d'Énergie avec buffs croisés de DGT Basique/Compétence.",
    passive: "Résolution Orageuse : Régén. d'Énergie +12,8 %. Coup de Compétence de Résonance → DGT d'Attaque Basique personnels +10 % (8 s). Coup d'Attaque Basique → DGT de Compétence de Résonance personnels +10 % (8 s).",
  },
  'Cosmic Ripples': {
    name: "Ondes cosmiques",    desc: "5★ Standard. Rectificateur résonnant avec des ondulations cosmiques. Régén. d'Énergie avec buff cumulable de DGT d'Attaque Basique au contact.",
    passive: "Résolution Orageuse : Régén. d'Énergie +12,8 %. DGT d'Attaque Basique → DGT d'Attaque Basique personnels +3,2 % (cumuls x5, 8 s, TRI 0,5 s).",
  },
  'Stringmaster': {
    name: "Main du marionnettiste",    desc: "Arme signature de Yinlin. Cordes qui orchestrent le destin lui-même. Bonus DGT avec ATQ cumulable sur les DGT de Compétence.",
    passive: "Amplification Électrique : Bonus DGT tous éléments +12 %. DGT de Compétence de Résonance → ATQ personnelle +12 % (cumuls x2, 5 s). Hors du terrain : ATQ supplémentaire +12 %.",
  },
  'Ages of Harvest': {
    name: "Cycles de saisons",    desc: "Arme signature de Jinhsi. Lame forgée d'âges de récolte et de détermination. Bonus DGT + double marque de DGT de Compétence.",
    passive: "Bonus DGT tous éléments +12 %, Compétence d'Intro/de Résonance → DGT de Compétence de Résonance +24 % chacun (cumulables).",
  },
  'Blazing Brilliance': {
    name: "Flamme rayonnée",    desc: "Arme signature de Changli. Épée embrasée d'un éclat immortel. ATQ avec DGT de Compétence de Résonance cumulables.",
    passive: "Phénix Écarlate : ATQ +12 %. Infliger des DGT → 1 cumul de Plume Ardente (TRI 0,5 s) ; Compétence de Résonance → 5 cumuls. Chaque cumul : DGT de Compétence de Résonance personnels +4 % (max x14/+56 % ; se réinitialise 12 s après avoir atteint le plafond).",
  },
  'Rime-Draped Sprouts': {
    name: "Germe de glacier",    desc: "Arme signature de Zhezhi. Pousses embrassées de givre qui fleurissent dans le calme. Buff de DGT d'Attaque Basique reporté hors du terrain via l'Outro.",
    passive: "Panorama : ATQ +12 %. Sur le terrain : Compétence de Résonance → DGT d'Attaque Basique personnels +12 % (cumuls x3, 6 s). À 3 cumuls, la Compétence d'Outro les consomme → DGT d'Attaque Basique +52 % pendant 27 s (fonctionne hors du terrain).",
  },
  "Verity's Handle": {
    desc: "Arme signature de Xiangli Yao. Poignée qui dévoile la vérité de la véracité. Bonus DGT avec buff de DGT de Libération prolongeable.",
    passive: "Ad Veritatem : Bonus DGT tous éléments +12 %. Libération → DGT de Libération de Résonance personnels +48 % (8 s), prolongés de +5 s par lancer de Compétence (jusqu'à 3 fois).",
  },
  'Stellar Symphony': {
    name: "Symphonie stellaire",    desc: "Arme signature de Shorekeeper. Symphonie résonnant à travers la mer stellaire. Buff de PV, restauration de Concerto, ATQ d'équipe en soignant.",
    passive: "Évolution Astrale : PV +12 %. La Libération restaure 8 Énergie de Concerto (1x/20 s). Compétence de Soin → ATQ d'équipe +14 % pendant 30 s.",
  },
  'Red Spring': {
    name: "Printemps acéré",    desc: "Arme signature de Camellya. Lame pourpre s'épanouissant comme une fleur de printemps rouge. Buff d'ATQ avec DGT d'Attaque Basique cumulables.",
    passive: "ATQ +12 %, DGT d'Attaque Basique +10 % par cumul (max x3), +40 % DGT Basiques quand l'Énergie de Concerto est consommée.",
  },
  'The Last Dance': {
    name: "La Dernière Danse",    desc: "Arme signature de Carlotta. Pistolets élégants pour une dernière danse parfaite. Buff d'ATQ avec DGT de Compétence de Résonance sur Intro/Libération.",
    passive: "ATQ +12 %, Intro/Libération → DGT de Compétence de Résonance +48 % pendant 5 s.",
  },
  'Tragicomedy': {
    name: "Tragi-comédie",    desc: "Arme signature de Roccia. Gantelets nés de la comédie et de la tragédie entrelacées. ATQ avec DGT d'Attaque Lourde cumulables.",
    passive: "Vocalise du Fou : ATQ +12 %. Attaque Basique/Compétence d'Intro → DGT d'Attaque Lourde personnels +48 % (3 s).",
  },
  'Luminous Hymn': {
    name: "Hymne Lumineux",    desc: "Arme signature de Phoebe. Rectificateur couronné de lumière sacrée. ATQ avec DGT d'Attaque Basique/Lourde cumulables sur les DGT de Frazzle.",
    passive: "Hymne du Bâtisseur : ATQ +12 %. DGT sur des cibles en Spectro Frazzle → DGT d'Attaque Basique et Lourde personnels +14 % (cumuls x3, 6 s). Compétence d'Outro → Amplification DGT de Spectro Frazzle +30 % (30 s) autour du Résonateur actif.",
  },
  'Unflickering Valor': {
    name: "Courage Impérissable",    desc: "Arme signature de Brant. Épée de bravoure inébranlable et de détermination ardente. Taux Critique avec DGT d'Attaque Basique cumulables.",
    passive: "Le Rire Triomphe : Taux Critique +8 %. Libération → DGT d'Attaque Basique personnels +24 % (10 s). DGT d'Attaque Basique → DGT d'Attaque Basique personnels +24 % (4 s).",
  },
  'Whispers of Sirens': {
    name: "Murmures des Sirènes",    desc: "Arme signature de Cantarella. Rectificateur murmurant des chants de sirène de ruine. ATQ avec DGT d'Attaque Basique déclenchés par la Compétence d'Écho et Ignore RÉS Havoc.",
    passive: "Depuis les Profondeurs : ATQ +12 %. Compétence d'Écho dans les 10 s suivant la Compétence d'Intro/Attaque Basique → cumul de Doux Rêve (max x2, déclenchement 1x/10 s). À 1 cumul : DGT d'Attaque Basique personnels +40 %. À 2 cumuls : ignore 12 % de RÉS Havoc.",
  },
  'Blazing Justice': {
    name: 'Justice Flamboyante',
    desc: "Arme signature de Zani. Gantelets embrasés d'une justice inflexible. Renforce l'ATQ avec Ignore DÉF et Amplification Frazzle.",
    passive: "Briseuse d'Obscurité : ATQ +12 %. Attaque Basique → Ignore DÉF +8 %, Amplification DGT de Spectro Frazzle +50 % (6 s, un nouveau déclenchement réinitialise la durée).",
  },
  'Woodland Aria': {
    name: 'Aria Sylvestre',
    desc: "Arme signature de Ciaccona. Pistolets chantant un air forestier de vent et de feuilles. Renforce les DGT Aero avec réduction de RÉS.",
    passive: "Air Estival Persistant : ATQ +12 %. Infliger Érosion Aero → DGT Aero personnels +24 % (10 s). Toucher des cibles en Érosion Aero → RÉS Aero -10 % (20 s).",
  },
  "Defier's Thorn": {
    name: 'Épine du Défiant',
    desc: "Arme signature de Cartethyia. Épée épineuse d'un cœur rebelle. Scaling PV avec Ignore DÉF et Amplification DGT d'Érosion Aero.",
    passive: "Tarentelle du Chevalier Libre : PV +12 %. Dans les 15 s suivant la Compétence d'Intro/Attaque Basique : Ignore DÉF +8 %. Les cibles avec ≥1 cumul d'Érosion Aero subissent +20 % DGT.",
  },
  'Wildfire Mark': {
    name: 'Marque du Feu Sauvage',
    desc: "Arme signature de Lupa. Sabre marqué par le feu sauvage et la fureur. Renforce les DGT de Libération avec un buff Fusion d'équipe.",
    passive: "ATQ +12 %, DGT de Libération de Résonance +24 %, DGT Fusion d'équipe +24 %.",
  },
  'Lethean Elegy': {
    name: 'Élégie du Léthé',
    desc: "Arme signature de Phrolova. Rectificateur tissant une élégie de chagrins oubliés. ATQ avec buffs personnels déclenchés par la Compétence d'Écho.",
    passive: "Requiem des Enfers : ATQ +12 %. Dans les 12 s suivant des DGT de Compétence d'Écho : DGT de Compétence de Résonance personnels +32 %, DGT de Compétence d'Écho +32 %, Ignore DÉF +8 %.",
  },
  'Thunderflare Dominion': {
    name: 'Domaine de la Foudre',
    desc: "Arme signature d'Augusta. Sabre crépitant de la domination de l'éclair. ATQ avec DGT d'Attaque Lourde et Ignore DÉF cumulable via Bouclier.",
    passive: "Éminence Fulgurante : ATQ +12 %. Compétence d'Intro/de Résonance → DGT d'Attaque Lourde personnels +20 % (15 s). Obtenir un Bouclier → les DGT d'Attaque Lourde ignorent 7,2 % de DÉF (cumuls x5, 7 s, TRI 0,5 s).",
  },
  "Moongazer's Sigil": {
    name: 'Sceau du Contemplateur de Lune',
    desc: "Arme signature d'Iuno. Gantelets portant le sceau d'une prophétie lunaire. ATQ avec DGT de Libération et Ignore DÉF cumulable via Bouclier.",
    passive: "Splendeur de la Pleine Lune : ATQ +12 %. Compétence d'Intro/Libération → DGT de Libération de Résonance personnels +20 % (15 s). Obtenir un Bouclier → les DGT de Libération ignorent 7,2 % de DÉF (cumuls x5, 7 s, TRI 0,5 s ; la Compétence d'Intro maximise les cumuls instantanément).",
  },
  'Lux & Umbra': {
    name: 'Lux & Umbra',
    desc: "Arme signature de Galbrena. Pistolets jumeaux de lumière et d'ombre entrelacées. ATQ avec buff croisé DGT de Compétence d'Écho/Attaque Lourde.",
    passive: "Vers le Feu Elle Revient : ATQ +12 %. DGT de Compétence d'Écho → DGT d'Attaque Lourde personnels +24 % (6 s). DGT d'Attaque Lourde → DGT de Compétence d'Écho personnels +24 % (6 s). Les deux actifs : Ignore DÉF +8 %.",
  },
  'Emerald Sentence': {
    name: 'Sentence d\'Émeraude',
    desc: "Arme signature de Qiuyuan. Épée de jade prononçant une sentence émeraude contre les injustes. ATQ avec DGT d'Attaque Lourde déclenchés par la Compétence d'Écho et buff d'équipe.",
    passive: "Quand un Cœur se Pose : ATQ +12 %. Compétence d'Écho dans les 10 s suivant la Compétence d'Intro/Attaque Basique → DGT d'Attaque Lourde personnels +12 % (cumuls x2, 30 s, intervalle de déclenchement 10 s). Compétence d'Intro → DGT de Compétence d'Écho d'équipe +20 % (30 s).",
  },
  'Kumokiri': {
    name: 'Kumokiri',
    desc: "Arme signature de Chisa. Lame voilée de brume qui tranche le brouillard et le destin. Renforce les DGT de Libération et tous types de DGT.",
    passive: "Fil du Destin : ATQ +12 %. Compétence d'Intro/infliger un État Négatif → DGT de Libération de Résonance personnels +8 % (cumuls x3, 15 s). Au maximum de cumuls, l'équipe infligeant un État Négatif → Bonus DGT tous éléments +24 % (15 s).",
  },
  'Spectrum Blaster': {
    name: 'Blaster Spectral',
    desc: "Arme signature de Lynae. Pistolets qui tirent une lumière prismatique à travers le spectre. Renforce les DGT d'Attaque Basique et cumule les DGT totaux d'équipe sur Tune Break.",
    passive: "ATQ +12 %, DGT d'Attaque Basique personnels +36 % (4 s) au coup d'Intro/Attaque Basique, DGT totaux d'équipe +8 %/cumul ×3 (max 24 %, 30 s) sur Tune Rupture/Strain - Shifting pendant l'Attaque Basique.",
  },
  'Starfield Calibrator': {
    name: 'Calibreur Stellaire',
    desc: "Arme signature de Mornye. Sabre calibré sur le rythme du champ stellaire. Scaling DÉF avec buff de Dégâts Critiques d'équipe.",
    passive: "DÉF +16 %, Concerto +8 (1x/20 s), Dégâts Critiques d'équipe +20 % (4 s) en soignant.",
  },
  'Everbright Polestar': {
    name: 'Étoile Polaire Éternelle',
    desc: "Arme signature d'Aemeath. Épée rayonnant de la lumière de l'étoile polaire toujours brillante. Ignore DÉF avec Ignore RÉS Fusion.",
    passive: "Bonus DGT tous éléments +12 %, Ignore DÉF +32 %, Ignore RÉS Fusion +10 %.",
  },
  "Daybreaker's Spine": {
    name: 'Épine de l\'Aube Brisée',
    desc: "Arme signature de Luuk Herssen. Gantelets forgés à partir de l'épine d'un briseur d'aube. Renforce l'Attaque Basique et les DGT Spectro.",
    passive: "ATQ +12 %, Amplification DGT d'Attaque Basique +20 %, DGT Spectro +20 %, Ignore DÉF +10 %.",
  },
  'Radiance Cleaver': {
    name: 'Fendoir de Radiance',
    desc: "5★ Standard. Sabre synthétique de force concentrée. ATQ avec DGT de Libération sur les coups portés à une cible en Tune Strain - Interfered.",
    passive: "Briseur de Lame : ATQ +12 %. DGT sur des cibles en Tune Strain - Interfered → DGT de Libération de Résonance personnels +24 % (3 s, un nouveau déclenchement réinitialise la durée).",
  },
  'Laser Shearer': {
    name: 'Cisaille Laser',
    desc: "5★ Standard. Épée synthétique qui tranche l'incertitude. ATQ avec DGT de Compétence sur les coups portés à une cible en Tune Strain - Interfered.",
    passive: "Capteur de Signal : ATQ +12 %. DGT sur des cibles en Tune Strain - Interfered → DGT de Compétence de Résonance personnels +24 % (3 s, un nouveau déclenchement réinitialise la durée).",
  },
  'Phasic Homogenizer': {
    name: 'Homogénéisateur Phasique',
    desc: "5★ Standard. Pistolets synthétiques d'une concentration perçante. ATQ avec Bonus DGT tous éléments quand un coéquipier lance une compétence de Tune Break.",
    passive: "Porteur d'Intuition : ATQ +12 %. Un membre de l'équipe lance une compétence de Tune Break → Bonus DGT tous éléments personnel +20 % (14 s).",
  },
  'Pulsation Bracer': {
    name: 'Brassard de Pulsation',
    desc: "5★ Standard. Gantelets synthétiques pulsant d'une poussée décisive. ATQ avec DGT d'Attaque Basique cumulables sur les coups portés à une cible en Tune Strain - Interfered.",
    passive: "Briseur de Barrière : ATQ +12 %. DGT sur des cibles en Tune Strain - Interfered → DGT d'Attaque Basique personnels +6 % (cumuls x3, 4 s, TRI 0,5 s, un nouveau déclenchement réinitialise la durée).",
  },
  'Boson Astrolabe': {
    name: 'Astrolabe à Bosons',
    desc: "5★ Standard. Rectificateur synthétique cartographiant les possibilités stellaires. ATQ et DGT d'Attaque Basique quand un coéquipier lance une compétence de Tune Break.",
    passive: "Observateur de Trajectoire : ATQ +12 %. Un membre de l'équipe lance une compétence de Tune Break → ATQ personnelle +12 %, DGT d'Attaque Basique +12 % (14 s).",
  },
  "Bloodpact's Pledge": {
    name: 'Serment du Pacte de Sang',
    desc: "5★ Standard. Épée scellée par un pacte de sang inviolable. Le soin renforce les DGT de Compétence de Résonance.",
    passive: "Soin → DGT de Compétence de Résonance +10 % pendant 6 s. DGT Aero +10 % pendant 30 s.",
  },
  'Solsworn Ciphers': {
    name: 'Chiffres Ensoleillés',
    desc: "Arme signature de Sigrika. Gantelets gravés de chiffres solaires. Amplification DGT de Compétence d'Écho + Ignore DÉF.",
    passive: "ATQ +12 %. Compétence d'Intro/d'Écho → Amplification DGT de Compétence d'Écho +32 % pendant 15 s. Compétence d'Écho → Ignore DÉF Aero +10 %.",
  },
  'Discord': {
    name: "Discorde",    desc: "Adagio descendant, le rideau ne tombe jamais. Restaure l'Énergie de Concerto à l'usage de la Compétence.",
    passive: "Compétence de Résonance → restaure 8 Énergie de Concerto (recharge 20 s).",
  },
  'Variation': {
    name: "Variation fantastique",    desc: "Adagio descendant, changeant l'air de la bataille. Restaure l'Énergie de Concerto à l'usage de la Compétence.",
    passive: "Compétence de Résonance → restaure 8 Énergie de Concerto (recharge 20 s).",
  },
  'Marcato': {
    name: 'Marcato',
    desc: "Adagio descendant, brisant tout comme un hymne mortel. Restaure l'Énergie de Concerto à l'usage de la Compétence.",
    passive: "Compétence de Résonance → restaure 8 Énergie de Concerto (recharge 20 s).",
  },
  'Lunar Cutter': {
    name: "Tailleur lunaire",    desc: "Épée née de la lumière d'une étoile étrangère. Gagne des cumuls d'ATQ à l'entrée sur le terrain.",
    passive: "Entrée sur le terrain → 6 cumuls de Serment, chacun +2 % ATQ (max 6 cumuls/+12 %). Perd 1 cumul toutes les 2 s. Sur élimination : regagne 6 cumuls. Recharge de 12 s sur le déclenchement à l'entrée.",
  },
  'Thunderbolt': {
    name: "Tonnerre",    desc: "Pistolets cérémoniels de Huanglong, résilients et endurants. DGT de Compétence cumulables sur coups d'Attaque Basique/Lourde.",
    passive: "Coup d'Attaque Basique/Lourde → DGT de Compétence de Résonance +7 % par cumul (max x3, 10 s par cumul, intervalle de déclenchement 1 s).",
  },
  'Overture': {
    name: "Le Fendeur",    desc: "Crescendo ascendant, un glorieux prélude tranchant. Restaure l'Énergie de Concerto à l'usage de la Compétence.",
    passive: "Compétence de Résonance → restaure 8 Énergie de Concerto (recharge 20 s).",
  },
  'Cadenza': {
    name: 'Cadenza',
    desc: "Crescendo ascendant, symphonie tonitruante de destruction. Restaure l'Énergie de Concerto à l'usage de la Compétence.",
    passive: "Compétence de Résonance → restaure 8 Énergie de Concerto (recharge 20 s).",
  },
  "Ocean's Gift": {
    desc: "Rectificateur béni par la mer, espoir d'un pêcheur. DGT Spectro cumulables contre les ennemis en Frazzle.",
    passive: "DGT sur des ennemis en Spectro Frazzle → +6 % DGT Spectro par 1 s (max x4, 6 s).",
  },
  'Waltz in Masquerade': {
    name: "Valse en Masque",    desc: "Danses tourbillonnantes dissimulant des secrets chuchotés. ATQ cumulable sur les coups en État Négatif.",
    passive: "DGT sur des ennemis en État Négatif → ATQ +4 % (max x4, 10 s).",
  },
  'Legend of Drunken Hero': {
    name: "Légende du Héros Ivre",    desc: "Le vin donne du courage mais émousse les sens. ATQ cumulable sur les coups en État Négatif.",
    passive: "DGT sur des ennemis en État Négatif → ATQ +4 % (max x4, 10 s).",
  },
  'Romance in Farewell': {
    name: "Amour en Adieu",    desc: "Pistolets gravés d'une promesse d'adieu et d'un chagrin persistant. ATQ cumulable sur les coups en État Négatif.",
    passive: "DGT sur des ennemis en État Négatif → ATQ +4 % (max x4, 10 s).",
  },
  'Fables of Wisdom': {
    name: "Fables de Sagesse",    desc: "Épée gravée de fables spirituelles cachant la vérité. ATQ cumulable sur les coups en État Négatif.",
    passive: "DGT sur des ennemis en État Négatif → ATQ +4 % (max x4, 10 s).",
  },
  'Meditations on Mercy': {
    name: "Méditations sur la Grâce",    desc: "Sabre d'un guerrier déchiré entre punition et pitié. ATQ cumulable sur les coups en État Négatif.",
    passive: "DGT sur des ennemis en État Négatif → ATQ +4 % (max x4, 10 s).",
  },
  'Call of the Abyss': {
    name: "Appel du Vide",    desc: "Sceptre d'une domination perdue et d'une grandeur fanée. Boost de Bonus de Soins après la Libération.",
    passive: "Libération → Bonus de Soins +16 % pendant 15 s.",
  },
  'Somnoire Anchor': {
    name: "Ancre de Somnoire",    desc: "Ancre du Gardien des Rêves venue des rivages du crépuscule. Buff d'ATQ cumulable en infligeant des DGT.",
    passive: "Infliger des DGT → 1 cumul de Sifflement par 1 s, chacun +2 % ATQ (max x10, 3 s/cumul). Sortir du terrain efface tout. À 10 cumuls : Taux Critique +6 %.",
  },
  'Fusion Accretion': {
    name: "Accrétion de fusion",    desc: "Prototype des Rives Noires canalisant le rayonnement d'un blazar. La Compétence confère de l'Énergie de Résonance et un buff d'ATQ.",
    passive: "Compétence de Résonance → +6 Énergie de Résonance, ATQ +10 % pendant 16 s (recharge 20 s).",
  },
  'Celestial Spiral': {
    name: "Spirale céleste",    desc: "Rayonnement galactique en spirale vers une fin tragique. La Compétence confère de l'Énergie de Résonance et un buff d'ATQ.",
    passive: "Compétence de Résonance → +6 Énergie de Résonance, ATQ +10 % pendant 16 s (recharge 20 s).",
  },
  'Relativistic Jet': {
    name: "Jets relativistes",    desc: "La course incessante d'un blazar vers la destruction cosmique. La Compétence confère de l'Énergie de Résonance et un buff d'ATQ.",
    passive: "Compétence de Résonance → +6 Énergie de Résonance, ATQ +10 % pendant 16 s (recharge 20 s).",
  },
  'Endless Collapse': {
    name: "Effondrement éternel",    desc: "Le cœur effondré d'un blazar mourant. La Compétence confère de l'Énergie de Résonance et un buff d'ATQ.",
    passive: "Compétence de Résonance → +6 Énergie de Résonance, ATQ +10 % pendant 16 s (recharge 20 s).",
  },
  'Waning Redshift': {
    name: "Spectre en déclin",    desc: "Le rayonnement déclinant d'un blazar à travers des milliards d'années-lumière. La Compétence confère de l'Énergie de Résonance et un buff d'ATQ.",
    passive: "Compétence de Résonance → +6 Énergie de Résonance, ATQ +10 % pendant 16 s (recharge 20 s).",
  },
  'Lumingloss': {
    name: "Lumineux",    desc: "Épée lumineuse au tranchant cérémoniel brillant. Boost de DGT d'Attaque Basique et Lourde après la Compétence.",
    passive: "Compétence de Résonance → DGT d'Attaque Basique et Lourde +20 % pendant 10 s (1 cumul max, intervalle de déclenchement 1 s).",
  },
  'Commando of Conviction': {
    name: "Commando de la Conviction",    desc: "Les esprits s'unissent dans des gorges retentissantes de bravoure. Boost d'ATQ sur la Compétence d'Intro.",
    passive: "Compétence d'Intro → ATQ +15 % pendant 15 s.",
  },
  'Jinzhou Keeper': {
    name: "Gardien de Jinzhou",    desc: "Regard vigilant tourné vers le nord, où la pluie voile la cité. Boost d'ATQ et de PV sur la Compétence d'Intro.",
    passive: "Compétence d'Intro → ATQ +8 %, PV +10 % pendant 15 s.",
  },
  'Comet Flare': {
    name: "Comète éclatant",    desc: "Lumière stellaire étrangère forgée délicate et réactive. Bonus de Soins cumulable sur les coups d'Attaque Basique/Lourde.",
    passive: "Coup d'Attaque Basique/Lourde → Bonus de Soins +3 % (max x3, 8 s).",
  },
  'Augment': {
    name: "Dévoisant",    desc: "Ginkgo doré de la résilience de Huanglong. Boost d'ATQ après l'usage de la Libération.",
    passive: "Libération → ATQ +15 % pendant 15 s.",
  },
  'Hollow Mirage': {
    name: "Mirage creux",    desc: "Lumière creuse d'une étrange étoile dissimulant une force immense. Cumuls d'Armure de Fer sur la Libération.",
    passive: "Libération → 3 cumuls d'Armure de Fer, chacun +3 % ATQ et +3 % DÉF (max 3 cumuls, sans durée ; perd 1 cumul en subissant des DGT).",
  },
  'Stonard': {
    name: 'Stonard',
    desc: "Gantelets cérémoniels du magistrat de Huanglong. Boost de DGT de Libération après la Compétence.",
    passive: "Compétence de Résonance → DGT de Libération +18 % pendant 15 s.",
  },
  'Amity Accord': {
    name: 'Accord Amical',
    desc: "Camaraderie des rangers, armure contre le froid des étoiles. Boost de DGT de Libération sur la Compétence d'Intro.",
    passive: "Compétence d'Intro → DGT de Libération +20 % pendant 15 s.",
  },
  'Novaburst': {
    name: "Éclat de Nova",    desc: "Pistolets qui explosent d'une force semblable à une nova. Boost d'ATQ cumulable au dash/à l'esquive.",
    passive: "Dash/esquive → ATQ +4 % (max x3, 8 s).",
  },
  'Undying Flame': {
    name: "Flamme divine",    desc: "Pistolets brûlant d'une flamme immortelle. Boost de DGT de Compétence sur la Compétence d'Intro.",
    passive: "Compétence d'Intro → DGT de Compétence de Résonance +20 % pendant 15 s.",
  },
  'Helios Cleaver': {
    name: 'Fendoir Hélios',
    desc: "Sabre forgé dans le feu solaire. Buff d'ATQ cumulable graduellement après l'usage de la Compétence.",
    passive: "Après la Compétence de Résonance → ATQ +3 % toutes les 2 s (max x4, 12 s).",
  },
  'Dauntless Evernight': {
    name: "Intrépide éternel",    desc: "Sabre qui tranche à travers la plus longue des nuits. Boost d'ATQ et de DÉF sur la Compétence d'Intro.",
    passive: "Compétence d'Intro → ATQ +8 %, DÉF +15 % pendant 15 s.",
  },
  'Autumntrace': {
    name: 'Trace d\'Automne',
    desc: "Ginkgo doré de Huanglong, prospère et durable. ATQ cumulable sur coups d'Attaque Basique/Lourde.",
    passive: "DGT d'Attaque Basique/Lourde → ATQ +4 % par cumul (max x5, 7 s par cumul, intervalle de déclenchement 1 s).",
  },
  'Solar Flame': {
    name: 'Flamme Solaire',
    desc: "Pistolets brûlant d'un feu solaire. ATQ et DGT d'Attaque Lourde cumulables au contact.",
    passive: "Attaque Basique/Lourde → ATQ +2,2 %, DGT d'Attaque Lourde +2,2 % (max x4, 7 s).",
  },
  'Feather Edge': {
    name: 'Lame de Plume',
    desc: "Épée légère comme une plume mais tranchante comme une lame. Boost d'ATQ et de DGT de Libération après la Libération.",
    passive: "Libération → ATQ +7,2 %, DGT de Libération +10,8 % pendant 15 s.",
  },
  'Broadblade#41': {
    name: "Épée #41",    desc: "Sabre fabricable. Boost d'ATQ et de soin selon que les PV sont hauts ou bas.",
    passive: "PV >80 % → ATQ +12 %. PV <40 % → soigne 5 % à l'ATQ.",
  },
  'Sword#18': {
    name: "Épée #18",    desc: "Épée de série améliorée fabriquée à Huanglong. Conçue pour les guerriers aguerris.",
    passive: "Aube : PV <40 % → DGT d'Attaque Lourde +18 %, soigne 5 % des PV au coup d'Attaque Lourde (recharge 8 s).",
  },
  'Gauntlets#21D': {
    name: "Gantelets #21D",    desc: "Gantelets fabricables. Conception axée sur la contre-attaque avec soutien adaptatif.",
    passive: "Maître à Penser : Dash/esquive → ATQ +8 %, DGT de Contre d'Esquive +50 % pendant 8 s, soigne 5 % des PV sur une Contre (recharge 6 s).",
  },
  'Rectifier#25': {
    name: "Amplificateur #25",    desc: "Rectificateur fabricable. Soutien adaptatif avec soin conditionnel ou buff d'ATQ.",
    passive: "Porteur d'Aube : Compétence → PV <60 % : soigne 5 % des PV (recharge 8 s) ; PV ≥60 % : ATQ +12 % pendant 10 s.",
  },
  'Pistols#26': {
    name: "Pistolets #26",    desc: "Pistolets fabricables. Buff d'ATQ cumulable en évitant les dégâts.",
    passive: "Omniscient : Aucun DGT subi → ATQ +6 % toutes les 5 s (max 2 cumuls, 8 s). Subir des DGT : perd 1 cumul, soigne 5 % des PV.",
  },
  'Aureate Zenith': {
    name: 'Zénith Doré',
    desc: "Sabre du Passe de Combat aux gravures inspirées de Griffrex. ATQ et DGT d'Attaque Lourde après la Libération.",
    passive: "Serment des Chasseurs de Marée : Après la Libération → ATQ +7,2 %, DGT d'Attaque Lourde +10,8 % pendant 15 s.",
  },
  'Aether Strike': {
    name: 'Frappe d\'Éther',
    desc: "Gantelets du Passe de Combat aux gravures inspirées de Griffrex. ATQ et DGT de Libération après la Libération.",
    passive: "Serment des Chasseurs de Marée : Après la Libération → ATQ +7,2 %, DGT de Libération +10,8 % pendant 15 s.",
  },
  'Radiant Dawn': {
    name: 'Aube Radieuse',
    desc: "Rectificateur du Passe de Combat aux gravures inspirées de Griffrex. ATQ et DGT d'Attaque Basique après la Compétence.",
    passive: "Serment des Chasseurs de Marée : Après la Compétence → ATQ +9 %, DGT d'Attaque Basique +9 % pendant 10 s.",
  },
  'Guardian Sword': {
    name: "Épée du Gardien",    desc: "Épée fabricable forgée à Jinzhou. Renforce l'efficacité de la Compétence de Résonance.",
    passive: "Unifié : DGT de Compétence de Résonance +12 %.",
  },
  'Guardian Pistols': {
    name: "Pistolets du Gardien",    desc: "Pistolets fabricables forgés à Jinzhou. Renforce l'efficacité de la Compétence de Résonance.",
    passive: "Unité : DGT de Compétence de Résonance +12 %.",
  },
  'Guardian Gauntlets': {
    name: "Gantelets du Gardien",    desc: "Gantelets fabricables forgés à Jinzhou. Renforce l'efficacité de la Libération.",
    passive: "Force Collective : DGT de Libération de Résonance +12 %.",
  },
  'Guardian Rectifier': {
    name: "Amplificateur du Gardien",    desc: "Rectificateur fabricable forgé à Jinzhou. Renforce l'Attaque Basique et l'Attaque Lourde.",
    passive: "Camaraderie : DGT d'Attaque Basique et Lourde +12 %.",
  },
  'Guardian Broadblade': {
    name: "Sabre du Gardien",    desc: "Sabre fabricable forgé à Jinzhou. Renforce l'efficacité de l'Attaque Basique et de l'Attaque Lourde.",
    passive: "Consensus : DGT d'Attaque Basique et Lourde +12 %.",
  },
  'Sword of Voyager': {
    name: "Épée du Voyageur",    desc: "Épée de voyage conçue pour l'aventure prolongée. Restaure de l'énergie à l'usage de la Compétence.",
    passive: "Croisade : Compétence de Résonance → restaure 8 Énergie de Résonance (recharge 20 s).",
  },
  'Pistols of Voyager': {
    name: "Pistolets du Voyageur",    desc: "Pistolets de voyage conçus pour l'aventure prolongée. Restaurent de l'énergie à l'usage de la Compétence.",
    passive: "Long Voyage : Compétence de Résonance → restaure 8 Énergie de Résonance (recharge 20 s).",
  },
  'Gauntlets of Voyager': {
    name: "Gantelets du Voyageur",    desc: "Gantelets de voyage conçus pour l'aventure prolongée. Restaurent de l'énergie à l'usage de la Compétence.",
    passive: "Croisade : Compétence de Résonance → restaure 8 Énergie de Résonance (recharge 20 s).",
  },
  'Rectifier of Voyager': {
    name: "Amplificateur du Voyageur",    desc: "Rectificateur de voyage conçu pour l'aventure prolongée. Restaure de l'énergie à l'usage de la Compétence.",
    passive: "Croisade : Compétence de Résonance → restaure 8 Énergie de Résonance (recharge 20 s).",
  },
  'Broadblade of Voyager': {
    name: "Sabre du Voyageur",    desc: "Sabre de voyage conçu pour l'aventure prolongée. Restaure de l'énergie à l'usage de la Compétence.",
    passive: "Long Voyage : Compétence de Résonance → restaure 8 Énergie de Résonance (recharge 20 s).",
  },
  'Sword of Night': {
    name: "Épée de Nuit",    desc: "Épée forgée à minuit. Renforce le porteur à l'entrée sur le terrain.",
    passive: "Vaillance : Compétence d'Intro → ATQ +8 % pendant 10 s.",
  },
  'Pistols of Night': {
    name: "Pistolets de Nuit",    desc: "Pistolets forgés à minuit. Renforcent le porteur à l'entrée sur le terrain.",
    passive: "Vaillance : Compétence d'Intro → ATQ +8 % pendant 10 s.",
  },
  'Gauntlets of Night': {
    name: "Gantelets de Nuit",    desc: "Gantelets forgés à minuit. Renforcent le porteur à l'entrée sur le terrain.",
    passive: "Vaillance : Compétence d'Intro → ATQ +8 % pendant 10 s.",
  },
  'Rectifier of Night': {
    name: "Amplificateur de Nuit",    desc: "Rectificateur forgé à minuit. Renforce le porteur à l'entrée sur le terrain.",
    passive: "Vaillance : Compétence d'Intro → ATQ +8 % pendant 10 s.",
  },
  'Broadblade of Night': {
    name: "Sabre de nuit",    desc: "Sabre forgé à minuit. Renforce le porteur à l'entrée sur le terrain.",
    passive: "Vaillance : Compétence d'Intro → ATQ +8 % pendant 10 s.",
  },
  'Originite: Type I': {
    name: 'Originite : Type I',
    desc: "Sabre de l'Académie Huaxu pour la vérification technique. Soigne à l'usage de la Compétence.",
    passive: "Tempérance : Compétence de Résonance → soigne 3 % des PV Max (recharge 12 s).",
  },
  'Originite: Type II': {
    name: 'Originite : Type II',
    desc: "Épée de l'Académie Huaxu pour la vérification technique. Soigne à l'usage de la Libération.",
    passive: "Anéantir : Libération de Résonance → soigne 5 % des PV Max (recharge 20 s).",
  },
  'Originite: Type III': {
    name: 'Originite : Type III',
    desc: "Pistolets de l'Académie Huaxu pour la vérification technique. Soignent sur Contre d'Esquive.",
    passive: "Célérité : Contre d'Esquive → soigne 1,6 % des PV Max (recharge 6 s).",
  },
  'Originite: Type IV': {
    name: 'Originite : Type IV',
    desc: "Gantelets de l'Académie Huaxu pour la vérification technique. Soignent au coup d'Attaque Basique.",
    passive: "Rajeunir : DGT d'Attaque Basique → soigne 0,5 % des PV Max (recharge 3 s).",
  },
  'Originite: Type V': {
    name: 'Originite : Type V',
    desc: "Rectificateur de l'Académie Huaxu pour la vérification technique. Soigne sur la Compétence d'Intro.",
    passive: "Augmenter : Compétence d'Intro → soigne 5 % des PV Max (recharge 20 s).",
  },
  'Beguiling Melody': {
    name: "Voix céleste",    desc: "Forgée à partir de l'écaille de Jué. Ressemble plus à un instrument de musique qu'à une arme.",
    passive: "Toucher Gracieux : Compétence d'Intro → restaure 4 Énergie de Concerto ; Compétence d'Outro → restaure 4 Énergie de Résonance.",
  },
  'Tyro Sword': {
    name: "Sabre Tyro",    desc: "La naissance de marées révolutionnaires. Une épée conçue pour les Résonateurs novices. Recèle une puissance à ne pas sous-estimer sous son apparence simple.",
    passive: "Prologue : ATQ +5 %.",
  },
  'Tyro Rectifier': {
    name: "Amplificateur Tyro",    desc: "L'origine de la genèse universelle. Un Rectificateur conçu pour les Résonateurs novices. Recèle une puissance à ne pas sous-estimer sous son apparence simple.",
    passive: "Prologue : ATQ +5 %.",
  },
  'Tyro Gauntlets': {
    name: "Gantelets Tyro",    desc: "L'aube d'une entreprise durable. Une paire de gantelets conçus pour les Résonateurs novices. Recèle une puissance à ne pas sous-estimer sous son apparence simple.",
    passive: "Prologue : ATQ +5 %.",
  },
  'Tyro Pistols': {
    name: "Pistolets Tyro",    desc: "L'origine d'une aventure vaillante. Une paire de pistolets conçus pour les Résonateurs novices. Recèle une puissance à ne pas sous-estimer sous son apparence simple.",
    passive: "Prologue : ATQ +5 %.",
  },
  'Tyro Broadblade': {
    name: "Epée Tyro",    desc: "Le début d'une quête vers l'excellence. Un sabre conçu pour les Résonateurs novices. Recèle une puissance à ne pas sous-estimer sous son apparence simple.",
    passive: "Prologue : ATQ +5 %.",
  },
  'Training Sword': {
    name: "Sabre Novice",    desc: "Cette épée est conçue spécifiquement pour l'entraînement et l'enseignement, n'offrant que les fonctions de base.",
    passive: "Persévérer : ATQ +4 %.",
  },
  'Training Rectifier': {
    name: "Amplificateur Novice",    desc: "Ce rectificateur est conçu spécifiquement pour l'entraînement et l'enseignement, n'offrant que les fonctions de base.",
    passive: "Persévérer : ATQ +4 %.",
  },
  'Training Gauntlets': {
    name: "Gantelets Novices",    desc: "Ces gantelets sont conçus spécifiquement pour l'entraînement et l'enseignement, n'offrant que les fonctions de base.",
    passive: "Persévérer : ATQ +4 %.",
  },
  'Training Pistols': {
    name: "Pistolets Novices",    desc: "Ces pistolets sont conçus spécifiquement pour l'entraînement et l'enseignement, n'offrant que les fonctions de base.",
    passive: "Persévérer : ATQ +4 %.",
  },
  'Training Broadblade': {
    name: "Epée Novice",    desc: "Ce sabre est conçu spécifiquement pour l'entraînement et l'enseignement, n'offrant que les fonctions de base.",
    passive: "Persévérer : ATQ +4 %.",
  },
};
