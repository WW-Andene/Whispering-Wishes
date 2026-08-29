# Whispering Wishes

**The all-in-one Wuthering Waves companion app.** Track your pity, plan your pulls, build your teams, and explore the map — all in one place, no account required.

Live at **[whispering-wishes.vercel.app](https://whispering-wishes.vercel.app)**

---

## What is Whispering Wishes?

Whispering Wishes is a web app for Wuthering Waves players. It runs entirely in your browser with no sign-up and no ads. Everything is stored locally on your device by default, with optional cloud backup for cross-device sync.

**Pull Tracker** — Import your convene history and see exactly where you stand. Pity counters, guarantee status, 50/50 tracking, and banner history at a glance.

**Probability Calculator** — Answer "should I pull?" with math. Simulate thousands of outcomes based on your current pity, guarantee, and available resources.

**Resource Planner** — Plan ahead for upcoming banners. See how many pulls you'll have by banner end, track Astrite income from events, and budget your resources.

**Team Builder & Damage Calculator** — Build teams, equip weapons and echoes, configure stats, and compare DPS across different loadouts. Export a shareable build card per character.

**Collection Tracker** — Track every Resonator, weapon, and echo you own. See your completion rate, manage duplicates, and showcase your collection.

**Interactive Map** — Full game world map with pan/zoom. Tiled for fast loading — only loads what you're looking at.

**Stats & Analytics** — Pull history charts, pity distribution histograms, luck analysis, and spending breakdowns.

---

## Features

- 9 sections: Tracker, Events, Map, Planner, Calculator, Stats, Teams, Collection, Profile
- 58 Resonators, 122 weapons, 181 echoes — kept in sync with the current game patch
- 5 server regions with timezone-aware countdowns
- Convene history import (URL paste or QR scan)
- ID card and build card generators for sharing your profile/team
- Optional cloud backup & cross-device sync, plus push notifications
- PWA — installable on mobile, works offline
- Native Android app (Capacitor wrapper) for fully offline use
- Self-hostable — run your own instance instead of/alongside the hosted deployment (see `SELF_HOSTING.md`)
- English and French localization
- Dark theme with customizable accent colors and banner art backgrounds
- Colorblind mode and accessibility features
- No tracking, no ads

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Map | Leaflet + custom tile pyramid |
| Animation | Spine Player |
| Native wrapper | Capacitor (Android) |
| Testing | Vitest + Testing Library |
| Hosting | Vercel |

---

## Project Structure

```
Whispering-Wishes/
  app/                          # Main web application
    api/                        # Serverless functions (gacha record, push notifications)
    android/                    # Capacitor native Android project
    self-host/                  # Self-hosting config/scripts
    public/
      map-tiles/                # Tiled game map (webp, 7 zoom levels)
    src/
      core/                     # State management, reducers
      data/                     # Game data (characters, weapons, echoes, banners)
      features/
        tracker/                # Pull/pity tracker
        events/                 # Event timeline
        map/                    # Interactive map (Leaflet)
        planner/                # Resource planner
        calculator/             # Probability calculator
        analytics/              # Stats & charts
        teams/                  # Team builder + damage calculator
        collection/             # Collection tracker
        profile/                # Profile, import, settings
      shared/
        components/             # Reusable UI (Card, EchoImage, etc.)
        modals/                 # Detail modals
        utils/                  # Helpers
      hooks/                    # Custom React hooks
      providers/                # Context providers (toast, PWA, etc.)
      styles/                   # Global CSS
  spine-rigger/                 # Character animation tooling
  scripts/                      # Build & data scripts
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/WW-Andene/Whispering-Wishes.git
cd Whispering-Wishes/app

# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Test
npm test
```

For running your own persistent instance instead of just a local dev server, see `SELF_HOSTING.md`. For building the native Android app, see `CAPACITOR_APP.md`.

---

## Game Data

All game data is maintained in `app/src/data/`:

- **`banners.js`** — Active and historical banners, character/weapon/echo images
- **`characters.js`** — All Resonators with stats, elements, weapons, skills
- **`weapons.js`** — All weapons with base ATK, substats, passives
- **`echoes.js`** — All echoes with sonata sets, buff types, skill descriptions, icons
- **`constants.js`** — Version, server configs, stat tables

Data is updated each patch.
