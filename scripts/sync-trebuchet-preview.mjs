import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transform } from 'esbuild';

const portfolio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Usage: node scripts/sync-trebuchet-preview.mjs /path/to/trebuchet');
const sourceRoot = resolve(process.argv[2]);
const revision = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const exported = JSON.parse(await readFile(resolve(portfolio, 'public/trebuchet/build.json'), 'utf8'));
if (exported.revision !== revision) throw new Error('Export the same source revision into public/trebuchet first.');
const output = resolve(portfolio, 'src/scripts/trebuchet-preview');
await mkdir(output, { recursive: true });
for (const [input, name] of [['physics.ts', 'physics.js'], ['siege-crew.ts', 'crew.js']]) {
  await build({
    entryPoints: [resolve(sourceRoot, 'lib', input)], outfile: resolve(output, name),
    bundle: true, format: 'esm', target: 'es2022',
    banner: { js: `// Generated from birlumbus/trebuchet ${revision}: lib/${input}` },
  });
}
const source = await readFile(resolve(sourceRoot, 'lib/renderer.ts'), 'utf8');
const slice = (start, end) => {
  const first = source.indexOf(start), last = source.indexOf(end, first);
  if (first < 0 || last < 0) throw new Error(`Trebuchet renderer section missing: ${start}`);
  return source.slice(first, last);
};
const helpers = slice('    const rectPx = (', '    drawScenery(');
const rig = slice('    // The launch trough and frame', '    // A human-scale range marker')
  .replace("worldRect(-s.config.arm - 1, 0, s.config.arm + 4, 0.14, '#725D41')",
    "worldRect(-4.35, 0, 8.7, 0.14, '#725D41')");
const projectile = slice("    if (s.phase !== 'misfire' && s.phase !== 'impact')", '    if (preview) {');
const moduleSource = `import { positions } from './physics.js';
export function drawSourceRig(g, s, scale, ox, oy, ink = color => color) {
  const INK = '#293638', CHALK = '#D9DEC7', preview = null, pose = positions(s);
  const X = x => Math.round(ox + x * scale), Y = y => Math.round(oy - y * scale);
${helpers}
${rig}
${projectile}
}`.replaceAll('g.fillStyle = color;', 'g.fillStyle = ink(color);');
const { code } = await transform(moduleSource, { loader: 'ts', target: 'es2022', format: 'esm' });
await writeFile(resolve(output, 'rig.js'),
  `// Generated from birlumbus/trebuchet ${revision}: lib/renderer.ts.\n// Range scenery omitted; the trough is cropped to the frame for the hover preview.\n` + code);
console.log(`Trebuchet preview synchronized with ${revision.slice(0, 7)}`);
