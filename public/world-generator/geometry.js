// Surface attributes: position(3), gradient(3), height/water(4), region(2),
// map(2), discrete corner categories(3), barycentric weights(2).
export const STRIDE = 19;
const PI = Math.PI, TAU = PI * 2;

function expand(data, indices, size, classes) {
  let output = new Float32Array(indices.length * STRIDE * 2);
  let offset = 0;
  for (let start = 0; start < indices.length; start += size) {
    const ids = Array.from(indices.subarray(start, start + size));
    const regions = ids.map(id => data.plateIds[id] + 256 * data.crustType[id]);
    const lon = ids.map(id => Math.atan2(data.positions[id*3+1], data.positions[id*3]));
    const lat = ids.map(id => Math.asin(Math.max(-1, Math.min(1, data.positions[id*3+2]))));
    const polar = ids.map(id => Math.hypot(data.positions[id*3], data.positions[id*3+1]) < 1e-7);
    const anchor = lon[polar.findIndex(value => !value)] ?? 0;
    for (let i = 0; i < size; i++) {
      while (lon[i] - anchor > PI) lon[i] -= TAU;
      while (lon[i] - anchor < -PI) lon[i] += TAU;
    }
    const nonpolar = lon.filter((_, i) => !polar[i]);
    for (let i = 0; i < size; i++) if (polar[i]) lon[i] = nonpolar.reduce((a,b) => a+b, 0) / Math.max(1, nonpolar.length);
    const shifts = [0];
    if (Math.max(...lon) > PI) shifts.push(-TAU);
    if (Math.min(...lon) < -PI) shifts.push(TAU);
    let corners = ids.map((_, i) => ({i, longitude: lon[i]}));
    const pole = polar.indexOf(true);
    if (size === 3 && pole >= 0) {
      const a = (pole + 1) % 3, b = (pole + 2) % 3;
      // A pole occupies the entire top/bottom edge of an equirectangular face.
      // The additional triangle is degenerate on the globe.
      corners = [
        {i:pole,longitude:lon[a]}, {i:a,longitude:lon[a]}, {i:b,longitude:lon[b]},
        {i:pole,longitude:lon[a]}, {i:b,longitude:lon[b]}, {i:pole,longitude:lon[b]},
      ];
    }
    for (const shift of shifts) for (const {i, longitude} of corners) {
      if (offset + STRIDE > output.length) {
        const grown = new Float32Array(output.length * 2);
        grown.set(output); output = grown;
      }
      const id = ids[i];
      for (let j = 0; j < 3; j++) output[offset++] = data.positions[id*3+j];
      for (let j = 0; j < 3; j++) output[offset++] = data.gradient[id*3+j];
      output[offset++] = data.elevation[id];
      output[offset++] = data.heightAboveSea[id];
      output[offset++] = data.ocean[id];
      output[offset++] = data.basinCandidates[id];
      output[offset++] = classes ? classes[start+i] : data.plateIds[id];
      output[offset++] = data.crustType[id];
      output[offset++] = longitude + shift;
      output[offset++] = lat[i];
      output[offset++] = regions[0];
      output[offset++] = regions[1];
      output[offset++] = regions[2] ?? regions[1];
      output[offset++] = i === 0 ? 1 : 0;
      output[offset++] = i === 1 ? 1 : 0;
    }
  }
  return output.subarray(0, offset);
}

export const buildSurfaceGeometry = data => expand(data, data.faces, 3);
export const buildLineGeometry = (data, indices, classes) => expand(data, indices, 2, classes);
