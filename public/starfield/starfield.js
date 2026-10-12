const STARFIELD_MAX_DEVICE_PIXEL_RATIO = 1.5;
const STARFIELD_STAR_DENSITY_PX = 42;
const STARFIELD_RESIZE_BUCKET_PX = 80;
const STARFIELD_ASPECT_BUCKET = 0.04;
const STARFIELD_SMALL_VIEWPORT_PX = 720;
const STARFIELD_SMALL_AREA_PX = 700_000;
const STARFIELD_HORIZONTAL_FOV_DEG = 96;
const STARFIELD_PORTRAIT_VERTICAL_FOV_DEG = 80;
const STARFIELD_MAX_YAW_DEG = 9;
const STARFIELD_MAX_PITCH_DEG = 7;
const STARFIELD_CAMERA_EASE = 0.1;
const STARFIELD_CAMERA_EPSILON = 0.0003;
const STARFIELD_CAMERA_DEPTH_STEPS = 32;
const STARFIELD_FAR_CAMERA_RATE = 0.4;
const STARFIELD_NEAR_CAMERA_RATE = 1.1;
const STARFIELD_POINT_SIZE = 1.35;
const STARFIELD_MAX_POINT_SIZE = 2;
const STARFIELD_PARALLAX_PX = 12;
const STARFIELD_PARALLAX_REFERENCE_DEPTH = 4.8;
const STARFIELD_EDGE_MARGIN_PX = 8;
const STARFIELD_INTRO_DURATION_MS = 1600;
const STARFIELD_INTRO_STAGGER_MS = 560;
const STARFIELD_INTRO_FADE_START = 0.34;
const STARFIELD_INTRO_FADE_END = 0.72;
const STARFIELD_INTRO_ORIGIN_JITTER = 0.035;
const STARFIELD_INTRO_POINT_SIZE = 0.28;
const STARFIELD_INTRO_GLOW_MAX = 0.18;
const STARFIELD_CLUSTER_RATIO = 0.075;
const STARFIELD_CLUSTER_SPREAD_MIN = 0.2;
const STARFIELD_CLUSTER_SPREAD_MAX = 0.32;
const STARFIELD_CLUSTER_MAJOR_AXIS_MIN = 1.1;
const STARFIELD_CLUSTER_MAJOR_AXIS_MAX = 1.5;
const STARFIELD_CLUSTER_MINOR_AXIS_MIN = 0.65;
const STARFIELD_CLUSTER_MINOR_AXIS_MAX = 0.95;
const STARFIELD_CLUSTER_BEND_MAX = 0.08;
const STARFIELD_VOID_COUNT = 7;
const STARFIELD_VOID_RADIUS_MIN = 0.1;
const STARFIELD_VOID_RADIUS_MAX = 0.22;
const STARFIELD_VOID_STRENGTH = 0.48;
const STARFIELD_SAMPLING_DEPTH = 6;
const STARFIELD_DEPTH_NEAR_REFERENCE = 5.5;
const STARFIELD_DEPTH_FAR_REFERENCE = 96;

const STARFIELD_DEPTH_BANDS = [
  {
    share: 0.77, distance: 58,
    opacityMin: 0.32, opacityMax: 0.88
  },
  {
    share: 0.22, distance: 48,
    opacityMin: 0.32, opacityMax: 0.88
  },
  {
    share: 0.01, distance: 38,
    opacityMin: 0.45, opacityMax: 0.88
  }
];

const STARFIELD_TONES = [
  {rgb: "250, 252, 255", weight: 0.74},
  {rgb: "202, 224, 255", weight: 0.17},
  {rgb: "255, 230, 198", weight: 0.09}
];

const state = {
  shell: document.querySelector(".starfield-shell"),
  host: document.querySelector("#starfield"),
  canvas: null,
  ctx: null,
  haloSprite: null,
  stars: [],
  viewportRect: null,
  metrics: null,
  planKey: "",
  renderFrame: null,
  resizeFrame: null,
  cameraFrame: null,
  pointerFrame: null,
  pendingPointer: null,
  pointerOrigin: null,
  camera: {
    yaw: 0,
    pitch: 0,
    targetYaw: 0,
    targetPitch: 0
  },
  intro: {
    frame: null,
    isActive: false,
    startedAt: 0,
    duration: STARFIELD_INTRO_DURATION_MS
  },
  isReady: false,
  isRevealed: false,
  totalStars: 0
};

initializeStarfield();

function initializeStarfield() {
  if (!state.host || !state.shell) return;

  syncStarfieldCanvas(state.host);
  state.haloSprite ??= createStarfieldHaloSprite();
  scheduleStarfieldRender({force: true});

  window.addEventListener("pointermove", handleStarfieldPointerMove, {passive: true});
  window.addEventListener("pointerdown", handleStarfieldPointerDown, {passive: true});
  window.addEventListener("resize", handleStarfieldResize, {passive: true});

  const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  motionQuery?.addEventListener?.("change", () => {
    resetStarfieldCameraTargets();
    if (prefersReducedStarfieldMotion() && state.intro.isActive) {
      finishStarfieldIntro();
      return;
    }

    drawCurrentStarfieldFrame();
  });

  document.addEventListener("visibilitychange", handleStarfieldVisibilityChange);
}

function syncStarfieldCanvas(host) {
  let canvas = host.querySelector("[data-starfield-canvas]");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "starfield-canvas";
    canvas.dataset.starfieldCanvas = "true";
    host.append(canvas);
  }

  state.canvas = canvas;
  state.ctx = canvas.getContext("2d", {alpha: true});
}

function createStarfieldHaloSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 24;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(12, 12, 0, 12, 12, 12);
  gradient.addColorStop(0, "rgba(235, 242, 255, 0.06)");
  gradient.addColorStop(0.28, "rgba(235, 242, 255, 0.02)");
  gradient.addColorStop(1, "rgba(235, 242, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 24, 24);
  return canvas;
}

function scheduleStarfieldRender({force = false} = {}) {
  if (!state.host?.isConnected) return;

  if (state.renderFrame) {
    window.cancelAnimationFrame(state.renderFrame);
    state.renderFrame = null;
  }

  state.isReady = false;
  state.shell?.classList.remove("is-ready");

  state.renderFrame = window.requestAnimationFrame(() => {
    state.renderFrame = null;
    renderStarfield({force});
  });
}

function renderStarfield({force = false} = {}) {
  const rect = starfieldViewportRect({refresh: true});
  const metrics = starfieldMetrics(rect);
  const canvasChanged = resizeStarfieldCanvas(metrics);
  const planChanged = force || state.planKey !== metrics.planKey;

  if (planChanged) {
    state.stars = createStarSphere(metrics.totalStars, {
      includeIntro: !state.isRevealed || state.intro.isActive,
      metrics
    });
    state.totalStars = metrics.totalStars;
    state.planKey = metrics.planKey;
    state.host.dataset.starCount = String(state.totalStars);
  }

  state.metrics = metrics;
  if (planChanged || canvasChanged || force) {
    drawCurrentStarfieldFrame();
  }

  state.isReady = true;
  state.shell?.classList.add("is-ready");

  revealStarfield();
}

function resizeStarfieldCanvas(metrics) {
  const canvas = state.canvas;
  if (!(canvas instanceof HTMLCanvasElement)) return false;

  const pixelWidth = Math.max(1, Math.ceil(metrics.width * metrics.dpr));
  const pixelHeight = Math.max(1, Math.ceil(metrics.height * metrics.dpr));
  const changed = canvas.width !== pixelWidth || canvas.height !== pixelHeight;

  if (changed) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.dataset.canvasDpr = String(metrics.dpr);
  canvas.dataset.starCount = String(metrics.totalStars);
  return changed;
}

function drawCurrentStarfieldFrame() {
  if (state.intro.isActive) {
    drawStarfieldIntroFrame(starfieldIntroElapsed());
    return;
  }

  drawStarfieldCamera();
}

function drawStarfieldCamera() {
  drawStarfieldFrame();
}

function drawStarfieldIntroFrame(elapsed) {
  drawStarfieldFrame({introElapsed: elapsed});
}

function drawStarfieldFrame({introElapsed = null} = {}) {
  const canvas = state.canvas;
  const ctx = state.ctx;
  const metrics = state.metrics;
  if (!(canvas instanceof HTMLCanvasElement) || !ctx || !metrics) return;

  const {width, height, dpr, focalLength} = metrics;
  const centerX = width / 2;
  const centerY = height / 2;
  const margin = STARFIELD_EDGE_MARGIN_PX;
  const isIntroFrame = Number.isFinite(introElapsed);
  const camera = prefersReducedStarfieldMotion() || isIntroFrame
    ? {yaw: 0, pitch: 0}
    : state.camera;
  const basis = starfieldCameraBasis(camera.yaw, camera.pitch);
  // Cache the distance-dependent view responses for the depth layers.
  const depthBases = Array.from({length: STARFIELD_CAMERA_DEPTH_STEPS + 1}, (_, index) => {
    const rate = mixNumber(STARFIELD_FAR_CAMERA_RATE, STARFIELD_NEAR_CAMERA_RATE,
      index / STARFIELD_CAMERA_DEPTH_STEPS);
    return starfieldCameraBasis(camera.yaw * rate, camera.pitch * rate);
  });
  // A small camera lean separates the depth bands. Rotation alone would leave
  // stars along the same sightline at identical projected positions.
  const parallaxPx = Math.min(STARFIELD_PARALLAX_PX, width * 0.012);
  const leanScale = parallaxPx * STARFIELD_PARALLAX_REFERENCE_DEPTH / focalLength;
  const leanGain = metrics.yawGain ?? degreesToRadians(STARFIELD_MAX_YAW_DEG);
  const leanX = clampNumber(camera.yaw / leanGain, -1, 1) * leanScale;
  const leanY = clampNumber(camera.pitch / leanGain, -1, 1) * leanScale;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let activeColor = "";

  for (let index = 0; index < state.stars.length; index += 1) {
    const star = state.stars[index];
    if (isIntroFrame && (!star.intro || introElapsed <= star.intro.delay)) continue;

    const starBasis = depthBases[star.cameraDepthIndex] ?? basis;
    const cameraX = dotStarVector(star, starBasis.right) - leanX;
    const cameraY = dotStarVector(star, starBasis.up) - leanY;
    const cameraZ = dotStarVector(star, starBasis.forward);

    if (cameraZ <= 0.02) continue;

    const screenX = centerX + cameraX / cameraZ * focalLength;
    const screenY = centerY - cameraY / cameraZ * focalLength;

    if (
      screenX < -margin ||
      screenX > width + margin ||
      screenY < -margin ||
      screenY > height + margin
    ) {
      continue;
    }

    const pointSize = Math.min(STARFIELD_MAX_POINT_SIZE, star.pointSize ?? STARFIELD_POINT_SIZE);
    if (isIntroFrame) {
      const introStar = starfieldIntroStarFrame(
        star,
        screenX,
        screenY,
        centerX,
        centerY,
        width,
        height,
        pointSize,
        introElapsed
      );

      if (!introStar) continue;

      if (star.color !== activeColor) {
        ctx.fillStyle = star.color;
        activeColor = star.color;
      }

      drawStarfieldPoint(ctx, star, introStar.x, introStar.y, introStar.pointSize, introStar.opacity);
      continue;
    }

    if (star.color !== activeColor) {
      ctx.fillStyle = star.color;
      activeColor = star.color;
    }

    drawStarfieldPoint(ctx, star, screenX, screenY, pointSize, star.opacity);
  }

  ctx.globalAlpha = 1;
}

function drawStarfieldPoint(ctx, star, x, y, pointSize, opacity) {
  ctx.globalAlpha = opacity;
  if (star.haloStrength > 0 && state.haloSprite) {
    const haloSize = pointSize * 4;
    const inset = (haloSize - pointSize) / 2;
    ctx.globalAlpha = opacity * star.haloStrength;
    ctx.drawImage(state.haloSprite, x - inset, y - inset, haloSize, haloSize);
    ctx.globalAlpha = opacity;
  }
  ctx.fillRect(x, y, pointSize, pointSize);
}

function starfieldIntroStarFrame(
  star,
  screenX,
  screenY,
  centerX,
  centerY,
  width,
  height,
  finalPointSize,
  elapsed
) {
  const intro = star.intro;
  if (!intro) return null;

  const rawProgress = (elapsed - intro.delay) / intro.duration;
  if (rawProgress <= 0) return null;

  const progress = clampNumber(rawProgress, 0, 1);
  const travelProgress = easeInOutCubic(progress);
  const lightProgress = easeOutCubic(progress);
  const originX = centerX + width * intro.originX;
  const originY = centerY + height * intro.originY;
  const depthScale = mixNumber(intro.depthScale, 1, travelProgress);
  const x = originX + (screenX - originX) * depthScale;
  const y = originY + (screenY - originY) * depthScale;
  const fadeIn = smoothstep(STARFIELD_INTRO_FADE_START, STARFIELD_INTRO_FADE_END, progress);
  const glow = 1 + Math.sin(progress * Math.PI) * intro.glow;
  const opacity = clampNumber(star.opacity * fadeIn * lightProgress * glow, 0, 1);
  const pointSize = mixNumber(STARFIELD_INTRO_POINT_SIZE, finalPointSize, easeOutCubic(progress));

  return {x, y, opacity, pointSize};
}

function createStarSphere(count, {includeIntro = true, metrics = null} = {}) {
  const safeCount = Math.max(0, Number.parseInt(count, 10) || 0);
  const clusters = STARFIELD_CLUSTER_RATIO > 0 ? createStarClusters() : [];
  const voids = createStarVoids();

  return Array.from({length: safeCount}, (_, index) => {
    const clustered = clusters.length > 0 && Math.random() < STARFIELD_CLUSTER_RATIO;
    const adjusted = placeStarfieldDirection(clustered ? clusters[index % clusters.length] : null, voids, metrics);
    const share = index / safeCount;
    const bandIndex = share < STARFIELD_DEPTH_BANDS[0].share ? 0 :
      share < STARFIELD_DEPTH_BANDS[0].share + STARFIELD_DEPTH_BANDS[1].share ? 1 : 2;
    const band = STARFIELD_DEPTH_BANDS[bandIndex];
    const depth = band.distance;
    const closeness = starfieldDepthCloseness(depth);
    const toneIndex = randomStarToneIndex();
    const tone = STARFIELD_TONES[toneIndex];

    const star = {
      x: adjusted.x * depth,
      y: adjusted.y * depth,
      z: adjusted.z * depth,
      bandIndex,
      depth,
      sizeVariation: randomRange(-0.1, 0.1),
      opacity: randomRange(band.opacityMin, band.opacityMax),
      toneIndex,
      color: `rgb(${tone.rgb})`
    };
    updateStarfieldDepthAppearance(star, closeness);

    if (includeIntro) {
      star.intro = createStarIntro(index, closeness);
    }

    return star;
  }).sort((a, b) => a.bandIndex - b.bandIndex || a.toneIndex - b.toneIndex);
}

function starfieldDepthCloseness(depth) {
  return smoothstep(0, 1, Math.log(STARFIELD_DEPTH_FAR_REFERENCE / depth) /
    Math.log(STARFIELD_DEPTH_FAR_REFERENCE / STARFIELD_DEPTH_NEAR_REFERENCE));
}

function updateStarfieldDepthAppearance(star, closeness = starfieldDepthCloseness(star.depth)) {
  // Equal distances share every depth cue. Keep each star's intrinsic variation
  // separate so its layer label cannot imply a different distance.
  star.cameraDepthIndex = Math.round(closeness * STARFIELD_CAMERA_DEPTH_STEPS);
  star.pointSize = mixNumber(1.23, 1.61, closeness) + star.sizeVariation;
  star.haloStrength = (1 - smoothstep(6, 12, star.depth)) * 0.6;
}

function createStarIntro(index, closeness = 0) {
  const sequenceIndex = index + 1;
  const delaySeed = halton(sequenceIndex, 2);
  const depthSeed = halton(sequenceIndex, 5);
  const originSeedX = halton(sequenceIndex, 7);
  const originSeedY = halton(sequenceIndex, 11);
  const glowSeed = halton(sequenceIndex, 13);
  const delay = Math.pow(delaySeed, 1.25) * STARFIELD_INTRO_STAGGER_MS;

  return {
    delay,
    duration: Math.max(1, STARFIELD_INTRO_DURATION_MS - delay),
    depthScale: mixNumber(0.26, 0.34, depthSeed) * mixNumber(1, 0.32, closeness),
    originX: (originSeedX - 0.5) * STARFIELD_INTRO_ORIGIN_JITTER,
    originY: (originSeedY - 0.5) * STARFIELD_INTRO_ORIGIN_JITTER,
    glow: glowSeed * STARFIELD_INTRO_GLOW_MAX
  };
}

function createStarClusters() {
  const anchors = [
    starfieldCameraBasis(-0.43, 0.22).forward,
    starfieldCameraBasis(0.5, -0.24).forward
  ];
  return Array.from({length: 8}, (_, index) => {
    const center = anchors[index] ?? randomUnitVector();
    if (index >= anchors.length) center.z = -Math.abs(center.z);
    return {
      center,
      basis: tangentBasis(center),
      spread: randomRange(STARFIELD_CLUSTER_SPREAD_MIN, STARFIELD_CLUSTER_SPREAD_MAX),
      axisAngle: Math.random() * Math.PI * 2,
      majorAxis: randomRange(STARFIELD_CLUSTER_MAJOR_AXIS_MIN, STARFIELD_CLUSTER_MAJOR_AXIS_MAX),
      minorAxis: randomRange(STARFIELD_CLUSTER_MINOR_AXIS_MIN, STARFIELD_CLUSTER_MINOR_AXIS_MAX),
      bend: randomRange(-STARFIELD_CLUSTER_BEND_MAX, STARFIELD_CLUSTER_BEND_MAX),
      phase: Math.random() * Math.PI * 2
    };
  });
}

function createStarVoids() {
  const anchors = [
    starfieldCameraBasis(0.06, -0.06).forward,
    starfieldCameraBasis(-0.65, -0.25).forward
  ];
  return Array.from({length: STARFIELD_VOID_COUNT}, (_, index) => {
    const center = anchors[index] ?? randomUnitVector();
    if (index >= anchors.length) center.z = -Math.abs(center.z);
    const radius = randomRange(STARFIELD_VOID_RADIUS_MIN, STARFIELD_VOID_RADIUS_MAX);
    return {center, radius, edgeDot: Math.cos(radius)};
  });
}

function randomClusteredUnitVector(cluster) {
  const cosAxis = Math.cos(cluster.axisAngle);
  const sinAxis = Math.sin(cluster.axisAngle);
  const primary = {
    x: cluster.basis.tangent.x * cosAxis + cluster.basis.bitangent.x * sinAxis,
    y: cluster.basis.tangent.y * cosAxis + cluster.basis.bitangent.y * sinAxis,
    z: cluster.basis.tangent.z * cosAxis + cluster.basis.bitangent.z * sinAxis
  };
  const secondary = {
    x: cluster.basis.tangent.x * -sinAxis + cluster.basis.bitangent.x * cosAxis,
    y: cluster.basis.tangent.y * -sinAxis + cluster.basis.bitangent.y * cosAxis,
    z: cluster.basis.tangent.z * -sinAxis + cluster.basis.bitangent.z * cosAxis
  };
  const alongLimit = cluster.spread * cluster.majorAxis;
  const crossLimit = cluster.spread * cluster.minorAxis;
  const along = randomSignedPower(0.72) * alongLimit;
  const normalizedAlong = along / (alongLimit || 1);
  const curve = Math.sin(normalizedAlong * Math.PI + cluster.phase) * cluster.spread * cluster.bend;
  const cross = randomSignedPower(2.35) * crossLimit + curve + randomSignedPower(1.4) * crossLimit * 0.12;
  const x = cluster.center.x +
    primary.x * along +
    secondary.x * cross;
  const y = cluster.center.y +
    primary.y * along +
    secondary.y * cross;
  const z = cluster.center.z +
    primary.z * along +
    secondary.z * cross;

  return normalizeVector({x, y, z});
}

function placeStarfieldDirection(cluster, voids, metrics) {
  let vector;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    vector = cluster ? randomClusteredUnitVector(cluster) : randomStarfieldDirection(metrics);
    let density = 1;
    for (const voidArea of voids) {
      if (dotStarVector(vector, voidArea.center) <= voidArea.edgeDot) continue;
      const distance = angularDistance(vector, voidArea.center);
      const falloff = smoothstep(0, 1, 1 - distance / voidArea.radius);
      density *= 1 - STARFIELD_VOID_STRENGTH * falloff;
    }
    if (Math.random() <= density) break;
  }
  // Resampling makes soft gaps without pushing stars into a bright ring.
  return vector;
}

function randomStarfieldDirection(metrics) {
  if (!metrics?.viewSampleRatio || Math.random() >= metrics.viewSampleRatio) return randomUnitVector();

  // Portrait framing needs more of the existing stars in its visible region.
  // Sample beyond every camera limit so looking around never exposes a seam.
  return normalizeVector({
    x: randomRange(-metrics.sampleHalfWidth, metrics.sampleHalfWidth) / metrics.focalLength,
    y: randomRange(-metrics.sampleHalfHeight, metrics.sampleHalfHeight) / metrics.focalLength,
    z: 1
  });
}

function randomUnitVector() {
  const z = randomRange(-1, 1);
  const theta = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.max(0, 1 - z * z));

  return {
    x: Math.cos(theta) * radius,
    y: Math.sin(theta) * radius,
    z
  };
}

function tangentBasis(center) {
  const reference = Math.abs(center.y) > 0.86
    ? {x: 1, y: 0, z: 0}
    : {x: 0, y: 1, z: 0};
  const tangent = normalizeVector(crossProduct(reference, center));
  const bitangent = normalizeVector(crossProduct(center, tangent));

  return {tangent, bitangent};
}

function crossProduct(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function normalizeVector(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function angularDistance(a, b) {
  return Math.acos(clampNumber(dotStarVector(a, b), -1, 1));
}

function starfieldCameraBasis(yaw, pitch) {
  const sinYaw = Math.sin(yaw);
  const cosYaw = Math.cos(yaw);
  const sinPitch = Math.sin(pitch);
  const cosPitch = Math.cos(pitch);

  const forward = {
    x: sinYaw * cosPitch,
    y: sinPitch,
    z: cosYaw * cosPitch
  };
  const right = {
    x: cosYaw,
    y: 0,
    z: -sinYaw
  };
  const up = {
    x: -sinYaw * sinPitch,
    y: cosPitch,
    z: -cosYaw * sinPitch
  };

  return {forward, right, up};
}

function dotStarVector(star, vector) {
  return star.x * vector.x + star.y * vector.y + star.z * vector.z;
}

function revealStarfield() {
  if (state.isRevealed) return;

  state.isRevealed = true;
  resetStarfieldCameraTargets();
  state.shell?.classList.add("is-revealed");

  if (prefersReducedStarfieldMotion()) {
    stopStarfieldIntro();
    drawStarfieldCamera();
    releaseStarfieldIntroMetadata();
    return;
  }

  startStarfieldIntro();
}

function startStarfieldIntro() {
  stopStarfieldIntro();

  state.intro.isActive = true;
  state.intro.startedAt = performance.now();
  drawStarfieldIntroFrame(0);
  state.intro.frame = requestAnimationFrame(stepStarfieldIntro);
}

function stepStarfieldIntro(timestamp) {
  if (!state.intro.isActive) return;

  if (prefersReducedStarfieldMotion()) {
    finishStarfieldIntro();
    return;
  }

  const elapsed = timestamp - state.intro.startedAt;
  if (elapsed >= state.intro.duration) {
    finishStarfieldIntro();
    return;
  }

  drawStarfieldIntroFrame(elapsed);
  state.intro.frame = requestAnimationFrame(stepStarfieldIntro);
}

function finishStarfieldIntro() {
  stopStarfieldIntro();
  setStarfieldPointerOrigin();
  drawStarfieldCamera();
  releaseStarfieldIntroMetadata();
}

function stopStarfieldIntro() {
  if (state.intro.frame) {
    window.cancelAnimationFrame(state.intro.frame);
    state.intro.frame = null;
  }

  state.intro.isActive = false;
}

function setStarfieldPointerOrigin(pointer = state.pendingPointer) {
  state.pointerOrigin = pointer ? {
    x: pointer.x,
    y: pointer.y,
    yaw: state.camera.yaw,
    pitch: state.camera.pitch
  } : null;
}

function handleStarfieldPointerDown(event) {
  if (!state.host?.isConnected || (event.pointerType !== "touch" && event.pointerType !== "pen")) return;

  state.pendingPointer = {x: event.clientX, y: event.clientY};
  setStarfieldPointerOrigin();
  state.camera.targetYaw = state.camera.yaw;
  state.camera.targetPitch = state.camera.pitch;
}

function handleStarfieldPointerMove(event) {
  if (!state.host?.isConnected) return;

  state.pendingPointer = {x: event.clientX, y: event.clientY};

  // Keep tracking through arrival so looking around starts from the cursor's
  // current position instead of catching up to its distance from screen center.
  if (!state.isRevealed || state.intro.isActive || prefersReducedStarfieldMotion()) return;

  if (state.pointerFrame) return;
  state.pointerFrame = requestAnimationFrame(() => {
    state.pointerFrame = null;
    applyStarfieldPointer(state.pendingPointer);
  });
}

function applyStarfieldPointer(pointer = {x: 0, y: 0}) {
  if (state.intro.isActive) return;

  if (prefersReducedStarfieldMotion()) {
    resetStarfieldCameraTargets();
    return;
  }

  if (!state.pointerOrigin) {
    setStarfieldPointerOrigin(pointer);
    return;
  }

  const rect = starfieldViewportRect();
  const current = normalizeStarfieldPointer(pointer.x, pointer.y, rect);
  const origin = normalizeStarfieldPointer(state.pointerOrigin.x, state.pointerOrigin.y, rect);
  const yawLimit = degreesToRadians(STARFIELD_MAX_YAW_DEG);
  const pitchLimit = degreesToRadians(STARFIELD_MAX_PITCH_DEG);
  const {yawGain, pitchGain} = starfieldFraming(rect.width, rect.height);

  state.camera.targetYaw = clampNumber(state.pointerOrigin.yaw + (current.x - origin.x) * yawGain,
    -yawLimit, yawLimit);
  state.camera.targetPitch = clampNumber(state.pointerOrigin.pitch + (origin.y - current.y) * pitchGain,
    -pitchLimit, pitchLimit);
  startStarfieldCameraLoop();
}

function startStarfieldCameraLoop() {
  if (state.cameraFrame || state.intro.isActive || prefersReducedStarfieldMotion()) return;

  state.cameraFrame = requestAnimationFrame(stepStarfieldCamera);
}

function stepStarfieldCamera() {
  state.cameraFrame = null;
  if (state.intro.isActive || prefersReducedStarfieldMotion()) return;

  const yawDelta = state.camera.targetYaw - state.camera.yaw;
  const pitchDelta = state.camera.targetPitch - state.camera.pitch;

  if (
    Math.abs(yawDelta) <= STARFIELD_CAMERA_EPSILON &&
    Math.abs(pitchDelta) <= STARFIELD_CAMERA_EPSILON
  ) {
    state.camera.yaw = state.camera.targetYaw;
    state.camera.pitch = state.camera.targetPitch;
    drawStarfieldCamera();
    return;
  }

  state.camera.yaw += yawDelta * STARFIELD_CAMERA_EASE;
  state.camera.pitch += pitchDelta * STARFIELD_CAMERA_EASE;
  drawStarfieldCamera();
  state.cameraFrame = requestAnimationFrame(stepStarfieldCamera);
}

function resetStarfieldCameraTargets() {
  state.camera.targetYaw = 0;
  state.camera.targetPitch = 0;
  state.camera.yaw = 0;
  state.camera.pitch = 0;
  setStarfieldPointerOrigin();

  if (state.cameraFrame) {
    window.cancelAnimationFrame(state.cameraFrame);
    state.cameraFrame = null;
  }
}

function releaseStarfieldIntroMetadata() {
  for (let index = 0; index < state.stars.length; index += 1) {
    delete state.stars[index].intro;
  }
}

function handleStarfieldVisibilityChange() {
  if (!document.hidden) return;

  if (state.intro.isActive) {
    finishStarfieldIntro();
    return;
  }

  if (state.cameraFrame) {
    window.cancelAnimationFrame(state.cameraFrame);
    state.cameraFrame = null;
  }
}

function handleStarfieldResize() {
  if (!state.host?.isConnected || state.resizeFrame) return;

  // A new framing changes input sensitivity. Continue from the current pose
  // rather than recalculating a previous drag with that new sensitivity.
  setStarfieldPointerOrigin();
  state.camera.targetYaw = state.camera.yaw;
  state.camera.targetPitch = state.camera.pitch;

  state.resizeFrame = requestAnimationFrame(() => {
    state.resizeFrame = null;
    state.viewportRect = null;
    scheduleStarfieldRender();
  });
}

function starfieldMetrics(rect) {
  const width = Math.max(1, Number(rect?.width) || 1);
  const height = Math.max(1, Number(rect?.height) || 1);
  const bucketWidth = bucketStarfieldDimension(width);
  const bucketHeight = bucketStarfieldDimension(height);
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, STARFIELD_MAX_DEVICE_PIXEL_RATIO));
  const totalStars = starfieldTargetStarCount(bucketWidth, bucketHeight);
  const framing = starfieldFraming(width, height);
  const sampling = starfieldViewSampling(width, height, framing.focalLength);
  const planKey = [
    bucketWidth,
    bucketHeight,
    starfieldAspectBucket(width, height),
    totalStars,
    dpr
  ].join(":");

  return {
    width,
    height,
    bucketWidth,
    bucketHeight,
    dpr,
    totalStars,
    ...framing,
    ...sampling,
    planKey
  };
}

function starfieldFraming(width, height) {
  const baseFocalLength = width / (2 * Math.tan(degreesToRadians(STARFIELD_HORIZONTAL_FOV_DEG) / 2));
  const portraitMix = smoothstep(1, 1.65, height / width);
  const portraitFocalLength = height / (2 * Math.tan(degreesToRadians(STARFIELD_PORTRAIT_VERTICAL_FOV_DEG) / 2));
  const focalLength = mixNumber(baseFocalLength, Math.max(baseFocalLength, portraitFocalLength), portraitMix);
  const motionScale = baseFocalLength / focalLength;
  const yawGain = degreesToRadians(STARFIELD_MAX_YAW_DEG) * motionScale;
  // Pointer coordinates are normalized independently by width and height.
  // Compensate for aspect so the same pixel movement produces the same look.
  const pitchGain = yawGain * height / width;

  return {focalLength, yawGain, pitchGain};
}

function starfieldViewSampling(width, height, focalLength) {
  const baseFocalLength = width / (2 * Math.tan(degreesToRadians(STARFIELD_HORIZONTAL_FOV_DEG) / 2));
  const {sampleHalfWidth, sampleHalfHeight} = starfieldSamplingBounds(width, height, focalLength);
  const sphereVisibleFraction = focal => Math.asin(
    Math.sin(Math.atan(width / (2 * focal))) * Math.sin(Math.atan(height / (2 * focal)))
  ) / Math.PI;
  const baseVisibleFraction = sphereVisibleFraction(baseFocalLength);
  const visibleFraction = sphereVisibleFraction(focalLength);
  const sampleVisibleFraction = width * height / (4 * sampleHalfWidth * sampleHalfHeight);
  // Keep the visible population close to the old lens without allocating more
  // stars. The remaining spherical population preserves soft depth and gaps.
  const viewSampleRatio = focalLength === baseFocalLength ? 0 : clampNumber(
    (baseVisibleFraction - visibleFraction) / (sampleVisibleFraction - visibleFraction), 0, 0.8
  );

  return {sampleHalfWidth, sampleHalfHeight, viewSampleRatio};
}

function starfieldSamplingBounds(width, height, focalLength) {
  const halfWidth = (width / 2 + STARFIELD_EDGE_MARGIN_PX) / focalLength;
  const halfHeight = (height / 2 + STARFIELD_EDGE_MARGIN_PX) / focalLength;
  const leanScale = Math.min(STARFIELD_PARALLAX_PX, width * 0.012) *
    STARFIELD_PARALLAX_REFERENCE_DEPTH / focalLength;
  // Keep the established overscan with a conservative foreground depth so
  // mobile density and edge coverage stay stable at the camera limits.
  const nearestDepth = STARFIELD_SAMPLING_DEPTH;
  let sampleHalfWidth = 0;
  let sampleHalfHeight = 0;

  // Joint yaw and pitch stretch corners more than either axis alone. Transform
  // every viewing corner at both limits, including the nearest stars' lean.
  for (const yawSign of [-1, 1]) for (const pitchSign of [-1, 1]) {
    const basis = starfieldCameraBasis(
      yawSign * degreesToRadians(STARFIELD_MAX_YAW_DEG) * STARFIELD_NEAR_CAMERA_RATE,
      pitchSign * degreesToRadians(STARFIELD_MAX_PITCH_DEG) * STARFIELD_NEAR_CAMERA_RATE
    );
    const leanX = yawSign * leanScale;
    const leanY = pitchSign * leanScale;
    for (const xSign of [-1, 1]) for (const ySign of [-1, 1]) {
      const slopeX = xSign * halfWidth;
      const slopeY = ySign * halfHeight;
      // Intersect this screen ray with the nearest depth sphere.
      const a = 1 + slopeX * slopeX + slopeY * slopeY;
      const b = 2 * (slopeX * leanX + slopeY * leanY);
      const c = leanX * leanX + leanY * leanY - nearestDepth * nearestDepth;
      const cameraZ = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      const cameraX = slopeX * cameraZ + leanX;
      const cameraY = slopeY * cameraZ + leanY;
      const worldX = basis.right.x * cameraX + basis.up.x * cameraY + basis.forward.x * cameraZ;
      const worldY = basis.right.y * cameraX + basis.up.y * cameraY + basis.forward.y * cameraZ;
      const worldZ = basis.right.z * cameraX + basis.up.z * cameraY + basis.forward.z * cameraZ;
      sampleHalfWidth = Math.max(sampleHalfWidth, Math.abs(worldX / worldZ) * focalLength);
      sampleHalfHeight = Math.max(sampleHalfHeight, Math.abs(worldY / worldZ) * focalLength);
    }
  }

  return {sampleHalfWidth: sampleHalfWidth * 1.04, sampleHalfHeight: sampleHalfHeight * 1.04};
}

function starfieldTargetStarCount(width, height) {
  const area = Math.max(1, width * height);
  const target = Math.round(area / STARFIELD_STAR_DENSITY_PX);
  const isSmallViewport = Math.min(width, height) < STARFIELD_SMALL_VIEWPORT_PX ||
    area < STARFIELD_SMALL_AREA_PX;
  const min = isSmallViewport ? 12_000 : 22_000;
  const max = isSmallViewport ? 22_000 : 70_000;

  return clampInteger(target, min, max);
}

function starfieldViewportRect({refresh = false} = {}) {
  if (!refresh && state.viewportRect) return state.viewportRect;

  const hostRect = state.host?.getBoundingClientRect?.();
  if (hostRect?.width > 0 && hostRect?.height > 0) {
    state.viewportRect = plainStarfieldRect(hostRect);
    return state.viewportRect;
  }

  state.viewportRect = {
    left: 0,
    top: 0,
    width: document.documentElement.clientWidth || window.innerWidth || 0,
    height: document.documentElement.clientHeight || window.innerHeight || 0
  };
  return state.viewportRect;
}

function plainStarfieldRect(rect) {
  return {
    left: Number(rect.left) || 0,
    top: Number(rect.top) || 0,
    width: Number(rect.width) || 0,
    height: Number(rect.height) || 0
  };
}

function normalizeStarfieldPointer(clientX = 0, clientY = 0, rectLike = {}) {
  const width = Number(rectLike?.width) || 0;
  const height = Number(rectLike?.height) || 0;
  if (width <= 0 || height <= 0) return {x: 0, y: 0};

  const left = Number(rectLike?.left) || 0;
  const top = Number(rectLike?.top) || 0;
  const x = ((Number(clientX) - left) / width - 0.5) * 2;
  const y = ((Number(clientY) - top) / height - 0.5) * 2;

  return {
    x: clampNumber(x, -1, 1),
    y: clampNumber(y, -1, 1)
  };
}

function randomStarToneIndex() {
  const roll = Math.random();
  let threshold = 0;

  for (let index = 0; index < STARFIELD_TONES.length; index += 1) {
    const tone = STARFIELD_TONES[index];
    threshold += tone.weight;
    if (roll <= threshold) return index;
  }

  return 0;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomSignedPower(power) {
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * Math.pow(Math.random(), power);
}

function mixNumber(min, max, amount) {
  return min + (max - min) * clampNumber(amount, 0, 1);
}

function easeOutCubic(value) {
  const progress = clampNumber(value, 0, 1);
  return 1 - Math.pow(1 - progress, 3);
}

function easeInOutCubic(value) {
  const progress = clampNumber(value, 0, 1);
  if (progress < 0.5) return 4 * progress * progress * progress;

  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function smoothstep(edgeStart, edgeEnd, value) {
  const span = edgeEnd - edgeStart || 1;
  const progress = clampNumber((value - edgeStart) / span, 0, 1);

  return progress * progress * (3 - 2 * progress);
}

function starfieldIntroElapsed() {
  if (!state.intro.isActive) return 0;
  return performance.now() - state.intro.startedAt;
}

function bucketStarfieldDimension(value) {
  return Math.max(
    STARFIELD_RESIZE_BUCKET_PX,
    Math.round((Number(value) || 0) / STARFIELD_RESIZE_BUCKET_PX) * STARFIELD_RESIZE_BUCKET_PX
  );
}

function starfieldAspectBucket(width, height) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  return (Math.round((safeWidth / safeHeight) / STARFIELD_ASPECT_BUCKET) * STARFIELD_ASPECT_BUCKET).toFixed(2);
}

function halton(index, base) {
  let result = 0;
  let fraction = 1 / base;

  for (let value = index; value > 0; value = Math.floor(value / base)) {
    result += fraction * (value % base);
    fraction /= base;
  }

  return result;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function clampInteger(value, min, max) {
  const parsed = Number.parseInt(value, 10);
  const safeValue = Number.isFinite(parsed) ? parsed : min;
  return Math.min(max, Math.max(min, safeValue));
}

function prefersReducedStarfieldMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}
