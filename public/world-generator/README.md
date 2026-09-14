# World Generator for GitHub Pages

A static globe and 2D map demo. Worlds use the final regional M3 terrain and
water at standard resolution: 40,962 samples and 81,920 faces. Both views share
one data set, with slope lighting and the regional diagnostic's elevation
palette. No backend, API key, database or server bill is needed.

## Publish

Build with `python scripts/build_web_demo.py`, then unzip `dist/web-demo.zip`.
Copy its `world-generator` folder into your website's published content (for
Astro, `public/world-generator`). Commit and publish through your usual Pages
workflow. All asset paths are relative; keep the manifest, engine archive and
JavaScript modules together. `.nojekyll` supports standalone branch-based Pages
hosting; do not disable Jekyll in a parent site that depends on it.

Preview with `python -m http.server 8000 --directory dist` and open
`http://localhost:8000/web-demo/`. Use HTTP or HTTPS, not a file URL.

## Use

Enter a decimal seed, choose Generate world or Random world, then drag and zoom.
The seed field's copy icon copies just the seed. All unsigned 64-bit integers
are supported, from 0 through 18446744073709551615. Globe / 2D map switches views
immediately; the reset icon restores framing. Keyboard controls on the canvas
are arrow keys, +/− and Home. Display holds the colour, vertical exaggeration
and plate boundary controls. Both views are horizontally centered on the page.
The 2D map fits between the toolbar and a compact bottom dock; its extra options
are collapsed and its exaggeration slider is hidden. Cancel stops generation and preserves the current
world. The address records the displayed seed and view.

## Runtime and starter world

New worlds run the packaged Python engine in a Web Worker using pinned Pyodide
0.28.3 and NumPy 2.2.5 from jsDelivr. The opening screen downloads and prepares
that runtime beside a slowly rotating miniature of seed 42. The ready worker is
reused for the first generation; subsequent results terminate their worker to
release memory. Browser network caches help later starts. Generation remains much heavier than interactive rendering:
standard M3 took about 34 seconds in the tested desktop browser. Other devices
will vary. WebGL 2 and HTTPS (or localhost) are required.

After setup, seed 42 opens without generation from `starter.json`, an actual
browser-generated result. It is included only when its source archive SHA-256 and runtime versions
match the build. A changed engine invalidates the starter; the demo then generates
normally. To refresh it, generate seed 42 through the pinned worker and save an
object containing `sourceSha256`, `pyodideVersion`, `numpyVersion`, and `scene`
(the worker result) as `web/starter.json` before rebuilding. No native result is
substituted: browser and native floating-point fingerprints can differ.

Terrain is procedural regional M3, not a high-resolution erosion simulation.
No synthetic detail is added by the renderer. Purple basins are unresolved
candidates, not confirmed lakes. Plate and crust overlays show the initial
snapshot. Seeds use the current deployed engine; URLs do not preserve old
versions of the generator.

Build outputs contain only known assets. Obsolete engine archives may remain
in a reused local output directory, but are excluded from the release zip.

The builder derives `preview.json` from the cached starter's level-3 parent mesh:
642 samples and fewer than 70 KB, with no new terrain simulation. This miniature
is just the loading illustration; full-resolution views still use the complete
scene. Intro rotation respects reduced motion and stops when the intro closes.
Controls remain hidden and inert until setup finishes. Cancel interrupts setup
or generation. Network failures restore the controls with a retry message.

Elevation uses a distinct violet-to-gold scale over the entire surface, including
the ocean floor. Colours span the current world's minimum and maximum absolute
elevation, shown in metres in the gradient legend. Ocean and basin masks do not
change this view; map colours are unaffected by terrain shading, and the globe
uses only gentle sphere lighting. Contours remain at 500-metre intervals.
