// ═══════════════════════════════════════════════════════════════════════════════
// useAmbientMusic — loops the selected "Log Screen" background music track
// (public/audio/log-screen-{1,2,3}.m4a) while the app is open. Selected and
// muted via Profile > Display > Sound (visualSettings.logScreenTrack,
// visualSettings.soundEnabled). A single <audio> element is reused across
// track switches so playback doesn't restart just from a re-render.
//
// index.html already starts this same default track (window.__bootAmbientAudio)
// synchronously at boot, before React mounts, so it's already playing under
// the splash video. On first mount here we adopt that exact <audio> element
// instead of creating a new one, so the track carries on with no restart or
// gap once React takes over managing it.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';

// Vite's base is './' (relative) — resolve against BASE_URL, not a hardcoded
// leading-slash path, so this still 404s correctly on a subpath deploy or
// the native file:// build (see chime.js for the same fix).
const BASE = import.meta.env.BASE_URL || './';

// The bulk OST library — same 36 tracks as the native Soundtrack widget's
// own SoundtrackTracks.java, filenames kept identical (including the " OST"
// suffix — only the *label* shown to the user drops it, same reasoning as
// that file's own comment) so both sides stay trivially in sync by eye.
// Labels are proper nouns (track/boss names) — not run through t(), same
// as the widget's own strings.xml entries not needing a French variant.
//
// category groups the picker UI below: 'login' (folded in alongside the
// 3 original numbered login tracks), 'boss' (boss-fight themes — 5 of
// these don't actually have "Boss" in their real track name, but are
// boss themes all the same, per explicit direction: Dragon of Dirge,
// Lorelei, Fleurdelys, Sentry Construct, Where Wind Returns to Celestial
// Realm), 'theme' (region/game-mode themes, e.g. Depths of Illusive
// Realm, Whimpering Wastes), 'classic' (none yet — category exists for
// when some are added). Labels for every 'boss' entry drop the literal
// word "Boss" — redundant once grouped under that category heading.
const OST_TRACKS = [
  ['3_5_login', '3.5 Login Screen', '3.5 Login OST.mp3', 'login'],
  ['aleph_1_boss', 'Aleph 1', 'Aleph 1 Boss OST.mp3', 'boss'],
  ['arsinosa_boss', 'Arsinosa', 'Arsinosa Boss OST.mp3', 'boss'],
  ['bell_borne_geochelone_boss', 'Bell Borne Geochelone', 'Bell Borne Geochelone Boss OST.mp3', 'boss'],
  ['calmity_effigy_boss', 'Calmity Effigy', 'Calmity Effigy Boss OST.mp3', 'boss'],
  ['crownless_boss', 'Crownless', 'Crownless Boss OST.mp3', 'boss'],
  ['denia_boss', 'Denia', 'Denia Boss OST.mp3', 'boss'],
  ['depths_of_illusive_realm', 'Depths of Illusive Realm', 'Depths of Illusive Realm OST.mp3', 'theme'],
  ['dragon_of_dirge', 'Dragon of Dirge', 'Dragon of Dirge OST.mp3', 'boss'],
  ['dreamless_boss', 'Dreamless', 'Dreamless Boss OST.mp3', 'boss'],
  ['feilian_beringal_boss', 'Feilian Beringal', 'Feilian Beringal Boss OST.mp3', 'boss'],
  ['fenrico_boss', 'Fenrico', 'Fenrico Boss OST.mp3', 'boss'],
  ['fleurdelys', 'Fleurdelys', 'Fleurdelys OST.mp3', 'boss'],
  ['hecate_boss', 'Hecate', 'Hecate Boss OST.mp3', 'boss'],
  ['hyvita_full_boss', 'Hyvita Full', 'Hyvita Full Boss OST.mp3', 'boss'],
  ['impermanence_heron_boss', 'Impermanence Heron', 'Impermanence Heron Boss OST.mp3', 'boss'],
  ['impermanence_heron_boss_renewed', 'Impermanence Heron Renewed', 'Impermanence Heron Boss Renewed OST.mp3', 'boss'],
  ['inferno_rider_boss', 'Inferno Rider', 'Inferno Rider Boss OST.mp3', 'boss'],
  ['ju_boss', 'Jué', 'Jué Boss OST.mp3', 'boss'],
  ['lady_of_the_sea_boss', 'Lady of the Sea', 'Lady of the Sea Boss OST.mp3', 'boss'],
  ['leviathan_threnodian_boss', 'Leviathan Threnodian', 'Leviathan Threnodian Boss OST.mp3', 'boss'],
  ['lorelei', 'Lorelei', 'Lorelei OST.mp3', 'boss'],
  ['mech_abomination_boss', 'Mech Abomination', 'Mech Abomination Boss OST.mp3', 'boss'],
  ['mephis_alter_boss', 'Mephis Alter', 'Mephis Alter Boss OST.mp3', 'boss'],
  ['mephis_boss', 'Mephis', 'Mephis Boss OST.mp3', 'boss'],
  ['mourning_aix_boss', 'Mourning Aix', 'Mourning Aix Boss OST.mp3', 'boss'],
  ['myriad_snare_boss', 'Myriad Snare', 'Myriad Snare Boss OST.mp3', 'boss'],
  ['nameless_explorer_boss', 'Nameless Explorer', 'Nameless Explorer Boss OST.mp3', 'boss'],
  ['rector_husk_boss', 'Rector Husk', 'Rector Husk Boss OST.mp3', 'boss'],
  ['scar_boss', 'Scar', 'Scar Boss OST.mp3', 'boss'],
  ['scar_phase_2_boss', 'Scar Phase 2', 'Scar Phase 2 Boss OST.mp3', 'boss'],
  ['sentry_construct', 'Sentry Construct', 'Sentry Construct OST.mp3', 'boss'],
  ['sigillum_boss', 'Sigillum', 'Sigillum Boss OST.mp3', 'boss'],
  ['the_false_sovereign_boss', 'The False Sovereign', 'The False Sovereign Boss OST.mp3', 'boss'],
  ['where_wind_returns_to_celestial_realm', 'Where Wind Returns to Celestial Realm', 'Where Wind Returns to Celestial Realm OST.mp3', 'boss'],
  ['whimpering_wastes', 'Whimpering Wastes', 'Whimpering Wastes OST.mp3', 'theme'],
];

const TRACK_SRC = {
  '1': `${BASE}audio/log-screen-1.m4a`,
  '2': `${BASE}audio/log-screen-2.m4a`,
  '3': `${BASE}audio/log-screen-3.m4a`,
  // "Convene" — the pull-simulator's background loop — is just another
  // ambient track choice now, not a separate always-on toggle scoped to
  // the modal (that's what it used to be; folded in here per user
  // request). Same duck/resume behavior as every other track: paused
  // while ConvenePullSimModal's videos are playing, resumed after.
  convene: `${BASE}audio/convene-screen.m4a`,
  ...Object.fromEntries(OST_TRACKS.map(([key, , filename]) => [key, `${BASE}audio/${encodeURIComponent(filename)}`])),
};

// Resolves a logScreenTrack key to its playable URL — the single source of
// truth BootIntro.jsx's own boot-time bootstrap uses too (see its own
// comment for the bug this fixed: it used to hardcode a `log-screen-
// ${track}.m4a` URL pattern that only ever matched '1'/'2'/'3', so picking
// Convene or any OST track meant the boot audio 404'd silently, and the
// autoplay permission that only a page-load-time play() call can use was
// spent on that failed attempt — every later retry (including this hook's
// own mount effect noticing the wrong src and fixing it) runs without a
// fresh user gesture, so browsers/WebViews block it, and the track never
// starts until the user's next tap incidentally satisfies that requirement).
export function resolveAmbientTrackSrc(key) {
  return TRACK_SRC[key] || null;
}

// Ordered {key, label, category} list for the picker UI (ProfileTab's
// Ambient Music section) — the original 4 keep their translated labels
// (via t()) since those predate this list; only the OST entries are
// exposed here.
export const AMBIENT_OST_TRACKS = OST_TRACKS.map(([key, label, , category]) => ({ key, label, category }));

// Category display order for the picker — 'classic' has no tracks yet but
// is listed here so it renders (empty) the moment one is added, with no
// further code change needed.
export const AMBIENT_OST_CATEGORIES = ['login', 'theme', 'boss', 'classic'];

const AMBIENT_VOLUME = 0.35;

// Shared reference to the one ambient <audio> element (set below whenever
// useAmbientMusic's own ref is), so other components can duck it without
// needing their own copy of this hook's state — ConvenePullSimModal calls
// suspendAmbientMusic() while its rarity/item videos are playing (their own
// audio would otherwise layer over the ambient track) and resumeAmbientMusic()
// when it closes.
let sharedAmbientAudio = null;

export function suspendAmbientMusic() {
  sharedAmbientAudio?.pause();
}

// Re-checks the current settings itself rather than blindly playing — the
// track may have been paused because it's genuinely disabled (sound off,
// or track set to 'off'), not just ducked, and resuming unconditionally
// would start music back up against the user's own setting.
export function resumeAmbientMusic(visualSettings) {
  if (!sharedAmbientAudio) return;
  const track = visualSettings?.logScreenTrack;
  if (visualSettings?.soundEnabled && TRACK_SRC[track]) {
    sharedAmbientAudio.play().catch(() => {});
  }
}

export function useAmbientMusic(visualSettings) {
  const audioRef = useRef(null);
  const track = visualSettings?.logScreenTrack;
  const enabled = !!visualSettings?.soundEnabled && !!TRACK_SRC[track];

  // Backgrounding the app (home button, app switcher, screen lock) leaves
  // the process — and this <audio> element — running, so without this the
  // ambient track keeps playing under whatever the user switched to. Same
  // appStateChange listener pattern PullBubbleCard.jsx already uses.
  // Re-checks current settings on foreground rather than blindly resuming,
  // same reasoning as resumeAmbientMusic() above.
  useEffect(() => {
    let listenerHandle;
    let cancelled = false;
    (async () => {
      const { App } = await import('@capacitor/app');
      if (cancelled) return;
      listenerHandle = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          resumeAmbientMusic(visualSettings);
        } else {
          suspendAmbientMusic();
        }
      });
    })();
    return () => {
      cancelled = true;
      listenerHandle?.remove();
    };
  }, [visualSettings]);

  useEffect(() => {
    if (!audioRef.current) {
      // React mounts (and this effect runs) essentially immediately on
      // load — well before index.html's boot script fires, since that one
      // deliberately waits for the splash video's 'playing' event (or a
      // 1.5s fallback) before starting its own Audio, to avoid contending
      // with the video's decode. So window.__bootAmbientAudio is normally
      // still unset here, and this creates the audio itself instead.
      // Registering it back onto window.__bootAmbientAudio (and setting a
      // "someone already started this" flag) is what lets the boot
      // script's later, deferred check skip creating a second, overlapping
      // Audio for the same track once it does fire — without this, both
      // sides raced to create their own and played on top of each other.
      const audio = window.__bootAmbientAudio || new Audio();
      audio.loop = true;
      audio.volume = AMBIENT_VOLUME;
      audioRef.current = audio;
      sharedAmbientAudio = audio;
      window.__bootAmbientAudio = audio;
      window.__bootAmbientStarted = true;
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      sharedAmbientAudio = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!enabled) {
      audio.pause();
      return;
    }
    const src = new URL(TRACK_SRC[track], window.location.href).href;
    if (audio.src !== src) {
      audio.src = src;
    }
    // This effect runs essentially immediately on React mount (App.jsx
    // calls useAmbientMusic() unconditionally near the top), well before
    // BootIntro.jsx's own video-gated startAmbient() ever fires — so on a
    // genuinely first-ever app open, THIS is the play() call that actually
    // wins the race and claims window.__bootAmbientStarted, leaving
    // BootIntro's mute/unmute workaround dead code (its own `if
    // (window.__bootAmbientStarted) return;` guard bails immediately).
    // A plain unmuted play() here hits the exact same Chromium Media
    // Engagement Index block BootIntro.jsx's comment documents (blocked on
    // an origin's first-ever play, silently swallowed by the .catch()
    // below), so it needs the identical mute-then-unmute-on-resolve trick.
    audio.muted = true;
    audio.play().then(() => { audio.muted = false; }).catch(() => {});
  }, [enabled, track]);
}
