import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ClothCurrent } from '../public/cloth/current.js';

function run(current, seconds, fps = 60) {
  for (let i = 0; i < seconds * fps; i++) current.advance(1 / fps);
}

test('the opening current rises gently from rest, then settles completely', () => {
  const current = new ClothCurrent();
  assert.deepEqual(current.sample(0, 0), [0, 0, 0]);
  run(current, 0.5);
  assert.ok(Math.hypot(...current.sample(0, 0)) > 0.01);
  run(current, 20);
  assert.equal(current.active, false);
  assert.deepEqual(current.sample(0, 0), [0, 0, 0]);
});

test('a local current moves nearby folds more than distant folds', () => {
  const current = new ClothCurrent({ opening: false });
  current.stir(-0.6, 0.6, 0.08, -0.04);
  assert.deepEqual(current.sample(-0.6, 0.6), [0, 0, 0], 'The surface does not jump to the pointer');
  run(current, 0.25);
  const nearby = Math.hypot(...current.sample(-0.6, 0.6));
  const distant = Math.hypot(...current.sample(0.9, -0.9));
  assert.ok(nearby > 0.005);
  assert.ok(nearby > distant * 8);
});

test('folds continue drifting after input ends and can wake again after settling', () => {
  const current = new ClothCurrent({ opening: false });
  current.stir(0, 0, 0.08, 0.02);
  run(current, 0.1);
  const early = Math.hypot(...current.sample(0, 0));
  run(current, 0.4);
  assert.ok(Math.hypot(...current.sample(0, 0)) > early);
  run(current, 20);
  assert.equal(current.active, false);
  current.stir(0, 0, -0.05, 0.04);
  run(current, 0.25);
  assert.equal(current.active, true);
  assert.ok(Math.hypot(...current.sample(0, 0)) > 0.005);
});

test('repeated fast movement stays bounded and eventually settles', () => {
  const current = new ClothCurrent({ opening: false });
  for (let i = 0; i < 600; i++) {
    current.stir(Math.sin(i * 0.04), Math.cos(i * 0.03), 4, -3);
    current.advance(1 / 60);
    const sample = current.sample(Math.sin(i), Math.cos(i));
    assert.ok(sample.every(Number.isFinite));
    assert.ok(Math.hypot(...sample) < 1, 'Even sustained input must stay bounded');
    assert.ok(Number.isFinite(current.foldRelease(Math.sin(i), Math.cos(i))));
  }
  assert.equal(current.active, true);
  run(current, 25);
  assert.equal(current.active, false);
});

test('motion feels consistent across different frame rates', () => {
  const slow = new ClothCurrent();
  const fast = new ClothCurrent();
  run(slow, 2, 30);
  run(fast, 2, 120);
  const a = slow.sample(0.3, -0.5);
  const b = fast.sample(0.3, -0.5);
  assert.ok(Math.hypot(...a) > 0.005);
  assert.ok(a.every((value, i) => Math.abs(value - b[i]) < 0.004));
});

test('reset removes all motion for reduced-motion mode', () => {
  const current = new ClothCurrent();
  run(current, 1);
  assert.ok(Math.hypot(...current.sample(0.4, -0.7)) > 0.005);
  current.stir(0.4, -0.7, 0.08, 0);
  run(current, 0.3);
  assert.ok(current.foldRelease(0.4, -0.7) > 0);
  current.reset();
  assert.equal(current.active, false);
  assert.deepEqual(current.sample(0.4, -0.7), [0, 0, 0]);
  assert.equal(current.foldRelease(0.4, -0.7), 0);
  assert.equal(current.colorActivity(0.4, -0.7), 0);
  current.advance(0.02);
  assert.deepEqual(current.sample(0.4, -0.7), [0, 0, 0]);
});

test('a modest movement creates a visible directional response within 150ms', () => {
  const current = new ClothCurrent({ opening: false });
  current.stir(0, 0, 0.025, 0);
  run(current, 0.15);
  assert.ok(current.sample(0, 0)[0] > 0.012, 'Nearby folds should lean visibly in the movement direction');
});

test('diagonal movement still lifts the surface instead of cancelling its depth response', () => {
  const current = new ClothCurrent({ opening: false });
  current.stir(0, 0, 0.04, 0.04 * 1.2 / 0.9);
  run(current, 0.25);
  assert.ok(Math.abs(current.sample(0, 0)[2]) > 0.008);
});

test('one passing current loosens the crease without exhausting the folds', () => {
  const current = new ClothCurrent({ opening: false });
  current.stir(-0.45, 0, 0.03, 0);
  assert.equal(current.foldRelease(-0.45, 0), 0, 'The fold should open through motion, without jumping');
  for (let i = 0; i < 30; i++) {
    current.stir(-0.45 + i * 0.03, 0, 0.03, 0);
    current.advance(1 / 60);
  }
  let peak = current.foldRelease(0, 0);
  for (let i = 0; i < 60; i++) {
    current.advance(1 / 60);
    peak = Math.max(peak, current.foldRelease(0, 0));
  }
  assert.ok(peak > 0.1, 'An ordinary sweep should visibly loosen the crease');
  assert.ok(peak < 0.65, 'One sweep should leave folds available for the next movement');
  assert.ok(current.foldRelease(0.95, -0.95) < 0.5, 'A local current should not flatten the whole sheet');
  run(current, 1);
  assert.ok(current.foldRelease(0, 0) < 0.15, 'The crease should be mostly gathered within two seconds');
});

test('sustained currents can still fully open a crease and gather promptly afterward', () => {
  const current = new ClothCurrent({ opening: false });
  for (let i = 0; i < 180; i++) {
    current.stir(Math.sin(i * 0.08) * 0.45, 0, 0.04, 0);
    current.advance(1 / 60);
  }
  assert.ok(current.foldRelease(0, 0) > 0.95, 'Deliberate repeated movement should still be able to flatten a crease');
  run(current, 3);
  assert.ok(current.foldRelease(0, 0) < 0.15, 'Even a fully opened crease should return without a long flat pause');
  run(current, 20);
  assert.equal(current.foldRelease(0, 0), 0);
  assert.equal(current.active, false);
});

test('a cursor current leaves a local color wash that fades with the cloth', () => {
  const current = new ClothCurrent({ opening: false });
  assert.equal(current.colorActivity(-0.5, 0.5), 0);
  current.stir(-0.5, 0.5, 0.05, -0.02);
  run(current, 0.15);
  const nearby = current.colorActivity(-0.5, 0.5);
  const distant = current.colorActivity(0.9, -0.9);
  assert.ok(nearby > 0.2, 'The wash should appear promptly near the cursor current');
  assert.ok(nearby > distant * 8, 'Color should follow the local material rather than tint the whole page');
  run(current, 3);
  assert.ok(current.colorActivity(-0.5, 0.5) < 0.03, 'Color should fade without leaving a permanent stain');
  run(current, 20);
  assert.equal(current.colorActivity(-0.5, 0.5), 0);
  assert.equal(current.active, false);
});

test('color stays bounded under repeated currents and does not appear in the opening wave', () => {
  const opening = new ClothCurrent();
  run(opening, 1);
  assert.equal(opening.colorActivity(0, 0), 0);
  const current = new ClothCurrent({ opening: false });
  for (let i = 0; i < 240; i++) {
    current.stir(0, 0, 4, -3);
    current.advance(1 / 60);
    const color = current.colorActivity(0, 0);
    assert.ok(color >= 0 && color <= 1, 'Repeated movement must preserve a translucent color response');
  }
  assert.ok(current.colorActivity(0, 0) > 0.8);
  current.reset();
  assert.equal(current.colorActivity(0, 0), 0);
});
