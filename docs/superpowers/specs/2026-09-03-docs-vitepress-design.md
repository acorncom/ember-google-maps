# docs-app rebuild: VitePress + vite-plugin-ember — Design

## Why this replaces the Embroider-based foundation

v1's docs site (19 pages) was deleted during the monorepo move and never
rebuilt. A first rebuild attempt (Embroider + a hand-ported Bootstrap 5
stylesheet) reached a working 2-page foundation in PR #15, but a parallel
spike proved that `ember-google-maps`'s real, unmodified components
(context facade, custom component manager, service injection) render
correctly inside `vite-plugin-ember` + VitePress, with three small, well
understood fixes. VitePress gives Shiki syntax highlighting, sidebar/nav,
dark mode, and search for free — all things the Embroider foundation had
to hand-roll or defer. PR #15 is closed and its branch deleted; this spec
starts fresh on a new branch off `main`, carrying over only real content
(page prose, map data, deploy pipeline shape), not any code or git history.

## Goal

A `docs-app` package, built on VitePress and `vite-plugin-ember`, with:
a working scaffold, two content pages (`getting-started`, `map`) ported
faithfully from the original v1 content, live-rendered real
`ember-google-maps` components on the map page, Shiki-highlighted code
blocks, light custom branding over VitePress's default theme, and a
GitHub Pages deploy pipeline. This is a foundation, not full 19-page
parity — the remaining pages are separate, later plans, gated on
checking how this one looks and feels first.

## Package layout

```
docs-app/
  package.json
  .vitepress/
    config.ts       # VitePress config + vite-plugin-ember + importSync patch
    theme/
      index.ts       # enhanceApp: setupEmber, context init, MapComponentManager patch
      custom.css     # light brand color overrides only
  index.md
  getting-started.md
  map.md
  map-styles/
    dark.js
    light.js
  components/
    google-docs.gjs
```

No `app/`, no router, no Embroider config, no Bootstrap. `docs-app` stays
in `pnpm-workspace.yaml`'s package list (it is not there yet on `main` —
this plan adds it).

## Dependency versions (pinned, matching the proven spike exactly)

- `vitepress: ^1.5.0`
- `vite-plugin-ember: ^0.8.1` (pulls in `ember-live-compiler@0.2.4`
  transitively — do not declare it directly)
- `ember-source: ~6.12.0`
- `ember-provide-consume-context: 0.10.0`
- `@glimmer/component: ^2.1.1`, `@glimmer/tracking: ^1.1.2`
- `ember-google-maps: workspace:*`

`ember-google-maps` itself declares `ember-source: >= 5.12.0`, so pinning
`~6.12.0` here is compatible. This repo deliberately pins `ember-source`
per package (see the workspace's own `pnpm-workspace.yaml` comment) — do
not add a workspace-wide catalog/override for it.

## Content: pages and live code blocks

Markdown pages use ` ```gjs live ` fences (`emberFence`, wired in
`config.ts`'s `markdown.config`) for real, rendered `.gjs` snippets.
Plain ` ```gjs ` (no `live`) or ` ```js ` fences render as static
Shiki-highlighted code with no execution — use these for the
`getting-started` page's install command and `ENV['ember-google-maps']`
snippet, since neither should execute.

**`getting-started.md`** — direct prose port from the original page: an
"Installation" section (`ember install ember-google-maps` in a static
code block) and a "Loading Google Maps" section explaining
`config/environment.js`'s `key`/`language`/`region`/`protocol`/`version`/
`libraries` options, with the original's static config snippet. Full
original text is salvaged at
`scratchpad/old-docs-app-salvage/app/templates/docs/getting-started.gjs`
(paths relative to the session scratchpad directory) — port its prose
and code blocks verbatim into Markdown, dropping only the Ember-specific
wrapper markup (`<DocsPageFooter />` etc. — VitePress's built-in
prev/next footer replaces it via its sidebar config).

**`map.md`** — prose port from
`scratchpad/old-docs-app-salvage/app/templates/docs/map.gjs`: a
"Creating a map" section (static code block showing bare `<GMap>` usage,
a note on styling `.ember-google-map` for dimensions, the `lat`/`lng`
convenience-argument explanation, a link to Google's `MapOptions` docs)
and an "Accessing the map instance" section (`onceOnIdle` hook). Below
the prose, one live ` ```gjs live ` block renders a real, working map:
London coordinates (`{ lat: 51.507568, lng: -0.127762 }`, from
`scratchpad/old-docs-app-salvage/app/services/map-data.js`), the dark
map style array (`map-styles/dark.js`, ported verbatim — 56 lines of
Google Maps styler JSON, no logic), `zoom=12`, `minZoom=10`,
`panControl={false}`, `streetViewControl={false}` — matching the
original page's live example. `map-styles/light.js` ports over as well
even though only `dark` is used yet, since both existed in the original
and cost nothing to carry.

`google-docs.gjs` (an external-link component to Google's Maps JS docs,
salvaged at `scratchpad/old-docs-app-salvage/app/components/
google-docs.gjs`) ports as a plain `.gjs` component under
`docs-app/components/` and is imported directly into `map.md`'s live
fence where the original referenced `<GoogleDocs @section="...">`.

## Service injection: open risk, resolved by an early validation task

The spike proved `@service` injection works for `MapComponentManager`
only via a bypass (Fix 3): a direct `getOwner(this).lookup(...)` call,
because plain `@service` silently fails on that class under
`vite-plugin-ember` (traced to a missing Ember boot-time initialization
step, not a bug in `ember-provide-consume-context` or the addon itself).
`map.md`'s live example needs the dark map style data, but does **not**
strictly need a `mapData` *service* to get it — the style array can be
imported directly into the live code block, sidestepping the question
entirely for this plan's scope.

Before committing to that shortcut, one validation task runs first: a
disposable ` ```gjs live ``` ` block in a scratch page, testing plain
`@service` injection on an ordinary Glimmer Component (not a component
manager). If it works cleanly, service injection is available as a real
option for later pages and no workaround is needed here. If it fails the
same way Fix 3 did, the plan proceeds with the direct-import approach for
`map.md` (no service needed) and records the finding for later pages to
plan around explicitly, rather than silently assuming service injection
works.

## The three spike fixes: where they live

All three stay theme/config-level only — nothing changes in
`ember-google-maps` itself, per your explicit decision to hold that
change out for separate review.

**`.vitepress/config.ts`** — the `patchImportSync()` Vite `transform`
plugin, rewriting `ember-provide-consume-context`'s
`importSync('@ember/owner').getOwner` call site to a plain static
import (proven fix 1); `optimizeDeps.exclude: ['ember-provide-consume-context']`.

**`.vitepress/theme/index.ts`** — calling
`initializeProvideConsumeContext()` once at module load (proven fix 2,
no library changes needed — context propagation works correctly with a
plain string context key, which the real addon already uses); the
`MapComponentManager.prototype.googleMapsApi` `Object.defineProperty`
bypass (proven fix 3); and `setupEmber(app, { services: {...} })`
registering a `GoogleMapsApiService` subclass whose `_getConfig()`
override supplies the Google Maps API key and
`libraries: ['geometry', 'places', 'marker']`, avoiding the need for a
`config:environment` registry lookup the minimal VitePress owner doesn't
support. The key itself is injected the same way the proven spike did
it: a Vite `define` constant in `config.ts`
(`define: { __DOCS_GOOGLE_MAPS_KEY__: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY ?? '') }`),
read by `_getConfig()` as a bare identifier reference — matching
`docs.yml`'s existing `GOOGLE_MAPS_API_KEY` env var, so no new CI secret
plumbing is needed.

## Styling

VitePress's default theme is used as-is. `theme/custom.css` overrides
only VitePress's documented CSS custom properties (`--vp-c-brand-1`,
`--vp-c-brand-2`, `--vp-c-brand-3`, `--vp-c-brand-soft`) for light brand
color polish — no Bootstrap, no SCSS, no layout overrides. VitePress's
own sidebar (`themeConfig.sidebar`), nav, dark-mode toggle, and Shiki
highlighting are used directly with no wrapper components.

## Deploy pipeline

Adapts the existing `.github/workflows/docs.yml` shape (currently only
present on the deleted `docs-app-foundation` branch — this plan adds it
fresh to `main` via this branch): same "build the addon packages, then
build `docs-app`, then `upload-pages-artifact`/`deploy-pages`" structure,
with `docs-app`'s build output pointed at VitePress's own output
directory (`.vitepress/dist`) instead of a Vite/Embroider `dist`. The
rafgraph SPA-fallback `404.html`/`index.html` redirect pair is dropped
entirely — VitePress statically generates one real HTML file per route,
so there is no client-side-routing 404 problem to work around.

## Testing

No component tests for this plan (the pages are documentation content,
not addon code under test). Verification is: the dev server runs, both
pages render, the live map example actually renders a real Google Map
(confirmed visually, e.g. via a Playwright screenshot — a
`RefererNotAllowedMapError` for `localhost` is an expected, acceptable
result absent a docs-specific API key already authorized for that
referrer; it does not block this plan), and the production build
(`vite build` under VitePress) completes and produces static output
under `.vitepress/dist`.

## Out of scope

- The remaining ~17 v1 docs pages (separate, later plans).
- Any change to `ember-google-maps`'s `MapComponentManager` (Fix 3 stays
  a theme-level patch; upstreaming it is a separate decision).
- Upstreaming the `importSync` fix to `vite-plugin-ember` (separate,
  later effort).
- A real, authorized Google Maps API key for the deployed docs site
  (existing `docs.yml` already references
  `secrets.GOOGLE_MAPS_DOCS_API_KEY` — reused as-is, not part of this
  plan).
