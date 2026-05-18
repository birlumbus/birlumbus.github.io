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
