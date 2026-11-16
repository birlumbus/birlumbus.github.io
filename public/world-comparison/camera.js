const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class SharedCamera {
 constructor(){this.renderers=new Set();this.yaw=-.45;this.pitch=.17;this.globeZoom=1;}
 add(renderer){this.renderers.add(renderer);this.sync();}
 sync(){for(const r of this.renderers){r.yaw=this.yaw;r.pitch=this.pitch;r.globeZoom=this.globeZoom;if(r.canvas){r.canvas.dataset.yaw=String(this.yaw);r.canvas.dataset.pitch=String(this.pitch);r.canvas.dataset.zoom=String(this.globeZoom)}if(r.active!==false)r.schedule();}}
 drag(dx,dy){this.yaw+=dx*.006;this.pitch=clamp(this.pitch+dy*.006,-1.5,1.5);this.sync();}
 zoom(factor){this.globeZoom=clamp(this.globeZoom*factor,.8,2.5);this.sync();}
 reset(){this.yaw=-.45;this.pitch=.17;this.globeZoom=1;this.sync();}
 advance(ms){this.yaw+=Math.min(ms,100)*.00008;this.sync();}
}
