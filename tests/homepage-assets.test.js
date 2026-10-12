import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

test('the built homepage versions its cloth and project preview assets', async () => {
  const output = await mkdtemp(join(tmpdir(), 'portfolio-assets-'));
  try {
    execFileSync(process.execPath, [
      fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)),
      'build', '--outDir', output,
    ], { cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'pipe' });
    const html = await readFile(join(output, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    assert.equal(scripts.length, 2, 'The homepage should initialize its cloth and project previews');
    for (const script of scripts) {
      assert.match(script, /^\/_astro\/.+\.[\w-]+\.js$/, 'Homepage code must use build-generated versioned URLs');
      const asset = join(output, script.slice(1));
      assert.ok((await stat(asset)).size > 0, 'Each deployed script reference must resolve to a real asset');
      const bundle = await readFile(asset, 'utf8');
      assert.doesNotMatch(bundle, /(?:from\s*|import\s*\()["'][^"']*\/cloth\//, 'Nested cloth imports must be bundled too');
    }
    const files = await readdir(join(output, '_astro'));
    const terrain = files.find(file => /^world-preview\.[\w-]+\.bin$/.test(file));
    assert.ok(terrain, 'The globe terrain needs a versioned asset URL too');
    assert.equal((await stat(join(output, '_astro', terrain))).size, 204816, 'The deployed terrain must contain the full preview mesh');
    const bundles = await Promise.all(files.filter(file => file.endsWith('.js')).map(file => readFile(join(output, '_astro', file), 'utf8')));
    assert.ok(bundles.some(bundle => bundle.includes(terrain)), 'The globe renderer must reference the deployed terrain');
    const triggers = [...html.matchAll(/<a\b[^>]*\bdata-world-preview-trigger\b[^>]*>/g)];
    assert.equal(triggers.length, 1, 'Only world generator should trigger a globe preview');
    assert.match(triggers[0][0], /href="https:\/\/birlumbus\.github\.io\/world-generator\/"/, 'The preview link must retain direct project navigation');
    const starTriggers = [...html.matchAll(/<a\b[^>]*\bdata-starfield-preview-trigger\b[^>]*>/g)];
    assert.equal(starTriggers.length, 1, 'Starfield should also have its own preview trigger');
    assert.match(starTriggers[0][0], /href="https:\/\/birlumbus\.github\.io\/starfield\/"/, 'Starfield must retain direct project navigation');
    assert.ok(files.some(file => /^starfield-preview-renderer\.[\w-]+\.js$/.test(file)), 'The starfield preview must be deployed as a versioned lazy renderer');
    const trebuchetTriggers = [...html.matchAll(/<a\b[^>]*\bdata-trebuchet-preview-trigger\b[^>]*>/g)];
    assert.equal(trebuchetTriggers.length, 1, 'Trebuchet needs its own preview trigger');
    assert.match(trebuchetTriggers[0][0], /href="https:\/\/birlumbus\.github\.io\/trebuchet\/"/, 'Trebuchet must retain direct project navigation');
    assert.match(html, /data-trebuchet-preview[^>]*aria-hidden="true"/, 'The decorative trebuchet stays out of the accessibility tree');
    assert.ok(files.some(file => /^trebuchet-preview-renderer\.[\w-]+\.js$/.test(file)), 'The trebuchet renderer must have a build-generated versioned URL');
    const jellyTriggers = [...html.matchAll(/<a\b[^>]*\bdata-jellyfish-preview-trigger\b[^>]*>/g)];
    assert.equal(jellyTriggers.length, 1, 'Jellyfish needs its own preview trigger');
    assert.match(jellyTriggers[0][0], /href="https:\/\/birlumbus\.github\.io\/pretext\/"/, 'Jellyfish must retain direct project navigation');
    assert.match(html, /data-jellyfish-preview[^>]*aria-hidden="true"/, 'The decorative jellyfish preview must stay out of the accessibility tree');
    assert.ok(files.some(file => /^jellyfish-preview-renderer\.[\w-]+\.js$/.test(file)), 'The jellyfish renderer must have a build-generated versioned URL');
    assert.equal((await stat(join(output, 'licenses/pretext.txt'))).size > 0, true, 'The bundled text layout library license must be deployed');

  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
