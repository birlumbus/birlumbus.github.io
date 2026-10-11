import meshUrl from '../assets/world-preview.bin?url';

// Seed 42, sampled from the project's checked-in starter terrain. The packed
// mesh contains 10,242 normalized int16 xyz positions, int16 heights in metres,
// then 61,440 uint16 face indices, all little-endian.
const VERTICES = 10242;
const INDICES = 61440;

export async function createWorldPreview(canvas) {
  const response = await fetch(meshUrl);
  if (!response.ok) throw new Error(`World terrain: ${response.status}`);
  const data = await response.arrayBuffer();
  if (data.byteLength !== 204816) throw new Error('Incomplete world terrain');
  return new PearlGlobe(canvas, data);
}

class PearlGlobe {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.data = data;
    this.gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!this.gl) throw new Error('WebGL 2 unavailable');
    this.yaw = -1.9973636080900783;
    this.pitch = .42206209176072806;
    this.frame = 0;
    this.lastTime = null;
    this.rotating = false;
    this.setup();
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = null;
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.setup();
      this.draw();
      if (this.rotating) this.start();
    });
  }

  setup() {
    const gl = this.gl;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, `#version 300 es
      precision highp float;
      in vec3 a_position;
      in float a_height;
      uniform vec2 u_turn;
      out vec3 v_normal;
      out float v_height;
      void main() {
        vec3 p = normalize(a_position);
        vec3 world = vec3(p.y, p.z, p.x);
        float cy = cos(u_turn.x), sy = sin(u_turn.x), cp = cos(u_turn.y), sp = sin(u_turn.y);
        vec3 rotated = vec3(cy*world.x + sy*world.z, world.y, -sy*world.x + cy*world.z);
        rotated = vec3(rotated.x, cp*rotated.y - sp*rotated.z, sp*rotated.y + cp*rotated.z);
        v_normal = rotated;
        v_height = a_height;
        float relief = 1. + max(0., a_height) * .000004;
        float perspective = 1. / (1. - rotated.z * .085);
        gl_Position = vec4(rotated.xy * relief * .765 * perspective, -rotated.z * .5, 1.);
      }
    `);
    const fragment = compile(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float;
      in vec3 v_normal;
      in float v_height;
      out vec4 colour;
      void main() {
        vec3 n = normalize(v_normal);
        float coast = smoothstep(-30., 50., v_height);
        float elevation = clamp(v_height / 4100., 0., 1.);
        vec3 low = vec3(.70,.79,.81);
        vec3 mid = vec3(.795,.75,.86);
        vec3 high = vec3(.95,.91,.935);
        vec3 land = mix(low, mid, smoothstep(.08,.55,elevation));
        land = mix(land, high, smoothstep(.58,1.,elevation));
        vec3 light = normalize(vec3(-.5,.7,1.));
        float diffuse = max(0., dot(n,light));
        float contours = v_height / 360.;
        float d = min(fract(contours),1.-fract(contours));
        float line = 1.-smoothstep(0.,max(.025,fwidth(contours)*.85),d);
        land *= (.85+.16*diffuse)*(1.-line*.075);
        land += vec3(.09,.10,.08)*exp(-max(0.,v_height)/110.);
        float depth = clamp(-v_height/5500.,0.,1.);
        vec3 water = mix(vec3(.855,.882,.937)*1.025,vec3(.855,.882,.937)*.94,depth);
        water *= .86+.15*diffuse;
        vec3 c = mix(water,land,coast);
        float highlight = pow(max(0.,dot(n,normalize(light+vec3(0.,0.,1.)))),22.);
        float rim = pow(1.-abs(n.z),3.);
        c += .10*(vec3(1.)*highlight+high*rim*.18);
        colour = vec4(c,1.);
      }
    `);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    this.program = program;
    this.turn = gl.getUniformLocation(program, 'u_turn');
    gl.useProgram(program);
    const bind = (name, data, size, normalized) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.SHORT, normalized, 0, 0);
    };
    bind('a_position', new Int16Array(this.data, 0, VERTICES * 3), 3, true);
    bind('a_height', new Int16Array(this.data, VERTICES * 6, VERTICES), 1, false);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data, VERTICES * 8, INDICES), gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  draw() {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniform2f(this.turn, this.yaw, this.pitch);
    gl.drawElements(gl.TRIANGLES, INDICES, gl.UNSIGNED_SHORT, 0);
  }

  start() {
    this.rotating = true;
    if (this.frame || document.hidden || this.gl.isContextLost()) return;
    this.frame = requestAnimationFrame(time => this.animate(time));
  }

  animate(time) {
    this.frame = 0;
    if (!this.rotating || document.hidden || this.gl.isContextLost()) { this.lastTime = null; return; }
    if (this.lastTime !== null) this.yaw += Math.min(time - this.lastTime, 100) * 5 * Math.PI / 180 / 1000;
    this.lastTime = time;
    this.draw();
    this.frame = requestAnimationFrame(next => this.animate(next));
  }

  pause() {
    this.rotating = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.lastTime = null;
  }
}
