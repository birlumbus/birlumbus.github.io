# birlumbus.github.io

Personal website for Rhodri Thomas, built with Astro and deployed to GitHub Pages.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Projects

Project entries live in `src/content/projects`. Add a new markdown file with frontmatter matching the collection schema in `src/content.config.ts`.

Deploys run from `.github/workflows/deploy.yml` after pushes to `main`.

The homepage cloth source lives in `src/scripts/cloth` and is bundled by Astro,
which gives changed JavaScript a new asset URL on deployment. The older
`public/cloth` modules remain for cached pages and the original mockup.

Trebuchet is maintained separately in `birlumbus/trebuchet`. Its generated files live in `public/trebuchet/`; `build.json` identifies the source revision. To update it, run `npm run export:portfolio -- /path/to/this/checkout` from the Trebuchet repository, then build and publish this site as usual.

After exporting Trebuchet, run `node scripts/sync-trebuchet-preview.mjs /path/to/trebuchet` from this repository to update the homepage rig and crew artwork from that same source revision.

World Generator lives in `public/world-generator/`. It runs the packaged Python
engine in the browser through Pyodide, with no backend. Its `manifest.json`
records the engine source digest and pinned browser runtime. To update it, build
`dist/web-demo.zip` from the World Generator project and replace this static
folder with the archive's `world-generator` directory.
