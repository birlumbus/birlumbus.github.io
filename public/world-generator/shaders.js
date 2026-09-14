export const vertex = `#version 300 es
precision highp float;
precision highp int;
in vec3 a_position;
in vec3 a_gradient;
in vec4 a_surface;
in vec2 a_region;
in vec2 a_map;
in vec3 a_categories;
in vec2 a_barycentric;
uniform mat4 u_mvp;
uniform mat4 u_rotation;
uniform vec4 u_mapTransform;
uniform float u_radius;
uniform float u_exaggeration;
uniform bool u_flat;
uniform int u_lines;
out vec3 v_position;
out vec3 v_gradient;
out vec4 v_surface;
out vec2 v_region;
out vec2 v_map;
flat out vec3 v_categories;
out vec2 v_barycentric;
void main() {
  v_position = a_position;
  v_gradient = a_gradient;
  v_surface = a_surface;
  v_region = a_region;
  v_map = a_map;
  v_categories = a_categories;
  v_barycentric = a_barycentric;
  float radial = 1.0 + a_surface.x * u_exaggeration / u_radius;
  vec3 world = vec3(a_position.y, a_position.z, a_position.x) * radial;
  if (u_flat) gl_Position = vec4(a_map * u_mapTransform.xy + u_mapTransform.zw, u_lines > 0 ? -.01 : 0., 1.);
  else gl_Position = u_mvp * vec4(world * (u_lines > 0 ? 1.00025 : 1.), 1.);
}`;

export const fragment = `#version 300 es
precision highp float;
precision highp int;
in vec3 v_position;
in vec3 v_gradient;
in vec4 v_surface;
in vec2 v_region;
in vec2 v_map;
flat in vec3 v_categories;
in vec2 v_barycentric;
uniform mat4 u_rotation;
uniform float u_radius;
uniform float u_exaggeration;
uniform bool u_flat;
uniform bool u_contours;
uniform int u_mode;
uniform int u_lines;
out vec4 colour;
vec3 blend(vec3 a, vec3 b, float t) { return mix(a,b,clamp(t,0.,1.)); }
vec3 ocean(float depth) {
  return depth < 1500. ? blend(vec3(124,202,236),vec3(35,130,211),depth/1500.)/255.
    : blend(vec3(35,130,211),vec3(7,26,100),(depth-1500.)/7500.)/255.;
}
vec3 land(float height) {
  if (height < 1000.) return blend(vec3(55,151,77),vec3(153,183,65),height/1000.)/255.;
  if (height < 3500.) return blend(vec3(153,183,65),vec3(177,126,64),(height-1000.)/2500.)/255.;
  return blend(vec3(177,126,64),vec3(104,55,36),(height-3500.)/5500.)/255.;
}
vec3 plate(float n) { return .3+.65*vec3(fract(sin(n*12.9898)*43758.5453),fract(sin(n*78.233+2.)*43758.5453),fract(sin(n*39.425+4.)*43758.5453)); }
void main() {
  if (u_flat && abs(v_map.x)>3.141593) discard;
  if (u_lines > 0) {
    vec3 c = vec3(.68,.85,.89);
    if (u_lines == 2) {
      float n = v_region.x;
      c = n<.5 ? vec3(.6,.65,.7) : n<1.5 ? vec3(.96,.32,.24) : n<2.5 ? vec3(.18,.78,.91) : n<3.5 ? vec3(.98,.78,.22) : vec3(.87,.40,.95);
    }
    colour=vec4(c,u_lines==1?.28:.95); return;
  }
  float h = v_surface.y;
  bool basin = v_surface.w > v_surface.z && h < 0.;
  bool connectedOcean = v_surface.z > 0. && !basin && h < 0.;
  vec3 c = connectedOcean ? ocean(-h) : land(h);
  if (basin) c = vec3(144,65,177)/255.;
  if (u_mode==1) c=basin?vec3(.56,.25,.69):(connectedOcean?vec3(.11,.41,.74):vec3(.57,.67,.29));
  if (u_mode==2) c=v_surface.x<0.?ocean(-v_surface.x):land(v_surface.x);
  vec3 weights = vec3(v_barycentric,1.-v_barycentric.x-v_barycentric.y);
  float category = weights.x>=weights.y && weights.x>=weights.z ? v_categories.x : weights.y>=weights.z ? v_categories.y : v_categories.z;
  if (u_mode==3) c=plate(mod(category,256.));
  if (u_mode==4) c=category>=256.?vec3(.74,.55,.25):vec3(.08,.39,.67);
  vec3 p = normalize(v_position);
  vec3 g = v_gradient - dot(v_gradient,p)*p;
  float slopeScale = u_exaggeration / max(1.,u_radius + v_surface.x*u_exaggeration);
  float shade;
  if (u_flat) {
    vec3 east = normalize(vec3(-p.y,p.x,0.)+vec3(.0000001,0.,0.));
    vec3 north = cross(p,east);
    vec3 n = normalize(vec3(-dot(g,east)*slopeScale,-dot(g,north)*slopeScale,1.));
    shade = .68 + .4*max(0.,dot(n,normalize(vec3(-.65,.8,1.))));
  } else {
    vec3 n = normalize(p-g*slopeScale);
    n = normalize(mat3(u_rotation)*vec3(n.y,n.z,n.x));
    shade = .62 + .46*max(0.,dot(n,normalize(vec3(-.45,.65,1.))));
  }
  if (u_mode==0 || u_mode==2) {
    if (u_contours && (!basin || u_mode==2)) {
      float level = (u_mode==2 ? v_surface.x : h)/500.;
      float d = min(fract(level),1.-fract(level));
      float line = 1.-smoothstep(0.,max(.0001,fwidth(level)*.7),d);
      c *= 1.-line*.13;
    }
    c *= shade;
  } else if (!u_flat) c *= .85+.15*shade;
  colour=vec4(c,1.);
}`;
