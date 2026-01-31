# Whispering Wishes v2.1.0

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
- Recharts (charts)
- Lucide React (icons)

## Project Structure
```
src/
  App.jsx      - Main application (all components)
  main.jsx     - Entry point
  index.css    - Tailwind imports
```

## Game Constants
- Hard Pity: 80 pulls
- Soft Pity Start: 66 pulls
- Base 5★ Rate: 0.8%
- Soft Pity Increase: +5.5% per pull after 66
- Character Banner: 50/50 system
- Weapon Banner: 100% featured

## Notes for AI Editors
- The main code is in `src/App.jsx` (3700 lines)
- Use "Convenes" not "pulls" in UI text
- Use "Resonators" not "characters" (capitalized)
- Don't change gacha rate calculations
- Storage key: `whispering-wishes-v2.0` (keep for compatibility)
