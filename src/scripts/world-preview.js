const trigger = document.querySelector('[data-world-preview-trigger]');
const preview = document.querySelector('[data-world-preview]');

if (trigger && preview) {
  const canvas = preview.querySelector('canvas');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = false, focused = false, inView = true;
  let loading = null, renderer = null;

  function pauseOrRotate() {
    if (!renderer) return;
    if (preview.classList.contains('is-visible') && inView && !document.hidden && !reduced.matches) renderer.start();
    else renderer.pause();
  }

  function hide() {
    preview.classList.remove('is-visible');
    renderer?.pause();
  }

  async function reveal() {
    if (!hovered && !focused) return;
    try {
      loading ??= import('./world-preview-renderer.js').then(module => module.createWorldPreview(canvas));
      renderer = await loading;
      if (!hovered && !focused) return;
      renderer.draw();
      preview.classList.add('is-visible');
      pauseOrRotate();
    } catch (error) {
      // The preview is decorative; project navigation remains available if WebGL fails.
      loading = null;
      hide();
      console.warn('World preview unavailable', error);
    }
  }

  function update() {
    if (!hovered && !focused) hide();
    else void reveal();
  }

  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !hover.matches) return;
    hovered = true;
    update();
  });
  trigger.addEventListener('pointerleave', () => { hovered = false; update(); });
  trigger.addEventListener('focus', () => { focused = trigger.matches(':focus-visible'); update(); });
  trigger.addEventListener('blur', () => { focused = false; update(); });
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Escape') { hovered = false; focused = false; hide(); }
  });
  hover.addEventListener('change', () => { if (!hover.matches) { hovered = false; update(); } });
  reduced.addEventListener('change', pauseOrRotate);
  document.addEventListener('visibilitychange', pauseOrRotate);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; pauseOrRotate(); }).observe(trigger);
  window.addEventListener('pagehide', () => renderer?.pause());
  window.addEventListener('pageshow', () => {
    hovered = hover.matches && trigger.matches(':hover');
    focused = trigger.matches(':focus-visible');
    update();
    pauseOrRotate();
  });
}
