# Whispering Wishes

## Overview

Whispering Wishes is a companion app for Wuthering Waves, a gacha game. It helps players track their "Convene" (gacha pull) progress, calculate success rates, plan resources, and manage their collection of Resonators and weapons.

The app is a client-side React SPA with all data stored in browser localStorage. There is no backend or database - this is a purely frontend application.

**Current Version**: 2.2.0

### Recent Changes (v2.2.0)
- Fixed 4★ pity calculation in import to correctly count from last 4★ pull
- Improved state loading/restoring with proper initialState merging for forward compatibility
- Updated terminology consistency: "Resonator" instead of "Character", full "Weapon" instead of "Weap"
- Backup restore now shows version information in success message
- Code cleanup: removed unused variables
- Added hidden admin panel for banner management
- Integrated Imgur API for fetching banner images

### Core Features
- **Tracker**: View current banners, pity progress, time remaining
- **Events**: Track time-gated events and resets
- **Calculator**: Calculate gacha success rates based on pity and resources
- **Planner**: Plan resource income and goals
- **Stats**: View pull history charts and luck rating
- **Collection**: Track owned Resonators and weapons
- **Profile**: Import history from wuwatracker.com, backup/restore data

## User Preferences

Preferred communication style: Simple, everyday language.

### Game Terminology (Important)
- Use "Convenes" not "pulls" in UI text
- Use "Resonators" not "characters" (always capitalized)
- Do NOT modify gacha rate calculations - these are based on official game mechanics

### Game Constants (Do Not Change)
- Hard Pity: 80 pulls
- Soft Pity Start: 66 pulls
- Base 5★ Rate: 0.8%
- Soft Pity Increase: +5.5% per pull after 66
- Character Banner: 50/50 system
- Weapon Banner: 100% featured

### Data Compatibility
- Storage key: `whispering-wishes-v2.0` (must keep for backward compatibility with existing user data)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite 5 for fast development and optimized production builds
- **Styling**: Tailwind CSS 3.4 for utility-first styling
- **Charts**: Recharts for data visualization (pull history, stats)
- **Icons**: Lucide React for consistent iconography

### Code Structure
The application uses a monolithic single-file architecture:
- `src/App.jsx` - Contains ALL components (~3700 lines). This is the main codebase.
- `src/main.jsx` - React entry point
- `src/index.css` - Tailwind imports only

**Rationale**: Single-file approach chosen for simplicity and ease of maintenance for a relatively self-contained application.

### Data Storage
- **Method**: Browser localStorage
- **Key**: `whispering-wishes-v2.0`
- **Format**: JSON serialized application state
- No server-side storage or authentication

### State Management
- React's built-in useState and useEffect hooks
- No external state management library (Redux, Zustand, etc.)
- State persisted to localStorage for data retention across sessions

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
- **wuwatracker.com**: Users can import pull history from this external service via the Profile section. This is a one-way import feature, not a live API connection.

### No Backend Services
This is a fully client-side application with:
- No database
- No authentication service
- No API server
- No cloud storage

## Admin Panel

### Access
1. Tap the version text ("Whispering Wishes v2.2.0") in the footer 5 times rapidly
2. Enter your password (first time sets it, subsequent times verify it)
3. Password must be at least 4 characters

### Features
- Update banner version and phase
- Set banner start/end dates with validation
- Edit characters and weapons JSON arrays
- Fetch images from Imgur albums using Client ID
- Reset to default banners

### Storage Keys
- `whispering-wishes-admin-banners` - Custom banner data
- `whispering-wishes-admin-pass` - Admin password
- `whispering-wishes-imgur-config` - Imgur Client ID

### Validation
- Characters and weapons must be arrays with at least 1 item
- Each item must have `id` and `name` fields
- End date must be after start date
- Invalid data prevents saving