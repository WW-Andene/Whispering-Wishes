// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/banners.fr.js
// French overlay for banners.js. ONLY covers fields that are purely
// display text with no functional/parsing consumers:
//   - CURRENT_BANNERS.characters[].title / CURRENT_BANNERS.weapons[].title
//     (rendered as-is in shared/components/BannerCard.jsx)
//   - EVENTS[key].name / .subtitle / .description
//     (rendered as-is in features/events/EventCard.jsx and EventsTab.jsx)
//
// Explicitly NOT translated (documented functional-risk gaps, consistent with
// the pattern used in echoes.js/weapons.js/achievements.js/characters.js):
//   - EVENTS[key].resetType — parsed by a regex in EventCard.jsx
//     (`/^~?\d+\s*(days?|d|h|m)?$/i`) to detect recurring events and drive
//     countdown-timer logic (getRecurringEventEnd). Translating "28 days" to
//     "28 jours" would silently break that regex and the countdown feature.
//   - EVENTS[key].rewards — free-form text (e.g. "60 Astrite", "Boss
//     Materials") read via parseInt() in EventsTab.jsx, which only consumes
//     the leading digits, but is also displayed as a raw badge; left in
//     English to avoid any risk to the numeric parsing path.
//   - .color / .gradient / .accentColor — Tailwind class fragments, not text.
//   - Character/weapon/version proper nouns everywhere in this file (banner
//     history entries, character/weapon theme names, version splash-screen
//     titles like "Reverbs From The End of Galaxies", arena codenames) are
//     kept as official English names, matching the convention already
//     established for CHARACTER_DATA/WEAPON_DATA keys — these are titles,
//     not translatable prose, and would require per-item verification against
//     Kuro's official French naming that is out of scope here.
// ═══════════════════════════════════════════════════════════════════════════════

export const CURRENT_BANNER_TITLES_FR = {
  'Host of Harmony': 'Hôte de l’Harmonie',
  'Digital ghost of Startorch Academy': 'Fantôme numérique de l’Académie Startorch',
  'Absolute Pulsation': 'Pulsation Absolue',
};

export const EVENTS_FR = {
  dailyReset: {
    name: 'Réinitialisation quotidienne',
    subtitle: 'Activités quotidiennes et Champs Tacet',
    description: 'Réinitialisation des activités quotidiennes',
  },
  weeklyBoss: {
    name: 'Boss hebdomadaire',
    subtitle: 'Vestiges résonants',
    description: 'Réinitialisation des récompenses de boss hebdomadaires',
  },
  illusiveRealm: {
    name: 'Fantaisies des mille portes',
    subtitle: 'Mode Rogue-like',
    description: 'Réinitialisation hebdomadaire des récompenses',
  },
  pioneerPodcast: {
    name: 'Podcast du Pionnier',
    subtitle: 'Événement',
    description: 'Événement à durée limitée',
  },
  tacticalHologram: {
    name: 'Hologramme tactique : Combat d’entraînement',
    subtitle: 'Défi de combat',
    description: 'Défi de combat permanent — Arène d’entraînement, ajoutée en v3.5 (boss : Denia, Piège Foisonnant : Châssis Rouille-de-Feu)',
  },
  endstateMatrix: {
    name: 'Matrice de fin d’état (Phase 1)',
    subtitle: 'Enchaînement de boss',
    description: 'Enchaînement de boss haute difficulté — nouveau en v3.2',
  },
  towerOfAdversity: {
    name: 'Tour de l’Adversité : Péril Revisité',
    subtitle: 'Défi de fin de jeu',
    description: 'Défi de combat de fin de jeu',
  },
  whimperingWastes: {
    name: 'Landes Gémissantes',
    subtitle: 'Eaux Renaissantes',
    description: 'Défi de combat avec système de jetons',
  },
  versionSpecialCampaign: {
    name: 'Campagne spéciale de version',
    subtitle: 'Récompenses de connexion',
    description: 'En Version 3.5, un événement spécial est disponible : vos 10 premiers Conviers dans le Convier Résonateur Réverbérant sont gratuits.',
  },
  giftsOfAftertune: {
    name: 'Cadeaux de l’Après-Mélodie',
    subtitle: 'Événement de connexion sur 7 jours',
    description: 'Pendant l’événement, connectez-vous pour réclamer les récompenses de connexion du jour depuis la page de l’événement.',
  },
  lamentReconTacetCrisis: {
    name: 'Reconnaissance de la Complainte : Crise Tacet',
    subtitle: 'Événement à durée limitée',
    description: 'Sous une vue tactique spéciale, utilisez vos armes avec sagesse pour repousser des vagues d’ennemis. En combattant, renforcez votre Résonateur avec de nouvelles armes, des améliorations d’armes et des objets de boost. Pour terminer un exercice, vous devez survivre à chaque vague d’attaque.',
  },
  virtualCrisisQuadrantTrials: {
    name: 'Crise virtuelle : Épreuves du Quadrant',
    subtitle: 'Événement à durée limitée',
    description: 'Relevez les défis d’Épreuve de Crise et les défis de haute difficulté d’Épreuve de Catastrophe sous diverses combinaisons de Modules de Stress.',
  },
  lolloCampaignNewJourney: {
    name: 'Campagne Lollo : Nouveau Voyage',
    subtitle: 'Événement à durée limitée',
    description: 'Pendant l’événement, vous pouvez accomplir des Campagnes Lollo pour obtenir un nombre défini de Timbres Lollo. Chaque Timbre Lollo peut être échangé contre une livraison spéciale de l’Assistant Lollo.',
  },
  chordCleansing: {
    name: 'Purification d’Accord',
    subtitle: 'Événement à durée limitée de double récompense d’Échos',
    description: 'Dépensez des Plaques d’Ondes pour réclamer des récompenses doublées après avoir terminé un défi de Suppression Tacet.',
  },
};
