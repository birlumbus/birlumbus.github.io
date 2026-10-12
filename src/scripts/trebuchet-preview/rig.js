// Generated from birlumbus/trebuchet 9960b813c6ce8f0d55ff0710dced8d49a7b47823: lib/renderer.ts.
// Range scenery omitted; the trough is cropped to the frame for the hover preview.
import { positions } from "./physics.js";
function drawSourceRig(g, s, scale, ox, oy, ink = (color) => color) {
  const INK = "#293638", CHALK = "#D9DEC7", preview = null, pose = positions(s);
  const X = (x) => Math.round(ox + x * scale), Y = (y) => Math.round(oy - y * scale);
  const rectPx = (x, y, w, h2, color = INK) => {
    g.fillStyle = ink(color);
    g.fillRect(
      Math.round(x),
      Math.round(y),
      Math.max(1, Math.round(w)),
      Math.max(1, Math.round(h2))
    );
  };
  const line = (x1, y1, x2, y2, width = 1, color = INK) => {
    const dx = x2 - x1, dy = y2 - y1, steps = Math.max(Math.abs(dx), Math.abs(dy));
    g.fillStyle = ink(color);
    for (let n = 0; n <= steps; n++) {
      g.fillRect(
        Math.round(x1 + dx * n / Math.max(1, steps) - width / 2),
        Math.round(y1 + dy * n / Math.max(1, steps) - width / 2),
        Math.ceil(width),
        Math.ceil(width)
      );
    }
  };
  const worldLine = (a, b, w = 0.15, color = INK) => line(X(a.x), Y(a.y), X(b.x), Y(b.y), Math.max(1, w * scale), color);
  const worldRect = (x, y, w, h2, color = INK) => rectPx(X(x), Y(y + h2), w * scale, h2 * scale, color);
  const dot = (x, y, r, color = INK) => {
    r = Math.max(1, Math.round(r));
    for (let dy = -r; dy <= r; dy++) {
      const dx = Math.floor(Math.sqrt(r * r - dy * dy));
      rectPx(x - dx, y + dy, dx * 2 + 1, 1, color);
    }
  };
  const dashed = (a, b, color = CHALK) => {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const count = Math.max(1, Math.ceil(length * scale / 5));
    for (let i = 0; i < count; i += 2) {
      const t = i / count, u = Math.min(1, (i + 1) / count);
      worldLine(
        { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
        { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u },
        0.06,
        color
      );
    }
  };
  worldRect(-4.35, 0, 8.7, 0.14, "#725D41");
  const h = s.height, pivot = { x: 0, y: h };
  const beam = (a, b, w) => {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length;
    const at = (distance, across = 0) => ({
      x: a.x + (b.x - a.x) * distance / length + nx * across,
      y: a.y + (b.y - a.y) * distance / length + ny * across
    });
    worldLine(a, b, w + 1.5 / scale, INK);
    worldLine(a, b, w, "#594B38");
    if (scale <= 3) return;
    worldLine(at(0, w * 0.06), at(length, w * 0.06), w * 0.58, "#896B43");
    worldLine(at(0, w * 0.34), at(length, w * 0.34), w * 0.13, "#D0AC6F");
    worldLine(at(0, -w * 0.38), at(length, -w * 0.38), w * 0.12, "#3F3C30");
    for (let n = 0.45, i = 0; n < length - 0.2; n += 0.38, i++) {
      const across = (i * 7 % 11 / 11 - 0.5) * w * 0.6;
      worldLine(
        at(n, across),
        at(Math.min(length - 0.1, n + 0.15 + i % 3 * 0.12), across),
        0.025,
        i % 3 === 0 ? "#554732" : "#B18C56"
      );
      if (i % 9 === 4 && scale > 10) {
        const knot = at(n + 0.06, -w * 0.06);
        dot(X(knot.x), Y(knot.y), w * scale * 0.09, "#594B38");
      }
    }
    if (w > 0.3)
      for (const t of [0.08, 0.89]) {
        const distance = length * t;
        worldLine(at(distance, -w * 0.56), at(distance, w * 0.56), 0.21, INK);
        worldLine(
          at(distance - 0.065, -w * 0.5),
          at(distance - 0.065, w * 0.5),
          0.035,
          "#66766A"
        );
        for (const across of [-w * 0.28, w * 0.28]) {
          const bolt = at(distance, across);
          dot(X(bolt.x), Y(bolt.y), 1, "#ABB398");
        }
      }
  };
  worldLine({ x: -3.45, y: 0.3 }, { x: 0.25, y: h }, 0.5, "#354037");
  worldLine({ x: 3.95, y: 0.3 }, { x: 0.25, y: h }, 0.5, "#354037");
  beam({ x: -3.7, y: 0.3 }, pivot, 0.44);
  beam({ x: 3.7, y: 0.3 }, pivot, 0.44);
  beam({ x: -4.1, y: 0.3 }, { x: 4.1, y: 0.3 }, 0.5);
  beam({ x: -2.5, y: h * 0.36 }, { x: 2.5, y: h * 0.36 }, 0.23);
  beam({ x: -3.1, y: 0.45 }, { x: 1.3, y: h * 0.63 }, 0.2);
  beam({ x: 3.1, y: 0.45 }, { x: -1.3, y: h * 0.63 }, 0.2);
  for (const x of [-3.4, 3.4]) {
    worldRect(x - 0.38, 0.02, 0.76, 0.56, INK);
    worldRect(x - 0.3, 0.09, 0.6, 0.4, "#45524A");
    worldLine(
      { x: x - 0.3, y: 0.49 },
      { x: x + 0.3, y: 0.49 },
      0.04,
      "#7C8B78"
    );
    dot(X(x), Y(0.3), 0.13 * scale, "#B8B99A");
    for (const dx of [-0.23, 0.23]) dot(X(x + dx), Y(0.19), 1, "#87947E");
  }
  worldRect(0.95, 0.35, 0.16, 0.65, "#594B38");
  worldRect(1.65, 0.35, 0.16, 0.65, "#896B43");
  worldRect(1.05, 0.56, 0.65, 0.3, INK);
  for (let x = 1.15; x < 1.65; x += 0.1)
    worldRect(x, 0.59, 0.05, 0.24, "#A4AA8A");
  dot(X(1.76), Y(0.71), 0.23 * scale, INK);
  dot(X(1.76), Y(0.71), 0.13 * scale, "#6E7B68");
  worldLine({ x: 1.76, y: 0.71 }, { x: 2.15, y: 1.13 }, 0.09);
  worldLine({ x: 2.15, y: 1.13 }, { x: 2.33, y: 1.13 }, 0.13, "#A4AA8A");
  if (preview) {
    const q = preview.pose;
    for (const point of preview.path)
      rectPx(X(point.x), Y(point.y), 1, 1, "#d3ded6");
    dashed(q.hinge, q.tip);
    dashed(q.hinge, q.counterweight);
    dashed(q.tip, preview.projectile);
    const size2 = 0.9 * Math.cbrt(s.config.counterweight / 1e3);
    const corners = [
      { x: q.counterweight.x - size2 / 2, y: q.counterweight.y - size2 * 0.45 },
      { x: q.counterweight.x + size2 / 2, y: q.counterweight.y - size2 * 0.45 },
      { x: q.counterweight.x + size2 / 2, y: q.counterweight.y + size2 * 0.45 },
      { x: q.counterweight.x - size2 / 2, y: q.counterweight.y + size2 * 0.45 }
    ];
    corners.forEach((p2, i) => dashed(p2, corners[(i + 1) % 4]));
  }
  const p = pose;
  beam(p.hinge, p.tip, 0.38);
  dot(X(0), Y(h), Math.max(2, 0.29 * scale), INK);
  dot(X(-0.03), Y(h + 0.04), Math.max(1, 0.19 * scale), "#55665A");
  dot(X(0), Y(h), Math.max(1, 0.085 * scale), "#C8CEAF");
  worldLine(p.hinge, p.counterweight, 0.14, INK);
  const size = 0.9 * Math.cbrt(s.config.counterweight / 1e3);
  const boxX = p.counterweight.x - size / 2, boxY = p.counterweight.y - size * 0.45;
  worldRect(boxX - 0.04, boxY - 0.04, size + 0.08, size * 0.9 + 0.08);
  worldRect(boxX, boxY, size, size * 0.9, "#45534C");
  worldRect(boxX, boxY, size * 0.13, size * 0.9, "#5B6B5A");
  worldRect(boxX + size * 0.88, boxY, size * 0.12, size * 0.9, "#303E3A");
  for (const row of [0.2, 0.65]) {
    const y = boxY + size * row;
    worldLine({ x: boxX, y }, { x: boxX + size, y }, 0.07, INK);
    worldLine(
      { x: boxX, y: y + 0.05 },
      { x: boxX + size, y: y + 0.05 },
      0.035,
      "#80907A"
    );
    for (const column of [0.08, 0.48, 0.91])
      dot(X(boxX + size * column), Y(y), 1, "#ABB398");
  }
  worldLine(
    { x: boxX + size * 0.5, y: boxY },
    { x: boxX + size * 0.5, y: boxY + size * 0.9 },
    0.025,
    "#303E3A"
  );
  if (s.phase === "ready" || s.phase === "swing") {
    worldLine(p.tip, s.projectile, 0.07, "#D9DEC7");
    worldLine(
      { x: p.tip.x + 0.1, y: p.tip.y },
      s.projectile,
      0.045,
      "#A4AA8A"
    );
  } else {
    const empty = p.projectile;
    worldLine(p.tip, empty, 0.06, "#C8CCAD");
    worldLine(
      { x: p.tip.x + 0.12, y: p.tip.y },
      { x: empty.x + 0.17, y: empty.y + 0.1 },
      0.045,
      "#A4AA8A"
    );
  }
  if (s.phase !== "misfire" && s.phase !== "impact") {
    const pr = s.projectile;
    const radius = Math.max(1.7, s.radius * scale);
    dot(X(pr.x), Y(pr.y), radius + 1, INK);
    dot(
      X(pr.x),
      Y(pr.y),
      radius,
      s.config.material === "clay" ? "#9B7950" : s.config.material === "iron" ? "#596F70" : "#BBC5A9"
    );
    if (s.config.material === "clay") {
      rectPx(
        X(pr.x) - radius * 0.55,
        Y(pr.y) - radius - 1,
        radius * 1.1,
        2,
        INK
      );
      line(
        X(pr.x) - radius * 0.65,
        Y(pr.y),
        X(pr.x) + radius * 0.65,
        Y(pr.y),
        1,
        "#9eafa0"
      );
    } else if (s.config.material === "iron") {
      line(
        X(pr.x) - radius * 0.45,
        Y(pr.y) - radius * 0.4,
        X(pr.x) + radius * 0.2,
        Y(pr.y) - radius * 0.65,
        1,
        CHALK
      );
    } else {
      rectPx(
        X(pr.x) - radius * 0.45,
        Y(pr.y) - radius * 0.5,
        1,
        1,
        "#9eafa0"
      );
      rectPx(X(pr.x) + radius * 0.3, Y(pr.y) + radius * 0.2, 1, 1, "#718579");
    }
    if (s.phase === "flight") {
      const speed = Math.hypot(pr.vx, pr.vy);
      if (speed > 1)
        worldLine(
          {
            x: pr.x - pr.vx / speed * 0.8,
            y: pr.y - pr.vy / speed * 0.8
          },
          {
            x: pr.x - pr.vx / speed * 1.8,
            y: pr.y - pr.vy / speed * 1.8
          },
          0.045,
          "#789391"
        );
    }
  }
}
export {
  drawSourceRig
};
