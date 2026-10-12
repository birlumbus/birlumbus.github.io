import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/starfield/starfield.js', import.meta.url), 'utf8');

// Run the real camera handlers with a controlled animation clock. No canvas is
// needed to check whether pointer input changes the viewing direction.
function cameraHarness({ reducedMotion = false, seed } = {}) {
  const frames = new Map();
  const listeners = new Map();
  let nextFrame = 0;
  const requestFrame = callback => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  };
  class TestCanvas {
    getContext() {
      return {
        createRadialGradient: () => ({ addColorStop() {} }),
        fillRect() {},
      };
    }
  }
  let randomState = seed;
  const seededMath = Object.create(Math);
  seededMath.random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 2 ** 32;
  };
  const context = vm.createContext({
    Math: seed === undefined ? Math : seededMath,
    document: { querySelector: () => null, addEventListener() {}, createElement: () => new TestCanvas() },
    window: {
      addEventListener: (name, handler) => listeners.set(name, handler),
      requestAnimationFrame: requestFrame,
      cancelAnimationFrame: id => frames.delete(id),
      matchMedia: () => ({ matches: reducedMotion }),
    },
    requestAnimationFrame: requestFrame,
    performance: { now: () => 0 },
    HTMLCanvasElement: TestCanvas,
  });
  const run = code => vm.runInContext(code, context);
  run(source);
  run(`
    state.host = { isConnected: true };
    state.viewportRect = { left: 0, top: 0, width: 1000, height: 800 };
    state.isRevealed = true;
  `);
  return {
    run,
    setReducedMotion(value) {
      reducedMotion = value;
      run('resetStarfieldCameraTargets()');
    },
    pointerDown(x, y) {
      listeners.get('pointerdown')?.({ pointerType: 'touch', clientX: x, clientY: y });
    },
    move(x, y) {
      run(`handleStarfieldPointerMove({ clientX: ${x}, clientY: ${y} })`);
      for (let step = 0; frames.size > 0; step++) {
        assert.ok(step < 300, 'The camera should settle without a perpetual animation loop');
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach(callback => callback(step * 16));
      }
      return run('({ ...state.camera })');
    },
  };
}

function renderFirstFrame(camera) {
  camera.run(`
    state.isRevealed = false;
    state.shell = { classList: { add() {}, remove() {} } };
    state.host.dataset = {};
    state.host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 800 });
    state.canvas = new HTMLCanvasElement();
    state.canvas.dataset = {};
    state.ctx = { setTransform() {}, clearRect() {}, fillRect() {}, drawImage() {} };
    state.canvas.getContext = () => state.ctx;
    state.host.querySelector = () => state.canvas;
    renderStarfield({ force: true });
  `);
}

test('depth bands share the existing star budget and keep brightness restrained', () => {
  const camera = cameraHarness({ seed: 914 });
  const stars = camera.run('createStarSphere(6000, { includeIntro: false })');
  assert.equal(stars.length, 6000, 'Depth must redistribute stars rather than triple their count');
  const near = stars.filter(star => star.bandIndex === 2);
  const middle = stars.filter(star => star.bandIndex === 1);
  const distant = stars.filter(star => star.bandIndex === 0);
  assert.ok(near.length > 0 && near.length <= 120, 'The foreground should remain sparse');
  assert.ok(middle.length > 600 && distant.length > 4500, 'Most stars should retain their distant scale');
  assert.ok(stars.every(star => star.opacity <= 0.88 && star.pointSize <= 2),
    'Depth should not introduce dazzling or oversized stars');
  const lightPerStar = stars.reduce((sum, star) => sum + star.opacity * star.pointSize ** 2, 0) / stars.length;
  // Preserve the brightness of the approved 58 / 48 / 38 preview.
  const approvedLightPerStar = 0.96;
  assert.ok(lightPerStar > approvedLightPerStar * 0.95 && lightPerStar < approvedLightPerStar * 1.05,
    'The released field should stay close to the approved overall core brightness');
});

test('each layer uses its approved distance while retaining varied star appearance', () => {
  const camera = cameraHarness({ seed: 914 });
  const stars = camera.run('createStarSphere(6000, { includeIntro: false })');
  const distances = [58, 48, 38];
  assert.ok(stars.every(star => Math.abs(Math.hypot(star.x, star.y, star.z) - distances[star.bandIndex]) < 1e-9),
    'The approved distance should be the actual depth, with no hidden spread');
  const distant = stars.filter(star => star.bandIndex === 0);
  const sizes = distant.map(star => star.pointSize);
  assert.ok(Math.max(...sizes) - Math.min(...sizes) > 0.15,
    'Background stars should have subtle scale variation');
});

test('foreground scale and parallax blend gently into the middle distance', () => {
  const camera = cameraHarness({ seed: 914 });
  const stars = camera.run('createStarSphere(6000, { includeIntro: false })');
  const near = stars.filter(star => star.bandIndex === 2);
  const middle = stars.filter(star => star.bandIndex === 1);
  assert.ok(near.every(star => star.pointSize <= 1.75), 'Foreground cores should be less conspicuous');
  const averageParallax = group => group.reduce((sum, star) => sum + 1 / Math.hypot(star.x, star.y, star.z), 0) / group.length;
  assert.ok(averageParallax(near) > averageParallax(middle) && averageParallax(near) < averageParallax(middle) * 2.8,
    'Foreground motion should stay distinct without peeling away as a separate sheet');
  const smallestNearSize = Math.min(...near.map(star => star.pointSize));
  assert.ok(middle.some(star => star.pointSize > smallestNearSize), 'The size transition should overlap');
});

test('equal distances give every population identical depth and movement', () => {
  const camera = cameraHarness({ seed: 914 });
  camera.run(`
    STARFIELD_DEPTH_BANDS.forEach(band => { band.distance = 70; });
    state.stars = createStarSphere(1200, { includeIntro: false });
  `);
  const stars = camera.run('state.stars');
  assert.ok(stars.every(star => Math.abs(Math.hypot(star.x, star.y, star.z) - 70) < 1e-9),
    '70/70/70 must place every star at the same depth');
  assert.ok(stars.every(star => star.cameraDepthIndex === stars[0].cameraDepthIndex));
  assert.ok(stars.every(star => star.haloStrength === 0), 'No old foreground glow should imply a nearer layer');
  const coreSize = stars[0].pointSize - stars[0].sizeVariation;
  assert.ok(stars.every(star => Math.abs(star.pointSize - star.sizeVariation - coreSize) < 1e-9),
    'Equal distances should share a scale profile, with intrinsic size variation retained');
  camera.run(`
    state.stars = [0, 1, 2].map(bandIndex => ({
      ...state.stars.find(star => star.bandIndex === bandIndex), x: 0, y: 0, z: 70
    }));
    state.canvas = new HTMLCanvasElement();
    var sameDepthPoints = [];
    state.ctx = {
      setTransform() {}, clearRect() { sameDepthPoints = []; },
      fillRect(x, y) { sameDepthPoints.push({ x, y }); }
    };
  `);
  for (const [width, height] of [[1063, 837], [390, 844]]) {
    const points = camera.run(`
      state.metrics = starfieldMetrics({ width: ${width}, height: ${height} });
      state.camera.yaw = state.metrics.yawGain * 0.7;
      state.camera.pitch = state.metrics.pitchGain * 0.5;
      drawStarfieldCamera();
      sameDepthPoints;
    `);
    assert.equal(points.length, 3);
    assert.ok(points.every(point => point.x === points[0].x && point.y === points[0].y),
      'Matched sightlines at equal distances must project identically, regardless of layer label');
  }
});

test('equal pixel movements have balanced horizontal and vertical sensitivity', () => {
  for (const [width, height] of [[1280, 720], [1063, 837], [390, 844]]) {
    const camera = cameraHarness();
    camera.run(`state.viewportRect = { left: 0, top: 0, width: ${width}, height: ${height} }`);
    camera.move(width / 2, height / 2);
    const horizontal = camera.move(width / 2 + 80, height / 2);
    const vertical = camera.move(width / 2, height / 2 + 80);
    const ratio = Math.abs(vertical.pitch / horizontal.yaw);
    assert.ok(ratio > 0.9 && ratio < 1.1,
      `An 80px movement should feel similar on both axes at ${width}×${height}; ratio ${ratio}`);
  }
});

test('vertical look opens beyond the old limit and stays bounded', () => {
  const camera = cameraHarness();
  camera.move(500, 400);
  const view = camera.move(500, 800);
  const degrees = Math.abs(view.pitch) * 180 / Math.PI;
  assert.ok(degrees > 4.5 && degrees <= 7.0001, 'Vertical look should open up without becoming an unrestricted orbit');
});

test('an ordinary look keeps the approved depth separation subtle but visible', () => {
  const camera = cameraHarness({ seed: 914 });
  camera.run(`
    var generatedStars = createStarSphere(6000, { includeIntro: false });
    state.stars = [2, 1, 0].map(bandIndex => {
      const population = generatedStars.filter(star => star.bandIndex === bandIndex)
        .sort((a, b) => Math.hypot(a.x, a.y, a.z) - Math.hypot(b.x, b.y, b.z));
      const star = population[Math.floor(population.length / 2)];
      return { ...star, x: 0, y: 0, z: Math.hypot(star.x, star.y, star.z) };
    });
    state.canvas = new HTMLCanvasElement();
    var responsePoints = [];
    state.ctx = {
      setTransform() {}, clearRect() { responsePoints = []; },
      fillRect(x) { responsePoints.push(x); }
    };
  `);
  for (const [width, height, drag, minimumSeparation] of [[1063, 837, 120, 0.5], [390, 844, 80, 0.35]]) {
    const moved = camera.run(`
      state.metrics = starfieldMetrics({ width: ${width}, height: ${height} });
      state.camera.yaw = state.metrics.yawGain * ${drag} / (${width} / 2);
      state.camera.pitch = 0;
      drawStarfieldCamera();
      responsePoints;
    `);
    assert.equal(moved.length, 3, 'All three depth populations should stay visible');
    assert.ok(moved[1] - moved[0] > minimumSeparation && moved[2] - moved[1] > minimumSeparation,
      `A ${drag}px look on ${width}×${height} should visibly separate each region: ${moved.join(', ')}`);
  }
});

function drawDepthFixture(camera, yaw = 0) {
  camera.run(`
    state.canvas = new HTMLCanvasElement();
    state.metrics = { width: 1000, height: 800, dpr: 1, focalLength: 500 };
    state.camera.yaw = ${yaw};
    state.camera.pitch = 0;
    state.stars = [3, 15, 60].map(z => ({
      x: 0, y: 0, z, opacity: 0.6, pointSize: 1.35, color: 'rgb(250, 252, 255)'
    }));
    var drawnPoints = [];
    state.ctx = {
      setTransform() {}, clearRect() {},
      fillRect(x, y) { drawnPoints.push({ x, y }); }
    };
    drawStarfieldCamera();
  `);
  return camera.run('drawnPoints');
}

test('nearby stars have greater parallax than distant stars under the same camera movement', () => {
  const camera = cameraHarness();
  const initial = drawDepthFixture(camera);
  const moved = drawDepthFixture(camera, 0.09);
  const distances = moved.map((point, index) => Math.abs(point.x - initial[index].x));
  assert.ok(distances[0] > distances[1] && distances[1] > distances[2],
    'Distance must affect movement, rather than merely changing the star size');
  assert.ok(distances[0] - distances[2] > 1 && distances[0] - distances[2] < 16,
    'The extra foreground motion should be visible but restrained');
});

test('reduced motion keeps every depth band still even with a displaced camera', () => {
  const camera = cameraHarness({ reducedMotion: true });
  const points = drawDepthFixture(camera, 0.09);
  assert.ok(points.every(point => point.x === 500 && point.y === 400));
});

test('portrait framing avoids an ultra-wide vertical view while preserving desktop framing', () => {
  const camera = cameraHarness();
  for (const [width, height] of [[320, 740], [390, 844], [430, 932]]) {
    const metrics = camera.run(`starfieldMetrics({ width: ${width}, height: ${height} })`);
    const verticalFov = 2 * Math.atan(height / (2 * metrics.focalLength)) * 180 / Math.PI;
    assert.ok(verticalFov >= 65 && verticalFov <= 90, 'Phone framing should not stretch into the peripheral viewing angles');
    assert.ok(metrics.totalStars <= 22000, 'Mobile framing should keep the existing population cap');
  }
  const desktop = camera.run('starfieldMetrics({ width: 1280, height: 720 })');
  const horizontalFov = 2 * Math.atan(1280 / (2 * desktop.focalLength)) * 180 / Math.PI;
  assert.ok(Math.abs(horizontalFov - 96) < 0.01, 'Desktop framing should stay as it is');
});

function drawPortrait(camera, { pitch = 0, stars = null } = {}) {
  camera.run(`
    state.canvas = new HTMLCanvasElement();
    state.metrics = starfieldMetrics({ width: 390, height: 844 });
    state.camera.yaw = 0;
    state.camera.pitch = ${pitch};
    var drawnPortraitPoints = [];
    state.ctx = {
      setTransform() {}, clearRect() {},
      fillRect(x, y, width) { drawnPortraitPoints.push({ x, y, size: width, opacity: this.globalAlpha }); }
    };
  `);
  if (stars) {
    camera.run(`state.stars = ${JSON.stringify(stars)}`);
  } else {
    camera.run('state.stars = createStarSphere(state.metrics.totalStars, { includeIntro: false, metrics: state.metrics })');
  }
  camera.run('drawStarfieldCamera()');
  return camera.run('drawnPortraitPoints').filter(point => point.x >= 0 && point.x < 390 && point.y >= 0 && point.y < 844);
}

test('portrait stars occupy the outer regions without a central pile-up', () => {
  const camera = cameraHarness({ seed: 914 });
  const points = drawPortrait(camera);
  const middle = points.filter(point => point.y >= 211 && point.y < 633).length;
  const outer = points.length - middle;
  assert.ok(middle < outer * 1.5 && middle > outer * 0.65,
    `Equal-area regions should have similar populations: ${middle} middle, ${outer} outer, ${points.length} visible`);
  assert.ok(points.length > 2400 && points.length < 3300, 'The reframed sky should retain close to its previous visible density');
});

test('portrait edge motion stays close to central motion', () => {
  const camera = cameraHarness();
  const metrics = camera.run('starfieldMetrics({ width: 390, height: 844 })');
  const slope = (422 - 42) / metrics.focalLength;
  const angle = Math.atan(slope);
  const stars = [0, angle, -angle].map(pitch => ({
    x: 0, y: Math.sin(pitch) * 15, z: Math.cos(pitch) * 15,
    opacity: 0.6, pointSize: 1.35, color: 'rgb(250, 252, 255)',
  }));
  const initial = drawPortrait(camera, { stars });
  const moved = drawPortrait(camera, { pitch: 0.004, stars });
  const displacement = moved.map((point, index) => Math.abs(point.y - initial[index].y));
  assert.ok(displacement[0] > 0, 'The center should still move');
  assert.ok(displacement[1] < displacement[0] * 2.2 && displacement[2] < displacement[0] * 2.2,
    'The top and bottom should not race ahead of the center');
});

test('portrait redistribution has no visible boundary at combined camera limits', () => {
  const camera = cameraHarness();
  for (const [width, height] of [[320, 740], [390, 844], [600, 720], [720, 960]]) {
    camera.run(`
      state.canvas = new HTMLCanvasElement();
      state.metrics = starfieldMetrics({ width: ${width}, height: ${height} });
      var boundaryPoints = [];
      state.ctx = {
        setTransform() {}, clearRect() { boundaryPoints = []; },
        fillRect(x, y) { boundaryPoints.push({ x, y }); }
      };
      state.stars = [];
      for (let step = 0; step <= 40; step++) {
        const across = step / 20 - 1;
        for (const [x, y] of [[-1, across], [1, across], [across, -1], [across, 1]]) {
          const direction = normalizeVector({
            x: x * state.metrics.sampleHalfWidth / state.metrics.focalLength,
            y: y * state.metrics.sampleHalfHeight / state.metrics.focalLength,
            z: 1
          });
          state.stars.push({
            x: direction.x * STARFIELD_SAMPLING_DEPTH,
            y: direction.y * STARFIELD_SAMPLING_DEPTH,
            z: direction.z * STARFIELD_SAMPLING_DEPTH,
            cameraDepthIndex: STARFIELD_CAMERA_DEPTH_STEPS,
            opacity: 0.6, pointSize: 1.35, color: 'rgb(250, 252, 255)'
          });
        }
      }
    `);
    for (const yaw of [-9, 9]) for (const pitch of [-7, 7]) {
      const visibleBoundary = camera.run(`
        state.camera.yaw = degreesToRadians(${yaw});
        state.camera.pitch = degreesToRadians(${pitch});
        drawStarfieldCamera();
        boundaryPoints.filter(point => point.x >= 0 && point.x < ${width} && point.y >= 0 && point.y < ${height});
      `);
      assert.equal(visibleBoundary.length, 0,
        `The sampled region must cover ${width}×${height} at yaw ${yaw}, pitch ${pitch}`);
    }
  }
});

test('portrait drag sensitivity compensates for the closer framing', () => {
  const camera = cameraHarness();
  camera.run('state.viewportRect = { left: 0, top: 0, width: 390, height: 844 }');
  camera.move(195, 422);
  const view = camera.move(195, 502);
  const stars = [{ x: 0, y: 0, z: 15, opacity: 0.6, pointSize: 1.35, color: 'rgb(250, 252, 255)' }];
  const moved = drawPortrait(camera, { pitch: view.pitch, stars });
  const displacement = Math.abs(moved[0].y - 422);
  assert.ok(displacement > 0.5 && displacement < 14, 'A short portrait drag should remain controlled with the wider vertical response');
});

test('changing to portrait framing preserves the viewing angle on the next pointer movement', () => {
  const camera = cameraHarness();
  camera.move(200, 400);
  const initial = camera.move(800, 400);
  camera.run(`
    state.host.dataset = {};
    state.host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 390, height: 844 });
    handleStarfieldResize();
  `);
  const resized = camera.move(802, 400);
  assert.ok(Math.abs(resized.yaw - initial.yaw) < 0.002,
    'A new lens should not reinterpret the movement before resizing');
  assert.equal(resized.pitch, initial.pitch);
});

test('foreground stars travel farther than distant stars during arrival', () => {
  const camera = cameraHarness();
  const stars = camera.run('createStarSphere(3000)');
  const near = stars.filter(star => star.bandIndex === 2);
  const distant = stars.filter(star => star.bandIndex === 0);
  const averageStart = group => group.reduce((sum, star) => sum + star.intro.depthScale, 0) / group.length;
  assert.ok(averageStart(near) < averageStart(distant),
    'Nearby stars should start farther from their settled positions');
});

test('the first rendered frame starts arrival without a click or keyboard activation', () => {
  const camera = cameraHarness();
  renderFirstFrame(camera);
  assert.equal(camera.run('state.isRevealed'), true, 'A ready starfield should reveal automatically');
  assert.equal(camera.run('state.intro.isActive'), true, 'Automatic arrival should preserve the depth animation');
  camera.move(800, 600);
  assert.equal(camera.run('state.intro.isActive'), false, 'Arrival should settle');
  const view = camera.move(900, 600);
  assert.ok(view.yaw > 0.01 && view.yaw < 0.05, 'Pointer movement alone should control the camera');
});

test('automatic arrival shows a static sky immediately with reduced motion', () => {
  const camera = cameraHarness({ reducedMotion: true });
  renderFirstFrame(camera);
  assert.equal(camera.run('state.isRevealed'), true);
  assert.equal(camera.run('state.intro.isActive'), false);
  assert.ok(camera.run('state.totalStars') > 0, 'The static view should contain the generated stars');
});

test('redrawing after automatic arrival does not restart the intro', () => {
  const camera = cameraHarness();
  renderFirstFrame(camera);
  assert.equal(camera.run('state.intro.isActive'), true);
  camera.run('finishStarfieldIntro(); renderStarfield({ force: true })');
  assert.equal(camera.run('state.intro.isActive'), false);
});

test('a new touch drag preserves the viewing angle instead of catching up to its contact position', () => {
  const camera = cameraHarness();
  renderFirstFrame(camera);
  camera.move(200, 600);
  camera.run('initializeStarfield()');
  camera.pointerDown(200, 600);
  const firstDrag = camera.move(300, 600);
  assert.ok(firstDrag.yaw > 0.01 && firstDrag.yaw < 0.05);
  camera.pointerDown(800, 600);
  const secondDrag = camera.move(802, 600);
  assert.ok(secondDrag.yaw > firstDrag.yaw && secondDrag.yaw - firstDrag.yaw < 0.002,
    'A two-pixel movement on a new contact should gently continue from the existing view');
  assert.equal(secondDrag.pitch, firstDrag.pitch);
});

test('a tiny movement after an off-center arrival produces only a tiny rotation', () => {
  const camera = cameraHarness();
  camera.run('state.intro.isActive = true');
  camera.move(800, 600);
  camera.run('finishStarfieldIntro()');
  const view = camera.move(802, 600);
  assert.ok(view.yaw > 0 && view.yaw < 0.002, 'Two pixels must not steer toward the old absolute cursor position');
  assert.equal(view.pitch, 0, 'An unchanged vertical cursor position must preserve pitch');
});

test('the last pointer position during arrival becomes the neutral viewing position', () => {
  const camera = cameraHarness();
  camera.run('state.intro.isActive = true');
  camera.move(800, 600);
  camera.move(200, 200);
  camera.run('finishStarfieldIntro()');
  const view = camera.move(200, 200);
  assert.equal(view.yaw, 0);
  assert.equal(view.pitch, 0);
  const moved = camera.move(300, 200);
  assert.ok(moved.yaw > 0.01 && moved.yaw < 0.05, 'Later horizontal movement should still look around');
  assert.equal(moved.pitch, 0);
});

test('arrival without a known cursor position waits for a pointer baseline', () => {
  const camera = cameraHarness();
  camera.run('finishStarfieldIntro()');
  const initial = camera.move(850, 600);
  assert.equal(initial.yaw, 0);
  assert.equal(initial.pitch, 0);
  const moved = camera.move(850, 610);
  assert.equal(moved.yaw, 0);
  assert.ok(moved.pitch < 0 && moved.pitch > -0.004, 'The next movement should gently rotate from the baseline');
});

test('reduced motion preserves the static view when the pointer moves', () => {
  const camera = cameraHarness({ reducedMotion: true });
  const view = camera.move(800, 600);
  assert.equal(view.yaw, 0);
  assert.equal(view.pitch, 0);
});

test('resizing after arrival does not reinterpret the cursor origin', () => {
  const camera = cameraHarness();
  camera.run('state.intro.isActive = true');
  camera.move(800, 600);
  camera.run('finishStarfieldIntro(); state.viewportRect.width = 1600');
  const view = camera.move(802, 600);
  assert.ok(view.yaw > 0 && view.yaw < 0.002, 'A resized viewport must not turn two pixels into a large rotation');
  assert.equal(view.pitch, 0);
});

test('movement during reduced motion refreshes the origin before looking around resumes', () => {
  const camera = cameraHarness();
  camera.run('state.intro.isActive = true');
  camera.move(800, 600);
  camera.run('finishStarfieldIntro()');
  camera.setReducedMotion(true);
  camera.move(200, 200);
  camera.setReducedMotion(false);
  const view = camera.move(202, 200);
  assert.ok(view.yaw > 0 && view.yaw < 0.002, 'Resuming motion must use the latest cursor position');
  assert.equal(view.pitch, 0);
});
