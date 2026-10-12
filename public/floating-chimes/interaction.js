// Contact paths and recent strikes stay separate for each pointer and pane.
// Main owns DOM/audio; this tracker uses the same moving geometry as rendering.
export class ChimeInteraction {
  constructor(chimes) {
    this.chimes = chimes;
    this.positions = new Map();
    this.recentHits = new Map();
  }

  remember(pointerId, chime, t, source) {
    if (!this.recentHits.has(pointerId)) this.recentHits.set(pointerId, new Map());
    this.recentHits.get(pointerId).set(chime, { t, source });
  }

  press({ pointerId, x, y, t, pointerType }, reducedMotion = false) {
    this.positions.set(pointerId, { x, y, t });
    const padding = pointerType === 'mouse' ? 8 : 12;
    let closest = null;
    for (const chime of this.chimes) {
      const hit = chime.hitAt(x, y, padding, reducedMotion);
      if (hit && (!closest || hit.distance < closest.hit.distance)) closest = { chime, hit };
    }
    if (!closest) return null;
    const previous = this.recentHits.get(pointerId)?.get(closest.chime);
    // A mouse may sound the pane as it enters immediately before the press.
    // Still provide recoil on that press, but sound the contact just once.
    const silent = previous?.source === 'sweep' && t - previous.t < 75;
    this.remember(pointerId, closest.chime, t, 'tap');
    return { ...closest, strength: 0.72, silent };
  }

  move({ pointerId, x, y, t }, reducedMotion = false) {
    const previous = this.positions.get(pointerId);
    this.positions.set(pointerId, { x, y, t });
    if (!previous) return [];
    const dt = Math.max(0.001, (t - previous.t) / 1000);
    const speed = Math.hypot(x - previous.x, y - previous.y) / dt;
    const strength = 0.1 + 0.9 * Math.min(1, speed / 480);
    const crossings = [];
    for (const chime of this.chimes) {
      const hit = chime.crossingAt(previous.x, previous.y, x, y, reducedMotion);
      if (hit) crossings.push({ chime, hit });
    }
    crossings.sort((a, b) => a.hit.t - b.hit.t);
    return crossings.filter(({ chime }) => {
      const last = this.recentHits.get(pointerId)?.get(chime);
      if (last && t - last.t < 65) return false;
      this.remember(pointerId, chime, t, 'sweep');
      return true;
    }).map(crossing => ({ ...crossing, strength, silent: false }));
  }

  release(pointerId, pointerType) {
    this.recentHits.delete(pointerId);
    if (pointerType !== 'mouse') this.positions.delete(pointerId);
  }

  leave(pointerId) {
    this.positions.delete(pointerId);
    this.recentHits.delete(pointerId);
  }

  clear() {
    this.positions.clear();
    this.recentHits.clear();
  }
}
