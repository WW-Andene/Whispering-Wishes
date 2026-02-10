# Whispering Wishes

## Overview

Whispering Wishes is a companion app for Wuthering Waves, a gacha game. It helps players track their "Convene" (gacha pull) progress, calculate success rates, plan resources, and manage their collection of Resonators and weapons.

The app is a client-side React SPA with most data stored in browser localStorage. Firebase Realtime Database is used for the leaderboard and presence tracking features.

**Current Version**: 3.1.1

### Recent Changes (v3.1.1)
- Synced APP_VERSION with package.json
- Added storage key migration from legacy keys (v2.0, v2.1) to current key (v2.2)
- Fixed duplicate 'Tyro Gauntlets' weapon image entry that was overriding valid URL
- Firebase Realtime Database integration for leaderboard and presence tracking
- Visual settings system for banner/event card image adjustments
- Collection image framing controls via admin mini window
- PWA support with service worker caching (Chromium browsers)
- Profile picture selection from owned Resonators
- Leaderboard with anonymous score submission

### Core Features
- **Tracker**: View current banners, pity progress, time remaining
- **Events**: Track time-gated events and resets (daily, weekly, recurring)
- **Calculator**: Calculate gacha success rates based on pity and resources
- **Planner**: Plan resource income and goals
- **Stats**: View pull history charts and luck rating
- **Collection**: Track owned Resonators and weapons with image framing
- **Profile**: Import history from wuwatracker.com, backup/restore data
- **Leaderboard**: Anonymous score submission and comparison

## User Preferences

Preferred communication style: Simple, everyday language.

### Game Terminology (Important)
- Use "Convenes" not "pulls" in UI text
- Use "Resonators" not "characters" (always capitalized)
- Do NOT modify gacha rate calculations - these are based on official game mechanics

### Game Constants (Do Not Change)
- Hard Pity: 80 pulls
- Soft Pity Start: 65 pulls
- Base 5★ Rate: 0.8%
- Soft Pity Increase: +5.5% per pull after 65
- Character Banner: 50/50 system
- Weapon Banner: 100% featured

### Data Compatibility
- Current storage key: `whispering-wishes-v2.2`
- Legacy keys (`whispering-wishes-v2.0`, `whispering-wishes-v2.1`) are auto-migrated on first load
- Admin banner storage: `whispering-wishes-admin-banners`

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite 5 for fast development and optimized production builds
- **Styling**: Tailwind CSS 3.4 for utility-first styling
- **Charts**: Recharts for data visualization (pull history, stats)
- **Icons**: Lucide React for consistent iconography

### Code Structure
The application uses a monolithic single-file architecture:
- `src/App.jsx` - Contains ALL components (~10,000 lines). This is the main codebase.
- `src/main.jsx` - React entry point
- `src/index.css` - Tailwind imports only

**Rationale**: Single-file approach chosen for simplicity and ease of maintenance for a relatively self-contained application.

**Note**: The file exceeds Babel's 500KB deoptimization threshold. Consider splitting into modules if performance becomes a concern.

### Data Storage
- **Method**: Browser localStorage (primary), Firebase Realtime Database (leaderboard/presence)
- **Key**: `whispering-wishes-v2.2` (with auto-migration from legacy keys)
- **Format**: JSON serialized application state
- Calculator state is always initialized fresh (not persisted)

### State Management
- React useReducer for main app state
- React's useState and useEffect hooks for local component state
- State persisted to localStorage for data retention across sessions

### Firebase Integration
- **Database**: Firebase Realtime Database for leaderboard scores and presence tracking
- **Auth**: Anonymous authentication (API key in code)
- **Presence**: Heartbeat-based session tracking with 2-minute expiry
- **Note**: Firebase API key appears to be a placeholder - needs real credentials for leaderboard/presence features to work

## External Dependencies

### Runtime Dependencies
| Package | Purpose |
|---------|---------|
| react, react-dom | UI framework |
| recharts | Charts for stats and history visualization |
| lucide-react | Icon library |

### Development Dependencies
| Package | Purpose |
|---------|---------|
| vite | Build tool and dev server |
| @vitejs/plugin-react | React support for Vite |
| tailwindcss | Utility CSS framework |
| postcss, autoprefixer | CSS processing |

### External Integrations
- **wuwatracker.com**: Users can import pull history from this external service via the Profile section. One-way import, not a live API connection.
- **Firebase Realtime Database**: Leaderboard and presence tracking (REST API, no SDK dependency).
- **ibb.co / Imgur**: Banner and collection images hosted externally.

## Admin Panel

### Access
1. Tap the version text ("Whispering Wishes v3.1.1") in the footer 5 times rapidly
2. Enter your password (first time sets it, subsequent times verify it)
3. Password is verified via SHA-256 hash

### Features
- Update banner version and phase
- Set banner start/end dates with validation
- Edit characters and weapons JSON arrays
- Set individual banner images (character, weapon, standard, event)
- Visual settings for image opacity, fade position, fade intensity
- Image framing mode for collection cards (zoom, position)
- Presence monitoring (open sessions, registered players)
- Mini window mode for visual adjustments while browsing

### Storage Keys
- `whispering-wishes-admin-banners` - Custom banner data
- `whispering-wishes-admin-pass` - Admin password hash
- `whispering-wishes-visual-settings` - Banner/event card visual settings
- `whispering-wishes-image-framing` - Collection card image framing data
- `whispering-wishes-mini-panel-pos` - Mini panel corner position

### Validation
- Characters and weapons must be arrays with at least 1 item
- Each item must have `id` and `name` fields
- End date must be after start date
- Invalid data prevents saving

## Known Issues
- Firebase API key may need to be replaced with a real project key for leaderboard features
- PWA service worker uses blob URL registration (only works in Chromium browsers)
- Babel deoptimizes the styling of App.jsx due to file size exceeding 500KB
