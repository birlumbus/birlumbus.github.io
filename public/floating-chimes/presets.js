// Chord presets — each has a name, root metadata, an array of frequencies in Hz
// (5–6 notes), and a palette of RGB colors (one per note, normalized 0–1) used
// for hue-shifting.
//
// Voice presets — each has a name and a synth type used by AudioEngine.

export const CHORDS = [
  {
    name: 'Frost (Cmaj9)',
    shortName: 'Frost',
    root: 'C',
    suffix: 'maj9',
    // Cmaj9: C4 E4 G4 B4 D5 — cool, crystalline
    freqs: [261.63, 329.63, 392.00, 493.88, 587.33],
    colors: [
      [0.52, 0.88, 0.94],  // pale cyan
      [0.68, 0.88, 1.00],  // sky blue
      [0.88, 0.94, 1.00],  // near-white blue
      [0.60, 0.80, 0.96],  // soft mid-blue
      [0.82, 0.90, 0.98],  // ice lavender
    ],
  },
  {
    name: 'Forest (Dm11)',
    shortName: 'Forest',
    root: 'D',
    suffix: 'm11',
    // Dm11: D3 F3 A3 C4 G4 — earthy, deep
    freqs: [146.83, 174.61, 220.00, 261.63, 392.00],
    colors: [
      [0.12, 0.42, 0.30],  // deep pine
      [0.30, 0.66, 0.42],  // soft fern
      [0.58, 0.78, 0.44],  // gold-green
      [0.82, 0.88, 0.64],  // lichen cream
      [0.72, 0.58, 0.28],  // amber bark
    ],
  },
  {
    name: 'Aurora (F Lydian)',
    shortName: 'Aurora',
    root: 'F',
    suffix: ' Lydian',
    // F Lydian: F4 G4 A4 B4 C5 E5 — ethereal, violet/teal
    freqs: [349.23, 392.00, 440.00, 493.88, 523.25, 659.25],
    colors: [
      [0.52, 0.30, 0.88],  // soft violet
      [0.28, 0.78, 0.84],  // teal
      [0.80, 0.36, 0.82],  // magenta-violet
      [0.28, 0.88, 0.84],  // bright teal
      [0.92, 0.50, 0.72],  // rose
      [0.46, 0.28, 0.94],  // deep violet
    ],
  },
  {
    name: 'Ember (G pentatonic)',
    shortName: 'Ember',
    root: 'G',
    suffix: ' pentatonic',
    // G major pentatonic: G3 A3 B3 D4 E4 — warm, golden
    freqs: [196.00, 220.00, 246.94, 293.66, 329.63],
    colors: [
      [0.94, 0.68, 0.22],  // burnished gold
      [0.86, 0.48, 0.32],  // copper rose
      [0.98, 0.86, 0.56],  // warm cream
      [0.76, 0.68, 0.34],  // soft brass
      [0.30, 0.58, 0.56],  // teal shadow
    ],
  },
  {
    name: 'Dusk (Am9)',
    shortName: 'Dusk',
    root: 'A',
    suffix: 'm9',
    // Am9: A2 C3 E3 G3 B3 D4 — warm, muted violet and rust
    freqs: [110.00, 130.81, 164.81, 196.00, 246.94, 293.66],
    colors: [
      [0.34, 0.24, 0.48],  // smoky plum
      [0.56, 0.32, 0.48],  // dusty mauve
      [0.72, 0.42, 0.34],  // muted rust
      [0.82, 0.58, 0.42],  // warm clay
      [0.54, 0.42, 0.66],  // twilight lavender
      [0.28, 0.30, 0.48],  // deep dusk blue
    ],
  },
  {
    name: 'Mist (Esus2)',
    shortName: 'Mist',
    root: 'E',
    suffix: 'sus2',
    // Esus2(add7): E3 F#3 B3 D4 F#4 — suspended, pearly
    freqs: [164.81, 185.00, 246.94, 293.66, 369.99],
    colors: [
      [0.72, 0.82, 0.78],  // soft sage
      [0.84, 0.90, 0.88],  // pearl
      [0.66, 0.74, 0.88],  // pale blue
      [0.78, 0.70, 0.88],  // lavender haze
      [0.54, 0.70, 0.68],  // rain green
    ],
  },
  {
    name: 'Coral (Fmaj7#11)',
    shortName: 'Coral',
    root: 'F',
    suffix: 'maj7#11',
    // Fmaj7#11: F3 A3 B3 C4 E4 — bright, glassy warmth
    freqs: [174.61, 220.00, 246.94, 261.63, 329.63],
    colors: [
      [0.96, 0.58, 0.46],  // coral
      [0.98, 0.74, 0.54],  // peach
      [0.76, 0.44, 0.36],  // terracotta
      [0.60, 0.82, 0.72],  // sea-foam
      [0.98, 0.86, 0.64],  // sunlit cream
    ],
  },
  {
    name: 'Nocturne (C#min9)',
    shortName: 'Nocturne',
    root: 'C#',
    suffix: 'min9',
    // C#min9: C#3 E3 G#3 B3 D#4 — deep, nocturnal
    freqs: [138.59, 164.81, 207.65, 246.94, 311.13],
    colors: [
      [0.16, 0.18, 0.44],  // midnight indigo
      [0.20, 0.42, 0.52],  // deep teal
      [0.38, 0.24, 0.58],  // plum violet
      [0.54, 0.34, 0.70],  // muted orchid
      [0.30, 0.56, 0.72],  // moon blue
    ],
  },
  {
    name: 'Lotus (Db Lydian)',
    shortName: 'Lotus',
    root: 'Db',
    suffix: ' Lydian',
    // Db Lydian: Db4 Eb4 F4 G4 Ab4 C5 — luminous, lifted
    freqs: [277.18, 311.13, 349.23, 392.00, 415.30, 523.25],
    colors: [
      [0.92, 0.64, 0.78],  // lotus blush
      [0.98, 0.78, 0.58],  // soft gold
      [0.86, 0.88, 0.62],  // pale chartreuse
      [0.46, 0.76, 0.64],  // jade
      [0.70, 0.62, 0.90],  // lilac
      [0.96, 0.86, 0.90],  // petal white
    ],
  },
  {
    name: 'Tide (E Dorian)',
    shortName: 'Tide',
    root: 'E',
    suffix: ' Dorian',
    // E Dorian: E3 F#3 G3 B3 D4 — sea-green and open
    freqs: [164.81, 185.00, 196.00, 246.94, 293.66],
    colors: [
      [0.16, 0.48, 0.56],  // deep water
      [0.28, 0.72, 0.68],  // sea green
      [0.70, 0.90, 0.84],  // foam
      [0.34, 0.58, 0.86],  // clear blue
      [0.12, 0.32, 0.58],  // deep blue
    ],
  },
];

export const VOICES = [
  { name: 'Glass',  type: 'glass'  },
  { name: 'Mallet', type: 'mallet' },
  { name: 'Harp',   type: 'harp'   },
  { name: 'Pad',    type: 'pad'    },
];
