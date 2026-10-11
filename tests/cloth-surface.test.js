import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ClothCurrent } from '../src/scripts/cloth/current.js';
import { createClothSurface, deformClothSurface } from '../src/scripts/cloth/surface.js';

function project(positions) {
  const projected = [];
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    const rx = x * Math.cos(-0.43) + z * Math.sin(-0.43);
    const rz = -x * Math.sin(-0.43) + z * Math.cos(-0.43);
    const ry = y * Math.cos(0.16) - rz * Math.sin(0.16);
    const depth = y * Math.sin(0.16) + rz * Math.cos(0.16);
    const perspective = 3.8 / (3.8 - depth);
    projected.push([0.56 + rx * 0.68 * perspective, 0.51 + ry * 0.72 * perspective]);
  }
  return projected;
}

function covers(surface, points) {
  const vertices = project(surface.positions);
  return points.every(([x, y]) => {
    for (let i = 0; i < surface.indices.length; i += 3) {
      const [a, b, c] = [vertices[surface.indices[i]], vertices[surface.indices[i + 1]], vertices[surface.indices[i + 2]]];
      const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (Math.abs(area) < 1e-12) continue;
      const cross = (p, q) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]);
      const ab = cross(a, b), bc = cross(b, c), ca = cross(c, a);
      if ((ab >= 0 && bc >= 0 && ca >= 0) || (ab <= 0 && bc <= 0 && ca <= 0)) return true;
    }
    return false;
  });
}

function findNode(surface, u, v) {
  for (let i = 0; i < surface.count; i++) {
    if (Math.abs(surface.uvs[i * 2] * 2 - 1 - u) < 1e-6 && Math.abs(surface.uvs[i * 2 + 1] * 2 - 1 - v) < 1e-6) return i;
  }
  assert.fail(`Missing original material point ${u}, ${v}`);
}

test('extra material preserves the original resting crease positions', () => {
  const surface = createClothSurface();
  deformClothSurface(surface, new ClothCurrent({ opening: false }));
  const fixtures = [
    [0, 0, [0, 0.12, 0.32]],
    [-0.5, -0.75, [-0.504096913265847, -0.5504001405650494, -0.4058792709743313]],
    [0.5, 0.75, [0.504096913265847, 0.6145998594349504, -0.15689584797019648]],
    [-0.5, 0.5, [-0.4802985629475, 0.5370998594349505, 0.04641031887280465]],
  ];
  for (const [u, v, expected] of fixtures) {
    const i = findNode(surface, u, v) * 3;
    assert.ok(expected.every((value, k) => Math.abs(surface.positions[i + k] - value) < 1e-7));
  }
});

test('the lower-left viewport remains covered during a strong upward and rightward current', () => {
  const surface = createClothSurface();
  const current = new ClothCurrent({ opening: false });
  const corner = [[0.005, 0.005], [0.08, 0.02], [0.2, 0.08]];
  for (let i = 0; i < 90; i++) {
    current.stir(-0.7, -0.85, 0.055, 0.04);
    current.advance(1 / 60);
    if (i % 15 === 0 || i === 89) {
      deformClothSurface(surface, current);
      assert.ok(covers(surface, corner), 'Flowing material should continue beyond the lower-left screen boundary');
    }
  }
});

test('the material beyond the screen moves with the current rather than staying pinned', () => {
  const surface = createClothSurface();
  const current = new ClothCurrent({ opening: false });
  for (let i = 0; i < 30; i++) {
    current.stir(-0.8, -0.8, 0, 0.04);
    current.advance(1 / 60);
  }
  deformClothSurface(surface, current);
  assert.ok(surface.uvs[0] < 0 && surface.uvs[1] < 0, 'The sheet should continue beyond its former boundary');
  assert.ok(Math.abs(surface.positions[1] - surface.rest[1]) > 0.05, 'The extended material should still flow');
});
