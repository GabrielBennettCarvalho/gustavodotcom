/* ===== Small synthesized sound effects (window.SFX) =====
   No audio files: each effect is a few oscillator notes through Web Audio, kept quiet and short.
   SFX.play(name); SFX.on (get/set, remembered in localStorage). Silent if Web Audio is missing or the user muted it. */
const SFX = (() => {
  const LS = 'estudo-ist-sfx';
  let on = true; try { on = localStorage.getItem(LS) !== '0'; } catch {}
  let ctx = null, master = null;
  const init = () => {
    if (ctx) return ctx;
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
    ctx = new A(); master = ctx.createGain(); master.gain.value = 0.16; master.connect(ctx.destination);
    return ctx;
  };
  // one note: frequency (Hz, or [from, to] for a glide), start offset, length, wave type, volume
  function note(f, at, len, type = 'sine', vol = 1) {
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    if (Array.isArray(f)) { o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + len); } else o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + len + 0.02);
  }
  function noise(at, len, vol = 0.4, freq = 1800) {
    const t = ctx.currentTime + at, n = Math.floor(ctx.sampleRate * len), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(freq * 2.2, t + len); f.Q.value = 1.4;
    g.gain.value = vol; s.buffer = b; s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  const FX = {
    tick: () => note(880, 0, 0.05, 'triangle', 0.5),
    up: () => { note(660, 0, 0.09, 'triangle', 0.7); note(990, 0.06, 0.12, 'triangle', 0.6); },
    down: () => { note(520, 0, 0.1, 'triangle', 0.6); note(390, 0.07, 0.14, 'triangle', 0.5); },
    pop: () => { note([420, 840], 0, 0.11, 'sine', 0.9); note(1260, 0.07, 0.1, 'sine', 0.35); },
    send: () => noise(0, 0.22, 0.5, 1400),
    good: () => [523, 659, 784].forEach((f, i) => note(f, i * 0.07, 0.18, 'triangle', 0.7)),
    bad: () => { note([220, 150], 0, 0.22, 'sawtooth', 0.25); note([233, 160], 0.02, 0.22, 'square', 0.12); },
    done: () => [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.09, i === 3 ? 0.42 : 0.16, 'triangle', 0.65)),
    click: () => note(1400, 0, 0.025, 'square', 0.15),
  };
  return {
    get on() { return on; },
    set on(v) { on = !!v; try { localStorage.setItem(LS, on ? '1' : '0'); } catch {} },
    play(name) {
      if (!on || !FX[name]) return;
      try { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); FX[name](); } catch {}
    },
  };
})();
