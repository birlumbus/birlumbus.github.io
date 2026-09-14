# World Generator for GitHub Pages

This folder is the complete static demo. Visitors generate worlds in their own
browser. There is no backend, API key, database, npm install, or server bill.

## Add it to your personal website

1. Unzip `web-demo.zip`. It contains a `world-generator` folder.
2. Copy that whole folder into your existing website's published content.
   For a Pages site published from a branch, this is normally the repository
   root or `docs/`, as configured in **Settings → Pages**. If your site has its
   own build pipeline, put the folder in its static/public assets directory so
   the contents are copied unchanged into the published site.
3. Commit and push through your normal website workflow.
4. Visit `https://YOUR-SITE/world-generator/` and add a link there from your site.
   A project Pages site also works at
   `https://USERNAME.github.io/REPOSITORY/world-generator/`.

All asset paths are relative. Leave `manifest.json`, the engine zip, and the
JavaScript files together. The `.nojekyll` file is included for serving the demo
as a standalone Pages root; follow your existing site's build process when
adding it as a subfolder. Do not disable Jekyll for a site that depends on it.

## Use

- Enter a decimal seed or choose Random world. The full unsigned 64-bit seed
  range is supported, from 0 through 18446744073709551615.
- Evolved mountains shows M3 regional-v2's final terrain and water; Snapshot is
  the faster M2 mode. Both use preview resolution, 10,242 samples.
- Copy world link shares the generated seed, terrain mode, and demo release.
  Changed form fields do not change the shared world until generation succeeds.
- Save globe downloads a self-contained HTML viewer that opens offline.
- Cancel stops a running generation. Generate world starts a new worker.

## Runtime and limits

The first visit downloads pinned Pyodide 0.28.3 and NumPy 2.2.5 from jsDelivr,
so it needs internet access. Python runs in a Web Worker; generation doesn't
block the page. Subsequent worlds reuse the runtime until cancellation or error.
HTTPS is required outside localhost (GitHub Pages supplies HTTPS).

The engine source is packaged directly from this project. Native Python still
uses its existing dependency pins. Floating-point results can differ between
browser and desktop, so their canonical hashes are not expected to match. Links
include the browser demo release; an outdated release link is visibly flagged
instead of silently regenerating with changed code. For permanent old links,
keep old demo folders at versioned paths, or save a globe HTML file.

M3 is experimental and uses more memory; lower-powered devices can use Snapshot.
The renderer needs WebGL. Initial plate and crust overlays remain baseline
fields. Purple basins are unresolved candidates, not confirmed lakes.

## Rebuild and preview from the source project

```sh
python scripts/build_web_demo.py
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000/web-demo/`. The published files cannot generate worlds
when opened as `file://`; use an HTTP server or GitHub Pages. Saved globe HTML
files work directly from disk.

Build outputs: `dist/web-demo/` and `dist/web-demo.zip`. The builder writes only
its known output files. After an engine change, an older engine zip may remain
in the local output folder, but the release archive includes only current files.

References: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
and [Pyodide workers](https://pyodide.org/en/0.28.3/usage/webworker.html).
