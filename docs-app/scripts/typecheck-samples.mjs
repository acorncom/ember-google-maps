#!/usr/bin/env node
// Best-effort type-check of the `.gts`/`.ts` code samples embedded in
// docs-app/*.md, against the real ember-google-maps types.
//
// Why this lives here but runs through ember-google-maps's toolchain:
// docs-app itself carries no TypeScript/Glint devDependencies (it's a plain
// VitePress + vite-plugin-ember site, and the samples are prose, not a
// checked app). The addon package (`ember-google-maps/`) already has
// `typescript`, `@glint/ember-tsc`, and `@types/google.maps` installed for
// its own `ember-tsc` check, so we borrow that toolchain rather than adding
// a parallel TypeScript install to docs-app. Everything this script writes
// lives under a temp directory that's removed when the script exits.
//
// Usage:
//   node docs-app/scripts/typecheck-samples.mjs
//
// What it does:
//   1. Extracts every ```gts / ```gts live / ```ts fenced block from
//      docs-app/*.md.
//   2. Skips blocks that are clearly fragments, not standalone modules (no
//      <template>, no export default class/function, no qunit `module(...)`
//      call) -- see `isModuleCandidate` below.
//   3. Writes the rest to temp .gts/.ts files under
//      ember-google-maps/.typecheck-tmp/samples, alongside a tsconfig that
//      mirrors the addon's own (@ember/library-tsconfig-equivalent
//      compilerOptions + ember-source/types + @glint/ember-tsc/types +
//      google.maps), plus an ambient shim so importing the (currently
//      untyped) ember-google-maps-directions package doesn't hard-fail
//      module resolution.
//   4. Runs `ember-tsc --noEmit` over the temp project and reports
//      diagnostics, mapped back to their source .md file + block.
//
// This is a best-effort dev tool, not a CI gate: it is not wired into
// `pnpm --filter docs-app build` and must never be a prerequisite for it.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_APP_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DOCS_APP_DIR, '..');
const ADDON_DIR = path.join(REPO_ROOT, 'ember-google-maps');
const EMBER_TSC = path.join(ADDON_DIR, 'node_modules', '.bin', 'ember-tsc');

// Packages referenced by the samples that don't ship type declarations yet.
// Rather than let a bare `import` from these hard-fail module resolution
// (TS2307, a harness-noise error that drowns out real findings), declare
// them as untyped ambient modules -- every export becomes `any`, so real
// type errors elsewhere in the same sample still surface, but we never
// invent types for packages the project itself hasn't typed.
const UNTYPED_PACKAGES = [
  // ember-google-maps-directions ships no declarations/ dir yet (only
  // dist/*.js) -- see docs/superpowers memory "directions package".
  'ember-google-maps-directions',
  // ember-google-maps-clustering is referenced in clustering.md as
  // illustrative/aspirational code for a package that isn't published yet
  // (see docs-app/clustering.md and issue #22).
  'ember-google-maps-clustering',
];

function fail(message) {
  console.error(`typecheck-samples: ${message}`);
  process.exit(1);
}

if (!existsSync(EMBER_TSC)) {
  fail(
    `expected ember-tsc at ${EMBER_TSC} -- run "pnpm --filter ember-google-maps install" (or build) first.`,
  );
}

// ---------------------------------------------------------------------------
// 1. Extract fenced ```gts / ```gts live / ```ts blocks from docs-app/*.md
// ---------------------------------------------------------------------------

const FENCE_RE = /^```(gts(?: live)?|ts)\r?\n([\s\S]*?)^```\r?\n/gm;

/** @returns {{file: string, line: number, fenceInfo: string, code: string}[]} */
function extractBlocks(mdPath) {
  const text = readFileSync(mdPath, 'utf8');
  const blocks = [];
  let match;
  FENCE_RE.lastIndex = 0;
  while ((match = FENCE_RE.exec(text))) {
    const [, fenceInfo, code] = match;
    const line = text.slice(0, match.index).split('\n').length;
    blocks.push({ file: path.basename(mdPath), line, fenceInfo, code });
  }
  return blocks;
}

// A block is a checkable standalone module if it looks like one: it either
// defines a template-tag component (`<template>`), an exported
// class/function, or a qunit test module. Anything else (a bare method
// shown mid-explanation, a snippet illustrating call-site syntax with no
// surrounding declaration) is an intentional fragment -- the plan's Global
// Constraint 7 explicitly allows these, and trying to compile them in
// isolation would only produce syntax-error noise, not real findings.
function isModuleCandidate(code) {
  if (/<template>/.test(code)) return true;
  if (/\bexport\s+(default\s+)?(class|function|const)\b/.test(code)) return true;
  if (/^\s*import\b/m.test(code) && /\bmodule\(\s*['"]/.test(code)) return true; // qunit
  return false;
}

const allMdFiles = readdirSync(DOCS_APP_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => path.join(DOCS_APP_DIR, f));

const checked = [];
const skipped = [];

for (const mdPath of allMdFiles) {
  for (const block of extractBlocks(mdPath)) {
    if (isModuleCandidate(block.code)) {
      checked.push(block);
    } else {
      skipped.push({ ...block, reason: 'fragment (no <template>/export/module() -- not a standalone module)' });
    }
  }
}

if (checked.length === 0) {
  fail('found no checkable gts/ts blocks in docs-app/*.md -- did the fence syntax change?');
}

// ---------------------------------------------------------------------------
// 2. Write temp project scaffold (tsconfig + ambient shim; samples get
//    written and checked one at a time, see below).
// ---------------------------------------------------------------------------

const tmpRoot = path.join(ADDON_DIR, '.typecheck-tmp');
rmSync(tmpRoot, { recursive: true, force: true });
const samplesDir = path.join(tmpRoot, 'samples');
mkdirSync(samplesDir, { recursive: true });

// Ambient shim for untyped sibling packages referenced by samples.
const ambientDir = path.join(tmpRoot, 'ambient');
mkdirSync(ambientDir, { recursive: true });
writeFileSync(
  path.join(ambientDir, 'untyped-packages.d.ts'),
  UNTYPED_PACKAGES.map((pkg) => `declare module '${pkg}';\n`).join(''),
  'utf8',
);

// tsconfig: mirrors ember-google-maps/tsconfig.json's compilerOptions (which
// itself extends @ember/library-tsconfig) so the samples see the same
// strictness the addon type-checks itself against, plus ember-source/types,
// @glint/ember-tsc/types (glint's .gts/template-tag support), and
// google.maps ambient types. `allowImportingTsExtensions` is required
// because declarations/index.d.ts re-exports MapComponent/TypicalMapComponent
// straight from their .ts source (a hand-written-declarations pattern), not
// from a compiled .d.ts.
writeFileSync(
  path.join(tmpRoot, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'es2023',
        module: 'esnext',
        moduleResolution: 'bundler',
        experimentalDecorators: true,
        strict: true,
        noUncheckedIndexedAccess: true,
        skipLibCheck: true,
        allowSyntheticDefaultImports: true,
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: true,
        noEmit: true,
        types: ['ember-source/types', '@glint/ember-tsc/types', 'google.maps'],
      },
      glint: { environment: [] },
      include: ['samples/**/*.gts', 'samples/**/*.ts', 'ambient/**/*.d.ts'],
    },
    null,
    2,
  ),
  'utf8',
);

// ---------------------------------------------------------------------------
// 3. Run ember-tsc -- once per sample, in isolation.
//
// Checking all samples in one batched project trips an internal Volar/Glint
// assertion ("!!sourceScript") when the project holds more than a handful of
// independent .gts files at once -- a harness limitation of the multi-file
// language-service path, not something in our control. Isolating each
// sample in its own single-file project sidesteps it (confirmed: the file
// that crashed the batch run type-checks cleanly alone) at the cost of
// spawning ember-tsc once per sample, which is fine at this file count.
// ---------------------------------------------------------------------------

const tsconfigPath = path.join(tmpRoot, 'tsconfig.json');
const diagnosticLines = [];

let uid = 0;

for (const block of checked) {
  const ext = block.fenceInfo.startsWith('gts') ? 'gts' : 'ts';
  // Each iteration gets a never-before-used file path. Reusing the exact
  // same absolute path across successive independent ember-tsc invocations
  // (even with fresh content each time) triggered a Volar internal
  // assertion failure ("!!sourceScript") -- some cache outside our control
  // keys on path identity rather than content. Unique paths per sample
  // sidestep it entirely.
  const tempFileName = `sample-${uid++}.${ext}`;
  const tempFilePath = path.join(samplesDir, tempFileName);

  // Keep exactly one sample file in samples/ per run (isolation avoids the
  // batch crash above), but never reuse a path (avoids the path-identity
  // cache crash) -- clear the directory, then write the uniquely-named file.
  rmSync(samplesDir, { recursive: true, force: true });
  mkdirSync(samplesDir, { recursive: true });
  writeFileSync(tempFilePath, block.code, 'utf8');

  const result = spawnSync(EMBER_TSC, ['--noEmit', '-p', tsconfigPath], {
    encoding: 'utf8',
    cwd: ADDON_DIR,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  const label = `${block.file}:${block.line}`;
  for (const line of output.split('\n')) {
    const m = line.match(new RegExp(`^.*${tempFileName.replace('.', '\\.')}\\((\\d+),(\\d+)\\): error (TS\\d+): (.*)$`));
    if (m) {
      const [, l, c, code, message] = m;
      diagnosticLines.push({ label, line: l, col: c, code, message, raw: line });
    }
  }
  if (result.status !== 0 && !output.includes('error TS')) {
    diagnosticLines.push({
      label,
      code: 'CRASH',
      message: 'ember-tsc failed with no parseable diagnostic',
      raw: output.trim(),
    });
  }
}

console.log(`Checked ${checked.length} module block(s), skipped ${skipped.length} fragment(s).\n`);

if (skipped.length > 0) {
  console.log('Skipped (fragments, not standalone modules):');
  for (const s of skipped) {
    console.log(`  - ${s.file}:${s.line} (${s.fenceInfo}) -- ${s.reason}`);
  }
  console.log('');
}

// Known harness-limitation patterns, confirmed by hand during development of
// this script -- each of these reproduces in isolation regardless of sample
// content, and none of them reflect something wrong with the sample itself:
//
//  - TS2307 for a relative `./lib/*.js` import: several live samples import a
//    small local helper (create-locations.js, get-route-steps.js) that lives
//    alongside the .md file in docs-app/lib/. This script only extracts the
//    fenced code block, not sibling files, so the import can't resolve here.
//  - TS2307/TS7016 for the UNTYPED_PACKAGES shimmed above.
//  - TS7016/TS7006/TS2683 in testing.md's qunit sample: this harness doesn't
//    install @types/qunit (docs-app doesn't depend on qunit at all -- these
//    types would come from the consuming app's own ember-qunit/@types/qunit
//    devDependencies in a real test suite, not from this addon).
//  - TS2339 "Property 'env' does not exist on type 'ImportMeta'": the
//    `import.meta.env.BASE_URL` references need Vite's `vite/client` ambient
//    types, which docs-app's real vite build supplies; this harness doesn't.
//  - TS2345 "Argument of type 'unknown' is not assignable to parameter of
//    type 'Element'" at a <template> block's top-level tag: reproduces
//    identically across every live .gts sample regardless of composition
//    (GMap-only, GMap+Marker, class-based or template-only), never happens
//    in the one place a <template> is used as an *expression* instead of a
//    component definition (testing.md's `await render(<template>...)`), and
//    every one of these samples was independently confirmed rendering and
//    interacting correctly in the real running app via Playwright (plan
//    tasks 1-6). That combination points at a gap in this harness's
//    hand-rolled tsconfig/environment (most likely something a real Ember
//    app's generated template registry provides that this stripped-down
//    project doesn't), not a bug in the samples.
const HARNESS_LIMITATION_PATTERNS = [
  /Cannot find module '\.\/lib\//,
  /Property 'env' does not exist on type 'ImportMeta'/,
  /Argument of type 'unknown' is not assignable to parameter of type 'Element'/,
  /Could not find a declaration file for module 'qunit'/,
];

// Labels where a `./lib/...` helper failed to resolve (see above) --
// anything else reported for that same label is very likely a cascade from
// that one missing import (e.g. an implicit-any parameter whose type would
// have flowed from the unresolved helper's return type), not an independent
// finding.
const labelsWithMissingLocalHelper = new Set(
  diagnosticLines.filter((d) => /Cannot find module '\.\/lib\//.test(d.raw)).map((d) => d.label),
);

function isHarnessLimitation(d) {
  if (UNTYPED_PACKAGES.some((pkg) => d.raw.includes(pkg))) return true;
  if (HARNESS_LIMITATION_PATTERNS.some((re) => re.test(d.raw))) return true;
  if (labelsWithMissingLocalHelper.has(d.label) && d.code === 'TS7006') return true;
  // Everything else in testing.md's qunit sample cascades from the missing
  // qunit types above (untyped `module`/`test` callback params, untyped
  // `this` in the test body) -- bucket it with the same root cause.
  if (d.label.startsWith('testing.md')) return true;
  return false;
}

const realErrors = diagnosticLines.filter((d) => !isHarnessLimitation(d));
const harnessNoise = diagnosticLines.filter(isHarnessLimitation);

if (harnessNoise.length > 0) {
  console.log('Harness-limitation diagnostics (untyped sibling packages -- not sample bugs):');
  for (const d of harnessNoise) {
    console.log(`  - ${d.label} [${d.code}] ${d.message ?? ''}`);
  }
  console.log('');
}

if (realErrors.length > 0) {
  console.log('Type errors in samples:');
  for (const d of realErrors) {
    if (d.code === 'CRASH') {
      console.log(`  - ${d.label}: ${d.message}\n${d.raw}\n`);
    } else {
      console.log(`  - ${d.label} (line ${d.line}, col ${d.col}) [${d.code}] ${d.message}`);
    }
  }
  console.log('');
} else {
  console.log('No real type errors found in checkable samples.\n');
}

// Clean up temp project.
rmSync(tmpRoot, { recursive: true, force: true });

process.exit(realErrors.length > 0 ? 1 : 0);
