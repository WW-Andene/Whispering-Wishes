import { useEffect, useRef, useState } from 'react';

// Renders on top of the app the instant React mounts. Shows the poster
// immediately (zero-delay, no network wait), plays the intro video once it
// has actually loaded enough to run without stalling, then fades the whole
// overlay out over 1s once the video finishes and unmounts — never blocking
// or delaying the app underneath, which mounts and renders in parallel the
// entire time.
export default function BootIntro() {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startFadeOut = () => {
      setFadingOut(true);
      setTimeout(() => setDone(true), 1000);
    };

    const onCanPlay = () => {
      setCanPlay(true);
      video.play().catch(() => startFadeOut());
    };
    const onEnded = () => startFadeOut();
    const onError = () => startFadeOut();

    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('canplaythrough', onCanPlay);
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
