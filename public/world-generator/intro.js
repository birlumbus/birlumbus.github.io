import {WorldRenderer} from './renderer.js';

export class LoadingIntro {
  constructor() {
    this.root=document.getElementById('intro');
    this.note=document.getElementById('intro-note');
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.updateMotion=()=>this.renderer?.setAutoRotate(!this.motion.matches && !this.root.hidden);
    this.motion.addEventListener('change',this.updateMotion);
  }
  async loadPreview(url) {
    try {
      const response=await fetch(url,{priority:'high'});
      if(!response.ok)return;
      this.scene=await response.json();
      if(!this.root.hidden)this.renderPreview();
    } catch(error) {console.warn('Loading preview unavailable:',error.message);}
  }
  renderPreview() {
    if(!this.scene || this.renderer)return;
    try {
      this.renderer=new WorldRenderer(document.getElementById('intro-globe'),()=>{}, {interactive:false});
      this.renderer.setOptions({contours:false,exaggeration:20});
      this.renderer.load(this.scene);
      this.updateMotion();
    } catch(error) {console.warn('Loading preview unavailable:',error.message);}
  }
  show() {
    this.root.hidden=false;document.body.classList.add('loading');
    for(const selector of ['#world','.toolbar','#panel'])document.querySelector(selector).inert=true;
    document.getElementById('status').hidden=true;
    this.setPhase();
    this.renderPreview();
  }
  setPhase(phase='loading') {
    const generating=phase==='generating';
    this.note.hidden=!generating;
    this.note.textContent=generating?'Usually takes 30–60 seconds.':'';
  }
  hide() {
    this.root.hidden=true;document.body.classList.remove('loading');
    for(const selector of ['#world','.toolbar','#panel'])document.querySelector(selector).inert=false;
    this.renderer?.dispose();this.renderer=undefined;
  }
}
