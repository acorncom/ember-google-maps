# docs-app: remaining 16 pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the remaining 16 v1 docs pages into the `docs-app` VitePress site
(`getting-started` and `map` already shipped in PR #21), wire them into the
sidebar in v1's original order, and verify every page renders.

**Architecture:** Same pattern already proven in PR #21 — Markdown pages,
` ```gjs live ``` ` fences for real, live-rendered components, no
`@service` usage (confirmed broken under `vite-plugin-ember` — use a direct
`getOwner(this).lookup('service:google-maps-api')` call instead, same as
the existing `MapComponentManager` bypass). No new architecture, no new
compatibility patches expected — this is content volume, not a design
change. One real new risk: the `directions` page needs
`ember-concurrency`, unproven under this stack, validated by its own task
before that page is built.

**Tech Stack:** Same as PR #21 — VitePress, `vite-plugin-ember`, no other
new dependencies expected except `ember-concurrency` (already a dependency
of `ember-google-maps-directions`, add `ember-google-maps-directions` as a
`docs-app` dependency for the `directions` task only).

**Spec:** `docs/superpowers/specs/2026-09-03-docs-vitepress-design.md`
(the original architecture spec — this plan extends it, doesn't change it)

## Global Constraints

- **Flat API only.** Every page uses the current flat components
  (`<Marker>`, `<Circle>`, `<Polyline>`, etc.), never the deprecated
  `<GMap as |g|>` yield bridge, even though v1's original templates used
  the old yield syntax throughout. Rewrite the templates to the flat API
  as you port them — do not copy the `as |g|>`/`<g.*>` syntax verbatim.
- **Event handling convention (confirmed from `ember-google-maps/src/utils/options-and-events.js`):**
  any component argument starting with `on` (e.g. `@onClick`,
  `@onDblclick`, `@onBoundsChanged`, `@onZoomChanged`) is automatically
  detected as an event handler and wired to the matching Google Maps
  event (decamelized: `onBoundsChanged` → `bounds_changed`). An
  `@onceOn<Name>` variant fires once instead of on every occurrence. This
  works on any map component, not just `<GMap>`. Use this directly —
  there is no separate fixed list of valid event-arg names to look up.
- **Current flat component names** (confirmed from `ember-google-maps/src/index.js`):
  `GMap`, `Canvas`, `Marker`, `AdvancedMarker`, `InfoWindow`, `Circle`,
  `Rectangle`, `Polygon`, `Polyline`, `TrafficLayer`, `TransitLayer`,
  `BicyclingLayer`, `Control`, `Overlay`, `Autocomplete` — all exported
  directly from `ember-google-maps`. `Control` takes `@position` (a
  string key into Google's `ControlPosition`, e.g. `"TOP_CENTER"`) and
  yields block content. `ember-google-maps-directions` exports
  `Directions`, `Route`, `Waypoint`.
- **No `@service` in live fences.** Confirmed broken under
  `vite-plugin-ember` for both plain classes and ordinary Glimmer
  Components (see `docs/superpowers/specs/2026-09-03-docs-vitepress-design.md`'s
  `## Findings` section). Anywhere a page needs the Google Maps API object
  or the `google-maps-api` service (for `google.maps.geometry`,
  `ControlPosition` constants, etc.), use this pattern instead, inside the
  live fence's component:
  ```js
  import { getOwner } from '@ember/owner';

  class Example extends Component {
    get googleMapsApi() {
      return getOwner(this).lookup('service:google-maps-api');
    }
    get google() {
      return this.googleMapsApi.google;
    }
  }
  ```
- **`clustering` is static content only** — no live demo. The real
  clustering addon has no v2 port yet (tracked in
  [issue #22](https://github.com/acorncom/ember-google-maps/issues/22)).
  Port the prose/code samples as static (non-`live`) fences, and add one
  sentence noting live clustering isn't available yet, linking to #22.
- **`complex-ui` drops the sweet-rentals demo app link.** That's tracked
  separately in
  [issue #23](https://github.com/acorncom/ember-google-maps/issues/23).
  Port `complex-ui`'s own prose/code; drop or rewrite any sentence that
  specifically points at the sweet-rentals example.
- **Salvaged v1 source lives at**
  `<session-scratchpad>/old-docs-app-salvage/` (the session's scratchpad
  directory — task briefs below give exact relative paths). This is real
  v1 content salvaged from a dangling commit — port its prose and code
  samples faithfully, translating old-API code samples to the flat API,
  but do not paraphrase the prose.
- **`docs-app/lib/create-locations.js`** (created in Task 2) is a shared
  utility other tasks (Task 6/`overlays`) also import — do not create a
  second copy.
- **`advanced-markers` needs a Google Cloud Map ID.** v1 hardcoded one
  tied to the previous maintainer's GCP project (no longer valid). Use a
  clearly-labeled placeholder string (e.g. `'DEMO_MAP_ID'`) with a code
  comment noting it needs replacing with a real Map ID before advanced
  markers will render correctly — same category of known, documented
  limitation as the `RefererNotAllowedMapError` already accepted
  elsewhere in this project. Do not block on getting a real one.
- **Nav/sidebar order** (from v1's own `router.js`, confirmed against the
  salvaged `app/controllers/docs.js`): `events, components, canvas,
  markers, advanced-markers, circles, polylines, info-windows, controls,
  directions, overlays, complex-ui, testing, clustering, advanced,
  transit-layers`. Task 9 wires the final sidebar in exactly this order,
  after `map`.
- Before starting `docs-app`'s dev server, kill stale processes:
  `lsof -ti:5173,5174 | xargs kill 2>/dev/null`.
- `ember-google-maps` must be built once per fresh checkout:
  `pnpm --filter ember-google-maps build`.
- A real, authorized Google Maps API key exists at the repo root's
  `.env.test` (`GOOGLE_MAPS_API_KEY=...`) — source it before any dev
  server or build: `export $(grep GOOGLE_MAPS_API_KEY <repo-root>/.env.test | head -1 | xargs)`.
  Never print the key's value in any report or output.
- A `RefererNotAllowedMapError` in any live-map screenshot (the shared
  test key isn't authorized for `localhost`) is an accepted, expected,
  non-blocking result — confirmed repeatedly in PR #21. Do not treat it
  as a failure.

---

### Task 1: Static-content pages (no live map)

**Files:**
- Create: `docs-app/components.md`
- Create: `docs-app/testing.md`
- Create: `docs-app/advanced.md`
- Create: `docs-app/clustering.md`
- Create: `docs-app/complex-ui.md`

**Interfaces:** None — these are standalone prose pages, no shared code.

Source content (salvaged v1 `.hbs` templates, old Handlebars/yield syntax —
port the prose faithfully; where a code sample demonstrates a *component
usage* pattern (not just a config snippet), rewrite it to the flat API per
Global Constraints):
- `<scratch>/old-docs-app-salvage/app/templates/docs/components.hbs`
- `<scratch>/old-docs-app-salvage/app/templates/docs/testing.hbs`
- `<scratch>/old-docs-app-salvage/app/templates/docs/advanced.hbs`
- `<scratch>/old-docs-app-salvage/app/templates/docs/clustering.hbs`
- `<scratch>/old-docs-app-salvage/app/templates/docs/complex-ui.hbs`

- [ ] **Step 1:** Read all five salvaged `.hbs` files.
- [ ] **Step 2:** Write `docs-app/components.md` — port the prose and code
  samples faithfully (this page is mostly a links/API-reference index —
  keep it that way, just update any component-usage samples to the flat
  API).
- [ ] **Step 3:** Write `docs-app/testing.md` — pure prose + static code
  snippets (`setupMapTest`/`waitForMap`), port verbatim (these are test
  helper APIs, not map components — check they still exist in the current
  addon at `ember-google-maps/src/test-support/` before asserting they're
  current; if the API has changed, note it, don't silently invent new
  content).
- [ ] **Step 4:** Write `docs-app/advanced.md` — pure prose (runtime URL
  override, custom components, treeshaking, perf notes), port verbatim.
- [ ] **Step 5:** Write `docs-app/clustering.md` — port the prose/code
  samples as **static, non-`live`** fences (per Global Constraints). Add
  one sentence near the top: "Live clustering isn't available yet — the
  clustering addon hasn't been ported to the v2 API. See
  [issue #22](https://github.com/acorncom/ember-google-maps/issues/22)."
- [ ] **Step 6:** Write `docs-app/complex-ui.md` — port the prose/code,
  dropping or rewriting any sentence that specifically references the
  sweet-rentals example app (tracked separately in
  [issue #23](https://github.com/acorncom/ember-google-maps/issues/23)).
- [ ] **Step 7:** `pnpm --filter docs-app start`, verify all five pages
  render (no live components to check — a `curl`/render check is
  sufficient).
- [ ] **Step 8:** Commit.

```bash
git add docs-app/components.md docs-app/testing.md docs-app/advanced.md docs-app/clustering.md docs-app/complex-ui.md
git commit -m "Port the static-content docs pages (components, testing, advanced, clustering, complex-ui)"
```

---

### Task 2: Simple live-map pages (events, canvas, markers) + shared location-data utility

**Files:**
- Create: `docs-app/lib/create-locations.js`
- Create: `docs-app/events.md`
- Create: `docs-app/canvas.md`
- Create: `docs-app/markers.md`

**Interfaces:**
- Produces: `docs-app/lib/create-locations.js` exporting
  `createLocations(google, origin, numLocations = 42)` — a pure function
  (no service dependency; caller passes in the `google` object). Reused by
  Task 6 (`overlays`).

Source content:
- `<scratch>/old-docs-app-salvage/app/templates/docs/events.hbs`
- `<scratch>/old-docs-app-salvage/app/templates/docs/canvas.hbs`
- `<scratch>/old-docs-app-salvage/app/templates/docs/markers.hbs`
- `<scratch>/old-docs-app-salvage/app/services/map-data.js` (has the
  original `createLocations()` — port its logic into the new pure
  function, see Step 1)

- [ ] **Step 1: Create `docs-app/lib/create-locations.js`**

Port the original `createLocations` method from the salvaged
`map-data.js` into a standalone function. The original took no `google`
argument (it read `this.google` from a service) — the new version takes
it as a parameter:

```js
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createLocations(google, origin, numLocations = 42) {
  return Array(numLocations)
    .fill()
    .map((_e, i) => {
      let heading = randomInt(1, 360),
        distance = randomInt(100, 5000),
        price = randomInt(0, 2000),
        n = google.maps.geometry.spherical.computeOffset(origin, distance, heading),
        type = randomInt(1, 5);

      return { id: i, lat: n.lat(), lng: n.lng(), price, type, active: false };
    });
}
```

- [ ] **Step 2: Write `docs-app/events.md`**

Read the salvaged `events.hbs` (83 lines — medium prose + reference
table). Port the prose faithfully. The live example wires 5 map event
handlers (bounds_changed/click/dblclick/zoom or similar — check the
actual salvaged content for the exact handler names and behavior) that
update on-page text when fired. Rewrite to the flat `<GMap>` API using the `@on<EventName>` convention
from Global Constraints (e.g. `@onClick`, `@onDblclick`,
`@onBoundsChanged`, `@onZoomChanged`) to wire the same 5 events the
original demonstrated.

- [ ] **Step 3: Write `docs-app/canvas.md`**

Read the salvaged `canvas.hbs` (39 lines). Port the prose. The live demo
positions a `<canvas>` between two inputs — check the current addon's
`Canvas`/canvas-related export (`ember-google-maps/src/components/`) for
its current flat-API name and args before writing the live fence.

- [ ] **Step 4: Write `docs-app/markers.md`**

Read the salvaged `markers.hbs` (46 lines). Port the prose. The live demo
renders clickable markers from generated random locations. In the live
fence's component, get `google` via the `getOwner` bypass pattern (Global
Constraints), compute an origin `LatLng` from London's coordinates
(`51.507568, -0.127762`), call
`createLocations(this.google, origin)` from
`./lib/create-locations.js`, and render a `<GMap>` with a `{{#each}}` loop
of `<Marker>` components from the resulting array.

- [ ] **Step 5:** `pnpm --filter docs-app start` (with the API key
  sourced), verify all three pages render, live maps show markers/events
  firing/canvas positioned correctly, screenshot each with Playwright
  (available at `<scratch>/pw`).
- [ ] **Step 6:** Commit.

```bash
git add docs-app/lib/create-locations.js docs-app/events.md docs-app/canvas.md docs-app/markers.md
git commit -m "Port events, canvas, and markers pages with a shared location-data utility"
```

---

### Task 3: Stateful live-map pages, part 1 (circles, polylines)

**Files:**
- Create: `docs-app/circles.md`
- Create: `docs-app/polylines.md`

**Interfaces:** None shared with other tasks. This task is also the first
real test of local `@tracked` component state inside a live fence (as
opposed to `@service` injection, which is confirmed broken) — if either
page's interactive state doesn't update the map live, stop and report
before proceeding to Task 4, which depends on the same pattern working.

Source content:
- `<scratch>/old-docs-app-salvage/app/templates/docs/circles.hbs`
- `<scratch>/old-docs-app-salvage/app/controllers/docs/circles.js`
- `<scratch>/old-docs-app-salvage/app/templates/docs/polylines.hbs`
- `<scratch>/old-docs-app-salvage/app/controllers/docs/polylines.js`

- [ ] **Step 1: Write `docs-app/circles.md`**

Read both salvaged `circles` files. Port the prose. The original
controller had `@tracked radius` and a fill-color field driving live
inputs that update a `<Circle>` on the map in real time. Rewrite as a
Glimmer Component inside the live fence: `@tracked radius = <original
default>`, an `<input>` bound to it (e.g. `{{on "input" this.updateRadius}}`
reading `event.target.value`), and a `<Circle @radius={{this.radius}}
.../>` reflecting it live.

- [ ] **Step 2: Write `docs-app/polylines.md`**

Read both salvaged `polylines` files. Port the prose. The original demo
appended points to a polyline on map click. Rewrite: `@tracked path =
[]` array on the live fence's component, an `@onClick` handler on
`<GMap>` (per the event convention in Global Constraints) that appends
the clicked `{lat, lng}` to `this.path`, and a `<Polyline
@path={{this.path}} .../>` reflecting it live.

- [ ] **Step 3:** `pnpm --filter docs-app start`, verify both pages: the
  radius/color input on `/circles` actually changes the rendered circle
  live, and clicking the map on `/polylines` actually appends visible
  points to the line. Screenshot both, including one interaction (e.g.
  drag the radius input, click the map) via Playwright, not just the
  initial static render — this task's whole point is proving the
  interactive state works, not just that the page loads.
- [ ] **Step 4:** Commit.

```bash
git add docs-app/circles.md docs-app/polylines.md
git commit -m "Port circles and polylines pages with live tracked-state demos"
```

---

### Task 4: Stateful live-map pages, part 2 (info-windows, controls, transit-layers)

**Files:**
- Create: `docs-app/info-windows.md`
- Create: `docs-app/controls.md`
- Create: `docs-app/transit-layers.md`
- Create: `docs-app/public/images/doge.jpg` (copy, not create from scratch)

**Interfaces:** Consumes the same `@tracked`-in-live-fence pattern proven
in Task 3 — if Task 3 found that pattern doesn't work, this task is
blocked; resolve that first (see Task 3's Step 3).

Source content:
- `<scratch>/old-docs-app-salvage/app/templates/docs/info-windows.hbs`
- `<scratch>/old-docs-app-salvage/app/controllers/docs/info-windows.js`
- `<scratch>/old-docs-app-salvage/public/images/doge.jpg`
- `<scratch>/old-docs-app-salvage/app/templates/docs/controls.hbs`
- `<scratch>/old-docs-app-salvage/app/controllers/docs/controls.js`
- `<scratch>/old-docs-app-salvage/app/templates/docs/transit-layers.hbs`
- `<scratch>/old-docs-app-salvage/app/controllers/docs/transit-layers.js`

- [ ] **Step 1: Copy the image asset**

`cp <scratch>/old-docs-app-salvage/public/images/doge.jpg docs-app/public/images/doge.jpg`

- [ ] **Step 2: Write `docs-app/info-windows.md`**

Read both salvaged `info-windows` files (81 lines — medium-large, 2 toggle
booleans, demos both map-level and marker-level info windows with custom
HTML content including the doge image). Port the prose. Rewrite the
toggle booleans as `@tracked` fields on the live fence's component.
Reference the image as `/images/doge.jpg` in the live fence's template
(VitePress serves `docs-app/public/**` at the site root, with `base`
prefix applied automatically to markdown-rendered `<img>`/asset
references — verify this actually resolves correctly in Step 4, don't
assume).

- [ ] **Step 3: Write `docs-app/controls.md`**

Read both salvaged `controls` files (61 lines — demos built-in control
positioning via `zoomControlOptions`-style args, plus a fully custom
recenter button using a `<GMap.control>`-equivalent block form). This page
needs `ControlPosition` constants from the Google Maps API — get them via
`this.google.maps.ControlPosition.<NAME>` using the `getOwner` bypass
pattern from Global Constraints (this page is exactly the kind of case
that pattern exists for). Port the prose; rewrite the custom control demo
to the current addon's actual `Control`/`GMap.Control`-equivalent flat
export (check `ember-google-maps/src/components/` for its real current
name before writing this).

- [ ] **Step 4: Write `docs-app/transit-layers.md`**

Read both salvaged `transit-layers` files (36 lines — button-driven toggle
between traffic/transit/bicycling layers). Port the prose. Rewrite the
toggle as a `@tracked` field selecting which layer component
(`TrafficLayer`/`TransitLayer`/`BicyclingLayer` or the current addon's
actual equivalent names — check `ember-google-maps/src/components/`) to
render inside `<GMap>`.

- [ ] **Step 5:** `pnpm --filter docs-app start`, verify all three pages:
  info-windows' image loads (check the actual asset URL resolves, not
  just that the page renders), the toggles on info-windows and
  transit-layers work, and controls' custom recenter button actually
  works (click it, confirm the map re-centers). Screenshot each with an
  interaction, not just initial state.
- [ ] **Step 6:** Commit.

```bash
git add docs-app/info-windows.md docs-app/controls.md docs-app/transit-layers.md docs-app/public/images/doge.jpg
git commit -m "Port info-windows, controls, and transit-layers pages"
```

---

### Task 5: advanced-markers page

**Files:**
- Create: `docs-app/advanced-markers.md`

**Interfaces:** None.

Source content: `<scratch>/old-docs-app-salvage/app/templates/docs/advanced-markers.hbs`

- [ ] **Step 1:** Read the salvaged template (46 lines). Port the prose.
- [ ] **Step 2:** Rewrite the live demo to the current addon's
  `AdvancedMarker`-equivalent flat export (check
  `ember-google-maps/src/components/` for its real name). Pass a Map ID
  per Global Constraints: `mapId="DEMO_MAP_ID"` with a code comment:
  `{{! Replace with a real Google Cloud Map ID before this demo works }}`.
- [ ] **Step 3:** `pnpm --filter docs-app start`, verify the page renders
  and reaches a stable state — a console warning/error about the invalid
  `DEMO_MAP_ID` is expected and acceptable (same category as the
  referrer error already accepted elsewhere); a crash that prevents the
  rest of the page from rendering is not — if you see the latter, report
  it, don't just note it and move on.
- [ ] **Step 4:** Commit.

```bash
git add docs-app/advanced-markers.md
git commit -m "Port the advanced-markers page"
```

---

### Task 6: overlays page

**Files:**
- Create: `docs-app/overlays.md`

**Interfaces:** Consumes `createLocations` from `docs-app/lib/create-locations.js`
(Task 2).

Source content: `<scratch>/old-docs-app-salvage/app/templates/docs/overlays.hbs`
(94 lines — the largest remaining page, 5 subsections on custom
`OverlayView` HTML overlays, positioning/transform math, hover-driven
CSS)

- [ ] **Step 1:** Read the salvaged template in full.
- [ ] **Step 2:** Port all 5 subsections' prose faithfully.
- [ ] **Step 3:** Rewrite the live demo to the current addon's
  `Overlay`-equivalent flat export (check `ember-google-maps/src/components/`
  for its real name and API — v1's version used a custom `OverlayView`
  subclass pattern; the current addon may expose this more directly,
  check before assuming the old low-level pattern is still needed). Loop
  over locations generated via `createLocations(this.google, origin)`
  (same `getOwner` bypass pattern as Task 2's `markers` page) rendering a
  price-tooltip overlay per location, with hover-driven CSS as in the
  original.
- [ ] **Step 4:** Port any positioning/transform CSS the original used
  into a `<style>` block or the fence's own styling — check how other
  pages handle demo-specific CSS (if none do yet, scoped inline styles on
  the elements are fine, don't create a new global stylesheet for this
  one page).
- [ ] **Step 5:** `pnpm --filter docs-app start`, verify the page renders,
  overlays appear at their expected map positions, hover CSS triggers.
  Screenshot including a hover state if practical.
- [ ] **Step 6:** Commit.

```bash
git add docs-app/overlays.md
git commit -m "Port the overlays page"
```

---

### Task 7: Validate ember-concurrency compatibility under vite-plugin-ember

**Files:**
- Create: `docs-app/directions-check.md` (temporary — deleted at the end of this task)
- Modify: `docs-app/package.json` (add `ember-google-maps-directions` as a
  dependency — needed either way, keep it whether or not this check
  passes)

**Interfaces:** Produces a finding, recorded in the spec file, that Task
8 depends on. This is a diagnostic task, not a feature.

`ember-google-maps-directions` uses `ember-concurrency` tasks
(`task(async (...) => {...})`). Per project history, this needed specific
Babel wiring (`async-arrow-task-transform`) in the real addon's own build
— it's untested whether `vite-plugin-ember`'s compile pipeline handles
this correctly for a *consuming* app (as opposed to the addon's own
build).

- [ ] **Step 1:** Add `ember-google-maps-directions: "workspace:*"` to
  `docs-app/package.json`'s `dependencies`. `pnpm install`.
- [ ] **Step 2:** Build the directions addon if not already built:
  `pnpm --filter ember-google-maps-directions build`.
- [ ] **Step 3:** Create `docs-app/directions-check.md` with a minimal
  live fence importing `Directions` (or whatever the package's actual
  flat export is named — check `ember-google-maps-directions/src/`) from
  `ember-google-maps-directions` inside a `<GMap>`, with hardcoded origin
  and destination coordinates.
- [ ] **Step 4:** `pnpm --filter docs-app start` (API key sourced),
  navigate to the check page. Look for any error mentioning `task`,
  `ember-concurrency`, `async-arrow`, or a Babel transform failure —
  these mean the concurrency wiring doesn't work under this stack and
  Task 8 needs a different approach (report this clearly, don't guess at
  a fix yourself — this task's job is to find out, not to solve it). A
  `RefererNotAllowedMapError` alone is fine, same as every other live-map
  page.
- [ ] **Step 5:** Record the finding in
  `docs/superpowers/specs/2026-09-03-docs-vitepress-design.md`'s
  `## Findings` section (append, don't overwrite the existing entry):
  does `ember-concurrency` work under `vite-plugin-ember` for a consuming
  app, yes or no, with the date and evidence.
- [ ] **Step 6:** Delete `docs-app/directions-check.md`.
- [ ] **Step 7:** Commit.

```bash
git add docs-app/package.json pnpm-lock.yaml docs/superpowers/specs/2026-09-03-docs-vitepress-design.md
git commit -m "Record whether ember-concurrency works under vite-plugin-ember for a consuming app"
```

---

### Task 8: directions page

**Files:**
- Create: `docs-app/directions.md`

**Interfaces:** Consumes Task 7's finding. If Task 7 found
`ember-concurrency` doesn't work under this stack, this task's live demo
may need to fall back to static-only content (same treatment as
`clustering`) — read Task 7's recorded finding before starting, and if it
found a real blocker, treat this page like Task 1's static pages instead
of attempting a live demo, and note why in the page's prose (a real
technical limitation, not invented content).

Source content: `<scratch>/old-docs-app-salvage/app/templates/docs/directions.hbs`
(78 lines, 4 subsections) and
`<scratch>/old-docs-app-salvage/app/helpers/get-route-steps.js` (11
lines — a small helper for displaying turn-by-turn steps)

- [ ] **Step 1:** Read Task 7's recorded finding in the spec file first.
- [ ] **Step 2:** Read the salvaged `directions.hbs` and
  `get-route-steps.js`.
- [ ] **Step 3:** Port all 4 subsections' prose.
- [ ] **Step 4 (if Task 7's finding was positive):** Rewrite the live
  demo to `ember-google-maps-directions`'s actual flat exports
  (`Directions`/`Route`/`Waypoint` per the earlier recon — confirm exact
  names in `ember-google-maps-directions/src/`). Reproduce the original's
  Covent Garden → Clerkenwell walking route with a waypoint. Port
  `get-route-steps.js`'s logic as a plain helper function (same pattern
  as `create-locations.js` in Task 2) for displaying turn-by-turn text.
- [ ] **Step 4 (if Task 7's finding was negative):** Port as static
  content only (non-`live` code fences showing the intended usage), with
  a note explaining the live demo isn't available yet due to the
  `ember-concurrency`/`vite-plugin-ember` incompatibility found in Task
  7, and that this is tracked for follow-up (file a new GitHub issue at
  this point if this path is taken — title it something like "Directions
  live demo blocked by ember-concurrency under vite-plugin-ember",
  linking to the spec's Findings section).
- [ ] **Step 5:** `pnpm --filter docs-app start`, verify the page renders
  (live route if Step 4's positive path was taken, static content
  otherwise).
- [ ] **Step 6:** Commit.

```bash
git add docs-app/directions.md
git commit -m "Port the directions page"
```

---

### Task 9: Wire the sidebar for all 16 new pages

**Files:**
- Modify: `docs-app/.vitepress/config.ts`

**Interfaces:** Consumes every page created in Tasks 1-8.

- [ ] **Step 1:** Update `themeConfig.sidebar` in
  `docs-app/.vitepress/config.ts` to include all 16 new pages after `map`,
  in this exact order (per Global Constraints): `events, components,
  canvas, markers, advanced-markers, circles, polylines, info-windows,
  controls, directions, overlays, complex-ui, testing, clustering,
  advanced, transit-layers`. Use readable titles (e.g. "Advanced markers"
  not "advanced-markers", "Info windows" not "info-windows",
  "Transit layers" not "transit-layers") — match the salvaged
  `app/controllers/docs.js`'s `links` array title casing where available.
- [ ] **Step 2:** `pnpm --filter docs-app start`, confirm the sidebar
  shows all 18 pages in order, and prev/next navigation flows correctly
  from `getting-started` through to `advanced`/`transit-layers` (whichever
  is genuinely last per the order above).
- [ ] **Step 3:** Commit.

```bash
git add docs-app/.vitepress/config.ts
git commit -m "Wire the sidebar for all 16 newly ported pages"
```

---

### Task 10: Final visual verification

**Files:** none (verification only)

**Interfaces:** Consumes everything from Tasks 1-9.

- [ ] **Step 1:** `pnpm --filter docs-app start` (API key sourced).
  Screenshot every one of the 18 pages (2 from PR #21 + 16 new). For each
  page with a live component, confirm it actually renders (not just that
  the page loads) — markers show pins, circles/polylines respond to
  interaction, info-windows' toggles work, controls' recenter button
  works, transit-layers' toggle works, overlays show tooltips,
  advanced-markers reaches its expected (invalid-Map-ID) state without
  crashing, directions shows a real route or its static fallback per
  Task 8's outcome.
- [ ] **Step 2:** `pnpm --filter docs-app build`, then serve the built
  output (`vitepress preview .` from `docs-app/`) and spot-check at least
  5 of the 16 new pages under the `/ember-google-maps/` base path,
  confirming assets load (same check pattern as PR #21's final fix wave).
- [ ] **Step 3:** Report pass/fail per page, listing any page that
  degraded to a known-acceptable limitation (advanced-markers' Map ID,
  directions' possible static fallback, clustering's static-only status)
  separately from any real, unexpected failure.
