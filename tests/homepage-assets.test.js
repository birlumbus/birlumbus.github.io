import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

test('the built homepage loads versioned cloth code instead of fixed public module URLs', async () => {
  const output = await mkdtemp(join(tmpdir(), 'portfolio-assets-'));
  try {
    execFileSync(process.execPath, [
      fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)),
      'build', '--outDir', output,
    ], { cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'pipe' });
    const html = await readFile(join(output, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    assert.equal(scripts.length, 1, 'The decorative cloth should have a single bundled entry point');
    assert.match(scripts[0], /^\/_astro\/.+\.[\w-]+\.js$/, 'Cloth code must use a build-generated versioned URL');
    const asset = join(output, scripts[0].slice(1));
    assert.ok((await stat(asset)).size > 0, 'The deployed script reference must resolve to a real asset');
    const bundle = await readFile(asset, 'utf8');
    assert.doesNotMatch(bundle, /(?:from\s*|import\s*\()["'][^"']*\/cloth\//, 'Nested cloth imports must be bundled too');
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
