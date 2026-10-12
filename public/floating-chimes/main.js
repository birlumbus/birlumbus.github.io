// main.js — entry point for the suspended-glass chime instrument.
//
// Responsibilities:
//   • Creates 8 Chime instances in a balanced row.
//   • Runs the rAF animation loop (physics update + render).
//   • Handles taps and directional sweeps against each pane's current pose.
//   • Manages chord/voice preset state and builds the pad/key UI.
//   • Unlocks the AudioContext after the user dismisses the start overlay (click).

import { CHORDS, VOICES } from './presets.js';
import { AudioEngine } from './audio.js';
import { Chime } from './chime.js';
import { ChimeInteraction } from './interaction.js';

// ─── Layout ─────────────────────────────────────────────────────────────────
// Equal lengths and spacing let the color and resonance carry the scene.
const LAYOUT = Array.from({ length: 8 }, (_, i) => ({
  xPercent: (i + 0.5) * 100 / 8,
  yCenterPercent: 42,
  heightPercent: 80,
}));

const KEY_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_TO_SEMITONE = new Map([
  ['C', 0], ['B#', 0],
  ['C#', 1], ['Db', 1],
  ['D', 2],
  ['D#', 3], ['Eb', 3],
  ['E', 4], ['Fb', 4],
  ['E#', 5], ['F', 5],
  ['F#', 6], ['Gb', 6],
  ['G', 7],
  ['G#', 8], ['Ab', 8],
  ['A', 9],
  ['A#', 10], ['Bb', 10],
  ['B', 11], ['Cb', 11],
]);

// ─── State ───────────────────────────────────────────────────────────────────

const canvas         = document.getElementById('canvas');
const ctx2d          = canvas.getContext('2d');
const hint           = document.getElementById('hint');
const unlockOverlay  = document.getElementById('unlock-overlay');
const browserNote    = document.getElementById('browser-note');
const chordPadGrid   = document.getElementById('chord-pad-grid');
const keyPanelTitle  = document.getElementById('key-panel-title');
const keyRow         = document.getElementById('key-row');
const presets        = document.getElementById('presets');
const masthead       = document.querySelector('.masthead');
const unlockPrompt   = document.getElementById('unlock-prompt');
const audioStatus    = document.getElementById('audio-status');
const moodPanel      = document.getElementById('mood-panel');
const keyPanel       = document.getElementById('key-panel');
const moodToggle     = document.getElementById('mood-toggle');
const keyToggle      = document.getElementById('key-toggle');
const selectedMood   = document.getElementById('selected-mood');
const keySummary     = document.getElementById('selected-key');
const compactLayout  = window.matchMedia('(max-width: 900px), (max-height: 640px)');
const reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)');
let openPanel = null;

const DEFAULT_CHORD_IDX = CHORDS.findIndex(c => c.shortName === 'Mist');
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
const interaction = new ChimeInteraction(chimes);
const chordRootSemitones = CHORDS.map(chord => noteToSemitone(chord.root));
const chordKeySemitones = chordRootSemitones.slice();
const chordButtons = [];
const chordButtonNames = [];
const keyButtons = [];

if (browserNote && /\bFirefox\//.test(navigator.userAgent)) {
  browserNote.hidden = false;
  unlockOverlay.setAttribute('aria-label', 'Enable sound. Best in Chrome.');
}

// ─── Note/key helpers ───────────────────────────────────────────────────────

function noteToSemitone(noteName) {
  const semitone = NOTE_TO_SEMITONE.get(noteName);
  if (semitone === undefined) {
    throw new Error(`Unknown note name: ${noteName}`);
  }
  return semitone;
}

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

function nearestSemitoneDelta(fromSemitone, toSemitone) {
  let delta = toSemitone - fromSemitone;
  if (delta > 6) delta -= 12;
  if (delta < -6) delta += 12;
  return delta;
}

function chordLabel(index) {
  return `${KEY_NAMES[chordKeySemitones[index]]}${CHORDS[index].suffix}`;
}

function chordTransposeFactor(index) {
  const delta = nearestSemitoneDelta(chordRootSemitones[index], chordKeySemitones[index]);
  return 2 ** (delta / 12);
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
  const stageTop = masthead.getBoundingClientRect().bottom + 20;
  const stageBottom = presets.getBoundingClientRect().top - 22;
  const availableHeight = stageBottom - stageTop;
  // The lowest pane ends at 82% of the stage. Leave room for the sound
  // invitation on short screens as well as for the resting hint.
  const stageHeight = Math.max(50, Math.min(availableHeight, (availableHeight - 82) / 0.82));
  document.documentElement.style.setProperty('--stage-top', `${stageTop}px`);
  document.documentElement.style.setProperty('--stage-bottom', `${stageBottom}px`);
  chimes.forEach(c => c.resize(w, stageHeight, hitBuf, stageTop));
  interaction.clear();
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

  if (!reducedMotion.matches) globalPhase += delta * 0.42;

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

  // Light from the glass colors the room before the panes are drawn.
  for (const chime of chimes) {
    chime.renderLight(ctx2d, chord, globalPhase, crossfadeT, prevChord, reducedMotion.matches);
  }

  // Render all chimes
  for (const chime of chimes) {
    chime.render(ctx2d, chord, globalPhase, crossfadeT, prevChord, reducedMotion.matches);
  }

  requestAnimationFrame(frame);
}

// ─── Direct play ──────────────────────────────────────────────────────────
// Track each contact independently so separate fingers never create a phantom
// sweep between their positions. Mouse hover still plays as it did originally.
function pointerSample(event) {
  return {
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    x: event.clientX,
    y: event.clientY,
    t: event.timeStamp,
  };
}

function strikeChime(chime, hit, strength, { silent = false, gentle = false } = {}) {
  const chord = CHORDS[chordIdx];
  const voiceType = VOICES[voiceIdx].type;
  const note = chime.strike(hit.y, strength, hit.direction, { gentle });
  const freq = chord.freqs[note % chord.freqs.length] * chordTransposeFactor(chordIdx);
  if (!interacted) {
    interacted = true;
    hint.classList.add('hidden');
  }
  if (!silent) {
    // Await resume so the first tap after returning to the tab is audible.
    audio.unlock().then(() => {
      if (audio.isUnlocked) audio.playNote(freq, strength, voiceType);
    }).catch(() => {});
  }
}

function onPointerDown(event) {
  if (!audioReady || event.target !== canvas || event.button !== 0) return;
  const strike = interaction.press(pointerSample(event), reducedMotion.matches);
  if (strike) strikeChime(strike.chime, strike.hit, strike.strength, { silent: strike.silent, gentle: true });
}

function onPointerMove(event) {
  if (!audioReady || event.target !== canvas) {
    interaction.leave(event.pointerId);
    return;
  }
  const { clientX: x, clientY: y } = event;
  if (event.pointerType === 'mouse') {
    canvas.style.cursor = chimes.some(chime => chime.hitAt(x, y, 0, reducedMotion.matches)) ? 'pointer' : 'default';
  }
  for (const strike of interaction.move(pointerSample(event), reducedMotion.matches)) {
    strikeChime(strike.chime, strike.hit, strike.strength);
  }
}

function clearPointers() {
  interaction.clear();
}

// ─── Preset controls ─────────────────────────────────────────────────────────

function setOpenPanel(name, { restoreFocus = false } = {}) {
  const previousToggle = openPanel === 'mood' ? moodToggle : keyToggle;
  openPanel = compactLayout.matches ? name : null;
  moodPanel.hidden = compactLayout.matches && openPanel !== 'mood';
  keyPanel.hidden = compactLayout.matches && openPanel !== 'key';
  moodToggle.setAttribute('aria-expanded', String(openPanel === 'mood'));
  keyToggle.setAttribute('aria-expanded', String(openPanel === 'key'));
  if (restoreFocus && compactLayout.matches) previousToggle.focus({ preventScroll: true });
}

moodToggle.addEventListener('click', () => setOpenPanel(openPanel === 'mood' ? null : 'mood'));
keyToggle.addEventListener('click', () => setOpenPanel(openPanel === 'key' ? null : 'key'));
document.addEventListener('pointerdown', event => {
  if (openPanel && !presets.contains(event.target)) setOpenPanel(null);
});
compactLayout.addEventListener('change', () => {
  setOpenPanel(null);
  resize();
});

function buildChips(rowId, items, getIdx, setIdx) {
  const row = document.getElementById(rowId);
  row.textContent = '';
  items.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (i === getIdx() ? ' active' : '');
    btn.textContent = item.name;
    btn.setAttribute('aria-pressed', i === getIdx() ? 'true' : 'false');
    btn.addEventListener('click', () => {
      setIdx(i);
      updateChipRow(row, getIdx);
    });
    row.appendChild(btn);
  });
}

function updateChipRow(row, getIdx) {
  row.querySelectorAll('.chip').forEach((chip, i) => {
    const active = i === getIdx();
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function resetChimesForChord(index) {
  const len = CHORDS[index].freqs.length;
  chimes.forEach(c => {
    c.loadedNote = Math.floor(Math.random() * len);
    c.baseOffsetTarget = c.loadedNote;
  });
}

function selectChord(index) {
  const nextIndex = wrapIndex(index, CHORDS.length);
  if (nextIndex !== chordIdx) {
    prevChordIdx = chordIdx;
    chordIdx = nextIndex;
    crossfadeT = 0;
    resetChimesForChord(nextIndex);
  }

  updateChordPads();
  updateKeyPanel();

  if (openPanel === 'mood') {
    setOpenPanel(null, { restoreFocus: true });
  }
}

function buildChordPads() {
  chordPadGrid.textContent = '';
  CHORDS.forEach((chord, i) => {
    const btn = document.createElement('button');
    const name = document.createElement('span');
    const spectrum = document.createElement('span');

    btn.type = 'button';
    btn.className = 'chord-pad';
    btn.addEventListener('click', () => selectChord(i));

    name.className = 'chord-pad__name';

    const colors = chord.colors.map(color => color.map(c => Math.round(c * 255)));
    spectrum.className = 'mood-spectrum';
    spectrum.setAttribute('aria-hidden', 'true');
    colors.forEach((color, j) => {
      const segment = document.createElement('span');
      segment.style.setProperty('--segment-color', color.join(','));
      segment.style.left = j % 2 ? '68%' : '28%';
      segment.style.top = `${j * 100 / (colors.length - 1)}%`;
      spectrum.appendChild(segment);
    });
    const accent = colors[Math.min(1, colors.length - 1)];
    btn.style.setProperty('--pad-accent', accent.join(','));
    btn.append(spectrum, name);
    chordPadGrid.appendChild(btn);
    chordButtons[i] = btn;
    chordButtonNames[i] = name;
  });

  updateChordPads();
}

function updateChordPads() {
  CHORDS.forEach((chord, i) => {
    const btn = chordButtons[i];
    const active = i === chordIdx;
    chordButtonNames[i].textContent = chord.shortName;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.setAttribute('aria-label', chord.shortName);
  });
}

function selectKey(index, { focusKey = false, closePanel = true } = {}) {
  const nextIndex = wrapIndex(index, KEY_NAMES.length);
  chordKeySemitones[chordIdx] = nextIndex;
  updateKeyPanel();
  if (focusKey) {
    keyButtons[nextIndex].focus({ preventScroll: true });
  } else if (closePanel && openPanel === 'key') {
    setOpenPanel(null, { restoreFocus: true });
  }
}

function buildKeyButtons() {
  keyRow.textContent = '';
  KEY_NAMES.forEach((keyName, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key-button';
    btn.textContent = keyName;
    btn.addEventListener('click', () => selectKey(i));
    keyRow.appendChild(btn);
    keyButtons[i] = btn;
  });

  updateKeyPanel();
}

function updateKeyPanel() {
  const chord = CHORDS[chordIdx];
  const selectedKey = chordKeySemitones[chordIdx];
  const selectedLabel = chordLabel(chordIdx);

  keyPanelTitle.textContent = selectedLabel;
  selectedMood.textContent = chord.shortName;
  keySummary.textContent = KEY_NAMES[selectedKey];
  keyRow.setAttribute('aria-label', `${chord.shortName} key`);

  keyButtons.forEach((btn, i) => {
    const active = i === selectedKey;
    const label = `${KEY_NAMES[i]}${chord.suffix}`;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.setAttribute('aria-label', label);
    btn.tabIndex = active ? 0 : -1;
  });
}

function isTextEntryTarget(target) {
  const tagName = target?.tagName;
  return target?.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA';
}

function onKeyDown(event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (isTextEntryTarget(event.target)) return;
  if (event.key === 'Escape' && openPanel) {
    setOpenPanel(null, { restoreFocus: true });
    return;
  }
  // Read the key grid even when the phone's key chooser is closed.
  const columns = Number(getComputedStyle(keyRow).getPropertyValue('--key-columns'));
  let step;
  switch (event.key) {
    case 'ArrowLeft': step = -1; break;
    case 'ArrowRight': step = 1; break;
    case 'ArrowUp': step = -columns; break;
    case 'ArrowDown': step = columns; break;
    default: return;
  }
  event.preventDefault();
  selectKey(chordKeySemitones[chordIdx] + step, {
    focusKey: keyRow.contains(event.target),
    closePanel: false,
  });
}

buildChordPads();
buildKeyButtons();
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
  unlockPrompt.classList.add('unlock-prompt--dismissed');
  unlockOverlay.setAttribute('aria-hidden', 'true');
  unlockOverlay.disabled = true;
  document.body.classList.remove('is-locked');
  audioStatus.classList.add('is-on');
  audioStatus.replaceChildren();
  const statusDot = document.createElement('span');
  statusDot.setAttribute('aria-hidden', 'true');
  audioStatus.append(statusDot, 'Sound on');
  canvas.setAttribute('aria-label', 'Eight glass chimes. Tap or sweep across them to play.');
}

unlockOverlay.addEventListener('click', (e) => {
  e.preventDefault();
  dismissUnlockOverlay().catch(() => {});
});

window.addEventListener('resize', resize);
window.addEventListener('pointerdown', onPointerDown, { passive: true });
window.addEventListener('pointermove', onPointerMove, { passive: true });
window.addEventListener('keydown', onKeyDown);
window.addEventListener('pointerout', event => { if (!event.relatedTarget) interaction.leave(event.pointerId); });
window.addEventListener('pointercancel', event => interaction.leave(event.pointerId));
window.addEventListener('blur', clearPointers);
window.addEventListener('pointerup', event => interaction.release(event.pointerId, event.pointerType));

setOpenPanel(null);
hint.textContent = 'Tap or sweep across the glass';
const layoutObserver = new ResizeObserver(resize);
layoutObserver.observe(presets);
layoutObserver.observe(masthead);
document.fonts.ready.then(resize);
resize();
requestAnimationFrame(frame);
