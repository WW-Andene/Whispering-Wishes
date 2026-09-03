// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/appUpdate.js
// In-app update check for the native (Capacitor) build — lets a user update
// without re-downloading the app from scratch or rebuilding it themselves.
// Native-only: there's no "installed app version" concept on the web (a page
// reload always gets the latest deploy already).
//
// How it works: build-apk.yml publishes a GitHub Release (tag apk-<run
// number>) with the APK attached on every push to main. android/app/
// build.gradle's versionCode is set to that same run number at build time
// (-PappVersionCode=..., see that file's comment) — so comparing the
// running app's own build number (via @capacitor/app's App.getInfo()) to
// the latest release's tag number tells us whether an update exists, with
// no separate version-manifest file to keep in sync.
// ═══════════════════════════════════════════════════════════════════════════════

import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const REPO = 'WW-Andene/Whispering-Wishes';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

// Returns null on web (nothing to check). Throws on network/API failure —
// callers should catch and show a "couldn't check" message rather than
// silently pretending there's no update.
export async function checkForUpdate() {
  if (!isNativePlatform()) return null;

  const info = await App.getInfo(); // { version, build, id, name }
  const currentBuild = parseInt(info.build, 10) || 0;

  const res = await fetch(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const release = await res.json();

  const match = /^apk-(\d+)$/.exec(release.tag_name || '');
  const latestBuild = match ? parseInt(match[1], 10) : 0;
  const apkAsset = (release.assets || []).find(a => a.name.endsWith('.apk'));

  return {
    currentVersion: info.version,
    currentBuild,
    latestVersion: release.tag_name,
    latestBuild,
    hasUpdate: latestBuild > currentBuild && !!apkAsset,
    publishedAt: release.published_at,
    notes: release.body || '',
    downloadUrl: apkAsset?.browser_download_url || null,
  };
}

// Opens the APK's GitHub download URL in the system browser — the OS's own
// Download Manager handles the fetch, and tapping the finished download
// hands off to the system package installer exactly like updating from any
// other website. No native install-intent code needed on our side, and no
// REQUEST_INSTALL_PACKAGES permission for the app itself: since the
// download's origin is the browser app the user already granted "install
// unknown apps" to (the same one-time step self-hosting the first APK
// required — see NATIVE_APP.md), not this app.
export async function downloadUpdate(downloadUrl) {
  await Browser.open({ url: downloadUrl });
}
