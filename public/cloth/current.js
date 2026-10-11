// Compatibility module for cached pages and the original mockup.
// The maintained simulation lives in src/scripts/cloth/current.js.
const COLS = 33;
const ROWS = 25;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// A coarse spring surface: neighbouring folds share momentum, while water drag
// and a soft return to the resting shape let every current die away.
export class ClothCurrent {
  constructor({ opening = true } = {}) {
    this.offset = new Float32Array(COLS * ROWS * 3);
    this.velocity = new Float32Array(this.offset.length);
    this.nextVelocity = new Float32Array(this.offset.length);
    this.fold = new Float32Array(COLS * ROWS);
    this.foldVelocity = new Float32Array(this.fold.length);
    this.nextFoldVelocity = new Float32Array(this.fold.length);
    this.color = new Float32Array(this.fold.length);
    this.nextColor = new Float32Array(this.fold.length);
    this.active = opening;
    if (!opening) return;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const u = x / (COLS - 1) * 2 - 1;
        const v = y / (ROWS - 1) * 2 - 1;
        const i = (y * COLS + x) * 3;
        this.velocity[i] = 0.045 * Math.cos(v * 1.8 + u);
        this.velocity[i + 1] = 0.025 * Math.sin(u * 2 - v);
        this.velocity[i + 2] = 0.21 * Math.sin(u * 1.4 + v * 1.8 + 0.7) + 0.07 * Math.cos(v * 2.2 - u);
      }
    }
  }

  stir(u, v, dx, dy) {
    const distance = Math.hypot(dx, dy);
    if (distance < 0.00001) return;
    const limit = Math.min(1, 0.085 / distance);
    dx *= limit;
    dy *= limit;
    const lift = Math.hypot(dx, dy) * (Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : -Math.sign(dy));
    const unfolding = Math.min(distance, 0.25) * 5;
    const colorImpulse = Math.min(distance, 0.12) * 9;
    u = clamp(u, -1.2, 1.2);
    v = clamp(v, -1.2, 1.2);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const a = x / (COLS - 1) * 2 - 1 - u;
        const b = y / (ROWS - 1) * 2 - 1 - v;
        const falloff = Math.exp(-a * a / 0.28 - b * b / 0.24);
        const i = (y * COLS + x) * 3;
        this.velocity[i] = clamp(this.velocity[i] + dx * falloff * 4.2, -0.75, 0.75);
        this.velocity[i + 1] = clamp(this.velocity[i + 1] + dy * falloff * 3.4, -0.75, 0.75);
        this.velocity[i + 2] = clamp(this.velocity[i + 2] + lift * falloff * 2.6, -0.65, 0.65);
        const openingFalloff = Math.exp(-a * a / 0.6 - b * b / 0.48);
        const node = y * COLS + x;
        this.foldVelocity[node] = Math.min(1.15, this.foldVelocity[node] + unfolding * openingFalloff);
        const colorFalloff = Math.exp(-a * a / 0.18 - b * b / 0.16);
        this.color[node] = 1 - (1 - this.color[node]) * Math.exp(-colorImpulse * colorFalloff);
      }
    }
    this.active = true;
  }

  advance(dt) {
    if (!this.active || dt <= 0) return;
    const duration = Math.min(dt, 0.05);
    const steps = Math.ceil(duration * 120);
    const h = duration / steps;
    const spreadX = 0.24 ** 2 / (2 / (COLS - 1)) ** 2;
    const spreadY = 0.24 ** 2 / (2 / (ROWS - 1)) ** 2;
    for (let step = 0; step < steps; step++) {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = (y * COLS + x) * 3;
          const left = x > 0 ? i - 3 : i;
          const right = x < COLS - 1 ? i + 3 : i;
          const down = y > 0 ? i - COLS * 3 : i;
          const up = y < ROWS - 1 ? i + COLS * 3 : i;
          for (let k = 0; k < 3; k++) {
            const p = this.offset[i + k];
            const laplacian = (this.offset[left + k] + this.offset[right + k] - 2 * p) * spreadX
              + (this.offset[down + k] + this.offset[up + k] - 2 * p) * spreadY;
            // Soft resistance lets a fold spread beyond the old fixed bounds
            // without the abrupt stop produced by clamping its position.
            const restoring = p * 1.4 + p * p * p * 128;
            this.nextVelocity[i + k] = this.velocity[i + k] + (laplacian - restoring - this.velocity[i + k] * 1.45) * h;
          }
          const node = i / 3, opening = this.fold[node];
          const foldLaplacian = (this.fold[left / 3] + this.fold[right / 3] - 2 * opening) * spreadX
            + (this.fold[down / 3] + this.fold[up / 3] - 2 * opening) * spreadY;
          // A sweep loosens the crease, while sustained currents can open it.
          // Increasing resistance prevents invisible excess from keeping it flat.
          const foldRestoring = opening * 3.2 + opening * opening * opening * 6;
          this.nextFoldVelocity[node] = this.foldVelocity[node]
            + (foldLaplacian - foldRestoring - this.foldVelocity[node] * 2.8) * h;
          // The wash belongs to the material, diffuses gently, then clears.
          // It shares the simulation clock but adds no force to the cloth.
          const color = this.color[node];
          const colorLaplacian = (this.color[left / 3] + this.color[right / 3] - 2 * color) * spreadX
            + (this.color[down / 3] + this.color[up / 3] - 2 * color) * spreadY;
          this.nextColor[node] = color + (colorLaplacian * 0.5 - color * 1.25) * h;
        }
      }
      let remaining = 0;
      for (let i = 0; i < this.offset.length; i++) {
        this.velocity[i] = this.nextVelocity[i];
        this.offset[i] += this.velocity[i] * h;
        remaining = Math.max(remaining, Math.abs(this.offset[i]), Math.abs(this.velocity[i]));
      }
      for (let i = 0; i < this.fold.length; i++) {
        this.foldVelocity[i] = this.nextFoldVelocity[i];
        this.fold[i] += this.foldVelocity[i] * h;
        this.color[i] = this.nextColor[i];
        remaining = Math.max(remaining, Math.abs(this.fold[i]), Math.abs(this.foldVelocity[i]), this.color[i]);
      }
      if (remaining < 0.00015) {
        this.reset();
        return;
      }
    }
  }

  reset() {
    this.offset.fill(0);
    this.velocity.fill(0);
    this.nextVelocity.fill(0);
    this.fold.fill(0);
    this.foldVelocity.fill(0);
    this.nextFoldVelocity.fill(0);
    this.color.fill(0);
    this.nextColor.fill(0);
    this.active = false;
  }

  foldRelease(u, v) {
    const x = clamp((u + 1) * 0.5, 0, 1) * (COLS - 1);
    const y = clamp((v + 1) * 0.5, 0, 1) * (ROWS - 1);
    const left = Math.min(Math.floor(x), COLS - 2);
    const down = Math.min(Math.floor(y), ROWS - 2);
    const fx = x - left, fy = y - down, i = down * COLS + left;
    const a = this.fold[i] * (1 - fx) + this.fold[i + 1] * fx;
    const b = this.fold[i + COLS] * (1 - fx) + this.fold[i + COLS + 1] * fx;
    const release = clamp(a * (1 - fy) + b * fy, 0, 1);
    // Ease into complete unfolding and back out, avoiding a sharp boundary
    // between the released material and the parts that are still gathered.
    return release * release * (3 - 2 * release);
  }

  colorActivity(u, v) {
    const x = clamp((u + 1) * 0.5, 0, 1) * (COLS - 1);
    const y = clamp((v + 1) * 0.5, 0, 1) * (ROWS - 1);
    const left = Math.min(Math.floor(x), COLS - 2);
    const down = Math.min(Math.floor(y), ROWS - 2);
    const fx = x - left, fy = y - down, i = down * COLS + left;
    const a = this.color[i] * (1 - fx) + this.color[i + 1] * fx;
    const b = this.color[i + COLS] * (1 - fx) + this.color[i + COLS + 1] * fx;
    return a * (1 - fy) + b * fy;
  }

  sample(u, v, out = [0, 0, 0]) {
    const x = clamp((u + 1) * 0.5, 0, 1) * (COLS - 1);
    const y = clamp((v + 1) * 0.5, 0, 1) * (ROWS - 1);
    const left = Math.min(Math.floor(x), COLS - 2);
    const down = Math.min(Math.floor(y), ROWS - 2);
    const fx = x - left;
    const fy = y - down;
    const i = (down * COLS + left) * 3;
    for (let k = 0; k < 3; k++) {
      const a = this.offset[i + k] * (1 - fx) + this.offset[i + 3 + k] * fx;
      const b = this.offset[i + COLS * 3 + k] * (1 - fx) + this.offset[i + COLS * 3 + 3 + k] * fx;
      out[k] = a * (1 - fy) + b * fy;
    }
    return out;
  }
}
