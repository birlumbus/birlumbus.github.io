/* One numerical job per worker. Termination cancels Python without shared memory. */
let runtime;
const status = message => self.postMessage({type: 'status', message});

async function initialize() {
  const response = await fetch('./manifest.json');
  if (!response.ok) throw new Error('Could not load the demo manifest. Reload and try again.');
  const manifest = await response.json();
  status('Downloading Python. The first visit takes a little longer…');
  importScripts(manifest.pyodideUrl + 'pyodide.js');
  const py = await loadPyodide({indexURL: manifest.pyodideUrl});
  status('Loading the terrain engine…');
  await py.loadPackage('numpy');
  const source = await fetch('./' + manifest.archive);
  if (!source.ok) throw new Error('Could not load the terrain engine. Reload and try again.');
  const bytes = await source.arrayBuffer();
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join('');
  if (digest !== manifest.sourceSha256) throw new Error('The demo files are from different versions. Reload and try again.');
  py.unpackArchive(bytes, 'zip');
  await py.runPythonAsync('from world_generator.web_demo import generate_demo\nimport json, sys, numpy');
  return {py, manifest};
}

self.onmessage = async ({data}) => {
  try {
    runtime ??= initialize();
    const {py, manifest} = await runtime;
    if (data.release !== manifest.release) throw new Error('The demo changed while loading. Reload and try again.');
    status(data.mode === 'm3' ? 'Generating terrain and evolving mountains…' : 'Generating terrain and oceans…');
    py.globals.set('demo_seed', data.seed);
    py.globals.set('demo_mode', data.mode);
    const result = JSON.parse(await py.runPythonAsync('json.dumps(generate_demo(demo_seed, demo_mode))'));
    self.postMessage({type: 'result', result, release: manifest.release});
  } catch (error) {
    runtime = undefined;
    self.postMessage({type: 'error', message: String(error)});
  }
};
