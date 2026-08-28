import { useEffect, useRef, useState } from 'react';

// Renders on top of the app the instant React mounts. index.html already
// shows the identical poster image, statically, from the very first paint
// (see #boot-poster there) — this component's own poster <img> below
// renders at the same position so the handoff is seamless, then this one
// removes the static element once mounted (no functional need to keep both
// in the DOM). Plays the intro video once it has actually loaded enough to
// run without stalling, starts the Log Screen ambient track in sync with
// the video's own 'playing' event (handed off to useAmbientMusic.js via
// window.__bootAmbientAudio so it continues with no restart once React's
// hook takes over managing it), then fades the whole overlay out over 1s
// once the video finishes and unmounts — never blocking or delaying the
// app underneath, which mounts and renders in parallel the entire time.
export default function BootIntro() {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.getElementById('boot-poster')?.remove();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startFadeOut = () => {
      setFadingOut(true);
      setTimeout(() => setDone(true), 1000);
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

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#080c14',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 1s ease-out',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      <img
        src="/boot-intro/boot-intro-poster.gif"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: canPlay ? 0 : 1,
          transition: 'opacity 0.2s ease-out',
        }}
      />
      <video
        ref={videoRef}
        src="/boot-intro/boot-intro.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: canPlay ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
      />
    </div>
  );
}
