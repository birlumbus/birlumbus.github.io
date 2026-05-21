// Chime — a single vertical glowing strand with its own 2D wave field.
//
// Wave physics adapted from RotaryTimeDialView in TimeLimitDial.swift.
// The angular/polar field (288×5 samples on a closed ring) is recast as a
// vertical/depth field (192×5 samples on a strand with softened ends).
//
// The wave equation mirrors the Swift implementation at lines 618–636:
//   velocity = current - previous
//   propagated = (current + velocity * damping + (neighborAvg - current) * spread) * settling
//
// Softened top/bottom boundaries lightly clamp the wave near the ends so
// strikes feel liquid instead of turning into harsh standing-wave stripes.
//
// Rendering uses four canvas passes (outer glow, base strand, depth shading,
// shimmer highlights) mirroring drawLiquidRing / drawRippleDepth /
// drawRippleHighlights in the Swift source.

// ─── Palette utility ────────────────────────────────────────────────────────

// Interpolates smoothly through a cyclic array of [r,g,b] colors.
// Mirrors DialPalette.color(at:) in TimeLimitDial.swift.
export function paletteColorAt(colors, position) {
  const count = colors.length;
  if (count === 0) return [1, 1, 1];
  const wrapped = ((position % count) + count) % count;
  const lo = Math.floor(wrapped) % count;
  const hi = (lo + 1) % count;
  const t = wrapped - Math.floor(wrapped);
  const a = colors[lo], b = colors[hi];
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const LAYOUT_VIEWPORT_RATIO = 0.68;
const MIN_LAYOUT_WIDTH = 560;
const MAX_LAYOUT_WIDTH = 800;
const VERTICAL_SAMPLES = 192;
const DEPTH_BANDS = 5;
const VISUAL_IMPULSE_SCALE = 0.8;
const BASELINE_VERTICAL_SAMPLES = 96;
const IMPULSE_RADIUS = Math.round(12 * VERTICAL_SAMPLES / BASELINE_VERTICAL_SAMPLES);
const IMPULSE_SPREAD = 5.25 * VERTICAL_SAMPLES / BASELINE_VERTICAL_SAMPLES;
const RIPPLE_SPREAD = 0.19;
const RIPPLE_VELOCITY_DAMPING = 0.935;
const RIPPLE_SETTLING = 0.952;
const RIPPLE_EDGE_DAMPING = 0.88;
const RIPPLE_SWELL_SCALE = 3.2;
const RIPPLE_SHEEN_THRESHOLD = 0.07;
const RIPPLE_SHEEN_ALPHA = 0.16;
const RIPPLE_SHEEN_WIDTH = 0.82;
const NOTE_RELOAD_DELAY_SECONDS = 0.9;
const NOTE_SETTLE_AMPLITUDE = 0.04;

// ─── Chime class ────────────────────────────────────────────────────────────

export class Chime {
  /**
   * @param {object} cfg
   * @param {number} cfg.xPercent        horizontal position as % of viewport width
   * @param {number} cfg.yCenterPercent  vertical center as % of viewport height
   * @param {number} cfg.heightPercent   strand height as % of viewport height
   * @param {number} [cfg.baseWidth=26]  base pixel width of the strand
   */
  constructor({ xPercent, yCenterPercent, heightPercent, baseWidth = 26 }) {
    this.xPercent = xPercent;
    this.yCenterPercent = yCenterPercent;
    this.heightPercent = heightPercent;
    this.baseWidth = baseWidth;

    // Wave field: high vertical resolution × depth bands, matching the
    // primary IdleDial's finer liquid surface more closely than the old demo.
    this.vSamples = VERTICAL_SAMPLES;
    this.dBands = DEPTH_BANDS;
    const N = this.vSamples * this.dBands;
    this._bufA = new Float32Array(N); // current state
    this._bufB = new Float32Array(N); // previous state (for wave velocity)
    this._bufC = new Float32Array(N); // scratch for next state

    // Note / color state
    this.loadedNote = 0;
    this.lastPlayedNote = -1;
    this.baseOffset = 0;        // current palette position (float, tweens toward target)
    this.baseOffsetTarget = 0;  // target palette position for the loaded note
    this.isSettled = true;
    this.noteReloadTimer = 0;

    // Screen coordinates (populated by resize())
    this.x = 0;
    this.top = 0;
    this.height = 0;
    this.hitLeft = 0;
    this.hitRight = 0;
  }

  // ── Geometry ──────────────────────────────────────────────────────────────

  resize(canvasW, canvasH, hitBuffer = 16) {
    const preferredBandW = Math.max(MIN_LAYOUT_WIDTH, canvasW * LAYOUT_VIEWPORT_RATIO);
    const bandW = Math.min(canvasW, preferredBandW, MAX_LAYOUT_WIDTH);
    const bandLeft = (canvasW - bandW) / 2;
    this.x = bandLeft + bandW * this.xPercent / 100;
    const cy = canvasH * this.yCenterPercent / 100;
    this.height = canvasH * this.heightPercent / 100;
    this.top = cy - this.height / 2;
    this.hitLeft  = this.x - this.baseWidth / 2 - hitBuffer;
    this.hitRight = this.x + this.baseWidth / 2 + hitBuffer;
  }

  // ── Wave physics ──────────────────────────────────────────────────────────

  // Advance the wave field by `delta` seconds.
  // Parameters mirror Swift lines 618–620 (idle-state values).
  advanceRipple(delta) {
    const N = this.vSamples;
    const D = this.dBands;
    const spread = RIPPLE_SPREAD;
    const damping = Math.pow(RIPPLE_VELOCITY_DAMPING, delta * 30);
    const settling = Math.pow(RIPPLE_SETTLING, delta * 30);
    const a = this._bufA, b = this._bufB, c = this._bufC;

    for (let j = 0; j < D; j++) {
      const jPrev = j > 0     ? j - 1 : 0;
      const jNext = j < D - 1 ? j + 1 : D - 1;
      const rowOff  = j     * N;
      const prevOff = jPrev * N;
      const nextOff = jNext * N;

      for (let i = 0; i < N; i++) {
        const idx  = rowOff + i;
        const curr = a[idx];
        const prev = b[idx];
        // Vertical neighbors: softened ends avoid hard reflections.
        const up    = i > 0     ? a[rowOff + i - 1] : curr * 0.35;
        const down  = i < N - 1 ? a[rowOff + i + 1] : curr * 0.35;
        // Depth neighbors: clamp to edge (closed boundary)
        const inner = a[prevOff + i];
        const outer = a[nextOff + i];

        const avg  = (up + down + inner + outer) * 0.25;
        const vel  = curr - prev;
        let next = (curr + vel * damping + (avg - curr) * spread) * settling;
        if (i < 7 || i > N - 8) next *= RIPPLE_EDGE_DAMPING;
        c[idx] = next > 1 ? 1 : next < -1 ? -1 : next;
      }
    }

    // Rotate buffers: A→previous, C→current, B→scratch
    this._bufB = a;
    this._bufA = c;
    this._bufC = b;
  }

  // Inject a Gaussian-shaped impulse at normalized vertical position `yNorm`
  // (0 = top, 1 = bottom). Mirrors injectRippleDrop in the Swift source.
  injectImpulse(yNorm, strength) {
    const N = this.vSamples;
    const D = this.dBands;
    const centerI = yNorm * (N - 1);
    const centerJ = (D - 1) * 0.5;
    const a = this._bufA;

    for (let j = 0; j < D; j++) {
      const jDist = j - centerJ;
      for (let di = -IMPULSE_RADIUS; di <= IMPULSE_RADIUS; di++) {
        const i = Math.round(centerI) + di;
        if (i < 0 || i >= N) continue;
        const iDist = di / IMPULSE_SPREAD;
        // Same Gaussian falloff as Swift lines 657–659
        const falloff = Math.exp(-(iDist * iDist + jDist * jDist * 1.45) * 0.5);
        const idx = j * N + i;
        let v = a[idx] + strength * falloff;
        a[idx] = v > 1 ? 1 : v < -1 ? -1 : v;
      }
    }
  }

  // ── Public interaction ────────────────────────────────────────────────────

  // Called when the cursor crosses this chime. Returns the loaded note index.
  strike(yCrossing, strength) {
    const yNorm = Math.max(0, Math.min(1, (yCrossing - this.top) / this.height));
    this.injectImpulse(yNorm, strength * VISUAL_IMPULSE_SCALE);
    this.lastPlayedNote = this.loadedNote;
    this.isSettled = false;
    this.noteReloadTimer = NOTE_RELOAD_DELAY_SECONDS;
    return this.loadedNote;
  }

  // Per-frame update: advance physics, check for settling, tween base color.
  update(delta, chordLen, adjacentNotes) {
    this.advanceRipple(delta);

    if (!this.isSettled) {
      this.noteReloadTimer = Math.max(0, this.noteReloadTimer - delta);
      if (this.noteReloadTimer <= 0 || this._maxAmplitude() < NOTE_SETTLE_AMPLITUDE) {
        this.isSettled = true;
        this.loadedNote = this._pickNextNote(chordLen, adjacentNotes);
        this.baseOffsetTarget = this.loadedNote;
      }
    }

    // Tween baseOffset toward target (400 ms)
    const diff = this.baseOffsetTarget - this.baseOffset;
    if (Math.abs(diff) > 0.005) {
      this.baseOffset += diff * Math.min(1, delta * 2.5);
    } else {
      this.baseOffset = this.baseOffsetTarget;
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  // Four-pass render onto a shared 2D canvas context. Mirrors the Swift
  // drawLiquidRing / drawRippleDepth / drawRippleHighlights sequence.
  //
  // `chord`       — current chord preset { colors: [[r,g,b], …] }
  // `globalPhase` — shared animation phase (advances at 0.42 rad/s)
  // `crossfade`   — 0–1 blend from prevChord (0) to chord (1)
  // `prevChord`   — chord being faded from (may equal chord when crossfade = 1)
  render(ctx, chord, globalPhase, crossfade = 1, prevChord = null) {
    const N = this.vSamples;
    const D = this.dBands;
    const midJ = D >> 1; // middle depth band index
    const segH = this.height / (N - 1) + 1; // +1 ensures no gaps between segments

    const blendColors = (pos) => {
      const c = paletteColorAt(chord.colors, pos);
      if (crossfade >= 1 || !prevChord) return c;
      const p = paletteColorAt(prevChord.colors, pos);
      const t = crossfade;
      return [
        p[0] + (c[0] - p[0]) * t,
        p[1] + (c[1] - p[1]) * t,
        p[2] + (c[2] - p[2]) * t,
      ];
    };

    const colCount = chord.colors.length;
    const { x, top, height, baseWidth, baseOffset, _bufA: a } = this;
    const strandClipW = baseWidth + 14;
    const strandClipH = height + segH;
    const strandClipX = x - strandClipW * 0.5;
    const strandRadius = strandClipW * 0.5;
    const clipToRoundedStrand = () => {
      roundedRectPath(ctx, strandClipX, top, strandClipW, strandClipH, strandRadius);
      ctx.clip();
    };

    // Pre-compute ripple values and vertical gradients for the middle depth band.
    // This avoids repeated buffer lookups in the inner rendering loops.
    const ripple = new Float32Array(N);
    const grad   = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const center = a[midJ * N + i];
      const above = i > 0     ? a[midJ * N + i - 1] : center * 0.5;
      const below = i < N - 1 ? a[midJ * N + i + 1] : center * 0.5;
      ripple[i] = center * 0.58 + (above + below) * 0.21;
    }
    for (let i = 0; i < N; i++) {
      const above = i > 0     ? ripple[i - 1] : ripple[i] * 0.5;
      const below = i < N - 1 ? ripple[i + 1] : ripple[i] * 0.5;
      grad[i] = below - above;
    }

    // ── Pass 1: Soft outer glow ────────────────────────────────────────────
    // Single rect with shadowBlur — creates the diffuse bloom visible on a
    // dark background. Color follows the loaded note's palette position.
    {
      const [gr, gg, gb] = blendColors(baseOffset + globalPhase * 0.3);
      ctx.save();
      ctx.shadowBlur = 32;
      ctx.shadowColor = `rgb(${gr * 255 | 0},${gg * 255 | 0},${gb * 255 | 0})`;
      ctx.fillStyle   = `rgba(${gr * 255 | 0},${gg * 255 | 0},${gb * 255 | 0},0.04)`;
      roundedRectPath(ctx, x - baseWidth * 0.8, top - 12, baseWidth * 1.6, height + 24, baseWidth * 0.8);
      ctx.fill();
      ctx.restore();
    }

    // ── Pass 2: Base strand ────────────────────────────────────────────────
    // Per-segment colored rectangles. Color position follows the formula from
    // drawLiquidRing (Swift line 703): palette position driven by vertical
    // coordinate, animation phase, ambient sinusoidal motion, and ripple offset.
    ctx.save();
    clipToRoundedStrand();
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const y = top + t * height;
      const r = ripple[i], g = grad[i];

      // Ambient sinusoidal motion — same formula as Swift lines 693–694
      const ambient = Math.sin(t * 3 + globalPhase * 4)  * 0.22
                    + Math.sin(t * 5 - globalPhase * 2.5) * 0.12;

      // Ripple-driven hue offset — mirrors Swift line 702
      const rippleOffset = g * 2.15 + r * 1.35;

      const pos = t * colCount + baseOffset + globalPhase * 0.3 + ambient * 0.5 + rippleOffset;
      const [cr, cg, cb] = blendColors(pos);

      // Width swells with wave amplitude — the "liquid metal" bulge effect
      const w = baseWidth + (r < 0 ? -r : r) * RIPPLE_SWELL_SCALE;
      ctx.fillStyle = `rgba(${cr * 255 | 0},${cg * 255 | 0},${cb * 255 | 0},0.94)`;
      ctx.fillRect(x - w * 0.5, y, w, segH);
    }
    ctx.restore();

    // ── Pass 3: Depth shading ──────────────────────────────────────────────
    // Soft white in troughs; brightened color on crests. Mirrors drawRippleDepth.
    ctx.save();
    clipToRoundedStrand();
    for (let i = 0; i < N; i++) {
      const midR   = ripple[i];
      const innerR = a[Math.max(0,     midJ - 1) * N + i];
      const outerR = a[Math.min(D - 1, midJ + 1) * N + i];
      const radialSlope  = outerR - innerR;
      const angularSlope = grad[i];

      // Trough (shadow): negative amplitude + inward radial slope → white overlay
      const trough = -midR * 0.7 - radialSlope * 0.45;
      if (trough > 0.01) {
        const alpha = trough * 0.16 < 0.06 ? trough * 0.16 : 0.06;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(x - baseWidth * 0.5, top + (i / (N - 1)) * height, baseWidth, segH);
      }

      // Crest: positive amplitude + steep gradient → brightened color stripe
      const crest = midR * 0.42 + (angularSlope < 0 ? -angularSlope : angularSlope) * 0.95
                    + radialSlope * 0.25 - 0.055;
      if (crest > 0.01) {
        const t2 = i / (N - 1);
        const shimmer = Math.sin(t2 * 9 * Math.PI - globalPhase * 7) * 0.18;
        const pos = t2 * colCount + baseOffset + globalPhase * 0.42 + radialSlope * 3 + shimmer;
        const [cr, cg, cb] = blendColors(pos);
        const amount = crest * 0.72 < 0.24 ? crest * 0.72 : 0.24;
        const rb = cr + (1 - cr) * amount;
        const gb = cg + (1 - cg) * amount;
        const bb = cb + (1 - cb) * amount;
        const alpha = crest * 0.7 < 0.22 ? crest * 0.7 : 0.22;
        const lineW = 0.7 + (crest * 3.8 < 1.45 ? crest * 3.8 : 1.45);
        ctx.fillStyle = `rgba(${rb * 255 | 0},${gb * 255 | 0},${bb * 255 | 0},${alpha})`;
        ctx.fillRect(x - lineW * 0.5 + midR * 2.4, top + t2 * height, lineW, segH);
      }
    }
    ctx.restore();

    // ── Pass 4: Crest sheens ───────────────────────────────────────────────
    // Soft horizontal reflections at wave peaks. These keep the tactile
    // "played" texture without turning the strand into vertical white lines.
    ctx.save();
    clipToRoundedStrand();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < N; i++) {
      const h = ripple[i];
      const gradient = grad[i] < 0 ? -grad[i] : grad[i];
      const sheen = h * 0.5 + gradient * 0.72 - RIPPLE_SHEEN_THRESHOLD;
      if (sheen <= 0) continue;

      const t3 = i / (N - 1);
      const y = top + t3 * height;
      const shimmer = Math.sin(t3 * 18 + globalPhase * 9 + baseOffset) * 0.5 + 0.5;
      const width = baseWidth * (0.26 + Math.min(RIPPLE_SHEEN_WIDTH, sheen * 4.8));
      const heightPx = 0.7 + Math.min(1.25, sheen * 5.2);
      const offset = (shimmer - 0.5) * baseWidth * 0.34 + h * 2.2;
      const left = x + offset - width * 0.5;
      const alpha = Math.min(RIPPLE_SHEEN_ALPHA, sheen * 0.55);
      const glow = ctx.createLinearGradient(left, 0, left + width, 0);
      glow.addColorStop(0, 'rgba(255,255,255,0)');
      glow.addColorStop(0.28, `rgba(255,255,255,${alpha * 0.32})`);
      glow.addColorStop(0.52, `rgba(255,255,255,${alpha})`);
      glow.addColorStop(0.78, `rgba(210,255,255,${alpha * 0.28})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      roundedRectPath(ctx, left, y - heightPx * 0.5, width, heightPx, heightPx * 0.5);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  _maxAmplitude() {
    const a = this._bufA;
    let max = 0;
    for (let i = 0; i < a.length; i++) {
      const v = a[i] < 0 ? -a[i] : a[i];
      if (v > max) max = v;
    }
    return max;
  }

  // Weighted random note selection: strongly avoids repeating the last note,
  // lightly avoids notes already loaded on adjacent strands.
  _pickNextNote(chordLen, adjacentNotes) {
    const weights = new Array(chordLen).fill(1.0);
    if (this.lastPlayedNote >= 0 && this.lastPlayedNote < chordLen) {
      weights[this.lastPlayedNote] *= 0.15; // strongly avoid repeat
    }
    for (const n of adjacentNotes) {
      if (n >= 0 && n < chordLen) weights[n] *= 0.6; // lightly avoid neighbors
    }
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < chordLen; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return chordLen - 1;
  }
}
