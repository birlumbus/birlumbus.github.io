import {
  createJellyfishState, stepJellyfish, getJellyfishGeometry,
  blockedIntervalsForLayout, carveTextLineSlots, prepareWithSegments, layoutNextLine,
  BODY_COPY,
} from './jellyfish-preview-model.js';

const SIZE = 280;
const FONT_SIZE = 11.6;
const LINE_HEIGHT = 16;
const FONT = `400 ${FONT_SIZE}px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

// The project's exact bell, fronds, following
// physics and Pretext line routing, reframed on an alpha canvas for the cloth.
// Only the material palette, excerpt framing and speed are changed here.
export function createJellyfishPreview(canvas) { return new JellyfishPreview(canvas); }

class JellyfishPreview {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.prepared = prepareWithSegments(BODY_COPY, FONT);
    this.frame = 0;
    this.running = false;
    this.lastTime = null;
    this.reducedMotion = false;
    this.pose();
  }

  pose() {
    this.targetX = 140;
    this.targetY = 52;
    this.jelly = createJellyfishState(this.targetX, this.targetY);
    // Begin with the actual relaxed ribbons, so the first visible frame is a
    // finished miniature, with no separate arrival animation or unrolling.
    for (let i = 0; i < 100; i++) stepJellyfish(this.jelly, this.targetX, this.targetY, 1 / 60, .55);
  }

  reveal(reducedMotion = false) {
    this.pause();
    this.reducedMotion = reducedMotion;
    this.pose();
  }

  setReducedMotion(value) {
    if (value === this.reducedMotion) return;
    this.reducedMotion = value;
    if (value) { this.pause(); this.pose(); this.draw(); }
  }

  lookAt(x, y) {
    if (this.reducedMotion) return;
    this.targetX = 140 + clamp(x, -1, 1) * 9;
    this.targetY = 52 + clamp(y, -1, 1) * 4;
  }

  draw() {
    const ctx = this.ctx;
    const ratio = this.canvas.width / SIZE;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    this.drawCreature(ctx);
    this.drawWords(ctx);
  }

  drawWords(ctx) {
    ctx.save();
    ctx.font = FONT;
    ctx.fillStyle = '#405c67';
    ctx.textBaseline = 'top';
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    // The excerpt has no panel or backing shape. Its varying line lengths and
    // fading ends read as a small current of words around the actual silhouette.
    for (let row = 0; row < 15; row++) {
      const y = 19 + row * LINE_HEIGHT;
      const normalized = (row - 6.5) / 9;
      const halfWidth = 125 * Math.sqrt(Math.max(.15, 1 - normalized ** 2));
      const slots = carveTextLineSlots(
        { left: 140 - halfWidth, right: 140 + halfWidth },
        blockedIntervalsForLayout(this.jelly, y, y + FONT_SIZE + 2, .92),
        FONT_SIZE * 4.1,
      );
      ctx.globalAlpha = [0.48, 0.58, 0.66, 0.72, 0.76, 0.76, 0.76, 0.76, 0.76, 0.72, 0.63, 0.50, 0.35, 0.20, 0.09][row];
      for (const slot of slots) {
        const line = layoutNextLine(this.prepared, cursor, slot.right - slot.left);
        if (!line) break;
        ctx.fillText(line.text, slot.left, y);
        cursor = line.end;
      }
    }
    ctx.restore();
  }

  drawCreature(ctx) {
    const geometry = getJellyfishGeometry(this.jelly, .92);
    const path = points => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.closePath();
    };
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [index, outline] of geometry.tentacles.entries()) {
      path(outline);
      const ribbon = ctx.createLinearGradient(this.jelly.x, this.jelly.y, this.jelly.x, this.jelly.y + 100);
      ribbon.addColorStop(0, index % 2 ? 'rgba(106,148,165,.28)' : 'rgba(95,172,158,.31)');
      ribbon.addColorStop(.65, index % 2 ? 'rgba(155,136,193,.18)' : 'rgba(105,165,165,.20)');
      ribbon.addColorStop(1, 'rgba(105,165,165,.035)');
      ctx.fillStyle = ribbon;
      ctx.fill();
      ctx.strokeStyle = 'rgba(67,127,139,.46)';
      ctx.lineWidth = .72;
      ctx.stroke();
    }
    ctx.translate(geometry.origin.x, geometry.origin.y);
    ctx.scale(geometry.effectiveScale, geometry.effectiveScale);
    ctx.transform(geometry.across.x, geometry.across.y, geometry.down.x, geometry.down.y, 0, 0);
    const { width, height } = geometry;
    const fill = ctx.createLinearGradient(-width * .4, -height, width * .5, 8);
    fill.addColorStop(0, 'rgba(205,192,235,.88)');
    fill.addColorStop(.32, 'rgba(180,199,224,.70)');
    fill.addColorStop(.75, 'rgba(116,180,184,.44)');
    fill.addColorStop(1, 'rgba(102,170,156,.30)');
    path(geometry.localBell);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = 'rgba(63,115,129,.64)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Keep the demo's three meridians, pearl crest and shallow double rim.
    ctx.strokeStyle = 'rgba(241,249,249,.66)';
    ctx.lineWidth = .8;
    for (const u of [-.52, 0, .52]) {
      ctx.beginPath();
      ctx.moveTo(0, -height * .94);
      ctx.quadraticCurveTo(u * width * 1.15, -height * .59, u * width, -5);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-width * .88, -4);
    ctx.quadraticCurveTo(0, -13, width * .88, -4);
    ctx.strokeStyle = 'rgba(48,127,133,.65)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-width, 0);
    ctx.bezierCurveTo(-width, -height * .6, -width * .5, -height, 0, -height);
    ctx.strokeStyle = 'rgba(249,252,255,.86)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  start() {
    if (this.reducedMotion || document.hidden || this.frame) return;
    this.running = true;
    this.frame = requestAnimationFrame(time => this.animate(time));
  }

  animate(time) {
    this.frame = 0;
    if (!this.running || this.reducedMotion || document.hidden) { this.lastTime = null; return; }
    const dt = this.lastTime === null ? 1 / 60 : Math.min((time - this.lastTime) / 1000, .04);
    this.lastTime = time;
    stepJellyfish(this.jelly, this.targetX, this.targetY, dt, .55);
    this.draw();
    this.frame = requestAnimationFrame(next => this.animate(next));
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.lastTime = null;
  }
}
