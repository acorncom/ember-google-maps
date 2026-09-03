// Types can look correct against the pnpm workspace symlink test-app-basic
// resolves through and still be broken for every real consumer: a symlinked
// workspace dependency never walks package.json's `exports` map the way an
// actual npm/git install does. That's exactly how the wildcard "./*"
// export's missing `types` condition, and whether `prepack` really builds
// declarations/, both slipped past test-app-basic's Glint fixture. This
// script packs the addon for real (`pnpm pack`, the same command
// push-dist.yml's prepack step runs), installs the tarball the way a real
// dependency install would lay it out, and typechecks verify-published-types/
// against THAT.
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const addonDir = join(repoRoot, 'ember-google-maps');
const fixtureDir = join(repoRoot, 'verify-published-types');
const fixtureNodeModules = join(fixtureDir, 'node_modules');

function run(command, args, options = {}) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit', ...options });
}

run('pnpm', ['--filter', 'ember-google-maps', 'build'], { cwd: repoRoot });

const tmp = mkdtempSync(join(tmpdir(), 'egm-verify-published-types-'));

try {
  run('pnpm', ['pack', '--pack-destination', tmp], { cwd: addonDir });

  const tarball = readdirSync(tmp).find((name) => name.endsWith('.tgz'));
  if (!tarball) {
    throw new Error(`pnpm pack did not produce a .tgz file in ${tmp}`);
  }

  run('tar', ['-xzf', tarball], { cwd: tmp });

  rmSync(fixtureNodeModules, { recursive: true, force: true });
  mkdirSync(join(fixtureNodeModules, '@types'), { recursive: true });
  mkdirSync(join(fixtureNodeModules, '@glint'), { recursive: true });

  cpSync(join(tmp, 'package'), join(fixtureNodeModules, 'ember-google-maps'), {
    recursive: true,
  });

  // The public API re-exports hand-written types straight off the real .ts
  // source (map-component.ts, typical-map-component.ts), which imports
  // @ember/*/@glimmer/* and @glint/template -- exactly what any real Ember
  // app already has. All of these are devDependencies of ember-google-maps
  // itself, so reuse them from there rather than installing second copies
  // just for this fixture.
  for (const dep of [
    ['@types', 'google.maps'],
    ['ember-source'],
    ['@glint', 'template'],
    ['@glint', 'ember-tsc'],
  ]) {
    symlinkSync(
      join(addonDir, 'node_modules', ...dep),
      join(fixtureNodeModules, ...dep),
    );
  }

  run(join(addonDir, 'node_modules', '.bin', 'tsc'), [
    '-p',
    join(fixtureDir, 'tsconfig.json'),
  ]);

  console.log(
    '\nverify-published-types: OK -- the packed tarball types check out.',
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
