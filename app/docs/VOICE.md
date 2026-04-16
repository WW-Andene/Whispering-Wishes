# VOICE.md — Whispering Wishes

Every user-visible string is a brand choice. This doc is the rule set.

---

## Voice in three adjectives

**Tactical · Insider · Reverent**

| Dimension | Where we sit |
|---|---|
| Formality | Moderate-formal (game-lore register) |
| Length | Terse-to-balanced — never verbose |
| Personality presence | High — voice IS the primary insider signal |
| User address | Personal ("Rover") when warranted; otherwise neutral |
| Technical transparency | Specific values always ("File too large (3.2MB). Maximum is 5MB") |

---

## Domain Vocabulary — canonical terms

Use these. Never the parenthesized alternatives.

| Use | Don't use |
|---|---|
| **Convene** | Pull, Wish, Roll, Spin |
| **Resonator** | Character, Hero, Unit |
| **Echo** | Artifact, Equipment, Substat |
| **Sonata Set** | Echo Set, Set Bonus |
| **Tacet** | Echo, Noise, Corruption |
| **Sequence (S1–S6)** | Constellation, Eidolon, Dupe |
| **Forte** | Talent, Passive, Skill Tree |
| **Pity** | Counter, Streak |
| **Lament** | Calamity, Crisis |
| **Tacet Field** | Corrupted Zone, Dungeon |
| **Tacet Mark** | Stain, Corruption Mark |
| **Sonance Casket** | Inventory |
| **Astrite** | Gems, Primogems, Premium currency |
| **Lunite** | Welkin, Monthly pack |
| **Radiant / Lustrous Tides** | Featured / Standard wishes |
| **Jinzhou / Rinascita / Huanglong** | City, Area, Region names — use actual |
| **Rover** | Player, User, You (use sparingly for insider warmth) |

---

## Tone by State Type

### Empty states

✅ **Do**

- "Awaiting 5★ signal resonance"
- "No active Resonator banners"
- "Nothing here yet — import Convene history in Profile"
- "Your Sonance Casket is empty"

❌ **Don't**

- "No data found"
- "Nothing to show"
- "Empty" (as the entire message)
- "There is no content"

### Error states

✅ **Do**

- "File too large (3.2MB). Maximum is 5MB."
- "Storage is nearly full. Consider exporting your data as a backup."
- "player_id not found. Try a clearer screenshot."
- "Convene data failed to parse — double-check the URL."

❌ **Don't**

- "Something went wrong"
- "Error occurred"
- "Operation failed" (without what)
- "500: Internal Server Error"
- "Invalid input"

### Success states

✅ **Do**

- "Convene history imported — {N} pulls merged"
- "Resonance Chain +1"
- Toast with specific item ("'Vacation Save' bookmark created")

❌ **Don't**

- "Success!"
- "Done"
- "Saved." (alone, without context)

### Loading states

✅ **Do**

- "Calculating probability distribution…"
- "Scanning Convene records…"
- "Summoning…" (only for the Convene reveal moment)

❌ **Don't**

- "Loading…" (alone)
- "Please wait"
- "Processing"

### Confirmation dialogs

✅ **Do**

- "Delete 'My Team 3'? Your loadout will be lost. This cannot be undone."
- "Clear all income entries? Your planner will reset to zero."

❌ **Don't**

- "Are you sure?"
- "Continue?"
- "This will delete the item. OK / Cancel"

---

## Button Labels

**Verb-led + specific.** Never generic.

| ✅ Do | ❌ Don't |
|---|---|
| Save draft | Save |
| Import Convene data | Submit |
| Create bookmark | OK |
| Clear filters | Reset |
| Export to file | Download |
| Unlock Admin | Login |
| Apply override | Confirm |

---

## Navigation labels

| Tab | Copy |
|---|---|
| Tracker | ✅ (noun — a place) |
| Events | ✅ |
| Map | ✅ |
| Plan | ✅ (shortening of Planner is fine) |
| Calc | ✅ (enthusiast shorthand is in-voice) |
| Stats | ✅ |
| Teams | ✅ |
| Collection | ✅ |
| Profile | ✅ |

All nouns. Never verbs ("Track / Plan / Calculate") for primary nav.

---

## Copy Anti-Examples Library

If any of these patterns appear in a PR, the copy is off-brand.

```
Anti-pattern: "Click here to learn more"
Fix:          "See the gacha rate breakdown"

Anti-pattern: "Are you sure you want to delete this?"
Fix:          "Delete '{item name}'? This cannot be undone."

Anti-pattern: "Please enter a valid number"
Fix:          "Pity count must be between 0 and 80."

Anti-pattern: "Welcome to our app!"
Fix:          "Welcome, Rover. Begin by logging your first Convene."

Anti-pattern: "No items to display"
Fix:          "Awaiting 5★ signal resonance."

Anti-pattern: "Settings saved successfully"
Fix:          "Server preferences updated."

Anti-pattern: "Oops! Something broke."
Fix:          "Convene service returned an error. Retry in 30s."
```

---

## Insider Warmth Rules

Use these sparingly — over-use breaks the tactical register.

- **"Rover"** — for onboarding welcome, major achievements, trophy descriptions
- **"you"** — for confirmation dialogs and error recovery
- **Second-person implied** — default for most labels ("Save draft" not "Save your draft")
- Humor only in **trophies** — lore-steeped jokes are permitted there and nowhere else (see `core/computeTrophies.js` for the reference set)

---

## Capitalization

- **Nav tabs**: Title Case — `Tracker`, `Events`, `Profile`
- **Buttons**: Sentence case — `Save draft`, `Import Convene data`
- **Field labels**: Sentence case — `Pity count`, `Daily astrite`
- **Headings in cards**: Sentence case with occasional Title Case for feature names (`Your 5★ history`)
- **Toast / error messages**: Sentence case
- **Trophies**: Title Case (they're named achievements) — `Soft Pity Landlord`, `Rover's Blessing`

---

## Punctuation

- **Em-dashes** for parenthetical asides (`—` not `--`)
- **Smart quotes** (`'` `"`) not straight quotes where possible
- **No trailing periods** on button labels, nav items, or single-phrase field labels
- **Periods on full sentences** in error messages, empty states, toast messages
- **Ellipsis** (`…`) for loading states, not three dots

---

## Numbers & Units

- **Locale formatting**: `.toLocaleString('en-US')` today; flagged for i18n
- **Probabilities**: 1 decimal (`42.3%`)
- **Pity**: integer (`58`)
- **Currency**: `$4.99` (integer cents x/100)
- **Unit labels always**: `160 Astrite`, not just `160`
- **Approximations**: `~` prefix (`~11.5 pulls per featured 4★`)

---

## Domain Accuracy

Wrong terminology = off-brand AND confuses the audience. Before shipping new copy, verify against:

- [Fandom Wiki (Wuthering Waves)](https://wutheringwaves.fandom.com/) for terminology
- The game's in-game UI for naming conventions
- Community Discord for vernacular (only for trophies / humor moments)

---

## References

- Trophy name reference: `src/core/computeTrophies.js:81-400` (lore-steeped insider names)
- Existing locale file: `src/locale/en.json`
- i18n scaffold: `src/utils/i18n.js`
- Disclaimer & attribution: `src/features/profile/AboutSection.jsx:18-19`
