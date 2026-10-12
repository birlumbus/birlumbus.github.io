// Generated from birlumbus/trebuchet 9960b813c6ce8f0d55ff0710dced8d49a7b47823: lib/siege-crew.ts

// ../../../Users/rhodri.thomas/work-personal/personal/trebuchet/lib/siege-crew.ts
var standingPose = {
  lean: 0,
  bob: 0,
  elbows: [
    [-3, -7],
    [3, -7]
  ],
  hands: [
    [-3, -5],
    [3, -5]
  ],
  knees: [
    [-1, -3],
    [1, -3]
  ],
  feet: [
    [-2, 0],
    [2, 0]
  ]
};
var poses = [
  {
    lean: 0,
    bob: 0,
    elbows: [
      [-4, -9],
      [4, -7]
    ],
    hands: [
      [-5, -12],
      [6, -8]
    ],
    knees: [
      [-2, -3],
      [2, -3]
    ],
    feet: [
      [-3, 0],
      [3, 0]
    ]
  },
  {
    lean: 1,
    bob: 1,
    elbows: [
      [-4, -8],
      [4, -10]
    ],
    hands: [
      [-6, -8],
      [5, -13]
    ],
    knees: [
      [-1, -3],
      [4, -4]
    ],
    feet: [
      [-2, 0],
      [6, -2]
    ]
  },
  {
    lean: 1,
    bob: 0,
    elbows: [
      [-4, -10],
      [4, -10]
    ],
    hands: [
      [-5, -13],
      [5, -13]
    ],
    knees: [
      [-2, -3],
      [3, -5]
    ],
    feet: [
      [-3, 0],
      [6, -4]
    ]
  },
  {
    lean: -1,
    bob: 1,
    elbows: [
      [-4, -10],
      [4, -6]
    ],
    hands: [
      [-5, -13],
      [6, -5]
    ],
    knees: [
      [-1, -3],
      [2, -3]
    ],
    feet: [
      [-2, 0],
      [3, 0]
    ]
  },
  {
    lean: 0,
    bob: 0,
    elbows: [
      [-4, -7],
      [4, -9]
    ],
    hands: [
      [-6, -8],
      [5, -12]
    ],
    knees: [
      [-2, -3],
      [2, -3]
    ],
    feet: [
      [-3, 0],
      [3, 0]
    ]
  },
  {
    lean: -1,
    bob: 1,
    elbows: [
      [-4, -10],
      [4, -8]
    ],
    hands: [
      [-5, -13],
      [6, -8]
    ],
    knees: [
      [-4, -4],
      [1, -3]
    ],
    feet: [
      [-6, -2],
      [2, 0]
    ]
  },
  {
    lean: -1,
    bob: 0,
    elbows: [
      [-4, -10],
      [4, -10]
    ],
    hands: [
      [-5, -13],
      [5, -13]
    ],
    knees: [
      [-3, -5],
      [2, -3]
    ],
    feet: [
      [-6, -4],
      [3, 0]
    ]
  },
  {
    lean: 1,
    bob: 1,
    elbows: [
      [-4, -6],
      [4, -10]
    ],
    hands: [
      [-6, -5],
      [5, -13]
    ],
    knees: [
      [-2, -3],
      [1, -3]
    ],
    feet: [
      [-3, 0],
      [2, 0]
    ]
  }
];
function danceFrame(time) {
  return Math.floor(time * 5) % poses.length;
}
function drawSiegeCrew(g, x, ground, unit = 1, time = null) {
  const frame = time === null ? 0 : danceFrame(time);
  const pose = time === null ? standingPose : poses[frame];
  const outline = "#344751", tunic = "#7DA6A8", tabard = "#B2A0BE";
  const skin = "#D5B28F", helmet = "#B9C9CB", shade = "#768F9A";
  const pixel = (px, py, w, h, color) => {
    g.fillStyle = color;
    g.fillRect(
      Math.round(x + px * unit),
      Math.round(ground + py * unit),
      Math.max(1, Math.round(w * unit)),
      Math.max(1, Math.round(h * unit))
    );
  };
  const line = (a, b, width, color) => {
    const length = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (let i = 0; i <= length; i++) {
      const t = i / Math.max(1, length);
      pixel(
        a[0] + (b[0] - a[0]) * t - width / 2,
        a[1] + (b[1] - a[1]) * t - width / 2,
        width,
        width,
        color
      );
    }
  };
  const lean = pose.lean, bob = pose.bob;
  for (let side = 0; side < 2; side++) {
    const hip = [(side ? 1 : -1) + lean, -5 + bob];
    line(hip, pose.knees[side], 2, outline);
    line(pose.knees[side], pose.feet[side], 2, outline);
    pixel(pose.feet[side][0] - 1, pose.feet[side][1], 4, 1, "#625647");
    const shoulder = [(side ? 2 : -2) + lean, -9 + bob];
    line(shoulder, pose.elbows[side], 2, outline);
    line(pose.elbows[side], pose.hands[side], 2, outline);
    line(shoulder, pose.elbows[side], 1, tunic);
    line(pose.elbows[side], pose.hands[side], 1, tunic);
    pixel(pose.hands[side][0], pose.hands[side][1], 2, 2, skin);
  }
  pixel(lean - 3, -10 + bob, 6, 6, outline);
  pixel(lean - 2, -9 + bob, 4, 4, tunic);
  pixel(lean - 1, -9 + bob, 2, 4, tabard);
  pixel(lean - 2, -5 + bob, 4, 1, outline);
  pixel(lean, -5 + bob, 1, 1, "#CAB491");
  pixel(lean - 3, -15 + bob, 6, 5, outline);
  pixel(lean - 2, -14 + bob, 4, 3, skin);
  pixel(lean - 1, -13 + bob, 1, 1, outline);
  pixel(lean + 1, -13 + bob, 1, 1, outline);
  pixel(lean, -11 + bob, 2, 1, outline);
  pixel(lean - 3, -16 + bob, 6, 2, helmet);
  pixel(lean - 2, -17 + bob, 4, 1, shade);
  pixel(lean - 3, -14 + bob, 1, 3, shade);
  pixel(lean + 2, -14 + bob, 1, 2, shade);
  pixel(lean + (frame < 4 ? -1 : 0), -19 + bob, 2, 2, tabard);
}
export {
  danceFrame,
  drawSiegeCrew
};
