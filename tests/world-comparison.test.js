import assert from 'node:assert/strict';
import {test} from 'node:test';
let Camera;try{({SharedCamera:Camera}=await import('../public/world-comparison/camera.js'))}catch{}
test('drag and zoom update all loaded and subsequently loaded globes identically',()=>{
 assert.equal(typeof Camera,'function','Shared camera is not implemented');
 const camera=new Camera(),a={schedule(){}},b={schedule(){}};camera.add(a);camera.add(b);camera.drag(45,-20);camera.zoom(1.4);
 assert.equal(a.yaw,b.yaw);assert.equal(a.pitch,b.pitch);assert.equal(a.globeZoom,b.globeZoom);
 const c={schedule(){}};camera.add(c);assert.equal(c.yaw,a.yaw);assert.equal(c.globeZoom,a.globeZoom);
 camera.reset();assert.equal(a.globeZoom,1);assert.equal(a.yaw,b.yaw);
});
test('shared camera clamps tilt and zoom and ignores independent scene reset',()=>{
 assert.equal(typeof Camera,'function');const camera=new Camera(),a={schedule(){}};camera.add(a);camera.drag(0,10000);camera.zoom(100);assert.ok(a.pitch<=1.5);assert.ok(a.globeZoom<=2.5);a.yaw=99;camera.sync();assert.equal(a.yaw,camera.yaw);
});
let leavePage;try{({leavePage}=await import('../public/world-comparison/lifecycle.js'))}catch{}
test('cached navigation preserves usable renderers for Back',()=>{assert.equal(typeof leavePage,'function','Page lifecycle handler missing');let disposed=0,stopped=0;const renderers=[{dispose(){disposed++}},{dispose(){disposed++}}];leavePage({persisted:true},renderers,()=>stopped++);assert.equal(disposed,0);assert.equal(stopped,0);leavePage({persisted:false},renderers,()=>stopped++);assert.equal(disposed,2);assert.equal(stopped,1);});
