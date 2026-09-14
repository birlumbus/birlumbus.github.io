const el = id => document.getElementById(id);
const form = el('generator'), seed = el('seed'), mode = el('mode');
let manifest, worker, current, busy = false, timer, began, message = '', downloadUrl;

function report(text, error = false) {
  message = text;
  el('status').classList.toggle('error', error);
  el('status').textContent = text;
}

function setBusy(value) {
  busy = value;
  for (const id of ['seed', 'mode', 'generate', 'random']) el(id).disabled = value;
  el('cancel').hidden = !value;
  el('world').setAttribute('aria-busy', String(value));
  clearInterval(timer);
  if (value) {
    began = performance.now();
    timer = setInterval(() => {
      el('status').textContent = `${message} (${Math.floor((performance.now() - began) / 1000)}s)`;
    }, 1000);
  }
}

function worldUrl(result) {
  const url = new URL(location.href);
  url.search = new URLSearchParams({seed: result.seed, mode: result.mode, v: manifest.release});
  url.hash = '';
  return url.href;
}

function fail(text) {
  worker?.terminate(); worker = undefined;
  setBusy(false);
  report(text, true);
  if (!current) {
    el('empty').querySelector('p').textContent = 'Your world is ready to be generated.';
    el('empty').querySelector('span').textContent = 'Check the message above, then try Generate world again.';
  }
}

function generate() {
  if (busy) return;
  if (!manifest) { report('The demo could not load. Check your connection and reload the page.', true); return; }
  const value = seed.value.trim();
  if (!/^[0-9]{1,20}$/.test(value) || BigInt(value) > 18446744073709551615n) {
    report('Use a whole-number seed from 0 to 18446744073709551615.', true); seed.focus(); return;
  }
  const normalized = BigInt(value).toString();
  seed.value = normalized;
  setBusy(true);
  report('Starting your world…');
  try {
    if (!worker) {
      worker = new Worker(new URL('./worker.js', import.meta.url));
      worker.onerror = event => { event.preventDefault(); fail('The generator could not start. Check your connection and try Generate world again.'); };
      worker.onmessage = ({data}) => {
        if (data.type === 'status') report(data.message);
        if (data.type === 'error') { console.error(data.message); fail('Generation failed. Try again, or select Snapshot for a lighter world. Details: ' + data.message.split('\n').slice(-1)[0]); }
        if (data.type === 'result') {
          setBusy(false);
          current = data.result;
          el('viewer').srcdoc = current.html;
          el('viewer').hidden = false;
          el('empty').hidden = true;
          el('share').disabled = false;
          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          downloadUrl = URL.createObjectURL(new Blob([current.html], {type: 'text/html'}));
          el('download').href = downloadUrl;
          el('download').download = `world-${current.seed}-${current.mode}.html`;
          el('download').setAttribute('aria-disabled', 'false');
          el('identity').textContent = `Seed ${current.seed}. ${current.mode === 'm3' ? 'M3 regional-v2 final terrain' : 'M2 snapshot'}. Preview resolution: 10,242 samples. Canonical SHA-256: ${current.canonicalSha256}. Demo: ${data.release}.`;
          history.replaceState(null, '', worldUrl(current));
          report(`World ${current.seed} generated in ${current.seconds.toFixed(1)}s.`);
        }
      };
    }
    worker.postMessage({seed: normalized, mode: mode.value, release: manifest.release});
  } catch (error) { fail('The browser could not start generation. Reload and try again. ' + error.message); }
}

form.addEventListener('submit', event => { event.preventDefault(); generate(); });
el('random').onclick = () => {
  const values = crypto.getRandomValues(new Uint32Array(2));
  seed.value = ((BigInt(values[0]) << 32n) | BigInt(values[1])).toString();
  generate();
};
el('cancel').onclick = () => {
  worker?.terminate(); worker = undefined;
  setBusy(false);
  report('Generation cancelled. Choose a seed and generate another world.');
  if (!current) el('empty').querySelector('p').textContent = 'Choose your next world.';
};
el('share').onclick = async () => {
  if (!current) return;
  const url = worldUrl(current);
  try { await navigator.clipboard.writeText(url); report('World link copied.'); }
  catch { history.replaceState(null, '', url); report('Copy the address from your browser to share this world.'); }
};
try {
  const response = await fetch(new URL('./manifest.json', import.meta.url));
  if (!response.ok) throw new Error('Demo manifest missing');
  manifest = await response.json();
  const params = new URLSearchParams(location.search);
  if (params.has('seed')) seed.value = params.get('seed');
  if (params.has('mode')) {
    if (!['m2', 'm3'].includes(params.get('mode'))) throw new Error('This link has an unknown terrain mode. Choose a terrain mode and generate a world.');
    mode.value = params.get('mode');
  }
  el('runtime').textContent = `Runs on your device with Pyodide ${manifest.pyodideVersion} and NumPy ${manifest.numpyVersion}. This browser edition is repeatable within its pinned runtime; its numeric fingerprint can differ from desktop Python. The first visit needs an internet connection.`;
  if (params.has('v') && params.get('v') !== manifest.release) {
    fail('This link was made with a different demo version. Generate world will use the current version.');
  } else generate();
} catch (error) { fail(error.message + ' Reload the page if the demo files did not load.'); }
