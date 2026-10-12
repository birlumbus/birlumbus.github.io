import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Chime } from '../public/floating-chimes/chime.js';
import { CHORDS } from '../public/floating-chimes/presets.js';

function makeChime(width = 1280) {
  const chime = new Chime({ xPercent: 43.75, yCenterPercent: 42, heightPercent: 80 });
  chime.resize(width, 520, 16, 60);
  return chime;
}

function advance(chime, seconds, fps = 60) {
  for (let i = 0; i < Math.round(seconds * fps); i++) chime.update(1 / fps, 6, []);
}

test('a strike turns promptly at the outer edge and keeps a light rebound', () => {
  const chime = makeChime();
  chime.strike(chime.top + chime.height * 0.7, 0.9, 1);
  advance(chime, 0.25);
  const first = chime.worldPoint(chime.x, chime.top + chime.height * 0.9);
  assert.ok(first.x > chime.x + 22, 'The first swing should have more room to move');
  advance(chime, 0.3);
  assert.ok(Math.abs(chime.worldPoint(chime.x, chime.top + chime.height * 0.9).x - chime.x) < (first.x - chime.x) * 0.35, 'Gravity should already be bringing the pane through center after half a second');
  advance(chime, 0.3);
  const rebound = chime.worldPoint(chime.x, chime.top + chime.height * 0.9);
  assert.ok(rebound.x < chime.x - 1, 'The pane should pass back through rest and rebound');
  advance(chime, 0.6);
  assert.ok(chime.worldPoint(chime.x, chime.top + chime.height * 0.9).x > chime.x + 1, 'A second gentle swing should remain visible');
  advance(chime, 8);
  const resting = chime.worldPoint(chime.x, chime.top + chime.height * 0.9);
  assert.ok(Math.abs(resting.x - chime.x) < 0.1, 'The pane should settle completely');
});

test('hit detection follows the tilted pane for repeated taps and sweeps', () => {
  const chime = makeChime();
  chime.strike(chime.top + chime.height * 0.8, 1, 1);
  advance(chime, 0.2);
  const localY = chime.top + chime.height * 0.9;
  const drawn = chime.worldPoint(chime.x, localY);
  assert.ok(chime.hitAt(drawn.x, drawn.y), 'A tap on the drawn pane must still hit it while it leans');
  assert.equal(chime.hitAt(chime.x, drawn.y), null, 'The old empty position must not become a ghost hit target');
  const from = chime.worldPoint(chime.x - 40, localY);
  const to = chime.worldPoint(chime.x + 40, localY);
  const crossing = chime.crossingAt(from.x, from.y, to.x, to.y);
  assert.ok(crossing);
  assert.ok(Math.abs(crossing.y - localY) < 0.001, 'The ripple should begin at the actual local contact point');
  assert.equal(crossing.direction, 1);
  assert.equal(chime.crossingAt(from.x, from.y, from.x + 2, from.y), null);
});

test('direct taps keep the pane under a stationary pointer, even when repeated', () => {
  for (const width of [1280, 390]) {
    const chime = makeChime(width);
    const y = chime.top + chime.height * 0.7;
    let largestMovement = 0;
    for (let tap = 0; tap < 40; tap++) {
      assert.ok(chime.hitAt(chime.x, y), 'The original point should remain easy to tap');
      chime.strike(y, 0.72, 1, { gentle: true });
      for (let frame = 0; frame < 6; frame++) {
        chime.update(1 / 60, 6, []);
        const lower = chime.worldPoint(chime.x, chime.top + chime.height);
        largestMovement = Math.max(largestMovement, Math.abs(lower.x - chime.x));
      }
    }
    assert.ok(largestMovement > 0.5, 'A tap should still give a small physical response');
    assert.ok(largestMovement < 6, 'Repeated taps must not push the pane out from under the pointer');
  }
});

test('a direct tap calms an earlier hover strike without jumping position', () => {
  const chime = makeChime();
  const y = chime.top + chime.height * 0.7;
  chime.strike(y, 1, 1);
  advance(chime, 0.1);
  const before = chime.worldPoint(chime.x, chime.top + chime.height);
  chime.strike(y, 0.72, 1, { gentle: true });
  assert.deepEqual(chime.worldPoint(chime.x, chime.top + chime.height), before);
  let furthest = before.x;
  let rebound = chime.x;
  for (let frame = 0; frame < 60; frame++) {
    chime.update(1 / 60, 6, []);
    const x = chime.worldPoint(chime.x, chime.top + chime.height).x;
    furthest = Math.max(furthest, x);
    rebound = Math.min(rebound, x);
  }
  assert.ok(furthest - before.x < 5, 'Clicking should calm the incoming swing instead of adding another shove');
  assert.ok(chime.x - rebound < 5, 'The calmed pane should not swing far back across the pointer');
});

test('gentle taps retain their note, internal pulse, and color bloom', () => {
  const chime = makeChime();
  chime.loadedNote = 2;
  const resting = chime.materialColorAt(CHORDS[0], 0.5, 0.5);
  assert.equal(chime.strike(chime.top + chime.height * 0.5, 0.72, 1, { gentle: true }), 2);
  assert.ok(chime._maxAmplitude() > 0.6, 'The visible pulse should retain its strength');
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.5)) > 55);
});

test('repeated taps remain bounded on a narrow phone screen', () => {
  const chime = makeChime(390);
  for (let i = 0; i < 180; i++) {
    chime.strike(chime.top + chime.height * 0.8, 1, i % 3 ? 1 : -1);
    chime.update(1 / 60, 6, []);
    const lower = chime.worldPoint(chime.x, chime.top + chime.height);
    assert.ok(Number.isFinite(lower.x) && Number.isFinite(lower.y));
    assert.ok(Math.abs(lower.x - chime.x) < 21, 'Motion should fit the spacing between phone chimes');
  }
  advance(chime, 9);
  assert.ok(Math.abs(chime.pose().angle) < 0.0001);
});

const colorDistance = (a, b) => a.reduce((sum, value, i) => sum + Math.abs(value - b[i]), 0);

test('a strike blooms a new color locally, spreads, and fades back to the palette', () => {
  const chime = makeChime();
  const resting = chime.materialColorAt(CHORDS[0], 0.5, 0.4);
  chime.strike(chime.top + chime.height * 0.4, 0.9);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.4)) > 55);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.95)) < 1, 'An untouched end should keep its mood color');
  advance(chime, 0.65);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.62)) > 25, 'The bloom should travel along the glass');
  advance(chime, 9);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.4)) < 1, 'The original mood palette should return');
});

test('repeated color blooms stay bounded and reduced motion keeps them local', () => {
  const chime = makeChime();
  const resting = chime.materialColorAt(CHORDS[0], 0.5, 0.85, 1, null, true);
  chime.strike(chime.top + chime.height * 0.4, 1);
  advance(chime, 1);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.85)) > 20);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.85, 1, null, true)) < 1, 'Reduced motion must not send color waves along the glass');
  for (let i = 0; i < 180; i++) {
    chime.strike(chime.top + chime.height * (i % 10) / 10, 1);
    chime.update(1 / 60, 6, []);
    const color = chime.materialColorAt(CHORDS[0], 0.5, (i % 10) / 10);
    assert.ok(color.every(value => Number.isFinite(value) && value >= 0 && value <= 255));
  }
  advance(chime, 10);
  assert.ok(colorDistance(resting, chime.materialColorAt(CHORDS[0], 0.5, 0.85)) < 1);
});

test('the recoil is consistent across frame rates', () => {
  const poses = [30, 60, 120].map(fps => {
    const chime = makeChime();
    chime.strike(chime.top + chime.height * 0.7, 0.85, -1);
    advance(chime, 0.3, fps);
    return chime.pose().angle;
  });
  assert.ok(Math.max(...poses) - Math.min(...poses) < 0.00001);
});

test('reduced motion uses the resting geometry for rendering and contacts', () => {
  const chime = makeChime();
  chime.strike(chime.top + chime.height * 0.8, 1, 1);
  advance(chime, 0.2);
  assert.notEqual(chime.pose().angle, 0);
  assert.equal(chime.pose(true).angle, 0);
  const y = chime.top + chime.height * 0.9;
  const resting = chime.worldPoint(chime.x, y, true);
  assert.ok(Math.abs(resting.x - chime.x) < 0.000001 && Math.abs(resting.y - y) < 0.000001);
  assert.ok(chime.hitAt(chime.x, y, 0, true));
  assert.ok(chime.strikeGlow > 0, 'Quiet light feedback should remain available in reduced motion');
});
