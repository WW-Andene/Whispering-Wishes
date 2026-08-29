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
// TWO-PIECE SPLIT, cut at the real status bar height — not one element
// spanning the whole screen. MainActivity.java documents the WebView's own
// content-area actually resizing mid-boot as edge-to-edge insets settle;
// every previous attempt sized a single full-screen element and hoped it
// wouldn't be affected. This sidesteps that entirely: cut the poster/video
// into a "bar" piece (top, exactly the status bar's height) and a "page"
// piece (everything below), each a fixed-size, non-overlapping clipping
// box that never changes size once mounted. Both boxes show the SAME
// full-size image — like a sprite sheet — each one just clipping to its
// own slice via a fixed pixel offset. Neither box's own dimensions are
// ever touched by anything, so neither can visibly reframe, regardless of
// what the OS does with the window around them.
//
// The cut line itself is the real status_bar_height MainActivity already
// computes synchronously and pushes as the --safe-area-top CSS custom
// property (same value the header/nav margin uses elsewhere in the app).
// Read once, synchronously, on mount — not re-read afterward — with a
// same 24px fallback used by the rest of the app.
function readStatusBarPx() {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top').trim();
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  } catch {
    // getComputedStyle unavailable — fall through to the default.
  }
  return 24;
}

export default function BootIntro() {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);
  const [screenSize] = useState(() => ({ w: window.screen.width, h: window.screen.height }));
  const [statusBarPx] = useState(readStatusBarPx);

  useEffect(() => {
    document.getElementById('boot-poster')?.remove();
    document.getElementById('boot-poster-page')?.remove();
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

  // Two clipping boxes for the POSTER only, cut at statusBarPx. Neither
  // box's own size is ever recomputed — only which slice of the full-size
  // image is currently scrolled into view via each image's fixed top
  // offset. The VIDEO stays a single full-screen layer (not split): it
  // only starts playing after buffering, well after the native transition
  // has already settled — the very reason it was never the element that
  // reframed in the first place — and two independently-decoding <video>
  // elements playing the "same" source could not be guaranteed to stay
  // frame-aligned the way two <img> crops of one static picture can.
  const barBoxStyle = { position: 'fixed', top: 0, left: 0, width: screenSize.w, height: statusBarPx, overflow: 'hidden', zIndex: 9999 };
  const pageBoxStyle = { position: 'fixed', top: statusBarPx, left: 0, width: screenSize.w, height: screenSize.h - statusBarPx, overflow: 'hidden', zIndex: 9999 };
  const barImgOffset = { position: 'absolute', top: 0, left: 0, width: screenSize.w, height: screenSize.h, objectFit: 'cover' };
  const pageImgOffset = { position: 'absolute', top: -statusBarPx, left: 0, width: screenSize.w, height: screenSize.h, objectFit: 'cover' };
  const posterOpacity = { opacity: canPlay ? 0 : 1, transition: 'opacity 0.2s ease-out' };

  return (
    <>
      {/* Bar piece — exactly the status bar's height, fixed, never resized. */}
      <div aria-hidden="true" style={{ ...barBoxStyle, background: '#080c14', opacity: fadingOut ? 0 : 1, transition: 'opacity 1s ease-out', pointerEvents: 'none' }}>
        <img src="/boot-intro/boot-intro-poster.gif" alt="" style={{ ...barImgOffset, ...posterOpacity }} />
      </div>
      {/* Page piece — everything below the bar, fixed, never resized. */}
      <div
        aria-hidden="true"
        style={{
          ...pageBoxStyle,
          background: '#080c14',
          opacity: fadingOut ? 0 : 1,
          transition: 'opacity 1s ease-out',
          pointerEvents: 'none',
        }}
      >
        <img src="/boot-intro/boot-intro-poster.gif" alt="" style={{ ...pageImgOffset, ...posterOpacity }} />
      </div>
      {/* Video — a single full-screen layer, a sibling of both poster
          pieces rather than nested in either (not split — see the
          comment above for why). Owns the fade-out/audio state; both
          poster pieces above just mirror its fade-out opacity so
          everything cuts away together. */}
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
          zIndex: 9999,
          objectFit: 'cover',
          opacity: canPlay ? (fadingOut ? 0 : 1) : 0,
          transition: canPlay ? 'opacity 1s ease-out' : 'opacity 0.2s ease-out',
          pointerEvents: fadingOut ? 'none' : 'auto',
        }}
      />
    </>
  );
}
