const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smooth = (low, high, value) => {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
const ARRIVAL_MS = 640;
const CRUISE_EASE_MS = 220;
const CRUISE_ROLL_RAD_PER_MS = .000065;

export function createStarfieldPreview(canvas) {
  return new StarfieldPreview(canvas);
}

class StarfieldPreview {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.frame = 0;
    this.lastTime = null;
    this.elapsed = ARRIVAL_MS;
    this.roll = 0;
    this.cruiseTime = 0;
    this.yaw = this.pitch = this.targetYaw = this.targetPitch = 0;
    this.reducedMotion = false;
    this.running = false;

    // Keep the finished demo's three depth bands, tone proportions, soft gaps,
    // and sparse clusters. Only framing and point size change for this crop.
    let seed = 142;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    this.stars = Array.from({ length: 1500 }, (_, index) => {
      const band = index / 1500 < .77 ? 0 : index / 1500 < .99 ? 1 : 2;
      const depth = [58, 48, 38][band];
      const tone = random();
      let x = (random() - .5) * 2.9;
      let y = (random() - .5) * 2.9;
      if (random() < .075) {
        const side = random() < .5 ? -1 : 1;
        x = side * .47 + (random() + random() - 1) * .44;
        y = side * -.19 + (random() + random() - 1) * .3;
      }
      const gap = Math.exp(-((x - .04) ** 2 + (y + .03) ** 2) / .045);
      return {
        x: x * depth, y: y * depth, z: depth, depth, band,
        colour: tone < .74 ? 'rgb(250,252,255)' : tone < .91 ? 'rgb(202,224,255)' : 'rgb(255,230,198)',
        opacity: (.5 + random() * .46) * (1 - gap * .48),
        size: .78 + random() * .28 + band * .09,
        delay: random() * 110,
      };
    });
  }

  reveal(reducedMotion) {
    this.pause();
    this.reducedMotion = reducedMotion;
    this.elapsed = reducedMotion ? ARRIVAL_MS : 0;
    this.cruiseTime = 0;
    this.yaw = this.pitch = this.targetYaw = this.targetPitch = 0;
  }

  setReducedMotion(value) {
    if (value === this.reducedMotion) return;
    this.reducedMotion = value;
    if (value) {
      this.elapsed = ARRIVAL_MS;
      this.cruiseTime = 0;
      this.yaw = this.pitch = this.targetYaw = this.targetPitch = 0;
      this.pause();
      this.draw();
    }
  }

  lookAt(x, y) {
    if (this.reducedMotion) return;
    this.targetYaw = clamp(x, -1, 1) * .065;
    this.targetPitch = clamp(-y, -1, 1) * .045;
    this.start();
  }

  draw() {
    const ctx = this.ctx;
    const size = this.canvas.width;
    // Draw in CSS-sized units at 2x resolution, matching the Pearl canvas.
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    const width = size / 2;
    const center = width / 2;
    const radius = width * .43;
    const halfHeight = radius * .77;
    const corner = radius * .34;
    const bevelWidth = 7;
    const viewportPath = (inset = 0) => {
      ctx.roundRect(-radius + inset, -halfHeight + inset,
        (radius - inset) * 2, (halfHeight - inset) * 2, corner - inset);
    };
    ctx.clearRect(0, 0, width, width);
    ctx.save();
    ctx.translate(center, center);
    ctx.beginPath();
    viewportPath(bevelWidth);
    ctx.save();
    ctx.clip();

    // Smoked glass keeps the cloth visible through its face. Its boundary is
    // a polished edge, rather than a dark vignette fading outside the lens.
    const smoke = ctx.createRadialGradient(-radius * .25, -radius * .3, 0, 0, 0, radius);
    smoke.addColorStop(0, 'rgba(21,29,45,.69)');
    smoke.addColorStop(.62, 'rgba(10,16,29,.81)');
    smoke.addColorStop(.9, 'rgba(22,30,45,.74)');
    smoke.addColorStop(1, 'rgba(37,44,59,.68)');
    ctx.fillStyle = smoke;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const cr = Math.cos(this.roll), sr = Math.sin(this.roll);
    for (const star of this.stars) {
      const rate = mix(.4, 1.1, (58 - star.depth) / 20);
      const x = cy * star.x - sy * star.z * rate;
      const z = sy * star.x * rate + cy * star.z;
      const y = cp * star.y - sp * z * rate;
      const forward = sp * star.y * rate + cp * z;
      const progress = smooth(star.delay, ARRIVAL_MS, this.elapsed);
      const travel = mix([.52, .4, .28][star.band], 1, progress);
      const projectedX = x / forward * radius * .84 * travel;
      const projectedY = -y / forward * radius * .84 * travel;
      let px = projectedX * cr - projectedY * sr;
      let py = projectedX * sr + projectedY * cr;
      const distance = Math.hypot(px, py) / radius;
      const magnification = 1 + .08 * Math.max(0, 1 - distance * distance);
      px *= magnification;
      py *= magnification;
      const edgeDistance = Math.max(Math.abs(px) / (radius - bevelWidth),
        Math.abs(py) / (halfHeight - bevelWidth));
      const edge = 1 - smooth(.94, 1, edgeDistance);
      if (edge <= 0) continue;
      const point = star.size * mix(.65, 1, progress);
      ctx.globalAlpha = star.opacity * edge * mix(.2, 1, progress);
      ctx.fillStyle = star.colour;
      ctx.fillRect(px - point / 2, py - point / 2, point, point);
    }
    ctx.globalAlpha = 1;

    // A broad, quiet reflection gives the stars a front surface to sit behind.
    const reflectionX = -radius * .28 + this.yaw * 50;
    const reflectionY = -radius * .38 + this.pitch * 50;
    ctx.save();
    ctx.translate(reflectionX, reflectionY);
    ctx.rotate(-.48);
    ctx.scale(1, .36);
    const reflection = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * .74);
    reflection.addColorStop(0, 'rgba(239,243,255,.19)');
    reflection.addColorStop(.5, 'rgba(224,231,251,.10)');
    reflection.addColorStop(1, 'rgba(224,231,251,0)');
    ctx.fillStyle = reflection;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
    ctx.restore();

    // The bevel catches separated colours of light. Keep the highlights in
    // the fixed glass, independent of the sky's rotation.
    const prism = ctx.createConicGradient(-2.15 + this.yaw * .6 + this.pitch * .4, 0, 0);
    prism.addColorStop(0, 'rgba(246,250,255,.86)');
    prism.addColorStop(.10, 'rgba(151,244,252,.68)');
    prism.addColorStop(.22, 'rgba(158,180,255,.54)');
    prism.addColorStop(.32, 'rgba(220,167,249,.66)');
    prism.addColorStop(.42, 'rgba(255,186,214,.68)');
    prism.addColorStop(.52, 'rgba(255,230,177,.65)');
    prism.addColorStop(.59, 'rgba(238,252,246,.88)');
    prism.addColorStop(.70, 'rgba(143,225,237,.38)');
    prism.addColorStop(.82, 'rgba(179,164,240,.42)');
    prism.addColorStop(.92, 'rgba(244,215,241,.64)');
    prism.addColorStop(1, 'rgba(246,250,255,.86)');
    ctx.beginPath();
    viewportPath();
    viewportPath(bevelWidth);
    ctx.fillStyle = prism;
    ctx.fill('evenodd');

    const edgeLight = ctx.createLinearGradient(-radius, -halfHeight, radius, halfHeight);
    edgeLight.addColorStop(0, 'rgba(250,252,255,.94)');
    edgeLight.addColorStop(.28, 'rgba(212,241,255,.62)');
    edgeLight.addColorStop(.55, 'rgba(36,44,65,.46)');
    edgeLight.addColorStop(.8, 'rgba(244,219,255,.76)');
    edgeLight.addColorStop(1, 'rgba(251,246,229,.88)');
    ctx.beginPath();
    viewportPath(.6);
    ctx.strokeStyle = edgeLight;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    viewportPath(bevelWidth);
    ctx.strokeStyle = 'rgba(13,22,40,.48)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const shine = ctx.createLinearGradient(-radius, -halfHeight, radius * .55, -halfHeight * .65);
    shine.addColorStop(0, 'rgba(255,255,255,.9)');
    shine.addColorStop(.55, 'rgba(246,252,255,.62)');
    shine.addColorStop(1, 'rgba(246,252,255,0)');
    ctx.beginPath();
    ctx.moveTo(-radius + 3, -halfHeight + corner);
    ctx.quadraticCurveTo(-radius + 3, -halfHeight + 3, -radius + corner, -halfHeight + 3);
    ctx.lineTo(radius - corner, -halfHeight + 3);
    ctx.strokeStyle = shine;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  start() {
    this.running = true;
    if (this.frame || this.reducedMotion || document.hidden) return;
    this.frame = requestAnimationFrame(time => this.animate(time));
  }

  animate(time) {
    this.frame = 0;
    if (!this.running || this.reducedMotion || document.hidden) { this.lastTime = null; return; }
    const dt = this.lastTime === null ? 16 : Math.min(time - this.lastTime, 50);
    this.lastTime = time;
    this.elapsed = Math.min(ARRIVAL_MS, this.elapsed + dt);
    this.cruiseTime = Math.min(CRUISE_EASE_MS, this.cruiseTime + dt);
    // Rotate only the view beyond the glass, without moving its rim or light.
    this.roll = (this.roll + dt * CRUISE_ROLL_RAD_PER_MS *
      mix(.25, 1, smooth(0, CRUISE_EASE_MS, this.cruiseTime))) % (Math.PI * 2);
    const ease = 1 - Math.exp(-dt / 80);
    this.yaw = mix(this.yaw, this.targetYaw, ease);
    this.pitch = mix(this.pitch, this.targetPitch, ease);
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
