import { DEFAULTS, createSimulation, positions } from './trebuchet-preview/physics.js';
import { drawSourceRig } from './trebuchet-preview/rig.js';
import { drawSiegeCrew, danceFrame } from './trebuchet-preview/crew.js';

const coolMaterials = new Map([
  ['#293638', '#344751'], ['#594B38', '#625647'], ['#896B43', '#927853'],
  ['#D0AC6F', '#CAB491'], ['#3F3C30', '#454449'], ['#554732', '#5F5146'],
  ['#B18C56', '#B29D79'], ['#354037', '#45575B'], ['#725D41', '#81705C'],
  ['#45534C', '#597178'], ['#5B6B5A', '#789498'], ['#303E3A', '#415662'],
  ['#80907A', '#94A9B2'], ['#66766A', '#849FA4'], ['#ABB398', '#BED3D6'],
  ['#55665A', '#718C95'], ['#C8CEAF', '#D5D3E4'], ['#D9DEC7', '#DAD1E4'],
  ['#C8CCAD', '#CFC4DD'], ['#A4AA8A', '#9D91AB'], ['#45524A', '#536B70'],
  ['#7C8B78', '#98ADBA'], ['#B8B99A', '#CECDD9'], ['#87947E', '#8D9EAA'],
  ['#6E7B68', '#8499A3'], ['#BBC5A9', '#C8D3D4'], ['#9eafa0', '#A3BEC1'],
  ['#718579', '#839AA9'],
]);

export function createTrebuchetPreview(canvas) {
  return new TrebuchetPreview(canvas);
}

class TrebuchetPreview {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.buffer = document.createElement('canvas');
    this.buffer.width = this.buffer.height = 130;
    this.g = this.buffer.getContext('2d', { alpha: true });
    this.frame = 0;
    this.lastTime = null;
    this.elapsed = 0;
    this.running = false;
    this.reducedMotion = false;
    this.reset();
    this.draw();
  }

  reset() {
    this.state = createSimulation(DEFAULTS);
    this.elapsed = 0;
    this.lastTime = null;
    this.drawnDanceFrame = -1;
  }

  reveal(reducedMotion = false) {
    this.pause();
    this.reducedMotion = reducedMotion;
    this.reset();
    this.draw();
  }

  setReducedMotion(value) {
    if (this.reducedMotion === value) return;
    this.reducedMotion = value;
    if (value) { this.pause(); this.reset(); this.draw(); }
  }

  draw() {
    const g = this.g, W = this.buffer.width, H = this.buffer.height;
    g.clearRect(0, 0, W, H);
    const pose = positions(this.state);
    // Frame the dancer beside the loaded arm, with only the rig's short base.
    const scale = 9.0, center = -1.9;
    const ox = W / 2 - center * scale, oy = H * .89;
    const ink = color => coolMaterials.get(color) ?? color;
    drawSourceRig(g, this.state, scale, ox, oy, ink);
    const danceTime = this.reducedMotion ? null : this.elapsed;
    drawSiegeCrew(g, ox - 7.05 * scale, oy, 1, danceTime);
    this.drawnDanceFrame = danceTime === null ? 0 : danceFrame(danceTime);

    // No sky, vignette, card, or rectangular ground: the actual pixels float
    // directly over the live cloth. Preserve the source's chunky pixel scale.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
    this.canvas.dataset.phase = this.state.time === 0 ? 'ready' : this.state.phase;
    this.canvas.dataset.simulationTime = this.state.time.toFixed(3);
    this.canvas.dataset.armAngle = pose.tip.x.toFixed(3);
    this.canvas.dataset.running = String(this.running);
    this.canvas.dataset.danceFrame = String(this.drawnDanceFrame);
  }

  start() {
    if (this.reducedMotion || document.hidden) return;
    this.running = true;
    if (!this.frame) this.frame = requestAnimationFrame(time => this.animate(time));
  }

  animate(time) {
    this.frame = 0;
    if (!this.running || this.reducedMotion || document.hidden) { this.lastTime = null; return; }
    const dt = this.lastTime === null ? 0 : Math.min((time - this.lastTime) / 1000, .04);
    this.lastTime = time;
    this.elapsed += dt;
    // Deliberately hand-stepped poses give the tiny figure awkward pixel charm.
    // Only its drawing clock advances; the machine's simulation never ticks.
    if (danceFrame(this.elapsed) !== this.drawnDanceFrame) this.draw();
    if (this.running) this.frame = requestAnimationFrame(next => this.animate(next));
    else this.lastTime = null;
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.lastTime = null;
    this.canvas.dataset.running = 'false';
  }
}
