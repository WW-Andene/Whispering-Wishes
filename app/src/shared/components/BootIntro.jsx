import { useEffect, useRef, useState } from 'react';

// Renders on top of the app the instant React mounts. index.html already
// shows the identical poster image, statically, from the very first paint
// (see #boot-poster there) — this component's own poster renders at the
// same position so the handoff is seamless, then this one removes the
// static element once mounted. Plays the intro video once it has actually
// loaded enough to run without stalling, starts the Log Screen ambient
// track in sync with the video's own 'playing' event (handed off to
// useAmbientMusic.js via window.__bootAmbientAudio so it continues with no
// restart once React's hook takes over managing it), then fades the whole
// overlay out over 1s once the video finishes and unmounts — never
// blocking or delaying the app underneath, which mounts and renders in
// parallel the entire time.
//
// This component's own poster is a single, unsplit full-screen piece — the
// two-piece split lives only on index.html's static pre-React poster now
// (and there, it's a vertical left/right split, not horizontal). Sized off
// window.screen.width/height (a fixed physical value), not a CSS
// viewport-relative unit, so this box's own dimensions are never
// recomputed as MainActivity.java's edge-to-edge insets settle mid-boot.
export default function BootIntro() {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);
  const [screenSize] = useState(() => ({ w: window.screen.width, h: window.screen.height }));

  useEffect(() => {
    document.getElementById('boot-poster')?.remove();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
    };
    const onEnded = () => startFadeOut();
    const onError = () => startFadeOut();

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
  // through the "still playing" video. Matches index.html's static poster,
  // which had the same fix applied for the same reason.
  const OVERLAY_Z = 2147483647;
  const posterBoxStyle = { position: 'fixed', top: 0, left: 0, width: screenSize.w, height: screenSize.h, overflow: 'hidden', zIndex: OVERLAY_Z };
  const posterImgStyle = { position: 'absolute', top: 0, left: 0, width: screenSize.w, height: screenSize.h, objectFit: 'cover', opacity: canPlay ? 0 : 1, transition: 'opacity 0.2s ease-out' };

  return (
    <>
      {/* Poster — single unsplit full-screen piece, fixed, never resized. */}
      <div aria-hidden="true" style={{ ...posterBoxStyle, background: '#080c14', opacity: fadingOut ? 0 : 1, transition: 'opacity 1s ease-out', pointerEvents: 'none' }}>
        <img src="/boot-intro/boot-intro-poster.gif" alt="" style={posterImgStyle} />
      </div>
      {/* Video — a single full-screen layer, a sibling of the poster.
          Owns the fade-out/audio state; the poster above just mirrors its
          fade-out opacity so everything cuts away together. */}
      <video
        ref={videoRef}
        src="/boot-intro/boot-intro.mp4"
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
          transition: canPlay ? 'opacity 1s ease-out' : 'opacity 0.2s ease-out',
          pointerEvents: fadingOut ? 'none' : 'auto',
        }}
      />
    </>
  );
}
