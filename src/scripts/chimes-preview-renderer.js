// Silent homepage preview using the instrument's glass material and spring physics.
import { Chime } from '../../public/floating-chimes/chime.js';
import { CHORDS } from '../../public/floating-chimes/presets.js';

const SIZE = 600;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export async function createChimesPreview(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('A 2D canvas is required for the chimes preview.');
  // Composite the instrument's layered material once at a lower opacity. This
  // preserves its real ripple while letting the live cloth show through glass.
  const material = document.createElement('canvas');
  material.width = material.height = SIZE;
  const materialCtx = material.getContext('2d');
  if (!materialCtx) throw new Error('The chimes material could not initialize.');
  let chord = CHORDS.find(preset => preset.shortName === 'Tide');
  let reduced = false, frame = 0, lastTime = 0, elapsed = 0;
  let running = false, previousX = 0;
  const chimes = Array.from({ length: 8 }, (_, index) => {
    const pane = new Chime({
      xPercent: (index + .5) * 100 / 8,
      yCenterPercent: 42,
      heightPercent: 80,
      baseWidth: 28,
    });
    pane.resize(SIZE, 470, 0, 98);
    pane.maxAngle = .038;
    pane.loadedNote = index % chord.colors.length;
    pane.baseOffset = pane.baseOffsetTarget = pane.loadedNote;
    return pane;
  });

  function inPose(context, pane, render) {
    const { angle, pivotX, pivotY } = pane.pose(reduced);
    context.save();
    context.translate(pivotX, pivotY);
    context.rotate(angle);
    context.translate(-pivotX, -pivotY);
    render();
    context.restore();
  }

  function glassColor(pane, y, alpha, brightness = 1) {
    const color = pane.materialColorAt(chord, pane.baseOffset * .68 + y * 1.18,
      y, 1, null, reduced).map(value => Math.round(value * brightness));
    return `rgba(${color.join(',')},${alpha})`;
  }

  function drawSuspension(pane) {
    const hole = pane.worldPoint(pane.x, pane.top + 15, reduced);
    const thread = ctx.createLinearGradient(0, 58, 0, hole.y);
    thread.addColorStop(0, 'rgba(63,103,118,0)');
    thread.addColorStop(.2, 'rgba(63,103,118,.24)');
    thread.addColorStop(1, 'rgba(63,103,118,.43)');
    ctx.strokeStyle = thread;
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(pane.x, 58);
    ctx.quadraticCurveTo(pane.x, (58 + hole.y) / 2, hole.x, hole.y);
    ctx.stroke();
  }

  function drawThickness(pane) {
    const left = pane.x - pane.drawWidth / 2, right = left + pane.drawWidth;
    const top = pane.top, bottom = top + pane.height, depth = 7;
    inPose(ctx, pane, () => {
      // The longer optical path through the side holds more blue-green pigment.
      const side = ctx.createLinearGradient(right - 2, 0, right + depth, 0);
      side.addColorStop(0, glassColor(pane, .5, .62, .46));
      side.addColorStop(.45, glassColor(pane, .5, .36, .78));
      side.addColorStop(1, 'rgba(199,239,238,.64)');
      ctx.fillStyle = side;
      ctx.beginPath();
      ctx.moveTo(right - 2, top + 3);
      ctx.lineTo(right + depth - 1, top - 2);
      ctx.lineTo(right + depth - 1, bottom - 6);
      ctx.quadraticCurveTo(right + depth - 2, bottom - 4, right - 2, bottom - 1);
      ctx.closePath();
      ctx.fill();

      const cap = ctx.createLinearGradient(left, top - 5, right, top + 2);
      cap.addColorStop(0, 'rgba(251,255,253,.88)');
      cap.addColorStop(.55, 'rgba(198,234,235,.56)');
      cap.addColorStop(1, glassColor(pane, 0, .46));
      ctx.fillStyle = cap;
      ctx.beginPath();
      ctx.moveTo(left + 3, top + 1);
      ctx.lineTo(left + depth + 3, top - 5);
      ctx.lineTo(right + depth - 2, top - 5);
      ctx.lineTo(right - 2, top + 1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(246,255,251,.8)';
      ctx.lineWidth = .85;
      ctx.beginPath();
      ctx.moveTo(right + depth - 1, top);
      ctx.lineTo(right + depth - 1, bottom - 7);
      ctx.stroke();
    });
  }

  function drawReflections(pane) {
    const left = pane.x - pane.drawWidth / 2, right = left + pane.drawWidth;
    const top = pane.top, bottom = top + pane.height, width = pane.drawWidth;
    inPose(ctx, pane, () => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(left, top, width, pane.height, 4);
      ctx.clip();

      // Asymmetric edge reflections leave the middle of the face almost clear.
      const bevel = ctx.createLinearGradient(left, 0, right, 0);
      bevel.addColorStop(0, 'rgba(37,83,106,.39)');
      bevel.addColorStop(.055, 'rgba(247,255,251,.77)');
      bevel.addColorStop(.15, 'rgba(234,251,247,.23)');
      bevel.addColorStop(.27, 'rgba(218,244,242,0)');
      bevel.addColorStop(.74, 'rgba(218,244,242,0)');
      bevel.addColorStop(.90, glassColor(pane, .5, .12, .65));
      bevel.addColorStop(1, glassColor(pane, .5, .48, .44));
      ctx.fillStyle = bevel;
      ctx.fillRect(left, top, width, pane.height);

      const reflection = ctx.createLinearGradient(0, top, 0, bottom);
      reflection.addColorStop(0, 'rgba(253,255,251,.29)');
      reflection.addColorStop(.3, 'rgba(253,255,251,.15)');
      reflection.addColorStop(.75, 'rgba(253,255,251,0)');
      ctx.fillStyle = reflection;
      ctx.beginPath();
      ctx.moveTo(left + width * .22, top);
      ctx.lineTo(left + width * .69, top);
      ctx.lineTo(left + width * .34, top + pane.height * .8);
      ctx.lineTo(left + width * .13, top + pane.height * .8);
      ctx.closePath();
      ctx.fill();

      // A denser bottom rim gives the transparent pane a tangible weight.
      const foot = ctx.createLinearGradient(0, bottom - 7, 0, bottom);
      foot.addColorStop(0, glassColor(pane, 1, 0));
      foot.addColorStop(.55, glassColor(pane, 1, .36, .60));
      foot.addColorStop(1, glassColor(pane, 1, .62, .42));
      ctx.fillStyle = foot;
      ctx.fillRect(left, bottom - 7, width, 7);
      ctx.restore();

      const edge = ctx.createLinearGradient(0, top, 0, bottom);
      edge.addColorStop(0, 'rgba(87,141,157,.45)');
      edge.addColorStop(.2, 'rgba(87,141,157,.14)');
      edge.addColorStop(.8, 'rgba(87,141,157,.18)');
      edge.addColorStop(1, 'rgba(45,99,118,.50)');
      ctx.strokeStyle = edge;
      ctx.lineWidth = .9;
      ctx.beginPath();
      ctx.roundRect(left, top, width, pane.height, 4);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(245,255,250,.74)';
      ctx.lineWidth = .95;
      ctx.beginPath();
      ctx.moveTo(left + 3, bottom - 2.3);
      ctx.lineTo(right - 3, bottom - 2.3);
      ctx.stroke();

      // The small drilled attachment catches light around the suspension line.
      ctx.strokeStyle = 'rgba(49,96,110,.42)';
      ctx.lineWidth = .85;
      ctx.beginPath();
      ctx.ellipse(pane.x, top + 15, 2.15, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(248,255,251,.8)';
      ctx.beginPath();
      ctx.ellipse(pane.x + .65, top + 15.5, 2.2, 2.5, 0, .15, Math.PI * .94);
      ctx.stroke();
    });
  }

  function draw() {
    ctx.setTransform(canvas.width / SIZE, 0, 0, canvas.height / SIZE, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    materialCtx.clearRect(0, 0, SIZE, SIZE);
    for (const pane of chimes) {
      drawSuspension(pane);
      drawThickness(pane);
      pane.render(materialCtx, chord, elapsed * .12, 1, null, reduced);
      inPose(materialCtx, pane, () => {
        materialCtx.globalCompositeOperation = 'destination-out';
        materialCtx.beginPath();
        materialCtx.ellipse(pane.x, pane.top + 15, 1.5, 1.8, 0, 0, Math.PI * 2);
        materialCtx.fill();
      });
    }
    ctx.save();
    ctx.globalAlpha = .37;
    ctx.drawImage(material, 0, 0);
    ctx.restore();
    chimes.forEach(drawReflections);
  }

  function tick(time) {
    frame = 0;
    if (!running || reduced) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .04) : 1 / 60;
    lastTime = time;
    elapsed += delta;
    for (let index = 0; index < chimes.length; index++) {
      // A light, continuous current sustains the real damped spring. Slightly
      // different periods and phases keep the panes from swinging in lockstep.
      const frequency = 4.1 + (index % 4) * .14;
      const current = .16 * Math.sin(elapsed * frequency + index * 2.13)
        + .035 * Math.sin(elapsed * 1.15 + index * .78);
      chimes[index].motionVelocity += current * Math.min(1, elapsed / 1.5) * delta;
      const adjacent = [chimes[index - 1]?.loadedNote, chimes[index + 1]?.loadedNote].filter(Number.isFinite);
      chimes[index].update(delta, chord.colors.length, adjacent);
    }
    draw();
    frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (running && !reduced && !frame) frame = requestAnimationFrame(tick);
  }

  function start() {
    running = true;
    wake();
  }

  function pause() {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function reveal(isReduced = reduced) {
    reduced = isReduced;
    previousX = 0;
    elapsed = 0;
    for (const pane of chimes) {
      pane.motionAngle = pane.motionVelocity = 0;
      pane._bufA.fill(0);
      pane._bufB.fill(0);
      pane._bufC.fill(0);
      pane.colorBlooms = [];
      pane.strikeGlow = pane.lightEnergy = 0;
    }
    if (!reduced) {
      // A very light brush, using the instrument's original directional recoil.
      chimes[3].strike(chimes[3].top + chimes[3].height * .58, .28, 1);
      chimes[4].strike(chimes[4].top + chimes[4].height * .5, .24, -1);
      wake();
    }
    draw();
  }

  function lookAt(x, y) {
    if (!running || reduced) return;
    const nextX = clamp(x, -.65, .65);
    const dx = nextX - previousX;
    if (Math.abs(dx) < .018) return;
    const index = clamp(Math.floor((nextX / 1.3 + .5) * chimes.length), 0, 7);
    const pane = chimes[index];
    pane.strike(pane.top + pane.height * clamp(.54 + y * .2, .2, .8),
      Math.min(.24, .09 + Math.abs(dx) * .25), Math.sign(dx));
    previousX = nextX;
    wake();
  }

  function setReducedMotion(value) {
    reduced = value;
    if (value) pause();
    draw();
  }

  draw();
  return { draw, start, pause, reveal, lookAt, setReducedMotion };
}
