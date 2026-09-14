import {WorldRenderer} from './renderer.js';
import {LoadingIntro} from './intro.js';
const el = id => document.getElementById(id);
const seed = el('seed');
let manifest, renderer, worker, current, busy = false, timer, hideTimer, began, message = '';
let readyResolve, readyReject, startupId=0;
const intro=new LoadingIntro();

function report(text, error = false, temporary = false, phase = 'loading') {
  clearTimeout(hideTimer);
  message = text;
  if (!intro.root.hidden && !error) {intro.setStatus(text,phase);return;}
  el('status').hidden = false;
  el('status').classList.toggle('error', error);
  el('status').textContent = text;
  if (temporary) hideTimer = setTimeout(() => {el('status').hidden = true;}, 3500);
}
function setBusy(value) {
  busy = value;
  for (const id of ['seed','copy-seed','generate','random']) el(id).disabled = value;
  el('cancel').hidden = !value;
  el('world').setAttribute('aria-busy', String(value));
  clearInterval(timer);
  if (value) {
    began = performance.now();
    timer = setInterval(() => {el('status').textContent = `${message} (${Math.floor((performance.now()-began)/1000)}s)`;}, 1000);
  }
}
function fail(text) {
  stopWorker();
  intro.hide();
  setBusy(false);
  if (current) seed.value = current.metadata.seed;
  report(text, true);
  if (!current) el('empty').textContent = 'Choose a seed and generate a world.';
}
function updateUrl() {
  if (!current) return;
  const url = new URL(location.href);
  url.search = new URLSearchParams({seed:current.metadata.seed,view:renderer.view});
  url.hash = '';
  history.replaceState(null, '', url);
}
function selectView(view) {
  renderer?.setView(view);
  el('view-globe').setAttribute('aria-pressed',String(view === 'globe'));
  el('view-map').setAttribute('aria-pressed',String(view === 'map'));
  updateUrl();
}
function show(scene) {
  renderer.load(scene);
  current = scene;
  seed.value = scene.metadata.seed;
  el('sea-level').textContent = scene.metadata.seaLevelM.toFixed(2) + ' m';
  const metres = value => Math.round(value).toLocaleString('en-US').replace('-', '−');
  el('elevation-range').textContent = `${metres(scene.metadata.elevationMinM)} to ${metres(scene.metadata.elevationMaxM)} m`;
  el('empty').hidden = true;
  updateUrl();
}
function stopWorker() {
  worker?.terminate();worker=undefined;
  readyReject?.(new DOMException('Cancelled','AbortError'));
  readyResolve=readyReject=undefined;
}
function ensureWorker() {
  if(worker)return;
  worker=new Worker(new URL('./worker.js',import.meta.url));
  let phase='loading';
  const rejectOrFail=message=>{
    if(readyReject){const reject=readyReject;readyResolve=readyReject=undefined;reject(new Error(message));}
    else fail(message);
  };
  worker.onerror=event=>{event.preventDefault();rejectOrFail('The generator could not load. Check your connection and try again.');};
  worker.onmessage=({data})=>{
    if(data.type==='status'){phase=data.phase;report(data.message,false,false,data.phase);}
    if(data.type==='error'){
      console.error(data.message);
      rejectOrFail(data.code==='version'?'The demo was updated. Reload to use the new version.':phase==='generating'?'This world could not be generated. Try again or choose another seed.':'The generator could not load. Check your connection and try again.');
    }
    if(data.type==='ready'){
      const resolve=readyResolve;readyResolve=readyReject=undefined;resolve?.();
    }
    if(data.type==='result'){
      stopWorker();setBusy(false);
      try {show(data.result);intro.hide();report(`Generated in ${data.result.seconds.toFixed(1)}s.`,false,true);}
      catch(error){console.error(error);fail('The world could not be displayed. Reload and try again.');}
    }
  };
}
function generate() {
  if(busy)return;
  if(!manifest || !renderer){report('Reload the page to load the generator.',true);return;}
  const value=seed.value.trim();
  if(!/^[0-9]{1,20}$/.test(value) || BigInt(value)>18446744073709551615n){
    report('Use a whole-number seed from 0 to 18446744073709551615.',true);seed.focus();return;
  }
  seed.value=BigInt(value).toString();
  if(!current)intro.show();
  setBusy(true);report('Loading the world generator');
  try {
    ensureWorker();
    worker.postMessage({seed:seed.value,release:manifest.release});
  } catch(error){console.error(error);fail('The browser could not start generation. Reload and try again.');}
}
el('generator').addEventListener('submit',event=>{event.preventDefault();generate();});
el('random').onclick = () => {
  const values=crypto.getRandomValues(new Uint32Array(2));
  seed.value=((BigInt(values[0])<<32n)|BigInt(values[1])).toString();generate();
};
function cancel() {
  startupId++;
  stopWorker();setBusy(false);intro.hide();
  if(current)seed.value=current.metadata.seed;
  else el('empty').textContent='Choose a seed and generate a world.';
  report('Cancelled.',false,true);
}
el('cancel').onclick=cancel;
el('intro-cancel').onclick=cancel;
el('copy-seed').onclick=async()=>{
  try {await navigator.clipboard.writeText(seed.value);report('Seed copied.',false,true);}
  catch {seed.focus();seed.select();report('Seed selected. Press copy.',false,true);}
};
el('view-globe').onclick=()=>selectView('globe');
el('view-map').onclick=()=>selectView('map');
el('reset').onclick=()=>renderer?.reset();
el('colour').onchange=()=>{
  const mode=Number(el('colour').value);
  renderer?.setOptions({mode});
  el('terrain-key').hidden=mode>=2;
  el('alternate-key').hidden=mode<2;
  el('alternate-key').textContent = mode===2?'Colour shows elevation above or below 0 m.':mode===3?'Each colour is an initial plate.':mode===4?'Blue · oceanic crust\nGold · continental crust':'';
};
el('exaggeration').oninput=()=>{
  const exaggeration=Number(el('exaggeration').value);
  el('scale').textContent=exaggeration+'×';renderer?.setOptions({exaggeration});
};
el('boundaries').onchange=()=>renderer?.setOptions({boundaries:el('boundaries').checked});
const compact=matchMedia('(max-width: 899px)');
const adapt=()=>{el('display').open=!compact.matches;};
adapt();compact.addEventListener('change',adapt);
async function starterScene() {
  if(seed.value!=='42' || !manifest.starter)return null;
  try {
    const response=await fetch(new URL('./'+manifest.starter,import.meta.url));
    if(!response.ok)throw new Error('Starter world unavailable');
    const cached=await response.json();
    if(!['sourceSha256','pyodideVersion','numpyVersion'].every(key=>cached[key]===manifest[key]))throw new Error('Starter world version mismatch');
    return cached.scene;
  } catch(error){console.warn(error.message);return null;}
}
async function start() {
  const id=++startupId;
  try {
    renderer=new WorldRenderer(el('globe'),text=>report(text,true));
    const params=new URLSearchParams(location.search);
    if(params.has('seed'))seed.value=params.get('seed');
    selectView(params.get('view')==='map'?'map':'globe');
    setBusy(true);
    const response=await fetch(new URL('./manifest.json',import.meta.url));
    if(!response.ok)throw new Error('The generator could not load. Check your connection and reload.');
    manifest=await response.json();
    if(id!==startupId)return;
    if(manifest.preview)void intro.loadPreview(new URL('./'+manifest.preview,import.meta.url));
    ensureWorker();
    const prepare=new Promise((resolve,reject)=>{
      readyResolve=resolve;readyReject=reject;
      worker.postMessage({type:'prepare',release:manifest.release});
    });
    const [scene]=await Promise.all([starterScene(),prepare]);
    if(id!==startupId)return;
    setBusy(false);
    if(scene){show(scene);intro.hide();el('status').hidden=true;}
    else {intro.hide();generate();}
  } catch(error){
    if(id!==startupId || error.name==='AbortError')return;
    console.error(error);fail(error.message);
  }
}
void start();
