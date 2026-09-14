import {buildSurfaceGeometry, buildLineGeometry, STRIDE} from './geometry.js';
import {vertex, fragment} from './shaders.js';

const decode = (value, Type) => {
  const raw = atob(value), bytes = new Uint8Array(raw.length);
  for (let i=0; i<raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return new Type(bytes.buffer);
};
const mul = (a,b) => {
  const r = new Float32Array(16);
  for (let c=0;c<4;c++) for (let row=0;row<4;row++) r[c*4+row]=a[row]*b[c*4]+a[4+row]*b[c*4+1]+a[8+row]*b[c*4+2]+a[12+row]*b[c*4+3];
  return r;
};
const rx = a => {const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);};
const ry = a => {const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);};
const translate = z => new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,z,1]);
const perspective = aspect => {const f=1/Math.tan(.41),near=.025,far=40,nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);};
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));

export class WorldRenderer {
  constructor(canvas, onError) {
    this.canvas=canvas; this.onError=onError;
    this.gl=canvas.getContext('webgl2',{alpha:true,antialias:true});
    if (!this.gl) throw new Error('This view needs WebGL 2. Try a current browser with graphics acceleration enabled.');
    this.options={mode:0,exaggeration:32,contours:true,boundaries:false};
    this.view='globe'; this.buffers=[]; this.pending=false; this.reset();
    this.setup(); this.interactions();
    this.observer=new ResizeObserver(()=>this.schedule()); this.observer.observe(canvas);
    canvas.addEventListener('webglcontextlost', event => {event.preventDefault();this.onError('Graphics paused. Reload the page to restore the world.');});
    canvas.addEventListener('webglcontextrestored',()=>{this.setup();if(this.scene)this.load(this.scene);});
  }

  setup() {
    const gl=this.gl;
    const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
    this.program=gl.createProgram();
    const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
    gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));
    this.uniforms={};
    for (const name of ['mvp','rotation','mapTransform','radius','exaggeration','flat','mode','lines','contours']) this.uniforms[name]=gl.getUniformLocation(this.program,'u_'+name);
    this.attributes=[['a_position',3,0],['a_gradient',3,3],['a_surface',4,6],['a_region',2,10],['a_map',2,12],['a_categories',3,14],['a_barycentric',2,17]].map(([name,size,offset])=>({index:gl.getAttribLocation(this.program,name),size,offset}));
  }

  buffer(vertices) {
    const gl=this.gl, buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    this.buffers.push(buffer);
    return {buffer,count:vertices.length/STRIDE};
  }

  load(scene) {
    const types={positions:Float32Array,gradient:Float32Array,faces:Uint32Array,edges:Uint32Array,elevation:Float32Array,heightAboveSea:Float32Array,ocean:Uint8Array,basinCandidates:Uint8Array,plateIds:Float32Array,crustType:Uint8Array,boundaryEdges:Uint32Array,boundaryClass:Int8Array};
    const data={};
    for (const [name,Type] of Object.entries(types)) data[name]=decode(scene.arrays[name],Type);
    for (const buffer of this.buffers) this.gl.deleteBuffer(buffer);
    this.buffers=[];this.scene=scene;this.data=data;
    this.surface=this.buffer(buildSurfaceGeometry(data));
    this.boundaries=null;
    // Open each world on its highest terrain, so new seeds reveal land immediately.
    let peak=0;
    for(let i=1;i<data.elevation.length;i++)if(data.elevation[i]>data.elevation[peak])peak=i;
    this.focus=[-Math.atan2(data.positions[peak*3+1],data.positions[peak*3]),Math.asin(clamp(data.positions[peak*3+2],-1,1))];
    this.reset();
  }

  setView(view) {this.view=view;this.canvas.setAttribute('aria-label',view==='map'?'Interactive 2D world map':'Interactive world globe');this.schedule();}
  setOptions(options) {Object.assign(this.options,options);this.schedule();}
  reset() {[this.yaw,this.pitch]=this.focus??[-1.15,.18];this.globeZoom=1;this.mapZoom=1;this.pan=[0,0];this.schedule();}
  schedule() {if(!this.pending){this.pending=true;requestAnimationFrame(()=>{this.pending=false;this.draw();});}}

  drawGeometry(geometry, primitive) {
    const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,geometry.buffer);
    for(const a of this.attributes) if(a.index>=0){gl.enableVertexAttribArray(a.index);gl.vertexAttribPointer(a.index,a.size,gl.FLOAT,false,STRIDE*4,a.offset*4);}
    gl.drawArrays(primitive,0,geometry.count);
  }

  draw() {
    if(!this.surface || this.gl.isContextLost())return;
    const gl=this.gl, rect=this.canvas.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1);
    const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);
    if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
    const sceneWidth=rect.width>=900?rect.width-260:rect.width;
    const vw=Math.round(sceneWidth*dpr), aspect=vw/height;
    gl.viewport(0,0,vw,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);gl.enable(gl.DEPTH_TEST);
    const flat=this.view==='map';
    if(flat)gl.disable(gl.CULL_FACE);else{gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);}
    const rotation=mul(rx(this.pitch),ry(this.yaw));
    const distance=Math.max(1.12,Math.max(3.05,2.65/aspect)/this.globeZoom);
    const mvp=mul(perspective(aspect),mul(translate(-distance),rotation));
    const fit=Math.min(sceneWidth/(2*Math.PI),rect.height/Math.PI)*.9;
    gl.uniformMatrix4fv(this.uniforms.mvp,false,mvp);
    gl.uniformMatrix4fv(this.uniforms.rotation,false,rotation);
    gl.uniform4f(this.uniforms.mapTransform,fit*2/sceneWidth*this.mapZoom,fit*2/rect.height*this.mapZoom,...this.pan);
    gl.uniform1f(this.uniforms.radius,this.scene.metadata.radiusM);
    gl.uniform1f(this.uniforms.exaggeration,this.options.exaggeration);
    gl.uniform1i(this.uniforms.flat,flat?1:0);
    gl.uniform1i(this.uniforms.mode,this.options.mode);
    gl.uniform1i(this.uniforms.contours,this.options.contours?1:0);
    gl.uniform1i(this.uniforms.lines,0);
    gl.disable(gl.BLEND);
    this.drawGeometry(this.surface,gl.TRIANGLES);
    if(this.options.boundaries){
      this.boundaries??=this.buffer(buildLineGeometry(this.data,this.data.boundaryEdges,this.data.boundaryClass));
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthFunc(gl.LEQUAL);
      gl.uniform1i(this.uniforms.lines,2);this.drawGeometry(this.boundaries,gl.LINES);gl.depthFunc(gl.LESS);
    }
  }

  zoom(factor) {
    if(this.view==='map')this.mapZoom=clamp(this.mapZoom*factor,1,12);
    else this.globeZoom=clamp(this.globeZoom*factor,.7,6);
    this.schedule();
  }

  interactions() {
    const canvas=this.canvas, pointers=new Map();
    canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId))return;
      const before=[...pointers.values()], old=pointers.get(e.pointerId);
      pointers.set(e.pointerId,[e.clientX,e.clientY]);
      if(pointers.size===2){
        const after=[...pointers.values()];
        const a=Math.hypot(before[0][0]-before[1][0],before[0][1]-before[1][1]);
        const b=Math.hypot(after[0][0]-after[1][0],after[0][1]-after[1][1]);
        if(a>1)this.zoom(b/a);
      } else if(pointers.size===1){
        const dx=e.clientX-old[0],dy=e.clientY-old[1];
        if(this.view==='map'){
          const width=canvas.clientWidth>=900?canvas.clientWidth-260:canvas.clientWidth;
          this.pan[0]+=dx*2/width;this.pan[1]-=dy*2/canvas.clientHeight;
        } else {this.yaw+=dx*.006;this.pitch=clamp(this.pitch+dy*.006,-1.5,1.5);}
        this.schedule();
      }
    });
    for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>pointers.delete(e.pointerId));
    canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom(Math.exp(-e.deltaY*.001));},{passive:false});
    canvas.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;
      e.preventDefault();
      if(e.key==='Home'){this.reset();return;}
      if(['+','=','-'].includes(e.key)){this.zoom(e.key==='-'?.9:1.1);return;}
      const dx=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0,dy=e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0;
      if(this.view==='map'){this.pan[0]-=dx;this.pan[1]+=dy;}else{this.yaw+=dx;this.pitch=clamp(this.pitch+dy,-1.5,1.5);}
      this.schedule();
    });
  }
}
