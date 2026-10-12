const hover = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const previews = [
  {
    name: 'World',
    trigger: document.querySelector('[data-world-preview-trigger]'),
    element: document.querySelector('[data-world-preview]'),
    load: canvas => import('./world-preview-renderer.js').then(module => module.createWorldPreview(canvas)),
  },
  {
    name: 'Starfield',
    trigger: document.querySelector('[data-starfield-preview-trigger]'),
    element: document.querySelector('[data-starfield-preview]'),
    load: canvas => import('./starfield-preview-renderer.js').then(module => module.createStarfieldPreview(canvas)),
  },
  {
    name: 'Trebuchet',
    trigger: document.querySelector('[data-trebuchet-preview-trigger]'),
    element: document.querySelector('[data-trebuchet-preview]'),
    load: canvas => import('./trebuchet-preview-renderer.js').then(module => module.createTrebuchetPreview(canvas)),
  },
  {
    name: 'Jellyfish',
    trigger: document.querySelector('[data-jellyfish-preview-trigger]'),
    element: document.querySelector('[data-jellyfish-preview]'),
    load: canvas => import('./jellyfish-preview-renderer.js').then(module => module.createJellyfishPreview(canvas)),
  },
  {
    name: 'Chimes',
    trigger: document.querySelector('[data-chimes-preview-trigger]'),
    element: document.querySelector('[data-chimes-preview]'),
    load: canvas => import('./chimes-preview-renderer.js').then(module => module.createChimesPreview(canvas)),
  },
].filter(preview => preview.trigger && preview.element);

let hovered = null, focused = null, active = null, revision = 0;

function syncMotion() {
  for (const preview of previews) {
    if (!preview.renderer) continue;
    preview.renderer.setReducedMotion?.(reduced.matches);
    if (preview === active && preview.element.classList.contains('is-visible') &&
        preview.inView && !document.hidden && !reduced.matches) preview.renderer.start();
    else preview.renderer.pause();
  }
}

async function update() {
  const next = hovered ?? focused;
  if (next === active) return;
  active = next;
  const request = ++revision;
  for (const preview of previews) {
    preview.element.classList.toggle('is-replaced', Boolean(next && preview !== next));
    preview.element.classList.remove('is-visible');
    preview.renderer?.pause();
  }
  if (!next) return;

  try {
    next.loading ??= next.load(next.element.querySelector('canvas'));
    next.renderer = await next.loading;
    if (request !== revision || active !== next) return;
    next.renderer.reveal?.(reduced.matches);
    next.renderer.draw();
    next.element.classList.add('is-visible');
    syncMotion();
  } catch (error) {
    // A decorative preview must never interfere with the project link.
    next.loading = null;
    if (request === revision) active = null;
    console.warn(`${next.name} preview unavailable`, error);
  }
}

for (const preview of previews) {
  preview.inView = true;
  let origin = null;
  preview.trigger.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !hover.matches) return;
    hovered = preview;
    origin = { x: event.clientX, y: event.clientY };
    void update();
  });
  preview.trigger.addEventListener('pointermove', event => {
    if (active !== preview || !origin || reduced.matches || document.hidden || !preview.inView) return;
    preview.renderer?.lookAt?.((event.clientX - origin.x) / 100, (event.clientY - origin.y) / 100);
  });
  preview.trigger.addEventListener('pointerleave', () => {
    if (hovered === preview) hovered = null;
    origin = null;
    void update();
  });
  preview.trigger.addEventListener('focus', () => {
    if (preview.trigger.matches(':focus-visible')) focused = preview;
    void update();
  });
  preview.trigger.addEventListener('blur', () => {
    if (focused === preview) focused = null;
    void update();
  });
  preview.trigger.addEventListener('keydown', event => {
    if (event.key === 'Escape') { hovered = null; focused = null; void update(); }
  });
}

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const preview = previews.find(item => item.trigger === entry.target);
    if (preview) preview.inView = entry.isIntersecting;
  }
  syncMotion();
});
for (const preview of previews) observer.observe(preview.trigger);
hover.addEventListener('change', () => {
  if (!hover.matches) { hovered = null; void update(); }
});
reduced.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
window.addEventListener('pagehide', () => previews.forEach(preview => preview.renderer?.pause()));
window.addEventListener('pageshow', () => {
  hovered = hover.matches ? previews.find(preview => preview.trigger.matches(':hover')) ?? null : null;
  focused = previews.find(preview => preview.trigger.matches(':focus-visible')) ?? null;
  void update();
  syncMotion();
});
