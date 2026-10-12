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
// The original wave field drives refracted light inside suspended glass panes.

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

function glassColorAt(chord, position, crossfade = 1, prevChord = null) {
  const current = paletteColorAt(chord.colors, position);
  const previous = prevChord && crossfade < 1 ? paletteColorAt(prevChord.colors, position) : current;
  const mixed = current.map((value, i) => previous[i] + (value - previous[i]) * crossfade);
  const brightest = Math.max(...mixed);
  return mixed.map(value => Math.max(0, brightest - (brightest - value) * 1.25) * 255);
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

const LAYOUT_VIEWPORT_RATIO = 0.74;
const MIN_LAYOUT_WIDTH = 560;
const MAX_LAYOUT_WIDTH = 900;
const VERTICAL_SAMPLES = 192;
const DEPTH_BANDS = 5;
const VISUAL_IMPULSE_SCALE = 1.05;
const BASELINE_VERTICAL_SAMPLES = 96;
const IMPULSE_RADIUS = Math.round(12 * VERTICAL_SAMPLES / BASELINE_VERTICAL_SAMPLES);
const IMPULSE_SPREAD = 5.25 * VERTICAL_SAMPLES / BASELINE_VERTICAL_SAMPLES;
const RIPPLE_SPREAD = 0.19;
const RIPPLE_VELOCITY_DAMPING = 0.935;
const RIPPLE_SETTLING = 0.952;
const RIPPLE_EDGE_DAMPING = 0.88;
const NOTE_RELOAD_DELAY_SECONDS = 0.9;
const NOTE_SETTLE_AMPLITUDE = 0.04;
const PALETTE_RETUNE_RATE = 0.72;
const PALETTE_RETUNE_SHIFT_FRACTION = 0.36;
const PALETTE_RETUNE_EPSILON = 0.003;
const RECOIL_STIFFNESS = 30;
const RECOIL_DAMPING = 1.0;
const TAP_RECOIL_SCALE = 0.12;
const TAP_RECOIL_DAMPING = 3.8;
const TAP_MAX_TRAVEL = 6; // pixels at the lower end, so another tap stays easy
// The same iridescent family revealed by a passing current on the home cloth.
const BLOOM_COLORS = [[20, 219, 194], [158, 82, 240], [255, 92, 153], [255, 194, 92]];

// ─── Chime class ────────────────────────────────────────────────────────────

export class Chime {
  /**
   * @param {object} cfg
   * @param {number} cfg.xPercent        horizontal position as % of viewport width
   * @param {number} cfg.yCenterPercent  vertical center as % of viewport height
   * @param {number} cfg.heightPercent   strand height as % of viewport height
   * @param {number} [cfg.baseWidth=30]  base pixel width of the strand
   */
  constructor({ xPercent, yCenterPercent, heightPercent, baseWidth = 30 }) {
    this.xPercent = xPercent;
    this.yCenterPercent = yCenterPercent;
    this.heightPercent = heightPercent;
    this.baseWidth = baseWidth;
    this.drawWidth = baseWidth;
    this.strikeGlow = 0;
    this.lightEnergy = 0;
    this.strikeAge = 10;
    this.lastStrikeNorm = 0.5;
    this.motionAngle = 0;
    this.motionVelocity = 0;
    this.gentleMotion = false;
    this.maxAngle = 0.1;
    this.colorBlooms = [];
    this.colorSequence = 0;

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

  resize(canvasW, canvasH, hitBuffer = 16, stageTop = 0) {
    const preferredBandW = Math.max(MIN_LAYOUT_WIDTH, canvasW * LAYOUT_VIEWPORT_RATIO);
    const bandW = Math.min(canvasW - 24, preferredBandW, MAX_LAYOUT_WIDTH);
    const bandLeft = (canvasW - bandW) / 2;
    this.x = bandLeft + bandW * this.xPercent / 100;
    const cy = stageTop + canvasH * this.yCenterPercent / 100;
    this.height = canvasH * this.heightPercent / 100;
    this.top = cy - this.height / 2;
    this.drawWidth = Math.min(this.baseWidth, canvasW < 560 ? 24 : this.baseWidth);
    this.maxAngle = Math.min(0.14, (bandW / 8) * 0.42 / (this.height * 0.9));
    this.motionAngle = 0;
    this.motionVelocity = 0;
    this.hitLeft  = this.x - this.drawWidth / 2 - hitBuffer;
    this.hitRight = this.x + this.drawWidth / 2 + hitBuffer;
  }

  pose(reducedMotion = false) {
    return {
      angle: reducedMotion ? 0 : this.motionAngle,
      pivotX: this.x,
      pivotY: this.top + this.height * 0.1,
    };
  }

  worldPoint(x, y, reducedMotion = false) {
    const { angle, pivotX, pivotY } = this.pose(reducedMotion);
    const dx = x - pivotX, dy = y - pivotY;
    return {
      x: pivotX + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: pivotY + dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  }

  localPoint(x, y, reducedMotion = false) {
    const { angle, pivotX, pivotY } = this.pose(reducedMotion);
    const dx = x - pivotX, dy = y - pivotY;
    return {
      x: pivotX + dx * Math.cos(angle) + dy * Math.sin(angle),
      y: pivotY - dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  }

  hitAt(x, y, padding = 0, reducedMotion = false) {
    const local = this.localPoint(x, y, reducedMotion);
    const distance = Math.abs(local.x - this.x);
    if (distance > this.drawWidth / 2 + padding || local.y < this.top || local.y > this.top + this.height) return null;
    return { y: local.y, distance, direction: local.x > this.x ? -1 : 1 };
  }

  crossingAt(fromX, fromY, toX, toY, reducedMotion = false) {
    const from = this.localPoint(fromX, fromY, reducedMotion);
    const to = this.localPoint(toX, toY, reducedMotion);
    const dx = to.x - from.x;
    if (Math.abs(dx) < 0.5 || (from.x < this.x) === (to.x < this.x)) return null;
    const t = (this.x - from.x) / dx;
    const y = from.y + (to.y - from.y) * t;
    if (y < this.top || y > this.top + this.height) return null;
    return { y, direction: Math.sign(dx), t };
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

  // Taps use a small movement budget; sweeps keep their directional swing.
  // The note and internal light response share the original strike strength.
  strike(yCrossing, strength, direction = 1, { gentle = false } = {}) {
    this.gentleMotion = gentle;
    this.strikeGlow = Math.max(this.strikeGlow, strength);
    const yNorm = Math.max(0, Math.min(1, (yCrossing - this.top) / this.height));
    this.lastStrikeNorm = yNorm;
    this.strikeAge = 0;
    this.lightEnergy = Math.min(1, this.lightEnergy + strength * 0.8);
    this.colorBlooms.push({ yNorm, strength, age: 0, phase: this.colorSequence });
    this.colorSequence = (this.colorSequence + 0.73) % BLOOM_COLORS.length;
    if (this.colorBlooms.length > 8) this.colorBlooms.shift();
    const impulse = -Math.sign(direction || 1) * strength * this.maxAngle * 6.6 * (0.55 + yNorm * 1.15) * (gentle ? TAP_RECOIL_SCALE : 1);
    // Limit the energy added by another strike, rather than flattening the
    // drawn angle near its limit. Gravity can then turn the pane immediately.
    // A tap also absorbs a preceding mouse-entry strike. If the pane is already
    // outside this small budget, stop its added momentum and let gravity return
    // it naturally from the current angle, without changing its position.
    const motionLimit = gentle ? Math.min(this.maxAngle, TAP_MAX_TRAVEL / (this.height * 0.9)) : this.maxAngle;
    const velocityLimit = Math.sqrt(RECOIL_STIFFNESS * Math.max(0, motionLimit ** 2 - this.motionAngle ** 2));
    this.motionVelocity = Math.max(-velocityLimit, Math.min(velocityLimit, this.motionVelocity + impulse));
    this.injectImpulse(yNorm, strength * VISUAL_IMPULSE_SCALE);
    this.lastPlayedNote = this.loadedNote;
    this.isSettled = false;
    this.noteReloadTimer = NOTE_RELOAD_DELAY_SECONDS;
    return this.loadedNote;
  }

  // Per-frame update: advance physics, check for settling, tween base color.
  update(delta, chordLen, adjacentNotes) {
    this.advanceRipple(delta);
    this.strikeGlow *= Math.exp(-delta * 1.9);
    this.lightEnergy *= Math.exp(-delta * 1.3);
    this.strikeAge += delta;
    for (const bloom of this.colorBlooms) bloom.age += delta;
    this.colorBlooms = this.colorBlooms.filter(bloom => bloom.age < 8);

    // Solve the damped spring analytically so rebound feels the same at every
    // frame rate. Strike energy keeps the whole swing within its pane's space.
    const angle = this.motionAngle, velocity = this.motionVelocity;
    const damping = this.gentleMotion ? TAP_RECOIL_DAMPING : RECOIL_DAMPING;
    const frequency = Math.sqrt(RECOIL_STIFFNESS - damping ** 2);
    const decay = Math.exp(-damping * delta);
    const sin = Math.sin(frequency * delta);
    const cos = Math.cos(frequency * delta);
    this.motionAngle = decay * (angle * cos + (velocity + damping * angle) / frequency * sin);
    this.motionVelocity = decay * (velocity * cos - (damping * velocity + RECOIL_STIFFNESS * angle) / frequency * sin);
    if (Math.abs(this.motionAngle) + Math.abs(this.motionVelocity) < 0.0001) {
      this.motionAngle = 0;
      this.motionVelocity = 0;
    }

    if (!this.isSettled) {
      this.noteReloadTimer = Math.max(0, this.noteReloadTimer - delta);
      if (this.noteReloadTimer <= 0 || this._maxAmplitude() < NOTE_SETTLE_AMPLITUDE) {
        this.isSettled = true;
        this.loadedNote = this._pickNextNote(chordLen, adjacentNotes);
        this.baseOffsetTarget = this._softRetuneTarget(this.loadedNote, chordLen);
      }
    }

    // Let the post-ripple palette retune drift quietly instead of snapping to
    // the next note color. The target is already softened, so this easing can be
    // deliberately slow without making the strand feel unresponsive.
    const diff = this.baseOffsetTarget - this.baseOffset;
    if (Math.abs(diff) > PALETTE_RETUNE_EPSILON) {
      this.baseOffset += diff * Math.min(1, delta * PALETTE_RETUNE_RATE);
    } else {
      this.baseOffset = this.baseOffsetTarget;
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  // A contact leaves pigment in the glass. Two soft fronts carry it away from
  // the strike, while a smaller wash lingers at the contact point. Blend the
  // overlapping washes before tinting so repeated taps cannot bleach the pane.
  materialColorAt(chord, position, yNorm, crossfade = 1, prevChord = null, reducedMotion = false) {
    const base = glassColorAt(chord, position, crossfade, prevChord);
    let weight = 0;
    const pigment = [0, 0, 0];
    for (const bloom of this.colorBlooms) {
      const distance = Math.abs(yNorm - bloom.yNorm);
      const width = reducedMotion ? 0.09 : 0.065 + Math.min(2, bloom.age) * 0.035;
      const core = Math.exp(-0.5 * (distance / width) ** 2);
      const front = reducedMotion ? core : Math.exp(-0.5 * ((distance - bloom.age * 0.34) / width) ** 2);
      const presence = bloom.strength * Math.exp(-bloom.age * 0.9) * (core * 0.45 + front * 0.9);
      if (presence < 0.0001) continue;
      const phase = bloom.phase + (reducedMotion ? 0 : bloom.age * 0.38 + yNorm * 0.5);
      const color = paletteColorAt(BLOOM_COLORS, phase);
      weight += presence;
      for (let i = 0; i < 3; i++) pigment[i] += color[i] * presence;
    }
    if (!weight) return base;
    const amount = Math.min(0.82, 1 - Math.exp(-weight * 2));
    return base.map((value, i) => value + (pigment[i] / weight - value) * amount);
  }

  // Colored light spills into the room from the same contact point and palette
  // as the pane. It grows softly and fades as the resonance settles.
  renderLight(ctx, chord, globalPhase, crossfade = 1, prevChord = null, reducedMotion = false) {
    const phase = reducedMotion ? 0 : globalPhase;
    const position = this.baseOffset * 0.68 + phase * 0.11 + this.lastStrikeNorm * 1.18;
    const color = this.materialColorAt(chord, position, this.lastStrikeNorm, crossfade, prevChord, reducedMotion).map(Math.round).join(',');
    const center = this.worldPoint(this.x, this.top + this.height * this.lastStrikeNorm, reducedMotion);
    const spread = reducedMotion ? 1 : 0.68 + (1 - Math.exp(-this.strikeAge * 1.8)) * 0.6;
    const radius = Math.max(90, Math.min(330, this.height * 0.62)) * spread;
    const alpha = 0.014 + this.lightEnergy * 0.13;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(center.x, center.y);
    ctx.scale(1.4, 0.85);
    const light = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    light.addColorStop(0, `rgba(${color},${alpha})`);
    light.addColorStop(0.28, `rgba(${color},${alpha * 0.56})`);
    light.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = light;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
  }

  // The pane's material and ripple move together. Contacts use this same pose.
  render(ctx, chord, globalPhase, crossfade = 1, prevChord = null, reducedMotion = false) {
    const { x, top, height, drawWidth: width, strikeGlow } = this;
    const left = x - width / 2;
    const radius = Math.min(4, width * 0.18);
    const phase = reducedMotion ? 0 : globalPhase;
    const colorAt = (position, yNorm) => this.materialColorAt(chord, position, yNorm, crossfade, prevChord, reducedMotion);
    const offset = this.baseOffset * 0.68 + phase * 0.11;
    const primary = colorAt(offset + this.lastStrikeNorm * 1.18, this.lastStrikeNorm);
    const rgb = color => color.map(value => Math.round(value)).join(',');
    const glassPath = () => roundedRectPath(ctx, left, top, width, height, radius);

    ctx.save();
    const { angle, pivotX, pivotY } = this.pose(reducedMotion);
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.translate(-pivotX, -pivotY);

    // A restrained colored halo makes the glass legible without a neon bloom.
    ctx.shadowColor = `rgba(${rgb(primary)},${0.12 + strikeGlow * 0.25})`;
    ctx.shadowBlur = 16 + strikeGlow * 18;
    ctx.fillStyle = `rgba(${rgb(primary)},0.085)`;
    glassPath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // One gradual spectral shift along each pane, rather than repeated stripes.
    const tint = ctx.createLinearGradient(0, top, 0, top + height);
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const color = colorAt(offset + t * 1.18, t);
      tint.addColorStop(t, `rgba(${rgb(color)},${0.78 + strikeGlow * 0.15})`);
    }
    ctx.fillStyle = tint;
    glassPath();
    ctx.fill();
    ctx.save();
    glassPath();
    ctx.clip();

    // Consistent light from the upper left reveals the beveled cross section.
    const face = ctx.createLinearGradient(left, 0, left + width, 0);
    face.addColorStop(0, 'rgba(228,247,247,0.18)');
    face.addColorStop(0.09, 'rgba(217,242,241,0.08)');
    face.addColorStop(0.22, 'rgba(10,25,36,0.12)');
    face.addColorStop(0.56, 'rgba(14,29,42,0.10)');
    face.addColorStop(0.82, 'rgba(230,240,255,0.11)');
    face.addColorStop(0.95, 'rgba(222,236,250,0.13)');
    face.addColorStop(1, 'rgba(11,23,37,0.20)');
    ctx.fillStyle = face;
    ctx.fillRect(left, top, width, height);

    const reflection = ctx.createLinearGradient(left, top, left + width, top + height);
    reflection.addColorStop(0, 'rgba(242,252,252,0.10)');
    reflection.addColorStop(0.18, 'rgba(242,252,252,0.01)');
    reflection.addColorStop(0.43, 'rgba(242,252,252,0.025)');
    reflection.addColorStop(0.49, 'rgba(242,252,252,0.08)');
    reflection.addColorStop(0.52, 'rgba(242,252,252,0.01)');
    reflection.addColorStop(1, 'rgba(242,252,252,0.07)');
    ctx.fillStyle = reflection;
    ctx.fillRect(left, top, width, height);

    // Refracted light travels with the existing ripple, without changing sound
    // or note reload timing. Reduced motion keeps only the quiet face highlight.
    if (!reducedMotion) {
      const N = this.vSamples;
      const middle = (this.dBands >> 1) * N;
      const segmentHeight = height / (N - 1) + 0.1;
      ctx.globalCompositeOperation = 'screen';
      for (let i = 1; i < N - 1; i++) {
        const ripple = this._bufA[middle + i];
        const gradient = this._bufA[middle + i + 1] - this._bufA[middle + i - 1];
        const energy = Math.abs(ripple) * 1.1 + Math.abs(gradient) * 1.8;
        if (energy < 0.018) continue;
        const t = i / (N - 1);
        const color = colorAt(offset + t * 1.18 + ripple * 0.65, t);
        ctx.fillStyle = `rgba(${rgb(color)},${Math.min(0.62, energy * 0.8)})`;
        ctx.fillRect(left + 1, top + t * height, width - 2, segmentHeight);
        ctx.fillStyle = `rgba(235,251,252,${Math.min(0.55, energy * 0.9)})`;
        ctx.fillRect(left + 1.8 + ripple * 1.5, top + t * height, 1.1, segmentHeight);
      }
    }
    ctx.restore();

    // The edge and end rims hold their shape as the light settles.
    const rim = ctx.createLinearGradient(0, top, 0, top + height);
    rim.addColorStop(0, 'rgba(226,247,249,0.58)');
    rim.addColorStop(0.4, 'rgba(221,242,246,0.17)');
    rim.addColorStop(1, 'rgba(211,229,247,0.38)');
    ctx.strokeStyle = rim;
    ctx.lineWidth = 0.75;
    glassPath();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(226,243,247,0.13)';
    ctx.lineWidth = 0.6;
    roundedRectPath(ctx, left + 2.5, top + 4, width - 5, height - 8, 2);
    ctx.stroke();

    const end = ctx.createLinearGradient(left, 0, left + width, 0);
    end.addColorStop(0, 'rgba(239,251,252,0.08)');
    end.addColorStop(0.35, 'rgba(239,251,252,0.55)');
    end.addColorStop(1, 'rgba(213,232,248,0.10)');
    ctx.fillStyle = end;
    roundedRectPath(ctx, left + 1.5, top + height - 3, width - 3, 1.5, 0.75);
    ctx.fill();
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

  _softRetuneTarget(note, chordLen) {
    if (chordLen <= 0) return this.baseOffset;

    const wrappedNote = ((note % chordLen) + chordLen) % chordLen;
    const nearestEquivalent = wrappedNote + Math.round((this.baseOffset - wrappedNote) / chordLen) * chordLen;
    const shortestShift = nearestEquivalent - this.baseOffset;
    return this.baseOffset + shortestShift * PALETTE_RETUNE_SHIFT_FRACTION;
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
