import { ClothCurrent } from './current.js';

const canvas = document.querySelector('#sculpture');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

function createSculpture(gl) {
  const current = new ClothCurrent({ opening: !motion.matches });
  let width = 1, height = 1, ratio = 1, frame = 0, lastTime = 0;
  let center = [0, 0], scale = [1, 1];
  let pending = null, geometryDirty = true;

  const vertex = `
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV; attribute vec2 aTint;
    uniform vec2 uResolution; uniform vec2 uScale; uniform vec2 uCenter;
    varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUV; varying vec2 vTint;
    void main() {
      float ry = -.43, rx = .16;
      mat3 yrot = mat3(cos(ry),0.,-sin(ry), 0.,1.,0., sin(ry),0.,cos(ry));
      mat3 xrot = mat3(1.,0.,0., 0.,cos(rx),sin(rx), 0.,-sin(rx),cos(rx));
      mat3 rotation = xrot*yrot;
      vec3 p = rotation*aPosition;
      float perspective = 3.8/(3.8-p.z);
      vec2 screen = p.xy*uScale*perspective+uCenter;
      gl_Position = vec4(screen/uResolution*2.-1., -p.z*.2, 1.);
      vNormal = rotation*aNormal; vPosition = p; vUV = aUV; vTint = aTint;
    }`;
  const atmosphere = `
    float noise(vec2 p) { return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    vec3 atmosphere(vec2 uv) {
      vec2 q = uv-vec2(.55,.52);
      vec3 base = vec3(.921,.942,.946);
      float mist = exp(-dot(q,q)*3.5);
      base = mix(base,vec3(.78,.86,.89),mist*.34);
      float cool = exp(-dot(uv-vec2(.82,.73),uv-vec2(.82,.73))*5.);
      float green = exp(-dot(uv-vec2(.28,.18),uv-vec2(.28,.18))*7.);
      base += vec3(.017,-.006,.023)*cool;
      base += vec3(-.014,.018,.002)*green;
      return base;
    }`;
  const fragment = `
    precision highp float;
    uniform vec2 uResolution;
    varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUV; varying vec2 vTint;
    ${atmosphere}
    void main() {
      vec3 n = normalize(vNormal); if(!gl_FrontFacing) n=-n;
      vec2 uv = gl_FragCoord.xy/uResolution;
      float facing = abs(n.z);
      float fresnel = pow(1.-facing,2.1);
      vec3 transmitted = atmosphere(uv+n.xy*.12);
      transmitted *= vec3(.968,.989,.998);
      vec3 r = reflect(vec3(0.,0.,-1.),n);
      float softbox = pow(max(0.,dot(r,normalize(vec3(-.6,.9,1.)))),6.);
      float darkReflection = pow(max(0.,dot(r,normalize(vec3(.8,-.3,.25)))),3.);
      vec3 pigment = mix(vec3(.168,.293,.346),vec3(.81,.91,.95),facing*.75);
      vec3 col = mix(transmitted,pigment,.16+fresnel*.45);
      col -= vec3(.19,.15,.11)*darkReflection;
      col += vec3(.86,.97,1.)*softbox*.20;
      col += vec3(.63,.82,.88)*fresnel*.23;
      float spectral = sin(vPosition.x*2.4+vPosition.y*3.+n.x*2.)*.5+.5;
      col += mix(vec3(.22,.11,.04),vec3(.02,.11,.23),spectral)*(.07+fresnel*.3);
      col += vec3(.025,-.006,.006)*sin(n.x*6.+n.y*3.);
      col -= vec3(.03,.035,.04)*pow(1.-facing,4.);
      // Fold angles and the passing current reveal a brighter iridescent spectrum.
      float hue = sin(n.x*3.4-n.y*2.3+vUV.x*2.8+vTint.x*2.6)*.5+.5;
      vec3 sheen = mix(vec3(.08,.86,.76),vec3(.62,.32,.94),smoothstep(0.,.62,hue));
      sheen = mix(sheen,vec3(1.,.36,.60),smoothstep(.55,1.,hue));
      sheen = mix(sheen,vec3(1.,.76,.36),smoothstep(.35,.9,n.y)*.45);
      float crease = smoothstep(.12,.75,vTint.y);
      // Carry color through flatter material and ease out continuously. Strong
      // curvature-based contrast made stretched folds look like pale islands.
      float colorPresence = 1.-exp(-vTint.x*3.2);
      float wash = colorPresence*(.50+crease*.14+fresnel*.06);
      col = mix(col,sheen,clamp(wash,0.,.72));
      float edge = min(min(vUV.y,1.-vUV.y),min(vUV.x,1.-vUV.x));
      col += vec3(.17,.2,.22)*exp(-edge*360.)*(.3+fresnel*.7);
      col += (noise(gl_FragCoord.xy)-.5)*.006;
      gl_FragColor = vec4(col,1.);
    }`;
  const bgVertex = `attribute vec2 aPosition; void main(){gl_Position=vec4(aPosition,0.,1.);}`;
  const bgFragment = `precision highp float; uniform vec2 uResolution; ${atmosphere}
    void main(){vec3 c=atmosphere(gl_FragCoord.xy/uResolution);c+=(noise(gl_FragCoord.xy)-.5)*.008;gl_FragColor=vec4(c,1.);}`;

  function program(v, f) {
    const p = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(p, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  const sculptureProgram = program(vertex, fragment);
  const backgroundProgram = program(bgVertex, bgFragment);
  const uniforms = Object.fromEntries(['uResolution', 'uCenter', 'uScale'].map(name => [name, gl.getUniformLocation(sculptureProgram, name)]));
  const bgResolution = gl.getUniformLocation(backgroundProgram, 'uResolution');

  const U = 88, V = 64, count = (U + 1) * (V + 1);
  const rest = new Float32Array(count * 3);
  const foldHeight = new Float32Array(count);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const tints = new Float32Array(count * 2);
  const uvs = new Float32Array(count * 2);
  const indices = [];
  for (let y = 0; y <= V; y++) {
    for (let x = 0; x <= U; x++) {
      const index = y * (U + 1) + x, u = x / U * 2 - 1, v = y / V * 2 - 1;
      rest[index * 3] = u * (1.03 + .12 * Math.cos(v * 2)) + .14 * Math.sin(v * 3 + u * 2);
      rest[index * 3 + 1] = v * .87 + .12 * Math.cos(u * 2.6) - u * .14;
      foldHeight[index] = .32 * Math.cos(u * 4.8 + v * 1.1);
      rest[index * 3 + 2] = foldHeight[index] + .16 * Math.sin(v * 3) + .10 * u * v;
      uvs[index * 2] = x / U;
      uvs[index * 2 + 1] = y / V;
      if (x < U && y < V) indices.push(index, index + 1, index + U + 1, index + 1, index + U + 2, index + U + 1);
    }
  }
  positions.set(rest);
  const positionBuffer = gl.createBuffer(), normalBuffer = gl.createBuffer(), tintBuffer = gl.createBuffer();
  const uvBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer(), backgroundBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions.byteLength, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals.byteLength, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, tintBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, tints.byteLength, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, backgroundBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

  function attribute(p, name, buffer, size) {
    const location = gl.getAttribLocation(p, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }
  const displacement = [0, 0, 0];
  function geometry() {
    for (let i = 0; i < count; i++) {
      const u = uvs[i * 2] * 2 - 1, v = uvs[i * 2 + 1] * 2 - 1;
      current.sample(u, v, displacement);
      const release = current.foldRelease(u, v);
      positions[i * 3] = rest[i * 3] + displacement[0] + u * .2 * release;
      positions[i * 3 + 1] = rest[i * 3 + 1] + displacement[1];
      positions[i * 3 + 2] = rest[i * 3 + 2] + displacement[2] - foldHeight[i] * release;
    }
    // Derive lighting from the moving surface itself; highlights travel with folds.
    for (let y = 0; y <= V; y++) {
      for (let x = 0; x <= U; x++) {
        const i = (y * (U + 1) + x) * 3;
        const l = x > 0 ? i - 3 : i, r = x < U ? i + 3 : i;
        const b = y > 0 ? i - (U + 1) * 3 : i, t = y < V ? i + (U + 1) * 3 : i;
        const ax = positions[r] - positions[l], ay = positions[r + 1] - positions[l + 1], az = positions[r + 2] - positions[l + 2];
        const bx = positions[t] - positions[b], by = positions[t + 1] - positions[b + 1], bz = positions[t + 2] - positions[b + 2];
        normals[i] = ay * bz - az * by;
        normals[i + 1] = az * bx - ax * bz;
        normals[i + 2] = ax * by - ay * bx;
        const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
        normals[i] /= length; normals[i + 1] /= length; normals[i + 2] /= length;
      }
    }
    for (let y = 0; y <= V; y++) {
      for (let x = 0; x <= U; x++) {
        const node = y * (U + 1) + x, i = node * 3;
        const l = x > 0 ? i - 3 : i, r = x < U ? i + 3 : i;
        const b = y > 0 ? i - (U + 1) * 3 : i, t = y < V ? i + (U + 1) * 3 : i;
        const bendX = Math.hypot(normals[r] - normals[l], normals[r + 1] - normals[l + 1], normals[r + 2] - normals[l + 2]);
        const bendY = Math.hypot(normals[t] - normals[b], normals[t + 1] - normals[b + 1], normals[t + 2] - normals[b + 2]);
        tints[node * 2] = current.colorActivity(uvs[node * 2] * 2 - 1, uvs[node * 2 + 1] * 2 - 1);
        tints[node * 2 + 1] = Math.min(1, (bendX + bendY) * 4);
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals);
    gl.bindBuffer(gl.ARRAY_BUFFER, tintBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, tints);
    geometryDirty = false;
  }

  function wake() {
    if (!frame && !document.hidden && !gl.isContextLost()) frame = requestAnimationFrame(render);
  }
  const cosY = Math.cos(-.43), sinY = Math.sin(-.43);
  const cosX = Math.cos(.16), sinX = Math.sin(.16);
  function surfaceCoordinates(x, y) {
    const screenX = x * ratio, screenY = (canvas.clientHeight - y) * ratio;
    let closest = 0, distance = Infinity;
    // Follow the projected folds themselves, including their rotation and
    // perspective, so the visible material beneath the pointer receives the push.
    for (let i = 0; i < count; i++) {
      const px = positions[i * 3], py = positions[i * 3 + 1], pz = positions[i * 3 + 2];
      const rx = px * cosY + pz * sinY;
      const rz = -px * sinY + pz * cosY;
      const ry = py * cosX - rz * sinX;
      const depth = py * sinX + rz * cosX;
      const perspective = 3.8 / (3.8 - depth);
      const dx = rx * scale[0] * perspective + center[0] - screenX;
      const dy = ry * scale[1] * perspective + center[1] - screenY;
      const squared = dx * dx + dy * dy;
      if (squared < distance) { distance = squared; closest = i; }
    }
    return [uvs[closest * 2] * 2 - 1, uvs[closest * 2 + 1] * 2 - 1];
  }
  function render(time) {
    frame = 0;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .04) : 1 / 60;
    lastTime = time;
    if (pending && !motion.matches) {
      const [u, v] = surfaceCoordinates(pending.x, pending.y);
      current.stir(u, v, pending.dx * ratio / scale[0], -pending.dy * ratio / scale[1]);
      pending = null;
    }
    if (current.active) {
      current.advance(dt);
      geometryDirty = true;
    }
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(backgroundProgram);
    gl.uniform2f(bgResolution, width, height);
    attribute(backgroundProgram, 'aPosition', backgroundBuffer, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(sculptureProgram);
    gl.uniform2f(uniforms.uResolution, width, height);
    gl.uniform2fv(uniforms.uCenter, center);
    gl.uniform2fv(uniforms.uScale, scale);
    if (geometryDirty) geometry();
    attribute(sculptureProgram, 'aPosition', positionBuffer, 3);
    attribute(sculptureProgram, 'aNormal', normalBuffer, 3);
    attribute(sculptureProgram, 'aUV', uvBuffer, 2);
    attribute(sculptureProgram, 'aTint', tintBuffer, 2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    if (current.active && !motion.matches) wake();
    else lastTime = 0;
  }
  function resize() {
    ratio = Math.min(devicePixelRatio || 1, 1.6);
    width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    const mobile = canvas.clientWidth <= 700;
    center = [width * (mobile ? .38 : .56), height * .51];
    scale = [width * (mobile ? .78 : .68), height * .72];
    wake();
  }
  function stir(x, y, dx, dy) {
    if (motion.matches || document.hidden) return;
    pending = { x, y, dx: (pending?.dx || 0) + dx, dy: (pending?.dy || 0) + dy };
    wake();
  }
  function pause() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; pending = null; }
  function reset() { pause(); current.reset(); geometryDirty = true; wake(); }
  resize();
  return { resize, stir, wake, pause, reset };
}

let renderer = null, pointer = null;
const gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: true });
function initialize() {
  if (!gl) return;
  try {
    renderer = createSculpture(gl);
    canvas.style.visibility = '';
  } catch (error) {
    canvas.style.visibility = 'hidden';
    console.warn('The sculpture could not render; the portfolio is still available.', error);
  }
}
initialize();
window.addEventListener('pointermove', event => {
  if (motion.matches || !renderer) return;
  if (pointer && pointer.id === event.pointerId) renderer.stir(event.clientX, event.clientY, event.clientX - pointer.x, event.clientY - pointer.y);
  pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
}, { passive: true });
window.addEventListener('pointerdown', event => {
  pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
  if (event.pointerType === 'touch' && !event.target.closest('button, a')) renderer?.stir(event.clientX, event.clientY, 12, -8);
}, { passive: true });
window.addEventListener('pointerup', event => { if (event.pointerType === 'touch') pointer = null; }, { passive: true });
window.addEventListener('pointercancel', () => { pointer = null; }, { passive: true });
document.addEventListener('pointerleave', () => { pointer = null; });
window.addEventListener('wheel', event => {
  renderer?.stir(event.clientX, event.clientY, event.deltaX * .08, Math.max(-24, Math.min(24, event.deltaY * .08)));
}, { passive: true });
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const delta = window.scrollY - scrollY;
  scrollY = window.scrollY;
  renderer?.stir(innerWidth * .5, innerHeight * .5, 0, Math.max(-12, Math.min(12, delta * .12)));
}, { passive: true });
window.addEventListener('resize', () => { pointer = null; renderer?.resize(); });
motion.addEventListener('change', () => { pointer = null; renderer?.reset(); });
document.addEventListener('visibilitychange', () => {
  pointer = null;
  if (document.hidden) renderer?.pause();
  else renderer?.wake();
});
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); renderer?.pause(); });
canvas.addEventListener('webglcontextrestored', initialize);
