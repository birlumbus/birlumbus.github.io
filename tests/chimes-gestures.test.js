import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Chime } from '../public/floating-chimes/chime.js';
import { ChimeInteraction } from '../public/floating-chimes/interaction.js';

function instrument() {
  const chimes = [25, 75].map(xPercent => {
    const chime = new Chime({ xPercent, yCenterPercent: 42, heightPercent: 80 });
    chime.resize(500, 200);
    return chime;
  });
  return { chimes, input: new ChimeInteraction(chimes) };
}

function sample(pointerId, x, t, pointerType = 'mouse') {
  return { pointerId, x, y: 80, t, pointerType };
}

test('lifting one finger preserves another finger’s sweep', () => {
  const { input, chimes } = instrument();
  input.press(sample(1, 50, 0, 'touch'));
  input.press(sample(2, 450, 0, 'touch'));
  input.release(1, 'touch');
  input.leave(1);
  assert.deepEqual(input.move(sample(2, 200, 100, 'touch')).map(hit => hit.chime), [chimes[1]]);
});

test('sweeps play in stroke order and the following press does not repeat their audio', () => {
  for (const [start, end, order] of [[50, 375, [0, 1]], [450, 125, [1, 0]]]) {
    const { input, chimes } = instrument();
    input.move(sample(1, start, 0));
    const sweep = input.move(sample(1, end, 100));
    assert.deepEqual(sweep.map(hit => hit.chime), order.map(index => chimes[index]));
    assert.equal(input.press(sample(1, end, 110)).silent, true);
    input.release(1, 'mouse');
    assert.equal(input.press(sample(1, end, 120)).silent, false, 'A deliberate repeated tap must sound again');
  }
});

test('a sweep’s cooldown covers every crossed pane and expires', () => {
  const { input, chimes } = instrument();
  input.move(sample(1, 50, 0));
  assert.equal(input.move(sample(1, 450, 100)).length, 2);
  assert.equal(input.move(sample(1, 50, 120)).length, 0);
  assert.deepEqual(input.move(sample(1, 450, 200)).map(hit => hit.chime), chimes);
});

test('one contact never silences a different finger’s tap', () => {
  const { input } = instrument();
  input.move(sample(1, 450, 0, 'touch'));
  input.move(sample(1, 125, 100, 'touch'));
  assert.equal(input.press(sample(2, 125, 110, 'touch')).silent, false);
});

test('leaving the play surface discards only that contact’s path', () => {
  const { input } = instrument();
  input.move(sample(1, 50, 0));
  input.leave(1);
  assert.equal(input.move(sample(1, 450, 100)).length, 0, 'Returning across a gap must not invent a sweep');
  input.clear();
  assert.equal(input.move(sample(1, 50, 200)).length, 0);
});
