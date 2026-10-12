// Generated from birlumbus/trebuchet 9960b813c6ce8f0d55ff0710dced8d49a7b47823: lib/physics.ts

// ../../../Users/rhodri.thomas/work-personal/personal/trebuchet/lib/physics.ts
var MATERIALS = {
  stone: {
    label: "Stone",
    density: 2500,
    cd: 0.55,
    mass: 40,
    restitution: 0.15,
    description: "Dressed stone. The siege workhorse."
  },
  iron: {
    label: "Iron",
    density: 7800,
    cd: 0.47,
    mass: 60,
    restitution: 0.3,
    description: "Dense and compact. Less drag for its mass."
  },
  clay: {
    label: "Clay pot",
    density: 650,
    cd: 0.85,
    mass: 20,
    restitution: 0,
    description: "A hollow vessel. More drag, a shattering impact."
  }
};
var DEFAULTS = {
  material: "stone",
  mass: 40,
  counterweight: 2e3,
  arm: 7.5,
  ratio: 3.5,
  sling: 6,
  release: 40,
  wind: 0,
  target: 158,
  drag: true,
  friction: 0.015
};
var LIMITS = {
  mass: [10, 100],
  counterweight: [500, 5e3],
  arm: [6, 10],
  ratio: [3, 5],
  sling: [3, 8],
  release: [20, 65],
  wind: [-20, 20],
  target: [40, 400],
  friction: [0, 0.06]
};
var G = 9.81;
var TAU = Math.PI * 2;
function radiusFor(c) {
  return Math.cbrt(
    3 * c.mass / (4 * Math.PI * MATERIALS[c.material].density)
  );
}
function buildWall(target) {
  const blocks = [];
  let id = 0;
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 10 && col === 1) continue;
      blocks.push({
        id: id++,
        x: target + col * 1.45 + row % 2 * 0.25,
        y: row * 0.92,
        w: 1.4,
        h: 0.87,
        health: 9e3,
        maxHealth: 9e3
      });
    }
  }
  return blocks;
}
function createSimulation(config, wall) {
  const c = { ...config };
  const height = c.arm * 0.88;
  const a = c.arm / c.ratio;
  const theta = -Math.PI + 0.72;
  const tipY = height + c.arm * Math.sin(theta);
  const radius = radiusFor(c);
  const psi = -Math.asin(Math.min(0.95, (tipY - radius) / c.sling));
  const armMass = 28 * (c.arm + a), inertia = armMass * (c.arm * c.arm - c.arm * a + a * a) / 3;
  const s = {
    config: c,
    height,
    short: a,
    hanger: 1.4,
    armMass,
    inertia,
    q: [theta, -Math.PI / 2, psi],
    w: [0, 0, 0],
    time: 0,
    phase: "ready",
    projectile: { x: 0, y: 0, vx: 0, vy: 0 },
    radius,
    trail: [],
    events: [],
    metrics: {
      distance: 0,
      launchSpeed: 0,
      launchAngle: 0,
      apex: 0,
      impactEnergy: 0,
      flightTime: 0,
      hit: false
    },
    blocks: wall ?? buildWall(c.target),
    releaseTime: 0,
    releasePosition: null,
    reason: "",
    sampleAt: 0,
    grounded: true
  };
  s.projectile = positions(s).projectile;
  return s;
}
function positions(s) {
  const [t, f, p] = s.q, [wt, , wp] = s.w;
  const L = s.config.arm, a = s.short, b = s.hanger, ls = s.config.sling;
  const tip = { x: L * Math.cos(t), y: s.height + L * Math.sin(t) };
  const hinge = { x: -a * Math.cos(t), y: s.height - a * Math.sin(t) };
  return {
    tip,
    hinge,
    counterweight: {
      x: hinge.x + b * Math.cos(f),
      y: hinge.y + b * Math.sin(f)
    },
    projectile: {
      x: tip.x + ls * Math.cos(p),
      y: tip.y + ls * Math.sin(p),
      vx: -L * Math.sin(t) * wt - ls * Math.sin(p) * wp,
      vy: L * Math.cos(t) * wt + ls * Math.cos(p) * wp
    }
  };
}
function solve(matrix, vector) {
  const n = vector.length, a = matrix.map((r, i) => [...r, vector[i]]);
  for (let i = 0; i < n; i++) {
    let k = i;
    for (let j = i + 1; j < n; j++)
      if (Math.abs(a[j][i]) > Math.abs(a[k][i])) k = j;
    [a[i], a[k]] = [a[k], a[i]];
    const pivot = a[i][i];
    if (Math.abs(pivot) < 1e-10) throw Error("Singular mechanism geometry");
    for (let j = i; j <= n; j++) a[i][j] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = a[r][i];
      for (let j = i; j <= n; j++) a[r][j] -= f * a[i][j];
    }
  }
  return a.map((r) => r[n]);
}
function derivative(s, z) {
  const q = z.slice(0, 3), w = z.slice(3), c = s.config;
  const attached = s.phase === "ready" || s.phase === "swing";
  const mp = attached ? c.mass : 0.03;
  const bodies = [
    { m: c.counterweight, l: [-s.short, s.hanger, 0] },
    { m: mp, l: [c.arm, 0, c.sling] }
  ];
  const M = Array.from({ length: 3 }, () => [0, 0, 0]);
  const F = [-s.armMass * G * (c.arm - s.short) / 2 * Math.cos(q[0]), 0, 0];
  M[0][0] = s.inertia;
  for (const { m, l } of bodies) {
    for (let i = 0; i < 3; i++) {
      F[i] -= m * G * l[i] * Math.cos(q[i]);
      for (let j = 0; j < 3; j++) {
        M[i][j] += m * l[i] * l[j] * Math.cos(q[i] - q[j]);
        F[i] += m * l[i] * l[j] * Math.sin(q[j] - q[i]) * w[j] * w[j];
      }
    }
  }
  for (let i = 0; i < 3; i++) F[i] -= c.friction * M[i][i] * w[i];
  if (attached && s.grounded) {
    const J = [c.arm * Math.cos(q[0]), 0, c.sling * Math.cos(q[2])];
    const bias = -c.arm * Math.sin(q[0]) * w[0] * w[0] - c.sling * Math.sin(q[2]) * w[2] * w[2];
    const constrained = solve(
      [...M.map((r, i) => [...r, -J[i]]), [...J, 0]],
      [...F, -bias]
    );
    if (constrained[3] >= 0) return [...w, ...constrained.slice(0, 3)];
  }
  return [...w, ...solve(M, F)];
}
function rk4(z, dt, f) {
  const a = f(z), b = f(z.map((v, i) => v + dt * a[i] / 2)), c = f(z.map((v, i) => v + dt * b[i] / 2)), d = f(z.map((v, i) => v + dt * c[i]));
  return z.map((v, i) => v + dt * (a[i] + 2 * b[i] + 2 * c[i] + d[i]) / 6);
}
function advanceMechanism(s, dt) {
  const z = rk4([...s.q, ...s.w], dt, (v) => derivative(s, v));
  s.q = z.slice(0, 3);
  s.w = z.slice(3);
  if (s.grounded && positions(s).projectile.y > s.radius + 1e-7)
    s.grounded = false;
}
function mechanismEnergy(s) {
  const p = positions(s);
  const [t, f, psi] = s.q, [wt, wf, wp] = s.w;
  const L = s.config.arm, a = s.short, b = s.hanger, l = s.config.sling;
  const vx = a * Math.sin(t) * wt - b * Math.sin(f) * wf, vy = -a * Math.cos(t) * wt + b * Math.cos(f) * wf;
  const pvx = -L * Math.sin(t) * wt - l * Math.sin(psi) * wp, pvy = L * Math.cos(t) * wt + l * Math.cos(psi) * wp;
  return 0.5 * s.inertia * wt * wt + s.armMass * G * (s.height + (L - a) / 2 * Math.sin(t)) + 0.5 * s.config.counterweight * (vx * vx + vy * vy) + s.config.counterweight * G * p.counterweight.y + 0.5 * s.config.mass * (pvx * pvx + pvy * pvy) + s.config.mass * G * p.projectile.y;
}
function flightStep(p, c, dt) {
  const radius = radiusFor(c);
  const k = c.drag ? 0.5 * 1.225 * MATERIALS[c.material].cd * Math.PI * radius * radius / c.mass : 0;
  const z = rk4([p.x, p.y, p.vx, p.vy], dt, ([, , vx, vy]) => {
    const dx = vx - c.wind, speed = Math.hypot(dx, vy);
    return [vx, vy, -k * speed * dx, -G - k * speed * vy];
  });
  return { x: z[0], y: z[1], vx: z[2], vy: z[3] };
}
function segmentBlock(a, b, block, r) {
  let lo = 0, hi = 1;
  for (const axis of ["x", "y"]) {
    const d = b[axis] - a[axis], min = block[axis] - r, max = block[axis] + (axis === "x" ? block.w : block.h) + r;
    if (Math.abs(d) < 1e-12) {
      if (a[axis] < min || a[axis] > max) return null;
    } else {
      let t0 = (min - a[axis]) / d, t1 = (max - a[axis]) / d;
      if (t0 > t1) [t0, t1] = [t1, t0];
      lo = Math.max(lo, t0);
      hi = Math.min(hi, t1);
      if (lo > hi) return null;
    }
  }
  return lo;
}
function impact(s, wall) {
  const p = s.projectile;
  const energy = 0.5 * s.config.mass * (p.vx * p.vx + p.vy * p.vy);
  s.metrics.impactEnergy = energy;
  s.metrics.hit = wall;
  s.metrics.distance = p.x;
  s.metrics.flightTime = s.time - s.releaseTime;
  s.phase = "impact";
  s.events.push({ ...p, kind: "impact", energy });
  if (wall) {
    const radius = 1 + Math.min(5, Math.sqrt(energy / 9e3));
    for (const b of s.blocks) {
      if (b.health <= 0) continue;
      const dist = Math.hypot(b.x + b.w / 2 - p.x, b.y + b.h / 2 - p.y);
      if (dist < radius) {
        b.health -= energy * 0.5 / (1 + dist * dist);
        if (b.health <= 0)
          s.events.push({
            kind: "break",
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            energy: 500,
            vx: p.vx * 0.12,
            vy: 3
          });
      }
    }
    for (let row = 1; row < 11; row++) {
      for (const b of s.blocks.filter(
        (b2) => b2.health > 0 && Math.abs(b2.y - row * 0.92) < 0.01
      )) {
        const support = s.blocks.some(
          (k) => k.health > 0 && Math.abs(k.y - (row - 1) * 0.92) < 0.01 && k.x < b.x + b.w && k.x + k.w > b.x
        );
        if (!support) {
          b.health = 0;
          s.events.push({
            kind: "break",
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            energy: 500,
            vx: 1,
            vy: 0
          });
        }
      }
    }
  }
}
function tick(s, dt) {
  if (s.phase === "ready") return;
  const previousPhase = s.phase;
  s.time += dt;
  if (s.phase === "swing") {
    const before = positions(s).projectile;
    advanceMechanism(s, dt);
    const p = positions(s).projectile;
    s.projectile = p;
    const angle = Math.atan2(p.vy, p.vx) * 180 / Math.PI;
    const prevAngle = Math.atan2(before.vy, before.vx) * 180 / Math.PI;
    if (s.time > 0.15 && p.vx > 5 && p.vy > 0 && prevAngle > s.config.release && angle <= s.config.release) {
      s.phase = "flight";
      s.releaseTime = s.time;
      s.releasePosition = { x: p.x, y: p.y };
      s.metrics.launchSpeed = Math.hypot(p.vx, p.vy);
      s.metrics.launchAngle = angle;
      s.metrics.apex = p.y;
      s.trail.push({ x: p.x, y: p.y });
      s.events.push({ ...p, kind: "release", energy: 0 });
    } else if (p.y < s.radius - 0.03 && !s.grounded && s.time > 0.12 || s.time > 6) {
      s.phase = "misfire";
      s.reason = p.y < s.radius ? "The sling struck the ground. Try a shorter sling or a different arm ratio." : "No clean release. Try a different release angle or a heavier counterweight.";
      s.events.push({ ...p, kind: "misfire", energy: 0 });
    }
  } else if (s.phase === "flight") {
    advanceMechanism(s, dt);
    const before = { ...s.projectile }, next = flightStep(before, s.config, dt);
    let first = 1, wall = false, collided = false;
    if (next.y <= s.radius) {
      first = Math.max(0, (before.y - s.radius) / (before.y - next.y));
      collided = true;
    }
    for (const b of s.blocks) {
      if (b.health <= 0) continue;
      const t = segmentBlock(before, next, b, s.radius);
      if (t !== null && t <= first) {
        first = t;
        wall = true;
        collided = true;
      }
    }
    s.projectile = collided ? flightStep(before, s.config, dt * first) : next;
    s.metrics.distance = s.projectile.x;
    s.metrics.apex = Math.max(s.metrics.apex, s.projectile.y);
    s.metrics.flightTime = s.time - s.releaseTime;
    if (collided) impact(s, wall);
    if (s.time - s.sampleAt > 0.04) {
      s.trail.push({ x: s.projectile.x, y: s.projectile.y });
      s.sampleAt = s.time;
    }
    if (s.time > 60) {
      s.phase = "misfire";
      s.reason = "The projectile left the test range.";
    }
  } else if (s.time - s.releaseTime < 18) {
    advanceMechanism(s, dt);
  }
  if (previousPhase === "swing" || previousPhase === "flight") {
    if (![...s.q, ...s.w, s.projectile.x, s.projectile.y].every(Number.isFinite)) {
      s.phase = "misfire";
      s.reason = "This configuration became unstable. Restore the rig and try again.";
    }
  }
  if (s.phase === "impact") s.q = s.q.map((x) => (x % TAU + TAU) % TAU);
}
function previewRelease(config) {
  const s = { ...createSimulation(config), phase: "swing" };
  const path = [{ x: s.projectile.x, y: s.projectile.y }];
  for (let i = 0; i < 480 * 7 && s.phase === "swing"; i++) {
    tick(s, 1 / 480);
    if (i % 8 === 0 && Number.isFinite(s.projectile.x + s.projectile.y))
      path.push({ x: s.projectile.x, y: s.projectile.y });
  }
  return {
    released: s.phase === "flight",
    pose: positions(s),
    projectile: { ...s.projectile },
    path,
    angle: s.phase === "flight" ? s.metrics.launchAngle : null
  };
}
export {
  DEFAULTS,
  LIMITS,
  MATERIALS,
  advanceMechanism,
  buildWall,
  createSimulation,
  flightStep,
  mechanismEnergy,
  positions,
  previewRelease,
  radiusFor,
  segmentBlock,
  tick
};
