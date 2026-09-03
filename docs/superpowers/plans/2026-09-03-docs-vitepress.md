# docs-app rebuild: VitePress + vite-plugin-ember Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `docs-app` package on VitePress + `vite-plugin-ember`
with a working scaffold, two ported content pages (`getting-started`,
`map`) with a real, live-rendered `ember-google-maps` map, Shiki code
highlighting, light custom branding, and a GitHub Pages deploy pipeline.

**Architecture:** VitePress static site generator, `vite-plugin-ember`
for compiling `.gjs` components inside markdown, three small
theme/config-level compatibility patches (proven working in an earlier
spike) standing in for gaps in `vite-plugin-ember`'s current Ember
runtime emulation. Nothing in `ember-google-maps` itself changes.

**Tech Stack:** VitePress ^1.5.0, vite-plugin-ember ^0.8.1,
ember-source ~6.12.0, ember-provide-consume-context 0.10.0,
@glimmer/component ^2.1.1, @glimmer/tracking ^1.1.2, pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-09-03-docs-vitepress-design.md`

## Global Constraints

- Pin `ember-source` to exactly `~6.12.0` in `docs-app`'s own
  `package.json` — do not add it to a workspace-wide catalog/override
  (this repo deliberately keeps `ember-source` per-package; see
  `pnpm-workspace.yaml`'s own comment).
- Pin `ember-provide-consume-context` to exactly `0.10.0` and
  `vite-plugin-ember` to exactly `^0.8.1` — these versions are what the
  three compatibility patches below were proven against. Do not upgrade
  either as part of this plan.
- `ember-google-maps` is consumed via `workspace:*` (not `link:` — that
  was only for the throwaway spike).
- Nothing in `ember-google-maps/src/**` changes in this plan. The
  `MapComponentManager.googleMapsApi` bypass (Fix 3) is a theme-level
  patch in `docs-app/.vitepress/theme/index.ts` only.
- `docs-app` must be added to `pnpm-workspace.yaml`'s `packages` list —
  it is not there yet on `main`.
- All page content ports from the salvaged source at
  `<scratchpad>/old-docs-app-salvage/` (the session's scratchpad
  directory — the task briefs below give exact relative paths). Port
  prose and code samples faithfully; do not invent new copy.

---

### Task 1: Scaffold the docs-app VitePress package

**Files:**
- Create: `docs-app/package.json`
- Create: `docs-app/.vitepress/config.ts`
- Create: `docs-app/index.md`
- Modify: `pnpm-workspace.yaml` (add `docs-app` to the `packages` list)

**Interfaces:**
- Produces: a working VitePress dev server at the package root,
  runnable via `pnpm --filter docs-app start`. Later tasks add
  `vite-plugin-ember` wiring to this same `config.ts`.

- [ ] **Step 1: Add `docs-app` to the workspace package list**

Edit `pnpm-workspace.yaml`'s `packages:` list to include `docs-app`
alongside the existing entries (`ember-google-maps`,
`ember-google-maps-directions`, `test-app-*`, `test-addon-*`).

- [ ] **Step 2: Create `docs-app/package.json`**

```json
{
  "name": "docs-app",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "description": "Documentation site for ember-google-maps.",
  "license": "MIT",
  "scripts": {
    "start": "vitepress dev .",
    "build": "vitepress build ."
  },
  "dependencies": {
    "@glimmer/component": "^2.1.1",
    "@glimmer/tracking": "^1.1.2",
    "ember-google-maps": "workspace:*",
    "ember-provide-consume-context": "0.10.0",
    "ember-source": "~6.12.0"
  },
  "devDependencies": {
    "vite-plugin-ember": "^0.8.1",
    "vitepress": "^1.5.0"
  },
  "engines": {
    "node": ">= 20.19.0"
  }
}
```

- [ ] **Step 3: Create a minimal `docs-app/.vitepress/config.ts`**

```ts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ember-google-maps',
  description: 'Documentation for ember-google-maps',
});
```

- [ ] **Step 4: Create a placeholder `docs-app/index.md`**

```md
# ember-google-maps

Documentation site under construction.
```

- [ ] **Step 5: Install and verify the dev server starts**

Run `pnpm install` from the repo root, then `pnpm --filter docs-app
start`. Confirm the CLI prints a local dev server URL and the page
loads with the placeholder content (check with a `curl` against the
printed URL, or a quick Playwright screenshot). Stop the dev server
before continuing.

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml docs-app/package.json docs-app/.vitepress/config.ts docs-app/index.md
git commit -m "Scaffold the docs-app VitePress package"
```

---

### Task 2: Wire vite-plugin-ember and the three compatibility fixes

**Files:**
- Modify: `docs-app/.vitepress/config.ts`
- Create: `docs-app/.vitepress/theme/index.ts`
- Create: `docs-app/smoke-test.md` (temporary — deleted at the end of this task)

**Interfaces:**
- Consumes: nothing from Task 1 beyond the scaffold.
- Produces: `docs-app/.vitepress/theme/index.ts`'s `enhanceApp`, which
  later tasks do not need to touch again. The `GoogleMapsApiService`
  class defined here is the one later live map examples depend on
  implicitly (it's registered globally via `setupEmber`).

This task reproduces three fixes already proven working in an earlier
spike (see the spec's "The three spike fixes" section) — this is a
faithful port of known-good code, not new design.

- [ ] **Step 1: Replace `docs-app/.vitepress/config.ts` with the full wiring**

```ts
import { defineConfig } from 'vitepress';
import vitePluginEmber, { emberFence } from 'vite-plugin-ember';

// Fix 1: vite-plugin-ember's shim for @embroider/macros's importSync
// throws unconditionally instead of attempting real resolution.
// ember-provide-consume-context's one importSync(...) call site is a
// macroCondition(dependencySatisfies('ember-source', '>=4.10.0')) branch
// that a real Embroider build would dead-code-eliminate into a plain
// static import. Our ember-source (~6.12.0) always satisfies that
// branch, so rewrite the call site to a plain static import ourselves.
function patchImportSync() {
  return {
    name: 'docs-patch-importsync',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.includes('ember-provide-consume-context')) return null;
      if (!code.includes("importSync('@ember/owner').getOwner")) return null;
      const patched = code
        .replace(
          "import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';",
          "import { getOwner as __patched_getOwner } from '@ember/owner';",
        )
        .replace(
          /let getOwner;\s*\nif \(macroCondition\(dependencySatisfies\('ember-source', '>=4\.10\.0'\)\)\) \{\s*\n\s*getOwner = importSync\('@ember\/owner'\)\.getOwner;\s*\n\} else \{\s*\n\s*getOwner = importSync\('@ember\/application'\)\.getOwner;\s*\n\}/,
          'let getOwner = __patched_getOwner;',
        );
      return { code: patched, map: null };
    },
  };
}

export default defineConfig({
  title: 'ember-google-maps',
  description: 'Documentation for ember-google-maps',
  vite: {
    plugins: [patchImportSync(), vitePluginEmber()],
    optimizeDeps: {
      exclude: ['ember-provide-consume-context'],
    },
    define: {
      __DOCS_GOOGLE_MAPS_KEY__: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY ?? ''),
    },
  },
  markdown: {
    config(md) {
      emberFence(md);
    },
  },
});
```

- [ ] **Step 2: Create `docs-app/.vitepress/theme/index.ts`**

```ts
import DefaultTheme from 'vitepress/theme';
import { setupEmber } from 'vite-plugin-ember/setup';
import { getOwner } from '@ember/owner';
import GoogleMapsApiServiceBase from 'ember-google-maps/services/google-maps-api';
import { MapComponentManager } from 'ember-google-maps/component-managers/map-component-manager';
import { initialize as initializeProvideConsumeContext } from 'ember-provide-consume-context/initializers/glimmer-overrides';
import type { Theme } from 'vitepress';

// The minimal owner vite-plugin-ember provides doesn't implement
// resolveRegistration('config:environment'), which the real
// _getConfig() calls. Override it directly instead.
class GoogleMapsApiService extends GoogleMapsApiServiceBase {
  _getConfig() {
    // eslint-disable-next-line no-undef
    return { key: __DOCS_GOOGLE_MAPS_KEY__, libraries: ['geometry', 'places', 'marker'] };
  }
}

// Fix 2: ember-provide-consume-context's context wiring is a plain
// function that monkeypatches @glimmer/runtime's VM, normally run as an
// Ember app initializer. vite-plugin-ember runs no initializers, so call
// it ourselves, once, before anything renders.
initializeProvideConsumeContext();

// Fix 3: @service injection on a plain (non-EmberObject) class -- like
// MapComponentManager -- goes through Ember's internal
// ComputedDescriptor/meta caching system, which silently fails here.
// Bypass it with a direct, public getOwner(this).lookup(...) call
// instead. This is a docs-only workaround; it does not touch
// ember-google-maps itself.
Object.defineProperty(MapComponentManager.prototype, 'googleMapsApi', {
  configurable: true,
  get() {
    return getOwner(this).lookup('service:google-maps-api');
  },
});

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    setupEmber(app, {
      services: {
        'google-maps-api': new GoogleMapsApiService(),
      },
    });
  },
} satisfies Theme;
```

- [ ] **Step 3: Create `docs-app/smoke-test.md` to prove the real addon renders**

```md
# Smoke test

\`\`\`gjs live
import { GMap, Marker } from 'ember-google-maps';

<template>
  <GMap @lat="51.5" @lng="-0.1" @zoom={{10}} style="width: 500px; height: 400px;">
    <Marker @lat="51.5" @lng="-0.1" />
  </GMap>
</template>
\`\`\`
```

- [ ] **Step 4: Verify with a real dev server + Playwright**

Run `pnpm --filter docs-app start`, navigate to `/smoke-test` with
Playwright, and confirm: no console errors other than an acceptable
`RefererNotAllowedMapError` (a Google API key referrer restriction, not
a code problem), and a screenshot shows a rendered Google Map. If any
other error appears, stop and diagnose — the three fixes above were
proven to work; a new error means something in this port differs from
the proven spike (check exact dependency versions against the Global
Constraints above first).

- [ ] **Step 5: Delete the smoke test and commit**

```bash
rm docs-app/smoke-test.md
git add docs-app/.vitepress/config.ts docs-app/.vitepress/theme/index.ts
git commit -m "Wire vite-plugin-ember and the three Ember compatibility fixes"
```

---

### Task 3: Validate @service injection on a plain Glimmer Component

**Files:**
- Create: `docs-app/service-check.md` (temporary — deleted at the end of this task)
- Create: (if the check fails) a note appended to
  `docs/superpowers/specs/2026-09-03-docs-vitepress-design.md` under a
  new `## Findings` heading

**Interfaces:**
- Consumes: the theme wiring from Task 2 (`setupEmber`'s services
  registration mechanism).
- Produces: a definitive answer, recorded in the spec, on whether plain
  `@service` injection works on ordinary Glimmer Components under
  `vite-plugin-ember`. Task 5 (the map page) reads this finding before
  deciding how to supply map style data.

This is a diagnostic task, not a feature — its deliverable is an
answer, not shipped code.

- [ ] **Step 1: Register a disposable test service**

Temporarily add to `docs-app/.vitepress/theme/index.ts`'s `setupEmber`
call (do not commit this addition — revert it in Step 4):

```ts
import Service from '@ember/service';

class TestService extends Service {
  value = 'service works';
}
```

and add `'test-service': new TestService()` to the `services` object
passed to `setupEmber`.

- [ ] **Step 2: Create `docs-app/service-check.md`**

```md
# Service injection check

\`\`\`gjs live
import Component from '@glimmer/component';
import { service } from '@ember/service';

class Check extends Component {
  @service testService;

  <template>
    result: {{this.testService.value}}
  </template>
}

<template><Check /></template>
\`\`\`
```

- [ ] **Step 3: Run it and read the result**

`pnpm --filter docs-app start`, navigate to `/service-check`, read the
rendered text. "result: service works" means `@service` works fine on
ordinary Glimmer Components (only `MapComponentManager` — a
non-EmberObject class — needed the Fix 3 bypass). Blank or "result: "
means the same failure mode as Fix 3 applies more broadly.

- [ ] **Step 4: Record the finding, revert the temporary test service, delete the check page**

Append to the spec file a `## Findings` section stating which outcome
occurred and its date. Revert the `TestService`/`test-service`
addition made in Step 1 (`docs-app/.vitepress/theme/index.ts` should
match Task 2's committed version exactly). Delete
`docs-app/service-check.md`.

- [ ] **Step 5: Commit the finding**

```bash
git add docs/superpowers/specs/2026-09-03-docs-vitepress-design.md
git commit -m "Record whether plain @service injection works under vite-plugin-ember"
```

---

### Task 4: Port the getting-started page

**Files:**
- Create: `docs-app/getting-started.md`
- Modify: `docs-app/index.md` (add a link, or redirect — see Step 3)

**Interfaces:**
- Consumes: nothing beyond the scaffold.
- Produces: a real content page. No live components on this page — both
  code samples are static.

Source content to port verbatim (prose and code), salvaged from the
original page, is at
`<session-scratchpad>/old-docs-app-salvage/app/templates/docs/getting-started.gjs`.
Read that file for the exact original wording before writing this task.

- [ ] **Step 1: Write `docs-app/getting-started.md`**

Port the two sections from the salvaged source — "Installation" (the
`ember install ember-google-maps` command in a static fenced code
block, language `sh`) and "Loading Google Maps" (the prose exactly as
written in the source, and the `ENV['ember-google-maps'] = {...}`
snippet in a static fenced code block, language `js`). Drop only the
`<DocsPageFooter />` wrapper — VitePress's built-in prev/next footer
(configured in Task 6) replaces it. Use a top-level `# Getting started`
heading; keep the original's `##### Installation` /
`##### Loading Google Maps` subheadings as `##`-level Markdown headings
(VitePress's sidebar/outline expects one `#` per page).

- [ ] **Step 2: Verify content renders and code blocks are Shiki-highlighted**

`pnpm --filter docs-app start`, navigate to `/getting-started`, confirm
both code blocks show syntax coloring (VitePress's default Shiki theme
applies automatically — no extra config needed) and the prose text
matches the salvaged source.

- [ ] **Step 3: Commit**

```bash
git add docs-app/getting-started.md
git commit -m "Port the getting-started page"
```

---

### Task 5: Port the map page (map-styles, google-docs link component, live map)

**Files:**
- Create: `docs-app/map-styles/dark.js`
- Create: `docs-app/map-styles/light.js`
- Create: `docs-app/components/google-docs.gjs`
- Create: `docs-app/map.md`

**Interfaces:**
- Consumes: the live-fence wiring from Task 2, and Task 3's finding on
  `@service` viability (informs whether map data is imported directly
  or looked up via a service — default to direct import unless Task 3
  proved service injection works and a reviewer prefers that style;
  direct import is simpler and sufficient either way).
- Produces: `docs-app/components/google-docs.gjs`, importable by future
  pages that link to Google's Maps JS API docs.

Source content to port verbatim, salvaged from the originals:
- `<session-scratchpad>/old-docs-app-salvage/app/map-styles/dark.js`
- `<session-scratchpad>/old-docs-app-salvage/app/map-styles/light.js`
- `<session-scratchpad>/old-docs-app-salvage/app/components/google-docs.gjs`
- `<session-scratchpad>/old-docs-app-salvage/app/templates/docs/map.gjs`
  (prose and live-example arguments)

- [ ] **Step 1: Copy the map style data files verbatim**

Copy `dark.js` and `light.js` from the salvage path into
`docs-app/map-styles/`, unchanged (each is a plain `export const
dark = [...]` / `export const light = [...]` array of Google Maps
styler objects — no logic to adapt).

- [ ] **Step 2: Port `google-docs.gjs` verbatim**

Copy the salvaged `google-docs.gjs` into `docs-app/components/`
unchanged — it's a plain `.gjs` component with no service dependencies,
so it needs no adaptation for `vite-plugin-ember`.

- [ ] **Step 3: Write `docs-app/map.md`**

Port the two prose sections from the salvaged `map.gjs` — "Creating a
map" (including its static `<GMap @lat="51.508530" @lng="-0.076132"
@zoom={{12}} />` code sample, the `.ember-google-map { width: 500px;
height: 500px; }` CSS sizing note, and the `lat`/`lng`
convenience-argument explanation, with a link to
`https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions`
where the original used a `<GoogleDocs>` component) and "Accessing the
map instance" (the `onceOnIdle` hook explanation). Below the prose, add
one live fence:

```md
\`\`\`gjs live
import { GMap, Marker } from 'ember-google-maps';
import { dark } from './map-styles/dark.js';

<template>
  <GMap
    @lat={{51.507568}}
    @lng={{-0.127762}}
    @zoom={{12}}
    @styles={{dark}}
    @minZoom={{10}}
    @panControl={{false}}
    @streetViewControl={{false}}
    style="width: 100%; height: 400px;"
  />
</template>
\`\`\`
```

(This drops the `mapData` service indirection from the original in
favor of a direct import, per this task's Interfaces note — the
original service only ever wrapped this same static data.)

- [ ] **Step 4: Verify with a real dev server + Playwright**

`pnpm --filter docs-app start`, navigate to `/map`, confirm the prose
renders, and take a screenshot confirming a real, dark-styled Google
Map renders in the live example (same acceptable-error caveat as Task
2 Step 4 — a `RefererNotAllowedMapError` for `localhost` is expected
and fine).

- [ ] **Step 5: Commit**

```bash
git add docs-app/map-styles docs-app/components docs-app/map.md
git commit -m "Port the map page with a live-rendered map"
```

---

### Task 6: Sidebar navigation and light brand styling

**Files:**
- Modify: `docs-app/.vitepress/config.ts`
- Create: `docs-app/.vitepress/theme/custom.css`
- Modify: `docs-app/.vitepress/theme/index.ts`
- Modify: `docs-app/index.md`

**Interfaces:**
- Consumes: the two pages from Tasks 4 and 5.
- Produces: a real sidebar/nav (`themeConfig.sidebar`), VitePress's
  built-in prev/next page footer wired via the same sidebar list, and
  light brand-color overrides. This closes out the "drop the
  hand-rolled nav/footer components" decision from the spec.

- [ ] **Step 1: Add `themeConfig` to `docs-app/.vitepress/config.ts`**

Add to the `defineConfig({...})` call (alongside the existing `vite`
and `markdown` keys):

```ts
themeConfig: {
  nav: [{ text: 'Docs', link: '/getting-started' }],
  sidebar: [
    {
      text: 'Documentation',
      items: [
        { text: 'Getting started', link: '/getting-started' },
        { text: 'Map', link: '/map' },
      ],
    },
  ],
  socialLinks: [
    { icon: 'github', link: 'https://github.com/acorncom/ember-google-maps' },
  ],
},
```

- [ ] **Step 2: Create `docs-app/.vitepress/theme/custom.css`**

```css
:root {
  --vp-c-brand-1: #2c5a71;
  --vp-c-brand-2: #29768a;
  --vp-c-brand-3: #193341;
  --vp-c-brand-soft: rgba(44, 90, 113, 0.14);
}
```

(Colors drawn from the original site's own dark map style palette —
`map-styles/dark.js`'s water/landscape colors — for a subtle visual
callback; adjust here if a reviewer prefers different tones. This is
the only CSS in the package.)

- [ ] **Step 3: Import the custom CSS in the theme**

Add `import './custom.css';` as the first line of
`docs-app/.vitepress/theme/index.ts`.

- [ ] **Step 4: Replace the placeholder `docs-app/index.md` with real landing content**

```md
---
layout: home
hero:
  name: ember-google-maps
  tagline: Reactive Google Maps components for Ember
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/acorncom/ember-google-maps
---
```

- [ ] **Step 5: Verify visually**

`pnpm --filter docs-app start`, screenshot the home page, the sidebar
on `/getting-started` and `/map`, and confirm prev/next navigation
between the two pages works (VitePress infers this from the `sidebar`
list automatically).

- [ ] **Step 6: Commit**

```bash
git add docs-app/.vitepress/config.ts docs-app/.vitepress/theme/custom.css docs-app/.vitepress/theme/index.ts docs-app/index.md
git commit -m "Add sidebar navigation and light brand styling"
```

---

### Task 7: GitHub Pages deploy pipeline

**Files:**
- Create: `.github/workflows/docs.yml`

**Interfaces:**
- Consumes: `docs-app`'s `build` script (Task 1, `vitepress build .`,
  outputting to `docs-app/.vitepress/dist` by VitePress's own default).
- Produces: nothing consumed by later tasks — this is the final
  integration point.

- [ ] **Step 1: Create `.github/workflows/docs.yml`**

```yaml
name: Deploy docs

on:
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - 'docs-app/**'
      - 'ember-google-maps/**'
      - 'ember-google-maps-directions/**'
      - '.github/workflows/docs.yml'

concurrency:
  group: deploy-docs
  cancel-in-progress: true

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: wyvox/action-setup-pnpm@v2
        with:
          node-version: '22'
      - name: Build the addon packages
        run: >-
          pnpm
          --filter ember-google-maps
          --filter ember-google-maps-directions
          build
      - name: Build docs-app
        run: pnpm --filter docs-app build
        env:
          GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_DOCS_API_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs-app/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

(Identical in shape to the deploy workflow proven in the earlier
Embroider-based attempt — only the `upload-pages-artifact` `path`
changes, to VitePress's own output directory.)

- [ ] **Step 2: Verify the build step locally**

Run `pnpm --filter ember-google-maps --filter ember-google-maps-directions build`
then `pnpm --filter docs-app build` (with `GOOGLE_MAPS_API_KEY` unset is
fine — Task 2's `_getConfig()` defaults to an empty string). Confirm
the command exits 0 and `docs-app/.vitepress/dist/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/docs.yml
git commit -m "Add the GitHub Pages deploy workflow for docs-app"
```

---

### Task 8: Final visual verification

**Files:** none (verification only)

**Interfaces:**
- Consumes: everything from Tasks 1-7.
- Produces: a pass/fail verification report for the whole-branch
  review.

- [ ] **Step 1: Start the dev server and drive it with Playwright**

`pnpm --filter docs-app start`. Screenshot: the home page,
`/getting-started` (confirm both code blocks and prose), `/map`
(confirm the live map renders with the dark style, sidebar shows both
pages, prev/next navigation present). Capture the browser console for
each page; the only acceptable message is a `RefererNotAllowedMapError`
tied to the `localhost` referrer.

- [ ] **Step 2: Run the production build end-to-end**

`pnpm --filter docs-app build`, then serve `docs-app/.vitepress/dist`
locally (e.g. `npx serve docs-app/.vitepress/dist` or VitePress's own
`vitepress preview .` run from `docs-app/`) and repeat the same checks
against the built output, not just the dev server.

- [ ] **Step 3: Report**

Summarize pass/fail for each page and the production build in a final
message — this is the deliverable the whole-branch review reads before
signing off.
