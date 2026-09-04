# Modernize docs code samples + restructure sidebar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `docs-app` code samples to modern single-file `.gts`
template-tag components with arrow-function handlers, `{{on}}` modifiers, and
light idiomatic TypeScript grounded in the addon's real types; restructure
the sidebar into Documentation / Coming Soon / Deprecated groups; drop a
stale prose reference.

**Architecture:** Same VitePress + vite-plugin-ember docs site. `emberFence`
already supports `gts live` fences. The branch is rebased onto `main`'s
TypeScript work, so `docs-app` consumes the typed addon via `workspace:*`.

**Tech Stack:** VitePress, vite-plugin-ember, ember-source ~6.12.0, the
now-typed `ember-google-maps` / `ember-google-maps-directions`, Glint types.

**Spec:** `docs/superpowers/specs/2026-09-04-docs-modernize-samples.md`

## Global Constraints

These transformation rules bind every task. Apply them identically.

**1. Live fences `gjs live` → `gts live`.** Change the fence info string.
The virtual module vite-plugin-ember creates then compiles as `.gts`.

**2. `@action` → arrow-function class field.** Drop
`import { action } from '@ember/object';`. Canonical before/after:

```
// BEFORE
@action
updateRadius(event) {
  let value = event.target.valueAsNumber;
  run(() => (this.radius = value));
}

// AFTER
updateRadius = (event: Event) => {
  const input = event.target as HTMLInputElement;
  run(() => (this.radius = input.valueAsNumber));
};
```

The `{{on "input" this.updateRadius}}` call sites stay exactly as they are —
arrow-field references work identically. `this` binds automatically (arrow
field), so no decorator is needed.

**3. Light idiomatic TypeScript.** Type DOM-event handlers as above
(`event: Event` + a cast to the concrete element — `HTMLInputElement`,
`HTMLSelectElement`, etc.). Type a `@tracked` field only where inference
wouldn't (e.g. `@tracked layer: 'traffic' | 'transit' | 'bicycling' =
'traffic'` if the union matters; a plain `@tracked radius = 1000` needs no
annotation). Do NOT add `Signature` interfaces to demo components unless a
demo genuinely takes typed args or yields blocks. Prefer `const` over `let`
where the value isn't reassigned. Keep it readable for the `.gjs` (JS)
audience — types that teach, not types that clutter.

**4. Preserve all substantive behavior verbatim.** The
`getOwner(this).lookup('service:google-maps-api')` service bypass, the
`run()`-in-sandbox wrapping AND its `::: tip` explanatory note, the
`${import.meta.env.BASE_URL}…` asset references, the component composition,
the coordinates, and the prose all stay. This is a syntax/type modernization,
not a rewrite.

**5. Types are grounded in the real addon, not invented.** The addon exports
Glint signatures (e.g. `Circle`'s args = `{ lat?: number; lng?: number } &
google.maps.CircleOptions & MapComponentEventArgs`; `GMap`'s =
`{ lat?, lng?, renderCanvasInPlace?, onReady? } & google.maps.MapOptions &
MapComponentEventArgs`). Read the relevant `.d.ts` under
`ember-google-maps/declarations/` when a sample's types need to match a
component's real arg shape. Do not hand-invent arg types that contradict the
declarations.

**6. Static component samples: merge `hbs` + `js` pairs into one `.gts`.**
Where a page shows a template block and its backing class as two separate
blocks for the SAME example, combine them into a single-file `.gts`
template-tag component. Any `@action`/`{{action}}` in these becomes an
arrow-field + `{{on}}` per rule 2.

**7. Do NOT wrap trivial standalone snippets.** A bare tag-syntax snippet
(`<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}} />`) shown only to
illustrate syntax, with no backing class, stays a focused snippet. Do not
fabricate a class + `<template>` around a one-liner. Prefer the `gts` fence
label for consistency where natural, but add no types to a bare fragment.

**8. Non-component JS stays JS.** The `ENV['ember-google-maps'] = { … }`
config object (getting-started.md, advanced.md) stays a `js` block — it is
not a component. Convert `google-maps-api` service-subclass examples to `ts`.

**9. The inline-mustache-in-prose trap still applies.** An inline
single-backtick code span containing `{{` / `{{#` / `{{/` in PROSE (not a
fenced block) breaks the VitePress production build. Since prose is being
touched, grep every edited page for it before committing.

**10. Build must stay clean.** After each task, `pnpm --filter docs-app
build` must complete with zero dead-link warnings and no template-compile
error. Prereqs each fresh checkout: `pnpm --filter ember-google-maps build &&
pnpm --filter ember-google-maps-directions build` (they emit declarations
now — `ember-tsc`), and source the API key
`export $(grep GOOGLE_MAPS_API_KEY <repo-root>/.env.test | head -1 | xargs)`
for live verification (never print the value). Kill stale dev servers first:
`lsof -ti:5173,5174 | xargs kill 2>/dev/null`.

**11. Known-accepted degraded states are not failures.** RefererNotAllowedMapError
on live maps (shared localhost key), REQUEST_DENIED on directions,
advanced-markers' placeholder Map ID rendering default styling — all
expected, not regressions. A build-time `importing-inject-from-ember-service`
deprecation stack trace comes from the ADDON's own code (out of scope here);
ignore it.

**Playwright** is at `<session-scratchpad>/pw` (run scripts from there with
`node <script>.mjs`). For interactive pages, drive the interaction and
screenshot after, reading the image — same rigor as the original port.

---

### Task 1: Feasibility gate — convert circles.md to `gts live`

**Files:** Modify `docs-app/circles.md`

This task proves `gts live` works end-to-end AND establishes the conversion
pattern every later task copies. If the live demo does not render/interact
after conversion, STOP and report — do not let later tasks proceed against a
broken fence format.

- [ ] **Step 1:** Read `docs-app/circles.md`'s live fence (the canonical
  `@action` example — see Global Constraint 2).
- [ ] **Step 2:** Convert per the rules: fence `gjs live` → `gts live`; both
  `@action` methods → arrow-field handlers with `event: Event` +
  `as HTMLInputElement`; drop `import { action }`; keep the `run()` wrapping,
  the `::: tip` note, the `{{on}}` call sites, coordinates, and template
  unchanged.
- [ ] **Step 3:** Build check: `pnpm --filter docs-app build` — clean
  (dead-link warnings for nothing expected now; a compile error is a stop).
- [ ] **Step 4:** Live check: dev server + Playwright on `/circles` — drag
  the radius input and change the color, screenshot after, confirm the circle
  actually resizes/recolors live (same as the original port verified). Read
  the screenshot. If interaction is broken, STOP and report BLOCKED with the
  console error.
- [ ] **Step 5:** Commit: `git commit -m "Convert circles demo to typed .gts template tag"`

---

### Task 2: polylines + transit-layers (interactive, run() pattern)

**Files:** Modify `docs-app/polylines.md`, `docs-app/transit-layers.md`

Both have interactive `@tracked` state driven by DOM handlers (polylines:
`@onClick` appends a path point — note this is the addon's own Google event,
NOT a raw DOM handler, so it may not need `run()`; transit-layers: a plain
DOM button toggles the layer, which DOES need `run()`). Preserve each page's
existing `run()`/no-`run()` decision and its note.

- [ ] **Step 1:** Read both pages' live fences.
- [ ] **Step 2:** Convert each per Global Constraints: `gts live`, any
  `@action` → typed arrow-field, light types (transit-layers' layer field is
  a good candidate for a typed string union if it reads cleanly). Preserve
  behavior, `run()` where present, notes, composition.
- [ ] **Step 3:** Build check — clean.
- [ ] **Step 4:** Live check both pages: click the map on `/polylines`
  (points appear on the line), toggle layers on `/transit-layers` (overlay
  changes). Screenshot after interaction; read them.
- [ ] **Step 5:** Commit.

---

### Task 3: info-windows + controls (interactive, most handlers)

**Files:** Modify `docs-app/info-windows.md`, `docs-app/controls.md`

Highest `@action` counts (5 and 4). info-windows has toggle booleans +
the base-URL doge image; controls has the custom recenter Control and reaches
`google.maps.ControlPosition` via the getOwner lookup.

- [ ] **Step 1:** Read both pages' live fences.
- [ ] **Step 2:** Convert per Global Constraints. Type the toggle handlers
  and the recenter handler. Keep the getOwner lookup, the `${import.meta.env.BASE_URL}images/doge.jpg`
  reference, the `run()` notes, and the `<Marker as |m|><InfoWindow
  @target={{m.mapComponent}}>` composition unchanged.
- [ ] **Step 3:** Build check — clean.
- [ ] **Step 4:** Live check: toggle both info windows (`/info-windows`),
  confirm the doge image still loads; click the recenter button
  (`/controls`), confirm the map re-centers. Screenshot after; read them.
- [ ] **Step 5:** Commit.

---

### Task 4: markers + events + canvas (display / event demos)

**Files:** Modify `docs-app/markers.md`, `docs-app/events.md`, `docs-app/canvas.md`

Loop/display and Google-event demos. markers: `createLocations` loop +
`@onClick`; events: 5 `@on*` handlers updating on-page text; canvas:
automatic-canvas demo. These use the addon's own `@on*` events (internally
runloop-wrapped) more than raw DOM handlers, so most need no `run()` — but
preserve whatever each page currently does.

- [ ] **Step 1:** Read all three pages' live fences.
- [ ] **Step 2:** Convert per Global Constraints. `createLocations` /
  `getOwner` patterns stay. Type the event handlers (the addon's event
  payload types come from `MapComponentEventArgs`/`google.maps.*` — for a
  handler like `@onClick={{this.markerClicked}}` receiving a Google
  `MapMouseEvent`, type the param as `google.maps.MapMouseEvent` if it reads
  cleanly, else leave inferred; do not invent a wrong type).
- [ ] **Step 3:** Build check — clean.
- [ ] **Step 4:** Live check: markers render + click returns coords
  (`/markers`); an event fires and updates text (`/events`); canvas layout
  renders (`/canvas`). Screenshot; read them.
- [ ] **Step 5:** Commit.

---

### Task 5: advanced-markers + overlays (loop / overlay demos)

**Files:** Modify `docs-app/advanced-markers.md`, `docs-app/overlays.md`

advanced-markers: `AdvancedMarker` loop with the placeholder Map ID;
overlays: `createLocations` loop rendering price-tooltip `Overlay`s with hover
CSS (pure CSS, no tracked state — likely no `@action` beyond a click handler).

- [ ] **Step 1:** Read both pages' live fences.
- [ ] **Step 2:** Convert per Global Constraints. Keep the `DEMO_MAP_ID`
  placeholder + its comment/warning, the hover CSS, the `createLocations`
  reuse, the getOwner lookup.
- [ ] **Step 3:** Build check — clean.
- [ ] **Step 4:** Live check: advanced markers render (`/advanced-markers`);
  overlays positioned + hover works (`/overlays`). Screenshot; read them.
- [ ] **Step 5:** Commit.

---

### Task 6: directions (complex live demo)

**Files:** Modify `docs-app/directions.md`

3 `@action` handlers; `Directions`/`Route`/`Waypoint` composition;
`get-route-steps.js` helper; step markers with click-to-toggle info windows.
The live route won't draw (REQUEST_DENIED) — that's accepted.

- [ ] **Step 1:** Read the page's live fence and any static samples.
- [ ] **Step 2:** Convert per Global Constraints. Type the handlers. Keep the
  `getRouteSteps` import, the `stepEntries` getter, the composition, the
  `::: warning` about REQUEST_DENIED, and every arg (origin/destination/
  travelMode/waypoint). `ember-google-maps-directions` types: read its
  declarations under `ember-google-maps-directions/declarations/` if present;
  if that package isn't typed yet, leave those component usages inferred
  rather than inventing types.
- [ ] **Step 3:** Build check — clean.
- [ ] **Step 4:** Live check: page renders, Directions component performs its
  task, only REQUEST_DENIED in console (no task/compile error). Screenshot;
  read it.
- [ ] **Step 5:** Commit.

---

### Task 7: static-sample pages (components, testing, advanced, clustering, complex-ui) + advanced.md prose

**Files:** Modify `docs-app/components.md`, `docs-app/testing.md`,
`docs-app/advanced.md`, `docs-app/clustering.md`, `docs-app/complex-ui.md`

These have static samples (no live fences, or the live ones are covered
elsewhere). Apply the static-sample rules (Global Constraints 6, 7, 8).

- [ ] **Step 1:** Read all five pages.
- [ ] **Step 2:** For each: merge `hbs`+`js` component-example pairs into
  single `.gts` blocks; convert `@action`/`{{action}}` in samples to
  arrow-field + `{{on}}`; convert `google-maps-api` service-subclass examples
  to `ts`; leave the `ENV['ember-google-maps']` config object as `js`; leave
  bare tag-syntax snippets as focused snippets (no fabricated wrappers).
- [ ] **Step 3 (advanced.md specifically):** Delete the sentence referencing
  the removed build-time `only`/`except` config in the Treeshaking section
  (the one from the maintainer's screenshot: "There's no more build-time
  `only` / `except` configuration to maintain." — remove that clause so the
  paragraph doesn't reference an old paradigm). Convert its two
  service-subclass `js` examples (already fixed to `import { service }`) to
  `ts`.
- [ ] **Step 4:** Grep all five for the inline-mustache-in-prose trap.
- [ ] **Step 5:** Build check — clean.
- [ ] **Step 6:** Commit.

---

### Task 8: Restructure the sidebar into three groups

**Files:** Modify `docs-app/.vitepress/config.ts`

- [ ] **Step 1:** Replace the single `themeConfig.sidebar` "Documentation"
  group with three groups, preserving the existing item object shape
  (`{ text, link }`) and readable titles:
  - **Documentation:** Getting started, Map, Events, Components, Canvas,
    Advanced markers, Circles, Polylines, Info windows, Controls, Overlays,
    Complex UI, Testing, Advanced, Transit layers (this order — the current
    order minus directions/clustering/markers).
  - **Coming Soon:** Directions, Clustering.
  - **Deprecated:** Markers.
- [ ] **Step 2:** Dev server: confirm all three groups render with all 18
  pages present, and prev/next still flows (VitePress infers it across the
  grouped sidebar).
- [ ] **Step 3:** Build check — clean.
- [ ] **Step 4:** Commit.

---

### Task 9: Best-effort type-check of the code blocks

**Files:** Create `docs-app/scripts/typecheck-samples.mjs` (or similar) IF the
harness proves modest; otherwise create nothing and record the fallback.

This is explicitly OPTIONAL (spec: "awesome but not required"). Timebox it.

- [ ] **Step 1:** Assess feasibility cheaply. Check whether `@types/google.maps`
  is resolvable in the workspace (the addon's declarations reference
  `google.maps.*`), and whether Glint or `tsc` can see the addon's
  `declarations/*.d.ts`. If the pieces aren't readily available, STOP and take
  the fallback (Step 4).
- [ ] **Step 2 (if feasible):** Write a small Node script that extracts every
  ` ```gts ` / ` ```gts live ` / ` ```ts ` fenced block from `docs-app/*.md`
  to temp `.gts`/`.ts` files with a shared tsconfig that includes the addon
  declarations + `@types/google.maps`, and runs Glint (`glint`) or `tsc
  --noEmit` over them. Bare template-fragment snippets that aren't complete
  modules should be skipped or wrapped minimally — don't fail the harness on
  intentional fragments.
- [ ] **Step 3 (if feasible):** Run it; fix any REAL type errors the samples
  contain (a sample using a non-existent arg, a wrong event type). Do NOT
  contort samples to satisfy the checker if the "error" is a harness
  limitation (missing ambient types, fragment handling) — note those instead.
- [ ] **Step 4 (fallback if not feasible / over-budget):** Record in the
  report that automated checking was not pursued and why, and instead
  spot-verify 3–4 representative converted samples by reading them against the
  addon's `declarations/*.d.ts` for type correctness by hand. No script
  committed.
- [ ] **Step 5:** Build check still clean (the harness must not break the
  docs build). Commit whatever was produced (script + fixes, or just sample
  fixes, or nothing if pure fallback with no errors found).

---

### Task 10: Final full-site verification

**Files:** none (verification only)

- [ ] **Step 1:** Dev server, API key sourced. Screenshot all 18 pages;
  confirm every live demo still renders + interacts (markers, overlays hover,
  circles/polylines/info-windows/transit-layers/controls interactions,
  advanced-markers, directions component). Known-accepted degraded states are
  fine.
- [ ] **Step 2:** `pnpm --filter docs-app build` — fully clean (zero dead
  links, no compile error). Serve the built output (`vitepress preview .`
  from `docs-app/`) and spot-check 5+ pages under `/ember-google-maps/`,
  confirming assets load (including the doge image).
- [ ] **Step 3:** Confirm the sidebar shows the three groups correctly in the
  built output.
- [ ] **Step 4:** Report pass/fail per page + build, separating
  known-accepted degraded states from any real failure.
