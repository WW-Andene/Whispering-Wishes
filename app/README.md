# Whispering Wishes v3.2.3

A Wuthering Waves Convene (gacha) companion app.

## Features
- **Tracker**: View current banners, pity progress, time remaining
- **Events**: Track time-gated events and resets
- **Calculator**: Calculate success rates based on pity and resources
- **Planner**: Plan resource income and goals
- **Stats**: View pull history charts and luck rating
- **Collection**: Track owned Resonators and weapons
- **Profile**: Import history from wuwatracker.com, backup/restore data

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Native SVG charts

## Project Structure
```
src/
  App.jsx              - Main application (~2300 lines)
  main.jsx             - Entry point
  index.css            - Tailwind imports
  core/                - Reducer, storage, calc engine, trophies
  data/                - Characters, weapons, echoes, banners, constants
  features/            - Tab components (tracker, events, calculator, planner, analytics, collection, teams, profile)
  shared/              - Reusable components, modals, backgrounds, utils
  providers/           - Toast, Confirm, FocusTrap, PWA, KuroStyles, Onboarding
  hooks/               - Custom hooks (useImageFraming)
  utils/               - Helpers, importers, i18n
```

## Game Constants
- Hard Pity: 80 pulls
- Soft Pity Start: 65 pulls
- Base 5★ Rate: 0.8%
- Soft Pity Increase: +5.5% per pull after 66
- Character Banner: 50/50 system
- Weapon Banner: 100% featured

## Notes for AI Editors
- The main code is in `src/App.jsx` (~2300 lines)
- Use "Convenes" not "pulls" in UI text
- Use "Resonators" not "characters" (capitalized)
- Don't change gacha rate calculations
- Storage key: `whispering-wishes-v2.2` (legacy v2.0 and v2.1 are auto-migrated)
