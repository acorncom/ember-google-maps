# docs-app Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a new `docs-app/` package that builds, deploys to GitHub Pages, and serves two fully working, content-parity-ported pages (getting-started, map) — proving the whole toolchain (workspace wiring, routing/layout pattern, live Google Maps demos, deploy pipeline) before the remaining 17 pages get mechanically ported in a follow-up plan.

**Architecture:** A private, unpublished Ember app in the pnpm workspace, built the same way as `test-app-basic` (Vite + `@embroider/vite`, `classicEmberSupport()`), consuming `ember-google-maps` as a real workspace dependency so every demo runs the addon's actual current source. Pages are `.gjs` route templates with the class co-located in the template file (the same pattern the addon's own components use) — no separate Controller files. Shared cross-page state (the London map center, map styles, the nav link list) lives in a service and a couple of plain modules, injected or imported by each page.

**Tech Stack:** Ember (Vite/Embroider v2 app blueprint, matching `test-app-basic`), `.gjs` template-tag components, `ember-google-maps` (workspace dep), GitHub Actions + GitHub's native Pages deployment.

**Spec:** `docs/superpowers/specs/2026-09-03-docs-app-design.md`

## Global Constraints

- Ember.js 5.12+ / Node 18+ (the addon's support floor — `docs-app` must not go below it).
- `.gjs` only, no TypeScript, no separate Controller files (co-locate class + `<template>` in the route template, matching the rest of the v2 addon's authoring style).
- No visual redesign — reuse v1's layout structure and class names as a starting point (spec non-goal). Full Bootstrap-based styling is explicitly deferred past this plan (see Task 3); this plan ships a small hand-written stand-in stylesheet covering only the classes the ported pages actually use.
- No test suite for `docs-app` itself — verification is `lint` + `build` + manual browser check in the dev server (spec: "A build/lint check in CI is sufficient"). Do not invent a qunit suite.
- The code-snippet display mechanism (`ember-code-snippet` vs. a modern replacement) is an explicit **open decision for the user**, out of scope for this plan. Pages needing code display use plain `<pre><code>` blocks with real, hardcoded snippet text for now.
- `docs-app` is its own `pnpm-workspace.yaml` entry (the `test-app-*`/`test-addon-*` globs won't match it).
- Deployed site's Google Maps API key must NOT be the test suite's localhost-only key — it needs its own domain-restricted key, stored as its own GitHub secret.

---

### Task 1: Scaffold the docs-app package

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `.github/workflows/ci.yml`
- Create: `docs-app/package.json`
- Create: `docs-app/vite.config.mjs`
- Create: `docs-app/app/app.js`
- Create: `docs-app/app/router.js`
- Create: `docs-app/app/templates/index.gjs`
- Create: `docs-app/app/config/environment.js`
- Create: `docs-app/config/environment.js`
- Create: `docs-app/.gitignore`

**Interfaces:**
- Produces: a buildable, lintable Ember app at `docs-app/` with one working route (`index`), matching `test-app-basic`'s toolchain (Vite + `@embroider/vite`).

- [ ] **Step 1: Add the workspace entry**

Edit `pnpm-workspace.yaml`, add `docs-app` to the `packages` list (it needs its own line — no glob covers it):

```yaml
packages:
  - ember-google-maps
  - ember-google-maps-directions
  - docs-app
  - test-app-*
  - test-addon-*
```

- [ ] **Step 2: Write the package manifest**

Create `docs-app/package.json`. This trims `test-app-basic`'s manifest down to what an app with no test suite and no data layer needs — no `@warp-drive/*`, no `qunit`/`ember-qunit`/`testem`/`@ember/test-helpers`, no `ember-welcome-page`:

```json
{
  "name": "docs-app",
  "version": "0.0.0",
  "private": true,
  "description": "Documentation site for ember-google-maps.",
  "repository": "",
  "license": "MIT",
  "author": "",
  "exports": {
    "./*": "./app/*"
  },
  "directories": {
    "doc": "doc"
  },
  "scripts": {
    "build": "vite build",
    "format": "prettier . --cache --write",
    "lint": "concurrently \"pnpm:lint:*(!fix)\" --names \"lint:\" --prefixColors auto",
    "lint:css": "stylelint \"**/*.css\"",
    "lint:css:fix": "concurrently \"pnpm:lint:css -- --fix\"",
    "lint:fix": "concurrently \"pnpm:lint:*:fix\" --names \"fix:\" --prefixColors auto && pnpm format",
    "lint:format": "prettier . --cache --check",
    "lint:hbs": "ember-template-lint .",
    "lint:hbs:fix": "ember-template-lint . --fix",
    "lint:js": "eslint . --cache",
    "lint:js:fix": "eslint . --fix",
    "start": "vite"
  },
  "dependencies": {
    "ember-google-maps": "workspace:*"
  },
  "devDependencies": {
    "@babel/core": "^7.29.7",
    "@babel/eslint-parser": "^7.29.7",
    "@babel/plugin-proposal-decorators": "^8.0.2",
    "@babel/plugin-transform-runtime": "^7.29.7",
    "@babel/runtime": "^7.29.7",
    "@ember/optional-features": "^3.0.0",
    "@ember/string": "^4.0.1",
    "@embroider/compat": "^4.1.20",
    "@embroider/config-meta-loader": "^1.0.0",
    "@embroider/core": "^4.6.1",
    "@embroider/macros": "^1.20.4",
    "@embroider/router": "^3.0.6",
    "@embroider/vite": "^1.7.7",
    "@eslint/js": "^9.39.4",
    "@glimmer/component": "^2.1.1",
    "@rollup/plugin-babel": "^7.1.0",
    "babel-plugin-ember-template-compilation": "^4.0.0",
    "concurrently": "^9.2.3",
    "decorator-transforms": "^2.3.2",
    "ember-auto-import": "^2.10.0",
    "ember-cli": "~7.1.0",
    "ember-cli-babel": "^8.3.1",
    "ember-cli-htmlbars": "^7.0.1",
    "ember-load-initializers": "^3.0.1",
    "ember-page-title": "^9.0.3",
    "ember-resolver": "^13.2.0",
    "ember-source": "~6.12.0",
    "ember-template-lint": "^7.9.3",
    "eslint": "^9.39.4",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-ember": "^12.7.5",
    "eslint-plugin-n": "^17.24.0",
    "globals": "^16.5.0",
    "prettier": "^3.8.4",
    "prettier-plugin-ember-template-tag": "^2.1.6",
    "stylelint": "^17.13.0",
    "stylelint-config-standard": "^40.0.0",
    "vite": "^8.1.0"
  },
  "engines": {
    "node": ">= 18"
  },
  "ember": {
    "edition": "octane"
  }
}
```

- [ ] **Step 3: Write the Vite config**

Create `docs-app/vite.config.mjs`, identical in shape to `test-app-basic`'s:

```js
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
```

- [ ] **Step 4: Write the app boot files**

Create `docs-app/app/app.js`:

```js
import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'docs-app/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(App, config.modulePrefix, compatModules);
```

Create `docs-app/app/router.js` — one route for now, proving the toolchain builds:

```js
import EmberRouter from '@embroider/router';
import config from 'docs-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '/' });
});
```

Create `docs-app/app/templates/index.gjs`:

```gjs
<template>
  <h1>ember-google-maps docs</h1>
</template>
```

- [ ] **Step 5: Write the environment config**

Create `docs-app/app/config/environment.js`:

```js
import loadConfigFromMeta from '@embroider/config-meta-loader';
import { assert } from '@ember/debug';

const config = loadConfigFromMeta('docs-app');

assert(
  'config is not an object',
  typeof config === 'object' && config !== null,
);
assert(
  'modulePrefix was not detected on your config',
  'modulePrefix' in config && typeof config.modulePrefix === 'string',
);
assert(
  'locationType was not detected on your config',
  'locationType' in config && typeof config.locationType === 'string',
);
assert(
  'rootURL was not detected on your config',
  'rootURL' in config && typeof config.rootURL === 'string',
);
assert(
  'APP was not detected on your config',
  'APP' in config && typeof config.APP === 'object',
);

export default config;
```

Create `docs-app/config/environment.js`. `rootURL: '/'` assumes a custom domain (or a user/org root Pages site); if the deployed site ends up living at `https://acorncom.github.io/ember-google-maps/` instead, this needs to become `/ember-google-maps/` — flagged here, not solved now, since the domain is still TBD:

```js
'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'docs-app',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {},
    },

    APP: {},

    // ember-google-maps config. GOOGLE_MAPS_API_KEY here must be a
    // domain-restricted key for the deployed docs site's own domain — NOT
    // the test suite's localhost-only key. See Task 6.
    'ember-google-maps': {
      key: process.env.GOOGLE_MAPS_API_KEY,
      libraries: ['places', 'marker', 'geometry'],
    },
  };

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
```

- [ ] **Step 6: Add a `.gitignore`**

Create `docs-app/.gitignore`:

```
/dist/
/node_modules/
/tmp/
.eslintcache
```

- [ ] **Step 7: Install and verify the build**

```bash
pnpm install
pnpm --filter docs-app build
```

Expected: build succeeds, `docs-app/dist/index.html` exists.

- [ ] **Step 8: Wire lint into CI and verify**

Edit `.github/workflows/ci.yml`, extend the `lint` job's filter list:

```yaml
      - run: pnpm --filter ember-google-maps --filter test-app-basic --filter docs-app lint
```

Run locally:

```bash
pnpm --filter docs-app lint
```

Expected: passes (or only pre-existing blueprint-default warnings — fix any real errors before moving on).

- [ ] **Step 9: Commit**

```bash
git add pnpm-workspace.yaml .github/workflows/ci.yml docs-app
git commit -m "Scaffold the docs-app package"
```

---

### Task 2: Port the map-data service, map styles, and route-steps helper

**Files:**
- Create: `docs-app/app/services/map-data.js`
- Create: `docs-app/app/map-styles/dark.js`
- Create: `docs-app/app/map-styles/light.js`
- Create: `docs-app/app/helpers/get-route-steps.js`

**Interfaces:**
- Consumes: `ember-google-maps`'s `google-maps-api` service (injected as `googleMapsApi`).
- Produces: `MapDataService` — injectable as `@service mapData`, exposing `london` (`{lat, lng}`), `primaryMapStyle`/`lightStyle` (`google.maps.MapTypeStyle[]`), and `google` (a promise resolving to the loaded `google` global, delegated from `googleMapsApi.google`). `getRouteSteps` — a template helper, used by the directions page in the follow-up plan (not consumed yet in this plan, but ported now alongside its map-styles siblings since it's equally small and dependency-free).

This task's modules aren't wired into any template yet — Task 5 is the first consumer. Verification here is lint + build only.

- [ ] **Step 1: Port the map style arrays**

Create `docs-app/app/map-styles/dark.js` (byte-for-byte port of v1's `docs/app/map-styles/dark.js` — a plain data array, no framework coupling):

```js
export const dark = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#193341' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#2c5a71' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#29768a' }, { lightness: -37 }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#406d80' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#406d80' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      { visibility: 'on' },
      { color: '#3e606f' },
      { weight: 2 },
      { gamma: 0.84 },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ weight: 0.6 }, { color: '#1a3541' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#2c5a71' }],
  },
];

export default dark;
```

Create `docs-app/app/map-styles/light.js`:

```js
export const light = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#545677' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#fffbf7' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#545677' }, { lightness: 40 }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }, { color: '#406d80' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#545677' }],
  },
  {
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      { visibility: 'off' },
      { weight: 0.6 },
      { color: '#1a3541' },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
];

export default light;
```

- [ ] **Step 2: Port the map-data service**

Create `docs-app/app/services/map-data.js`. Trimmed from v1: this plan's two pages (getting-started, map) only need `london` and the styles — `createLocations()`/`londonLocations` (the 42-random-marker generator) is added in the follow-up plan when the markers page is ported, so it isn't included here (no unused, unexercised code):

```js
import Service from '@ember/service';
import { service } from '@ember/service';
import darkStyle from '../map-styles/dark.js';
import lightStyle from '../map-styles/light.js';

export default class MapDataService extends Service {
  @service googleMapsApi;

  get google() {
    return this.googleMapsApi.google;
  }

  london = { lat: 51.507568, lng: -0.127762 };
  primaryMapStyle = darkStyle;
  lightStyle = lightStyle;
}
```

- [ ] **Step 3: Port the route-steps helper**

Create `docs-app/app/helpers/get-route-steps.js` (byte-for-byte port — the directions page in the follow-up plan needs it, and it's dependency-free):

```js
import { helper } from '@ember/component/helper';

export function getRouteSteps([directions]) {
  try {
    return directions.routes[0].legs[0].steps;
  } catch (error) {
    return [];
  }
}

export default helper(getRouteSteps);
```

- [ ] **Step 4: Verify**

```bash
pnpm --filter docs-app lint
pnpm --filter docs-app build
```

Expected: both pass. Nothing imports these modules yet, so the build proves syntax only — that's expected at this stage.

- [ ] **Step 5: Commit**

```bash
git add docs-app/app/services docs-app/app/map-styles docs-app/app/helpers
git commit -m "Port the map-data service, map styles, and route-steps helper"
```

---

### Task 3: Build the shared layout components and stylesheet

**Files:**
- Create: `docs-app/app/components/nav-main.gjs`
- Create: `docs-app/app/components/footer-main.gjs`
- Create: `docs-app/app/components/doc-tip.gjs`
- Create: `docs-app/app/components/doc-danger.gjs`
- Create: `docs-app/app/components/google-docs.gjs`
- Create: `docs-app/app/components/docs-page-footer.gjs`
- Create: `docs-app/app/lib/docs-links.js`
- Create: `docs-app/app/styles/app.css`

**Interfaces:**
- Consumes: nothing from earlier tasks (these are presentational, framework-only components) except `docs-links.js`, which `DocsPageFooter` reads.
- Produces: `NavMain` (`@links` arg — array of `{title, path}`), `FooterMain` (no args), `DocTip`/`DocDanger` (yield block content, optional `@badgeText` arg), `GoogleDocs` (`@section` required, `@type` optional `'reference'|'guide'`, yields link text), `DocsPageFooter` (no args — reads the router service itself and looks up the next page from `DOCS_LINKS`), `DOCS_LINKS` (exported array of `{title, path, text}`, consumed by `NavMain` and `DocsPageFooter`).

Like Task 2, these aren't mounted into the route tree yet — Task 4 is the first to render them. Verification here is lint + build.

- [ ] **Step 1: Write the shared nav-link data**

Create `docs-app/app/lib/docs-links.js`. Scoped to exactly the pages that exist by the end of this plan — the follow-up plan appends an entry here each time it ports a page, so `NavMain` never links to a route that doesn't exist yet:

```js
export const DOCS_LINKS = [
  { title: 'Getting started', path: 'docs.getting-started' },
  {
    title: 'Map',
    path: 'docs.map',
    text: "That's it. You're now ready to create a map.",
  },
];
```

- [ ] **Step 2: Port NavMain and FooterMain**

Create `docs-app/app/components/nav-main.gjs` (ported from v1's `.hbs`-only component — no class needed, `@links` is just iterated):

```gjs
import { LinkTo } from '@ember/routing';

<template>
  <nav class="sticky-top sticky-top-offset">
    <ul class="nav flex-md-column justify-content-center">
      {{#each @links as |l|}}
        <li class="nav-item">
          <LinkTo @route={{l.path}} class="nav-link">{{l.title}}</LinkTo>
        </li>
      {{/each}}
    </ul>
  </nav>
</template>
```

Create `docs-app/app/components/footer-main.gjs` (ported verbatim — the CI/Ember Observer badge URLs already point at `acorncom/ember-google-maps`, no changes needed):

```gjs
<template>
  <footer>
    © 2017-2024 <a href="https://github.com/sandydoo">Sander Melnikov</a>,
    2024-present <a href="https://github.com/acorncom">David Baker</a>
    <br />
    Licensed under
    <a href="https://github.com/acorncom/ember-google-maps/blob/main/LICENSE">MIT</a>.
    <br />
    Follow the addon on
    <a href="https://github.com/acorncom/ember-google-maps">GitHub</a>.
    <br />

    <div class="shields">
      <a
        href="https://github.com/acorncom/ember-google-maps/actions?query=workflow%3ACI"
        title="GitHub Actions CI status"
      >
        <img
          class="shield-inline"
          src="https://github.com/acorncom/ember-google-maps/workflows/CI/badge.svg"
          alt="GitHub Actions CI status"
        />
      </a>

      <a
        href="https://emberobserver.com/addons/ember-google-maps"
        alt="Ember Observer score"
      >
        <img
          class="shield-inline"
          src="https://emberobserver.com/badges/ember-google-maps.svg"
          alt="Ember Observer score"
        />
      </a>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: Port DocTip, DocDanger, GoogleDocs**

Create `docs-app/app/components/doc-tip.gjs` (co-locates v1's `doc-tip.js` + `.hbs`):

```gjs
import Component from '@glimmer/component';

export default class DocTip extends Component {
  defaultBadgeText = 'Tip';
  defaultCardClassNames = 'doc-tip';
  defaultBadgeClassNames = 'badge-primary';

  get cardClassNames() {
    return this.args.cardClassNames ?? this.defaultCardClassNames;
  }

  get badgeClassNames() {
    return this.args.badgeClassNames ?? this.defaultBadgeClassNames;
  }

  get badgeText() {
    return this.args.badgeText ?? this.defaultBadgeText;
  }

  <template>
    <div class="doc-card {{this.cardClassNames}}">
      <p class="m-0">
        {{#if this.badgeText}}
          <span class="badge {{this.badgeClassNames}}">{{this.badgeText}}</span>
        {{/if}}
        {{yield}}
      </p>
    </div>
  </template>
}
```

Create `docs-app/app/components/doc-danger.gjs` (v1 subclassed `DocTip` in JS and reused its template via classic component-class resolution; `.gjs` has no such implicit template inheritance, so this version composes `DocTip` instead — same visual result, no framework magic required):

```gjs
import DocTip from './doc-tip.gjs';

<template>
  <DocTip
    @cardClassNames="doc-danger"
    @badgeClassNames="badge-danger"
    @badgeText={{if @badgeText @badgeText "Warning"}}
    ...attributes
  >
    {{yield}}
  </DocTip>
</template>
```

Create `docs-app/app/components/google-docs.gjs`:

```gjs
import Component from '@glimmer/component';

const REFERENCE_URL =
  'https://developers.google.com/maps/documentation/javascript/reference/';
const GUIDE_URL = 'https://developers.google.com/maps/documentation/javascript/';

export default class GoogleDocs extends Component {
  get type() {
    return this.args.type ?? 'reference';
  }

  get baseUrl() {
    return this.type === 'reference' ? REFERENCE_URL : GUIDE_URL;
  }

  get href() {
    return this.baseUrl + this.args.section;
  }

  <template>
    <a
      href={{this.href}}
      rel="noopener noreferrer nofollow"
      target="_blank"
      ...attributes
    >{{yield}}</a>
  </template>
}
```

- [ ] **Step 4: Build DocsPageFooter (replaces v1's controller-computed `nextPage` + `<LinkToNext>`)**

Create `docs-app/app/components/docs-page-footer.gjs`. In v1, `nextPage` was a controller getter derived from `links.indexOf(currentPage)`; since pages no longer have controllers, this component does that lookup itself from the injected router service:

```gjs
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import { DOCS_LINKS } from '../lib/docs-links.js';

export default class DocsPageFooter extends Component {
  @service router;

  get currentPage() {
    return DOCS_LINKS.find((l) => l.path === this.router.currentRouteName);
  }

  get nextPage() {
    let index = DOCS_LINKS.indexOf(this.currentPage);
    return DOCS_LINKS[index + 1];
  }

  <template>
    {{#if this.nextPage}}
      <p>{{this.nextPage.text}}</p>
      <LinkTo @route={{this.nextPage.path}} class="btn btn-primary">
        {{this.nextPage.title}} ›
      </LinkTo>
    {{/if}}
  </template>
}
```

- [ ] **Step 5: Write the stand-in stylesheet**

Create `docs-app/app/styles/app.css`. This is a small hand-written replacement for v1's Bootstrap-4-based `app.scss` — real, working CSS covering exactly the classes the layout and this plan's two pages use, not a Bootstrap port. Full Bootstrap-based visual parity is explicit follow-up work (see Task 3 note in the spec), not this plan:

```css
:root {
  color-scheme: light dark;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
}

body {
  margin: 0;
}

.container-fluid {
  padding: 0 1.5rem;
}

.d-md-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.col-sidebar {
  flex: 0 0 200px;
}

.flex-1 {
  flex: 1 1 0%;
  min-width: 0;
}

.sticky-top {
  position: sticky;
  top: 0;
}

.sticky-top-offset {
  top: 1rem;
}

.nav {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0.25rem 0;
}

.nav-link {
  text-decoration: none;
}

.nav-link.active {
  font-weight: 600;
}

.doc-card {
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
}

.doc-tip {
  border-color: #4a90d9;
}

.doc-danger {
  border-color: #d94a4a;
}

.badge {
  display: inline-block;
  padding: 0.15em 0.5em;
  border-radius: 0.25rem;
  font-size: 0.75em;
  font-weight: 600;
  color: white;
}

.badge-primary {
  background: #4a90d9;
}

.badge-danger {
  background: #d94a4a;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-primary {
  background: #4a90d9;
  color: white;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.col-lg-7 {
  flex: 1 1 55%;
}

.col-lg-5 {
  flex: 1 1 35%;
}

.sticky-map {
  align-self: flex-start;
}

.ember-google-map,
.ember-google-map-responsive {
  width: 100%;
  height: 400px;
}

.shields {
  margin-top: 0.5rem;
}

.shield-inline {
  height: 20px;
  vertical-align: middle;
  margin-right: 0.5rem;
}
```

- [ ] **Step 6: Verify**

```bash
pnpm --filter docs-app lint
pnpm --filter docs-app build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add docs-app/app/components docs-app/app/lib docs-app/app/styles
git commit -m "Build the shared docs-app layout components and stylesheet"
```

---

### Task 4: Wire up the site shell and port the getting-started page

**Files:**
- Modify: `docs-app/app/router.js`
- Create: `docs-app/app/templates/docs.gjs`
- Create: `docs-app/app/templates/docs/index.js`
- Create: `docs-app/app/templates/docs/getting-started.gjs`
- Create: `docs-app/app/templates/not-found.gjs`
- Modify: `docs-app/app/app.js` (import the stylesheet)

**Interfaces:**
- Consumes: `NavMain`, `FooterMain`, `DocsPageFooter` (Task 3), `DOCS_LINKS` (Task 3).
- Produces: the `docs` parent route + layout, the site's first real page, and the `/` → `docs.getting-started` redirect. This is the first task with something to look at in a browser.

- [ ] **Step 1: Restructure the router**

Replace the contents of `docs-app/app/router.js`:

```js
import EmberRouter from '@embroider/router';
import config from 'docs-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('not-found', { path: '/*path' });
  this.route('index', { path: '/' });
  this.route('docs', function () {
    this.route('getting-started');
  });
});
```

An Ember route template can't redirect on its own — that needs a route class. Delete `docs-app/app/templates/index.gjs` (from Task 1) and create `docs-app/app/routes/index.js` instead:

```js
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('docs.getting-started');
  }
}
```

Create `docs-app/app/templates/not-found.gjs`:

```gjs
import { LinkTo } from '@ember/routing';

<template>
  <h1>Page not found</h1>
  <p>
    <LinkTo @route="docs.getting-started">Back to the docs</LinkTo>
  </p>
</template>
```

- [ ] **Step 2: Build the docs layout**

Create `docs-app/app/templates/docs.gjs`:

```gjs
import NavMain from '../components/nav-main.gjs';
import FooterMain from '../components/footer-main.gjs';
import { DOCS_LINKS } from '../lib/docs-links.js';

<template>
  <div class="container-fluid">
    <div class="d-md-flex">
      <div class="col-sidebar">
        <NavMain @links={{DOCS_LINKS}} />
      </div>
      <div class="col flex-1">
        <main>
          {{outlet}}
        </main>
        <FooterMain />
      </div>
    </div>
  </div>
</template>
```

Create `docs-app/app/templates/docs/index.js` (the `docs` parent route needs an index child or visiting `/docs` bare 404s — redirect it the same way `/` does):

```js
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DocsIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('docs.getting-started');
  }
}
```

The `beforeModel` redirect still needs a template to resolve against on first paint. Create `docs-app/app/templates/docs/index.gjs`:

```gjs
<template></template>
```

- [ ] **Step 3: Port the getting-started page**

Create `docs-app/app/templates/docs/getting-started.gjs`. Ported from v1's `docs/app/templates/docs/getting-started.hbs`: `<CodeSnippet @name="installation.sh">`/`<CodeSnippet @name="config.js">` become plain `<pre><code>` blocks with the same real snippet text (the code-snippet display mechanism is deferred — see Global Constraints), and the `<LinkTo @route="docs.advanced">` stays a dead link until the follow-up plan ports that page — replace it with plain text for now rather than link to a route that doesn't exist:

```gjs
import DocsPageFooter from '../../components/docs-page-footer.gjs';

<template>
  <div class="col-text">
    <section>
      <h5>Installation</h5>

      <pre><code>ember install ember-google-maps</code></pre>
    </section>
    <section>
      <h5>Loading Google Maps</h5>

      <p>You can configure the options used for loading the Google Maps API
        in your app's <var>config/environment.js</var>. The
        <var>key</var> option is <b>required</b>. Everything else is
        optional, however, I strongly suggest explicitly setting the
        language and version options to avoid any nasty surprises.</p>

      <p>As your app is built, these options will be used to generate the
        URL for the API. The API is automatically loaded — on-demand — only
        when it is needed.</p>

      <pre><code>ENV['ember-google-maps'] = {
  key: process.env.GOOGLE_MAPS_API_KEY, // Using .env files in this example
  language: 'en',
  region: 'GB',
  protocol: 'https',
  version: '3.55',
  libraries: ['geometry', 'places'], // Optional libraries
};</code></pre>

      <p>If your requirements are more complex and statically building the
        URL is too restrictive, you can always override the URL at runtime
        (the "advanced" page covers this — coming soon).</p>
    </section>

    <DocsPageFooter />
  </div>
</template>
```

- [ ] **Step 4: Import the stylesheet**

Edit `docs-app/app/app.js`, add near the top:

```js
import './styles/app.css';
```

- [ ] **Step 5: Verify in the browser**

```bash
pnpm --filter docs-app start
```

Visit `http://localhost:4200/`. Expected: redirects to `/docs/getting-started`, shows the nav sidebar with a "Getting started" link, the page content with two code blocks, and the footer with working GitHub/Ember Observer badges. Visit a nonsense path (e.g. `/nope`) — expected: the not-found page renders.

- [ ] **Step 6: Lint and build**

```bash
pnpm --filter docs-app lint
pnpm --filter docs-app build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add docs-app/app
git commit -m "Wire up the docs-app site shell and port the getting-started page"
```

---

### Task 5: Port the map page (first live Google Maps demo)

**Files:**
- Modify: `docs-app/app/router.js`
- Modify: `docs-app/app/lib/docs-links.js`
- Create: `docs-app/app/templates/docs/map.gjs`
- Create: `docs-app/.env.docs.example`

**Interfaces:**
- Consumes: `MapDataService` (Task 2, first real usage), `DocsPageFooter`/`DOCS_LINKS` (Task 3/4), `GMap` (from `ember-google-maps`).

- [ ] **Step 1: Add the route**

Edit `docs-app/app/router.js`:

```js
Router.map(function () {
  this.route('not-found', { path: '/*path' });
  this.route('index', { path: '/' });
  this.route('docs', function () {
    this.route('getting-started');
    this.route('map');
  });
});
```

- [ ] **Step 2: Add the nav entry**

Edit `docs-app/app/lib/docs-links.js` — this was already written with the `docs.map` entry in Task 3 (`DOCS_LINKS` already has both entries), so no change needed here. Confirm it still reads:

```js
export const DOCS_LINKS = [
  { title: 'Getting started', path: 'docs.getting-started' },
  {
    title: 'Map',
    path: 'docs.map',
    text: "That's it. You're now ready to create a map.",
  },
];
```

- [ ] **Step 3: Port the map page**

Create `docs-app/app/templates/docs/map.gjs`. Ported from v1's `docs/app/templates/docs/map.hbs`: the bare `<GMap ...>` needs no yield conversion (it never used `<g.*>` on this page), `<GoogleDocs>` becomes an import, `@styles`/`london` come from the injected `mapData` service instead of a controller, and the two `<CodeSnippet>` calls become `<pre><code>` blocks with the real source (same deferred-snippet approach as Task 4). The first snippet shows a literal `{{12}}` inside `<code>` text — a raw `{{` in a `.gjs` `<template>` tag is always parsed as a mustache regardless of surrounding HTML, so it's written as the HTML entities `&lbrace;&lbrace;`/`&rbrace;&rbrace;`, which the browser decodes to `{{`/`}}` after Glimmer's compiler has already run:

```gjs
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { GMap } from 'ember-google-maps';
import GoogleDocs from '../../components/google-docs.gjs';
import DocsPageFooter from '../../components/docs-page-footer.gjs';

export default class DocsMapPage extends Component {
  @service mapData;

  <template>
    <div class="row">
      <div class="col-lg-7">
        <section>
          <h5 id="creating-a-map">Creating a map</h5>

          <p>Creating a map is straightforward. The only required arguments
            are the coordinates for the center.</p>

          <pre><code>&lt;GMap @lat="51.508530" @lng="-0.076132" @zoom=&lbrace;&lbrace;12&rbrace;&rbrace; /&gt;</code></pre>

          <p>To get the map to render, the map canvas needs to be styled
            with dimensions. For example, in your <var>app.css</var>:</p>

          <pre><code>.ember-google-map {
  width: 500px;
  height: 500px;
}</code></pre>

          <p>Most of the components in this addon accept <var>lat</var> and
            <var>lng</var> parameters for convenience and consistency. This
            lets you avoid the hassle of remembering whether to use
            <var>position</var> or <var>center</var> and lets you provide
            the coordinates separately. We don't assert the usage of
            <var>lat</var> and <var>lng</var>, so you can still use the
            native Google options if you wish.</p>

          <p>The <var>GMap</var> component accepts all of the
            <GoogleDocs @section="map#MapOptions">MapOptions</GoogleDocs>
            options you would pass to a Google Map instance. These are
            automatically watched for changes.</p>
        </section>
        <section>
          <h5 id="map-instance">Accessing the map instance</h5>

          <p>If you need to access the map instance — to call
            <var>panTo</var> for example — you can use the
            <var>onceOnIdle</var> hook. It returns the map instance once
            the map has been initialized.</p>
        </section>

        <DocsPageFooter />
      </div>
      <div class="col-lg-5 sticky-top sticky-map">
        <GMap
          @lat={{this.mapData.london.lat}}
          @lng={{this.mapData.london.lng}}
          @zoom={{12}}
          @styles={{this.mapData.primaryMapStyle}}
          @minZoom={{10}}
          @panControl={{false}}
          @streetViewControl={{false}}
          class="ember-google-map-responsive"
        />
      </div>
    </div>
  </template>
}
```

- [ ] **Step 4: Add a local dev env template**

Create `docs-app/.env.docs.example` (documents the variable a local dev needs; the real key stays untracked, matching how `test-app-basic` handles its own `.env.test`):

```
GOOGLE_MAPS_API_KEY=your-key-here
```

- [ ] **Step 5: Verify in the browser**

```bash
GOOGLE_MAPS_API_KEY=<a real key with localhost allowed> pnpm --filter docs-app start
```

Visit `http://localhost:4200/docs/map`. Expected: nav shows both "Getting started" and "Map" links; the map page renders a real, live Google Map of London in dark style on the right, with the prose and both code blocks on the left. Click "Getting started" in the nav — expected: its page now shows a "Map" link and description in the page footer (`DocsPageFooter`'s next-page lookup working).

- [ ] **Step 6: Lint and build**

```bash
pnpm --filter docs-app lint
pnpm --filter docs-app build
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add docs-app/app docs-app/.env.docs.example
git commit -m "Port the map page"
```

---

### Task 6: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/docs.yml`

**Interfaces:**
- Produces: a workflow that builds and deploys `docs-app` on every push to `main`.

- [ ] **Step 1: Write the deploy workflow**

Create `.github/workflows/docs.yml`:

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
          path: docs-app/dist

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

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/docs.yml
git commit -m "Deploy docs-app to GitHub Pages"
```

- [ ] **Step 3: Manual steps (not automatable — do these on GitHub)**

These can't be done from the repo, so do them by hand once this commit is pushed:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.** Without this the `deploy-pages` action has nothing to publish to.
2. **Settings → Secrets and variables → Actions → New repository secret**, named `GOOGLE_MAPS_DOCS_API_KEY`. This must be a **separate** key from any test-only key — it ships in public JS on the deployed site, so in Google Cloud Console restrict it by HTTP referrer to the eventual docs domain (you can start with the default `*.github.io/*` referrer and tighten it once a custom domain is chosen).
3. Push to `main` (or run the workflow manually via `gh workflow run docs.yml`) and confirm the `Deploy docs` workflow goes green and the Pages URL (shown in the deploy job's environment link) serves the two-page site.
4. Once a custom domain is chosen: add a `docs-app/public/CNAME` file containing the domain, configure the domain's DNS per GitHub's Pages custom-domain docs, and revisit `rootURL` in `docs-app/config/environment.js` if the site is NOT going to live at the domain's root path.

---

## Self-Review

**Spec coverage:** Architecture (new `docs-app/` package, not `docs/`) — Task 1. Components/layout ported from v1 — Task 3/4. Code-snippet display deferred as an open decision — respected throughout (Global Constraints + Task 4/5's `<pre><code>` stand-in). Build & deploy via GitHub Actions/Pages, not a `gh-pages` branch — Task 6. Separate API key for the deployed site — Task 5 Step 4 + Task 6 Step 3. Manual one-time steps called out explicitly — Task 6 Step 3. Testing minimal (lint + build) — respected in every task's verification steps, no qunit suite introduced.

**Placeholder scan:** No TBD/TODO. The one deliberately-deferred item (code-snippet library) is called out as an explicit, actioned decision (use `<pre><code>` now, swap later), not a vague placeholder.

**Type/name consistency:** `MapDataService` (Task 2) exposes `london`, `primaryMapStyle`, `lightStyle`, `google` — Task 5's map page uses exactly `this.mapData.london.lat`/`.lng` and `this.mapData.primaryMapStyle`, matching. `DOCS_LINKS` (Task 3) shape `{title, path, text}` matches what `DocsPageFooter` (Task 3) and `NavMain` (Task 3) both read. `DocsPageFooter` has no args, consistent with its usage in Task 4 and Task 5 (`<DocsPageFooter />`, no args passed).
