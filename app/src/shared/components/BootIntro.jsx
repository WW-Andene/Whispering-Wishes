import { useEffect, useRef, useState } from 'react';

// Renders on top of the app the instant React mounts. Unlike earlier
// versions of this component, it renders NO poster of its own anymore —
// MainActivity.java's native ImageView poster (added on top of the WebView
// from the moment the Activity is created) covers the entire boot phase by
// itself, all the way up to the moment the intro video is actually ready to
// play. That native poster isn't part of the WebView's content area at all,
// so it's immune to the WebView content-area resize that every previous
// WebView-rendered poster (static in index.html, then React-rendered here)
// had to work around with split/superposition/status-bar tricks. None of
// that is needed once nothing poster-shaped is rendered by the WebView in
// the first place.
//
// This component's only job now: wait for the video to be ready, dismiss
// the native poster at that exact moment (window.AndroidBoot.
// dismissBootPoster()), play the video, start the Log Screen ambient track
// in sync with the video's own 'playing' event (handed off to
// useAmbientMusic.js via window.__bootAmbientAudio so it continues with no
// restart once React's hook takes over managing it), then fade the video
// out over 1s once it finishes and unmount — never blocking or delaying the
// app underneath, which mounts and renders in parallel the entire time.
export default function BootIntro() {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);
  const [screenSize] = useState(() => ({ w: window.screen.width, h: window.screen.height }));
  // Which Rover variant plays this boot. On native, MainActivity.onCreate() already flipped this
  // coin before the native poster ever painted (has to be decided there — that poster shows
  // before this component, or any JS at all, has run) and exposes its pick via the same
  // AndroidBoot bridge dismissBootPoster()/showStatusBar() use, so the video matches whichever
  // gender the poster already committed to. On plain web (no native poster to stay in sync
  // with), there's nothing to agree with, so this rolls its own.
  const [mrover] = useState(() => {
    try {
      if (window.AndroidBoot?.isMRoverVariant) return window.AndroidBoot.isMRoverVariant();
    } catch {
      // Bridge call failed for some reason — fall through to the web-only random pick.
    }
    return Math.random() < 0.5;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Called on both the normal path (video ready to play) and the error
    // path (video failed before ever becoming ready) — either way, the
    // native poster can't be left on screen once this component has given
    // up trying to show it something else.
    const dismissNativePoster = () => {
      try {
        window.AndroidBoot?.dismissBootPoster?.();
      } catch {
        // Not running in the Android WebView (e.g. plain web) — no-op.
      }
    };

    const startFadeOut = () => {
      setFadingOut(true);
      setTimeout(() => {
        setDone(true);
        // App.jsx's onboarding modal gates its own render on this — it was
        // mounting immediately on first launch regardless of the intro
        // video still playing underneath it. window.__bootIntroDone is set
        // synchronously (not just via a dispatched event) so a component
        // that mounts/checks after this point still sees the right value,
        // not just ones already listening when the event fires.
        window.__bootIntroDone = true;
        window.dispatchEvent(new Event('boot-intro-done'));
        // MainActivity.java hides the status bar entirely at boot (not
        // just transparent — actually hidden, so there's no status-bar
        // region left for the poster to align with or reframe against).
        // Restore it now that the intro has fully finished and layout has
        // long settled, so bringing it back isn't itself a reframe risk.
        try {
          window.AndroidBoot?.showStatusBar?.();
        } catch {
          // Not running in the Android WebView (e.g. plain web) — no-op.
        }
      }, 1000);
    };

    // Reads settings directly rather than via useVisualSettings/context —
    // this needs to fire the instant the video starts playing, not wait
    // for a provider to mount. See useAmbientMusic.js for the matching
    // adoption logic and the 'someone already started this' race guard.
    const startAmbient = () => {
      try {
        if (window.__bootAmbientStarted) return;
        const raw = localStorage.getItem('whispering-wishes-visual-settings-v3');
        const settings = raw ? JSON.parse(raw) : null;
        const soundOn = !settings || settings.soundEnabled !== false;
        const track = settings?.logScreenTrack || '2';
        if (!soundOn || track === 'off') return;
        window.__bootAmbientStarted = true;
        const audio = new Audio(`./audio/log-screen-${track}.m4a`);
        audio.loop = true;
        audio.volume = 0.35;
        audio.play().catch(() => {});
        window.__bootAmbientAudio = audio;
        window.__bootAmbientTrack = track;
      } catch {
        // localStorage unavailable/corrupt — no boot music, not fatal.
      }
    };

    const onCanPlay = () => {
      setCanPlay(true);
      video.play().catch(() => startFadeOut());
      // Wait for the video's own opacity flip (triggered by setCanPlay
      // above) to actually paint before dismissing the native poster —
      // calling dismissNativePoster() immediately, as before, raced two
      // independent async operations against each other: a native View
      // removal posted to the Android UI thread, and a React state update
      // that still needs its own render+commit+paint. When the native
      // removal lands in an earlier frame than the video's opacity paint,
      // there's a gap frame where neither one is covering the app — the
      // rare "main menu clips through the video" report. Double rAF is
      // the standard trick for "wait until the browser has completed a
      // paint": the first callback fires before the next paint, the
      // second fires after it, so by the time dismissNativePoster() runs,
      // the video is guaranteed to already be the thing on screen.
      requestAnimationFrame(() => requestAnimationFrame(dismissNativePoster));
    };
    const onEnded = () => startFadeOut();
    const onError = () => {
      dismissNativePoster();
      startFadeOut();
    };

    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('playing', startAmbient, { once: true });
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('canplaythrough', onCanPlay);
      video.removeEventListener('playing', startAmbient);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, []);

  if (done) return null;

  // zIndex 2147483647 (max signed 32-bit int, the practical CSS ceiling),
  // not 9999 — PWAProvider's offline banner (and anything else in the app
  // reaching for a "big enough" number) also used z-[9999], and since it
  // mounts later in the DOM than this component (main.jsx renders
  // <BootIntro/> before <App/>), an equal z-index tie is broken by DOM
  // order in the *later* element's favor — so that banner could paint on
  // top of this boot overlay, letting the app underneath visibly show
  // through the "still playing" video.
  const OVERLAY_Z = 2147483647;

  return (
    <video
      ref={videoRef}
      src={mrover ? '/boot-intro/boot-intro-mrover.mp4' : '/boot-intro/boot-intro.mp4'}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: screenSize.w,
        height: screenSize.h,
        zIndex: OVERLAY_Z,
        objectFit: 'cover',
        opacity: canPlay ? (fadingOut ? 0 : 1) : 0,
        // The reveal (canPlay flipping true) must be an instant cut, not a
        // fade — this used to crossfade against a poster fading out
        // underneath it at the same rate (opacity summed to 1 the whole
        // time, so nothing showed through), but that poster is gone now
        // (PR #237): the video is the only thing covering the app while
        // canPlay is true, so animating its own opacity up from 0 spent a
        // full second semi-transparent with nothing behind it but the real
        // app content, which is exactly the "main menu clips through the
        // start of the intro video" bug. Only the fade-OUT at the very end
        // (fadingOut true) is still meant to be gradual — that one really
        // is revealing the app on purpose.
        transition: fadingOut ? 'opacity 1s ease-out' : 'none',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    />
  );
}
