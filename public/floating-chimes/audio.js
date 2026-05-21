// AudioEngine — Web Audio API synthesis with shared convolution reverb.
//
// The AudioContext is created lazily on the first `unlock()` call (which must
// happen from a user-gesture handler). Three voice types replicate the
// plan's intended timbres: glass bowls (long additive sine), bells (inharmonic
// partials), and pad (detuned triangle waves with slow attack).
//
// Polyphony cap: when a 7th voice would start, the oldest is faded out in
// ~150 ms and released. The reverb uses a synthetic exponential-decay impulse
// response so no audio file loading is required.

export class AudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._limiter = null;
    this._outputTrim = null;
    this._dryGain = null;
    this._wetGain = null;
    this._reverbNode = null;
    this._reverbSend = null;
    this._voices = [];
    this._maxVoices = 10;
    this._unlocked = false;
    this._initPromise = null;
  }

  // Must be called from a user-gesture handler (click, pointermove, touchstart, …).
  // Safe to call on every pointer move — fast no-op when already running.
  async unlock() {
    // Fast path: graph is ready and context is actively running.
    if (this._unlocked && this._ctx && this._ctx.state === 'running') return;

    // Build the audio graph once. Do NOT cache a rejected promise — that
    // would make every retry re-throw immediately with no chance to recover.
    if (!this._ctx) {
      try {
        await this._init();
      } catch (_) {
        return; // will retry on the next gesture
      }
    }

    // Resume (may need a valid user gesture; retried on every gesture call).
    try {
      if (this._ctx.state !== 'running') await this._ctx.resume();
    } catch (_) {
      return; // will retry on the next gesture
    }

    if (this._ctx.state === 'running') this._unlocked = true;
  }

  get isUnlocked() {
    return this._unlocked && this._ctx != null && this._ctx.state === 'running';
  }

  async _init() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    // No options — { latencyHint } has uneven Safari support and can throw.
    this._ctx = new Ctx();

    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = 0.72 * 0.85;

    this._limiter = this._ctx.createDynamicsCompressor();
    this._limiter.threshold.value = -10;
    this._limiter.knee.value = 8;
    this._limiter.ratio.value = 16;
    this._limiter.attack.value = 0.004;
    this._limiter.release.value = 0.18;

    this._outputTrim = this._ctx.createGain();
    this._outputTrim.gain.value = 0.92;

    this._masterGain.connect(this._limiter);
    this._limiter.connect(this._outputTrim);
    this._outputTrim.connect(this._ctx.destination);

    // Dry signal path (direct)
    this._dryGain = this._ctx.createGain();
    this._dryGain.gain.value = 0.36;
    this._dryGain.connect(this._masterGain);

    // Wet signal path (reverb)
    this._wetGain = this._ctx.createGain();
    this._wetGain.gain.value = 0.42;
    this._wetGain.connect(this._masterGain);

    this._reverbNode = this._ctx.createConvolver();
    this._reverbNode.buffer = this._makeReverbIR(3.8, 2.4);
    this._reverbNode.connect(this._wetGain);

    // Single send bus into the reverb
    this._reverbSend = this._ctx.createGain();
    this._reverbSend.gain.value = 0.72;
    this._reverbSend.connect(this._reverbNode);
  }

  // Synthetic hall impulse response: white noise with exponential decay.
  // `duration` in seconds, `decay` controls tail slope (higher = shorter tail).
  _makeReverbIR(duration, decay) {
    const sr = this._ctx.sampleRate;
    const len = Math.round(sr * duration);
    const buf = this._ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  // Play a single note. `velocity` is 0–1, `voiceType` is 'glass'|'bell'|'pad'.
  playNote(freq, velocity, voiceType) {
    if (!this._ctx) return;
    // Auto-resume if the browser suspended the context (tab switch, focus loss, etc.)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
      return; // skip this note; context will be running for the next strike
    }
    if (!this._unlocked) return;

    // Evict finished voices
    this._voices = this._voices.filter(v => !v.done);

    // Enforce polyphony cap by gracefully releasing the oldest voice
    if (this._voices.length >= this._maxVoices) {
      const oldest = this._voices.shift();
      oldest.release(0.15);
    }

    const voice = this._makeVoice(freq, velocity, voiceType);
    if (voice) this._voices.push(voice);
  }

  _makeVoice(freq, velocity, type) {
    switch (type) {
      case 'mallet': return this._malletVoice(freq, velocity);
      case 'harp':   return this._harpVoice(freq, velocity);
      case 'pad':    return this._padVoice(freq, velocity);
      default:       return this._glassVoice(freq, velocity);
    }
  }

  // Glass bowl: four additive sine harmonics with independent decays.
  // Ratio 4.06 adds the slight inharmonicity that gives bowls their shimmer.
  _glassVoice(freq, velocity) {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    const amp = velocity * 0.22;
    const duration = 4.5;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(amp, t + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    master.connect(this._dryGain);
    master.connect(this._reverbSend);

    const harmonics = [
      [1.00, 1.00],
      [2.00, 0.45],
      [3.00, 0.18],
      [4.06, 0.07],
    ];

    const oscs = harmonics.map(([ratio, gain]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + duration + 0.15);
      return osc;
    });

    return makeVoice(ctx, master, oscs, duration);
  }

  // Mallet (vibraphone-style): pure sine fundamental with a warm octave partial
  // and the classic 3.733× inharmonic overtone that gives vibraphones their
  // metallic shimmer. Fast 8 ms attack, 2.6 s decay.
  _malletVoice(freq, velocity) {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    const amp = velocity * 0.24;
    const duration = 2.6;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(amp, t + 0.008);
    master.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    master.connect(this._dryGain);
    master.connect(this._reverbSend);

    const partials = [
      [1.000, 1.00], // fundamental
      [2.000, 0.18], // octave — adds body
      [3.733, 0.10], // vibraphone characteristic partial
    ];

    const oscs = partials.map(([ratio, gain]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + duration + 0.15);
      return osc;
    });

    return makeVoice(ctx, master, oscs, duration);
  }

  // Harp / pluck: each harmonic decays at its own rate. Higher partials fade
  // out first, leaving a pure singing fundamental — mimics Karplus-Strong
  // string character without a delay line. 3 ms attack, 2.2 s fundamental.
  _harpVoice(freq, velocity) {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    const amp = velocity * 0.20;
    const duration = 2.2;

    // Master is a flat pass-through; individual gain nodes carry the envelopes.
    // release() ramps master to 0, fading out whatever harmonics remain.
    const master = ctx.createGain();
    master.gain.value = 1.0;
    master.connect(this._dryGain);
    master.connect(this._reverbSend);

    const harmonics = [
      { ratio: 1.0, peak: amp * 0.88, decay: duration },
      { ratio: 2.0, peak: amp * 0.52, decay: 0.55 },
      { ratio: 3.0, peak: amp * 0.28, decay: 0.22 },
      { ratio: 4.0, peak: amp * 0.14, decay: 0.10 },
      { ratio: 5.0, peak: amp * 0.06, decay: 0.06 },
    ];

    const oscs = harmonics.map(({ ratio, peak, decay }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + decay + 0.05);
      return osc;
    });

    return makeVoice(ctx, master, oscs, duration, 0.1);
  }

  // Pad: three slightly detuned triangle oscillators through a low-pass filter,
  // with a slow 450 ms attack. Very ambient — each strike adds a sustained tone.
  _padVoice(freq, velocity) {
    const ctx = this._ctx;
    const t = ctx.currentTime;
    const amp = velocity * 0.18;
    const attack = 0.45;
    const duration = 6.0;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(amp, t + attack);
    master.gain.setValueAtTime(amp, t + attack);
    master.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    master.connect(this._dryGain);
    master.connect(this._reverbSend);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(freq * 5, 4000);
    filter.Q.value = 0.6;
    filter.connect(master);

    const oscs = [-7, 0, 7].map(detune => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = detune === 0 ? 0.6 : 0.3;
      osc.connect(g);
      g.connect(filter);
      osc.start(t);
      osc.stop(t + duration + 0.15);
      return osc;
    });

    return makeVoice(ctx, master, oscs, duration, 0.3);
  }
}

// Shared factory for a voice object with a `done` flag and `release()` method.
function makeVoice(ctx, masterGain, oscs, duration, defaultFade = 0.2) {
  const voice = { done: false };
  setTimeout(() => { voice.done = true; }, (duration + 0.6) * 1000);

  voice.release = (fadeTime = defaultFade) => {
    if (voice.done) return;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + fadeTime);
    oscs.forEach(o => { try { o.stop(now + fadeTime + 0.05); } catch (_) {} });
    voice.done = true;
  };

  return voice;
}
