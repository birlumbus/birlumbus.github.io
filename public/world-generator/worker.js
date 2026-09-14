/* Reuse the initialized engine; termination cancels a job or releases a failed runtime. */
let runtime;
const status = (message, phase = 'loading') => self.postMessage({type: 'status', message, phase});
const versionError = () => Object.assign(new Error('The demo was updated. Reload to use the new version.'), {code: 'version'});

async function initialize() {
  const response = await fetch('./manifest.json');
  if (!response.ok) throw new Error('Could not load the demo manifest. Reload and try again.');
  const manifest = await response.json();
  status('Loading the world generator');
  importScripts(manifest.pyodideUrl + 'pyodide.js');
  const py = await loadPyodide({indexURL: manifest.pyodideUrl});
  status('Preparing the generator');
  await py.loadPackage('numpy');
  const source = await fetch('./' + manifest.archive);
  if (!source.ok) throw new Error('Could not load the terrain engine. Reload and try again.');
  const bytes = await source.arrayBuffer();
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join('');
  if (digest !== manifest.sourceSha256) throw versionError();
  py.unpackArchive(bytes, 'zip');
  await py.runPythonAsync('from world_generator.web_scene import generate_scene\nimport json, sys, numpy');
  return {py, manifest};
}

self.onmessage = async ({data}) => {
  try {
    runtime ??= initialize();
    const {py, manifest} = await runtime;
    if (data.release !== manifest.release) throw versionError();
    if (data.type === 'prepare') {
      self.postMessage({type: 'ready', release: manifest.release});
      return;
    }
    status('Generating world ' + data.seed, 'generating');
    py.globals.set('demo_seed', data.seed);
    const result = JSON.parse(await py.runPythonAsync('json.dumps(generate_scene(demo_seed))'));
    self.postMessage({type: 'result', result, release: manifest.release});
  } catch (error) {
    runtime = undefined;
    self.postMessage({type: 'error', message: String(error), code: error.code});
  }
};
