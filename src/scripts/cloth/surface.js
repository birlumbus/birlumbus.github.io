export function createClothSurface() {
  const innerU = 88, innerV = 64, padding = 12;
  const U = innerU + padding, V = innerV + padding, count = (U + 1) * (V + 1);
  const rest = new Float32Array(count * 3);
  const foldHeight = new Float32Array(count);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const tints = new Float32Array(count * 2);
  const uvs = new Float32Array(count * 2);
  const indices = [];
  for (let y = 0; y <= V; y++) {
    for (let x = 0; x <= U; x++) {
      // Retain every original vertex. A coarser continuation adds material
      // beyond the left and bottom, rather than scaling or pinning the sheet.
      const index = y * (U + 1) + x;
      const u = x < padding ? -2 + x / padding : (x - padding) / innerU * 2 - 1;
      const v = y < padding ? -2 + y / padding : (y - padding) / innerV * 2 - 1;
      const a = Math.max(-1, u), b = Math.max(-1, v), du = u - a, dv = v - b;
      const phase = b * 3 + a * 2, crease = a * 4.8 + b * 1.1;
      // Tangent continuation, including the mixed derivative at the corner,
      // joins the original surface smoothly without inventing extra creases.
      rest[index * 3] = a * (1.03 + 0.12 * Math.cos(b * 2)) + 0.14 * Math.sin(phase)
        + du * (1.03 + 0.12 * Math.cos(b * 2) + 0.28 * Math.cos(phase))
        + dv * (-0.24 * a * Math.sin(b * 2) + 0.42 * Math.cos(phase))
        + du * dv * (-0.24 * Math.sin(b * 2) - 0.84 * Math.sin(phase));
      rest[index * 3 + 1] = b * 0.87 + 0.12 * Math.cos(a * 2.6) - a * 0.14
        + du * (-0.312 * Math.sin(a * 2.6) - 0.14) + dv * 0.87;
      foldHeight[index] = 0.32 * Math.cos(crease) - du * 1.536 * Math.sin(crease)
        - dv * 0.352 * Math.sin(crease) - du * dv * 1.6896 * Math.cos(crease);
      rest[index * 3 + 2] = foldHeight[index] + 0.16 * Math.sin(b * 3) + 0.10 * a * b
        + du * 0.10 * b + dv * (0.48 * Math.cos(b * 3) + 0.10 * a) + du * dv * 0.10;
      uvs[index * 2] = (u + 1) * 0.5;
      uvs[index * 2 + 1] = (v + 1) * 0.5;
      if (x < U && y < V) indices.push(index, index + 1, index + U + 1, index + 1, index + U + 2, index + U + 1);
    }
  }
  positions.set(rest);
  return { U, V, count, rest, foldHeight, positions, normals, tints, uvs, indices: new Uint16Array(indices), uvBounds: [-0.5, -0.5, 1.5, 1.5] };
}

export function deformClothSurface(surface, current) {
  const { count, rest, foldHeight, positions, uvs } = surface;
  const displacement = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    const u = uvs[i * 2] * 2 - 1, v = uvs[i * 2 + 1] * 2 - 1;
    current.sample(u, v, displacement);
    const release = current.foldRelease(u, v);
    positions[i * 3] = rest[i * 3] + displacement[0] + u * 0.2 * release;
    positions[i * 3 + 1] = rest[i * 3 + 1] + displacement[1];
    positions[i * 3 + 2] = rest[i * 3 + 2] + displacement[2] - foldHeight[i] * release;
  }
}
