// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/wallpaper.js
// Thin JS wrapper around WallpaperPlugin.java, a small in-project native plugin (not a
// separate npm package) that sets an image as the phone's home/lock screen wallpaper.
// Native-only — there's no wallpaper API for a web page to call.
//
// Fetches the image URL itself (works the same whether it's a bundled Vite-resolved path or
// a remote URL — both are just fetchable) and converts it to base64 here, so the native side
// never needs to know or care where the image actually came from; see WallpaperPlugin.java's
// own header for why.
// ═══════════════════════════════════════════════════════════════════════════════

import { registerPlugin } from '@capacitor/core';

const Wallpaper = registerPlugin('Wallpaper');

export const isNativePlatform = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result is "data:<mime>;base64,<data>" — strip the prefix, the plugin only
      // wants the raw base64 payload (BitmapFactory.decodeByteArray doesn't need a data URI).
      const result = reader.result || '';
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// target: 'home' | 'lock' | 'both' (default). Ignored pre-API 24 (setBitmap(Bitmap) there
// always sets both — see WallpaperPlugin.java).
export async function setWallpaper(imageUrl, target = 'both') {
  if (!isNativePlatform()) return { ok: false, error: 'not-native' };
  if (!imageUrl) return { ok: false, error: 'no-image' };
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const blob = await res.blob();
    const base64 = await blobToBase64(blob);
    await Wallpaper.setWallpaper({ base64, target });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Applies a looping video as an actual Android Live Wallpaper (LiveVideoWallpaperService),
// unlike setWallpaper() above which only ever sets a static bitmap. The plugin downloads/caches
// the video, then opens Android's own live-wallpaper confirmation screen (ACTION_CHANGE_LIVE_WALLPAPER)
// — that system UI step can't be skipped, so this resolves ok:true once the intent is launched,
// not once the user has actually confirmed it.
export async function setAnimatedWallpaper(videoUrl) {
  if (!isNativePlatform()) return { ok: false, error: 'not-native' };
  if (!videoUrl) return { ok: false, error: 'no-video' };
  try {
    await Wallpaper.setLiveWallpaper({ videoUrl });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
