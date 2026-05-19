// main.js — entry point for the ripple wind-chime demo.
//
// Responsibilities:
//   • Creates 8 Chime instances at the hand-tuned layout positions.
//   • Runs the rAF animation loop (physics update + render).
//   • Handles pointermove crossing detection (works for mouse and touch via
//     the Pointer Events API, which browsers normalize from touch).
//   • Manages chord/voice preset state and builds the chip strip UI.
//   • Unlocks the AudioContext after the user dismisses the start overlay (click).

import { CHORDS, VOICES } from './presets.js';
import { AudioEngine } from './audio.js';
import { Chime } from './chime.js';

// ─── Layout ─────────────────────────────────────────────────────────────────
// Hand-tuned positions from the plan. Values are {xPercent, yCenterPercent,
// heightPercent} — no two strands at the same height, deliberate irregularity.

const LAYOUT = [
  { xPercent:  8, yCenterPercent: 45, heightPercent: 45 },
  { xPercent: 19, yCenterPercent: 60, heightPercent: 35 },
  { xPercent: 28, yCenterPercent: 38, heightPercent: 55 },
  { xPercent: 42, yCenterPercent: 55, heightPercent: 40 },
  { xPercent: 53, yCenterPercent: 42, heightPercent: 50 },
  { xPercent: 65, yCenterPercent: 60, heightPercent: 38 },
  { xPercent: 76, yCenterPercent: 45, heightPercent: 52 },
  { xPercent: 89, yCenterPercent: 55, heightPercent: 42 },
];

// ─── State ───────────────────────────────────────────────────────────────────

const canvas         = document.getElementById('canvas');
const ctx2d          = canvas.getContext('2d');
const hint           = document.getElementById('hint');
const unlockOverlay  = document.getElementById('unlock-overlay');
const browserNote    = document.getElementById('browser-note');

const DEFAULT_CHORD_IDX = CHORDS.findIndex(c => c.name.startsWith('Aurora'));
let chordIdx  = DEFAULT_CHORD_IDX >= 0 ? DEFAULT_CHORD_IDX : 0;
let voiceIdx  = 0;
let prevChordIdx = chordIdx;
let crossfadeT   = 1.0; // 1 = fully on current chord; tweens from 0 on chord switch

let globalPhase = 0;
let lastTimestamp = null;
let interacted = false;
let audioReady = false;

const audio  = new AudioEngine();
const chimes = LAYOUT.map(cfg => new Chime(cfg));

if (browserNote && /\bFirefox\//.test(navigator.userAgent)) {
  browserNote.hidden = false;
  unlockOverlay.setAttribute('aria-label', 'Click to begin. Best in Chrome.');
}

// ─── Resize ──────────────────────────────────────────────────────────────────

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width  = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  // Hit-area buffer: larger on touch/coarse-pointer devices
  const hitBuf = window.matchMedia('(pointer: coarse)').matches ? 28 : 16;
  chimes.forEach(c => c.resize(w, h, hitBuf));
}

// ─── Adjacent-note helper ────────────────────────────────────────────────────

// Returns the loaded notes of the two nearest strands by x-position.
// Used to lightly discourage adjacent strands sharing the same note.
function adjacentNotes(idx) {
  const me = LAYOUT[idx].xPercent;
  return LAYOUT
    .map((l, i) => ({ i, dist: Math.abs(l.xPercent - me) }))
    .filter(({ i }) => i !== idx)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 2)
    .map(({ i }) => chimes[i].loadedNote);
}

// ─── Animation loop ──────────────────────────────────────────────────────────

function frame(timestamp) {
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const delta = Math.min(0.1, (timestamp - lastTimestamp) / 1000); // cap at 100 ms
  lastTimestamp = timestamp;

  globalPhase += delta * 0.42; // same rate as Swift animationPhase

  if (crossfadeT < 1) {
    crossfadeT = Math.min(1, crossfadeT + delta / 0.6); // 600 ms crossfade
  }

  const chord     = CHORDS[chordIdx];
  const prevChord = CHORDS[prevChordIdx];

  // Physics update for all chimes
  for (let i = 0; i < chimes.length; i++) {
    chimes[i].update(delta, chord.freqs.length, adjacentNotes(i));
  }

  // Clear with the DPR-aware transform reset each frame
  const dpr = window.devicePixelRatio || 1;
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Render all chimes
  for (const chime of chimes) {
    chime.render(ctx2d, chord, globalPhase, crossfadeT, prevChord);
  }

  requestAnimationFrame(frame);
}

// ─── Crossing detection ───────────────────────────────────────────────────────
//
// The cursor is treated as a moving line segment from the previous pointer
// position to the current one. We check if that segment crosses the chime's
// vertical centerline x, and if the crossing y is within the strand's height.
// This handles fast sweeps that skip from one side to the other between frames.

let prevPointer = null;

function onPointerMove(e) {
  if (!audioReady) return;

  const px = e.clientX, py = e.clientY;
  const now = e.timeStamp;

  // Re-activate if the browser suspended the context after a tab switch.
  audio.unlock().catch(() => {});

  if (!interacted) {
    interacted = true;
    hint.classList.add('hidden');
  }

  if (prevPointer !== null) {
    const { x: ox, y: oy, t: ot } = prevPointer;
    const dt = Math.max(0.001, (now - ot) / 1000);
    const dist = Math.hypot(px - ox, py - oy);
    const speed = dist / dt;

    // Velocity-modulated strike strength (0.1 floor so slow sweeps still ring)
    const strength = 0.1 + 0.9 * Math.min(1, speed / 480);

    const chord     = CHORDS[chordIdx];
    const voiceType = VOICES[voiceIdx].type;

    for (let i = 0; i < chimes.length; i++) {
      const chime = chimes[i];
      const crossY = crossingY(ox, oy, px, py, chime);
      if (crossY === null) continue;

      const note = chime.strike(crossY, strength);
      const freq = chord.freqs[note % chord.freqs.length];
      audio.playNote(freq, strength, voiceType);
    }
  }

  prevPointer = { x: px, y: py, t: now };
}

// Returns the y coordinate where the segment (ox,oy)→(cx,cy) crosses the
// chime's vertical centerline, or null if no valid crossing exists.
function crossingY(ox, oy, cx, cy, chime) {
  const dx = cx - ox;
  if (Math.abs(dx) < 0.5) return null; // nearly vertical motion: skip

  const prevLeft = ox < chime.x;
  const currLeft = cx < chime.x;

  if (prevLeft === currLeft) {
    // Both on the same side: only trigger if the segment passes all the way
    // through the strand (prev outside left edge, curr outside right edge or vice versa)
    const minX = ox < cx ? ox : cx;
    const maxX = ox < cx ? cx : ox;
    if (minX <= chime.hitLeft && maxX >= chime.hitRight) {
      // Full pass-through: compute y at the centerline
      const t = (chime.x - ox) / dx;
      const y = oy + (cy - oy) * t;
      if (y < chime.top || y > chime.top + chime.height) return null;
      return y;
    }
    return null;
  }

  // Centerline crossing: prev and curr are on opposite sides
  const t = (chime.x - ox) / dx;
  if (t < 0 || t > 1) return null;
  const y = oy + (cy - oy) * t;
  if (y < chime.top || y > chime.top + chime.height) return null;
  return y;
}

// ─── Preset chip strip ────────────────────────────────────────────────────────

function buildChips(rowId, items, getIdx, setIdx) {
  const row = document.getElementById(rowId);
  items.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (i === getIdx() ? ' active' : '');
    btn.textContent = item.name;
    btn.addEventListener('click', () => {
      setIdx(i);
      row.querySelectorAll('.chip').forEach((c, j) =>
        c.classList.toggle('active', j === i)
      );
    });
    row.appendChild(btn);
  });
}

buildChips('chord-row', CHORDS, () => chordIdx, (i) => {
  if (i === chordIdx) return;
  prevChordIdx = chordIdx;
  chordIdx = i;
  crossfadeT = 0;
  // Reset each chime's loaded note to a random one in the new chord
  const len = CHORDS[i].freqs.length;
  chimes.forEach(c => {
    c.loadedNote = Math.floor(Math.random() * len);
    c.baseOffsetTarget = c.loadedNote;
  });
});

buildChips('voice-row', VOICES, () => voiceIdx, (i) => { voiceIdx = i; });

// ─── Boot ─────────────────────────────────────────────────────────────────────

// Initialize loaded notes with random spread across the chord
chimes.forEach(c => {
  c.loadedNote = Math.floor(Math.random() * CHORDS[chordIdx].freqs.length);
  c.baseOffset = c.loadedNote;
  c.baseOffsetTarget = c.loadedNote;
});

async function dismissUnlockOverlay() {
  if (audioReady) return;
  await audio.unlock();
  if (!audio.isUnlocked) return;

  audioReady = true;
  unlockOverlay.classList.add('unlock-overlay--dismissed');
  unlockOverlay.setAttribute('aria-hidden', 'true');
}

unlockOverlay.addEventListener('click', (e) => {
  e.preventDefault();
  dismissUnlockOverlay().catch(() => {});
});

window.addEventListener('resize', resize);
window.addEventListener('pointermove', onPointerMove, { passive: true });

resize();
canvas.classList.add('loaded');
requestAnimationFrame(frame);
