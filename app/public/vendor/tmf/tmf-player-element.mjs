/**
 * <tmf-player> custom element — drop-in HTML tag for TMF playback.
 *
 *   <script type="module" src="format/player/tmf-player-element.mjs"></script>
 *   <tmf-player src="movie.tmf" loop autoplay controls></tmf-player>
 *
 * Mirrors the relevant subset of HTMLMediaElement so it slots into the
 * mental model people already have. Internally uses TmfPlayer; the
 * element owns a canvas, an optional control bar, and the playback state.
 */

import { TmfPlayer } from './tmf-player.mjs';

const DEFAULT_STYLES = `
  :host {
    display: inline-block;
    position: relative;
    background: repeating-conic-gradient(#222 0 25%, #333 0 50%) 0 0/16px 16px;
    line-height: 0;
  }
  canvas { display: block; max-width: 100%; image-rendering: pixelated; }
  .controls {
    position: absolute; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6); color: #ddd;
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.4rem 0.6rem; font: 12px system-ui, sans-serif;
    opacity: 0; transition: opacity 0.15s; line-height: 1.2;
  }
  :host(:hover) .controls, :host([controls]:not([hide-controls])) .controls { opacity: 1; }
  .controls button {
    background: none; border: 1px solid #666; color: inherit;
    padding: 0.15rem 0.5rem; border-radius: 3px; cursor: pointer; font: inherit;
  }
  .controls input[type=range] { flex: 1; min-width: 0; }
  .time { font-variant-numeric: tabular-nums; min-width: 5em; text-align: right; }
`;

// SSR / Node guard: HTMLElement only exists in DOM environments. Using a
// stub base class keeps `import { TmfPlayerElement }` non-throwing on the
// server; the registration block at the bottom is guarded separately, so
// the class is defined-but-never-instantiated outside browsers.
const _HTMLElementBase = typeof HTMLElement !== 'undefined'
  ? HTMLElement
  : class { constructor() { throw new Error('TmfPlayerElement: DOM-only class instantiated in non-DOM environment'); } };

class TmfPlayerElement extends _HTMLElementBase {
  static get observedAttributes() { return ['src', 'poster', 'preload']; }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = DEFAULT_STYLES;
    this._canvas = document.createElement('canvas');
    this._controls = document.createElement('div');
    this._controls.className = 'controls';
    this._controls.innerHTML = `
      <button data-act="play">▶</button>
      <input type="range" min="0" max="1000" value="0" step="1">
      <span class="time">0.00 / 0.00</span>
    `;
    this._root.append(style, this._canvas, this._controls);

    this._player = null;
    this._stopFn = null;
    this._scrub = this._controls.querySelector('input[type=range]');
    this._timeLabel = this._controls.querySelector('.time');
    this._playBtn = this._controls.querySelector('button[data-act=play]');

    this._playBtn.addEventListener('click', () => this.paused ? this.play() : this.pause());
    this._scrub.addEventListener('input', () => {
      if (!this._player) return;
      this.pause();
      this.currentTime = parseInt(this._scrub.value, 10) / 1000;
    });

    // ARIA / a11y (U3): the host element reads as a media player to AT.
    this.setAttribute('role', 'application');
    this._playBtn.setAttribute('aria-label', 'Play / pause');
    this._scrub.setAttribute('aria-label', 'Seek');
    this._scrub.setAttribute('role', 'slider');

    // Keyboard shortcuts (U4): space = play/pause, ←/→ = seek, ↑/↓ = volume,
    // Home/End = start/end, M = mute, F = fullscreen.
    this.tabIndex = 0;     // focusable
    this.addEventListener('keydown', (e) => {
      if (!this._player) return;
      switch (e.key) {
        case ' ':       e.preventDefault(); this.paused ? this.play() : this.pause(); break;
        case 'ArrowRight': e.preventDefault(); this.currentTime = Math.min(this.duration, this.currentTime + 5); break;
        case 'ArrowLeft':  e.preventDefault(); this.currentTime = Math.max(0, this.currentTime - 5); break;
        case 'ArrowUp':    e.preventDefault(); this._setVolume(Math.min(1, this.volume + 0.1)); break;
        case 'ArrowDown':  e.preventDefault(); this._setVolume(Math.max(0, this.volume - 0.1)); break;
        case 'Home':       e.preventDefault(); this.currentTime = 0; break;
        case 'End':        e.preventDefault(); this.currentTime = this.duration; break;
        case 'm': case 'M': this.muted = !this.muted; break;
        case 'f': case 'F': this._toggleFullscreen(); break;
      }
    });
  }

  _toggleFullscreen() {
    if (typeof this.requestFullscreen !== 'function') return;
    if (document.fullscreenElement === this) document.exitFullscreen();
    else this.requestFullscreen();
  }

  _setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._audioGain) this._audioGain.gain.value = this._muted ? 0 : this._volume;
    this.dispatchEvent(new Event('volumechange'));
  }

  connectedCallback() {
    if (this.hasAttribute('src')) this._loadSrc(this.getAttribute('src'));
  }
  disconnectedCallback() {
    if (this._stopFn) { this._stopFn(); this._stopFn = null; }
  }
  attributeChangedCallback(name, _old, val) {
    if (name === 'src' && val) this._loadSrc(val);
  }

  // --- HTMLMediaElement-shaped API ----------------------------------------

  get src() { return this.getAttribute('src'); }
  set src(v) { v == null ? this.removeAttribute('src') : this.setAttribute('src', v); }

  get loop() { return this.hasAttribute('loop'); }
  set loop(v) { v ? this.setAttribute('loop', '') : this.removeAttribute('loop'); }

  get autoplay() { return this.hasAttribute('autoplay'); }
  set autoplay(v) { v ? this.setAttribute('autoplay', '') : this.removeAttribute('autoplay'); }

  get muted() { return this.hasAttribute('muted'); }
  set muted(v) {
    v ? this.setAttribute('muted', '') : this.removeAttribute('muted');
    this._muted = v;
    if (this._audioGain) this._audioGain.gain.value = v ? 0 : (this._volume ?? 1);
    this.dispatchEvent(new Event('volumechange'));
  }

  get volume() { return this._volume ?? 1; }
  set volume(v) { this._setVolume(v); }

  get poster() { return this.getAttribute('poster'); }
  set poster(v) { v == null ? this.removeAttribute('poster') : this.setAttribute('poster', v); }

  get preload() { return this.getAttribute('preload') || 'auto'; }
  set preload(v) { v == null ? this.removeAttribute('preload') : this.setAttribute('preload', v); }

  /** HTMLMediaElement parity: TimeRanges-shaped objects. */
  get seekable() { return makeRange(0, this.duration); }
  get buffered() { return makeRange(0, this.duration); }
  get playbackRate() { return this._playbackRate ?? 1; }
  set playbackRate(v) {
    this._playbackRate = v;
    this.dispatchEvent(new Event('ratechange'));
  }
  get readyState() { return this._player ? 4 : 0; }     // HAVE_ENOUGH_DATA when loaded
  get networkState() { return this._player ? 1 : 0; }   // NETWORK_IDLE when loaded
  get ended() { return this._currentTime >= this.duration && !this.loop; }

  get duration() { return this._player ? this._player.duration : 0; }
  get paused() { return !this._stopFn; }
  get videoWidth() { return this._player ? this._player.width : 0; }
  get videoHeight() { return this._player ? this._player.height : 0; }
  get currentTime() { return this._currentTime || 0; }
  set currentTime(t) {
    this._currentTime = Math.max(0, Math.min(this.duration, t));
    if (this._player) this._player.drawFrame(this._canvas, this._currentTime).catch(() => {});
    this._scrub.value = String(Math.round(this._currentTime * 1000));
    this._updateTimeLabel();
    this.dispatchEvent(new Event('timeupdate'));
  }

  async play() {
    if (!this._player) return;
    if (this._stopFn) this._stopFn();
    const startedAt = this._currentTime || 0;
    const epoch = performance.now();
    // We re-implement the loop here so we can publish timeupdate events
    // from a single source of truth (and because TmfPlayer.play() resets
    // the wall clock; we want to resume from currentTime).
    let stopped = false;
    const audio = this.muted ? false : undefined;   // undefined => use container audio if present
    const loop = this.loop;
    const tick = async () => {
      if (stopped) return;
      const elapsed = (performance.now() - epoch) / 1000;
      let t = startedAt + elapsed;
      if (t >= this._player.duration) {
        if (loop && this._player.duration > 0) t = t % this._player.duration;
        else { stopped = true; this._stopFn = null; this._playBtn.textContent = '▶';
               this.dispatchEvent(new Event('ended')); return; }
      }
      this._currentTime = t;
      await this._player.drawFrame(this._canvas, t);
      this._scrub.value = String(Math.round(t * 1000));
      this._updateTimeLabel();
      this.dispatchEvent(new Event('timeupdate'));
      requestAnimationFrame(tick);
    };
    // For audio-bearing containers, prefer the audio-synced loop in
    // TmfPlayer.play (drift-free). The lightweight loop above is for
    // muted / video-only cases.
    if (!this.muted && this._player.audioChunk) {
      this._stopFn = this._player.play(this._canvas, {
        loop, audio: true,
        onFrame: (_idx, t) => {
          this._currentTime = t;
          this._scrub.value = String(Math.round(t * 1000));
          this._updateTimeLabel();
          this.dispatchEvent(new Event('timeupdate'));
        },
      });
    } else {
      this._stopFn = () => { stopped = true; };
      requestAnimationFrame(tick);
    }
    this._playBtn.textContent = '⏸';
    this.dispatchEvent(new Event('play'));
  }

  pause() {
    if (this._stopFn) { this._stopFn(); this._stopFn = null; }
    this._playBtn.textContent = '▶';
    this.dispatchEvent(new Event('pause'));
  }

  // --- Internals ----------------------------------------------------------

  async _loadSrc(url) {
    if (this._stopFn) { this._stopFn(); this._stopFn = null; }
    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      this._player = await TmfPlayer.fromArrayBuffer(buf);
      this._canvas.width  = this._player.width;
      this._canvas.height = this._player.height;
      this._scrub.max = String(Math.max(1, Math.round(this._player.duration * 1000)));
      this._scrub.value = '0';
      this._currentTime = 0;
      this._updateTimeLabel();
      await this._player.drawFrame(this._canvas, 0);
      this.dispatchEvent(new Event('loadedmetadata'));
      if (this.autoplay) this.play();
    } catch (err) {
      this.dispatchEvent(new ErrorEvent('error', { error: err, message: err.message }));
    }
  }

  _updateTimeLabel() {
    const fmt = s => `${s.toFixed(2)}`;
    this._timeLabel.textContent = `${fmt(this._currentTime || 0)} / ${fmt(this.duration)}`;
  }
}

/** Tiny TimeRanges-like structure (HTMLMediaElement seekable/buffered shape). */
function makeRange(start, end) {
  return {
    length: end > start ? 1 : 0,
    start: (i) => i === 0 ? start : (() => { throw new RangeError('index out of range'); })(),
    end:   (i) => i === 0 ? end   : (() => { throw new RangeError('index out of range'); })(),
  };
}

if (typeof customElements !== 'undefined' && !customElements.get('tmf-player')) {
  customElements.define('tmf-player', TmfPlayerElement);
}

export { TmfPlayerElement };
