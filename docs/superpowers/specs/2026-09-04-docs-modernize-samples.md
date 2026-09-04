# Modernize docs code samples + restructure sidebar — Design

## Why

The docs site (PR #21, all 18 pages) shipped with code samples in a mix of
styles carried over from the v1 port: separate `hbs` template + `js`
class/controller blocks, `@action` decorators, and plain-JS live fences.
The maintainer wants the samples to teach current best practice: single-file
`.gts` template-tag components, `{{on}}` modifiers with arrow-function
handlers instead of `@action`, and light idiomatic TypeScript — grounded in
the addon's real exported types (the addon gained hand-written Glint
signatures on `main`, and this branch is now rebased onto that). Two pages
also get reorganized in the sidebar to signal their status.

## Scope

The `docs-app` package only. No changes to `ember-google-maps` or
`ember-google-maps-directions` source. Touches the ~14 pages that carry code
samples or live demos, plus `docs-app/.vitepress/config.ts` (sidebar) and one
prose edit in `advanced.md`.

## Decisions (locked with the maintainer)

- **TypeScript depth: light & idiomatic.** Type the things that teach
  (event handlers via `event: Event` + a cast to the concrete element,
  component arg types where they clarify); lean on inference elsewhere. No
  `Signature` interface scaffolding on demo components unless a demo
  genuinely needs typed args/blocks. The goal is exemplary-but-readable
  `.gts`, legible to the `.gjs` (JS) half of the audience too.
- **`@action` → arrow-function class fields.** e.g.
  `updateRadius = (event: Event) => { … }`. No decorator, auto-binds `this`,
  works with `{{on}}`. This is the concrete meaning of "on modifiers instead
  of actions." The `{{on}}` modifier usage stays; only the handler
  definition changes.
- **Non-component JS handling:** literal config (the
  `ENV['ember-google-maps'] = { … }` object in `getting-started.md`,
  `advanced.md`) stays a `js` block — it isn't a component. The
  `google-maps-api` service-subclass examples become `.ts` blocks. Only
  template+component examples merge into unified `.gts`.
- **Sidebar: three groups** — `Documentation` (the 15 standard pages in
  current order), `Coming Soon` (Directions, Clustering), `Deprecated`
  (Markers).
- **Rebase done:** the branch is rebased onto `main`'s TypeScript work and
  force-pushed; `docs-app` consumes the typed addon via `workspace:*`.

## What changes, per sample type

**Live demos (12 `gjs live` fences → `gts live`).** `emberFence` already
supports `gts live` (it branches on `gjs`/`gts` and hands the virtual module
to vite-plugin-ember, which strips types). Each fence:
- fence language `gjs live` → `gts live`;
- `@action foo() {}` → `foo = (…) => {}` arrow-field, drop the
  `import { action } from '@ember/object'`;
- add light types (typed DOM-event handlers with an element cast; other
  types by inference);
- everything substantive is preserved verbatim in behavior: the
  `getOwner(this).lookup('service:google-maps-api')` service bypass, the
  `run()`-in-sandbox pattern and its `::: tip` note, the
  `${import.meta.env.BASE_URL}…` asset pattern, the component composition.

**Static component samples (`hbs` + `js` pairs → one `.gts`).** Where a page
shows a template block and a backing class as two blocks for the *same*
example, merge into one single-file `.gts` template-tag component. Any
`@action`/`{{action}}` in these becomes an arrow-field + `{{on}}`.

**Standalone template-syntax snippets** (a bare `<GMap @lat=… />` shown to
illustrate tag syntax, with no backing class): keep as a focused snippet.
Do **not** wrap a one-liner in a fabricated class + `<template>` — that adds
ceremony without teaching value. These may stay `hbs`/`gjs`/`gts` as a
fragment; prefer `gts` for consistency where it reads naturally, but a bare
tag has no types to add.

**`advanced.md` treeshaking prose:** delete the sentence that references the
removed build-time `only`/`except` config — it names an old paradigm readers
won't recognize.

## Types are grounded in the real addon

The addon now exports Glint signatures, e.g. `Circle`'s args are
`{ lat?: number; lng?: number } & google.maps.CircleOptions &
MapComponentEventArgs`; `GMap`'s are `{ lat?, lng?, renderCanvasInPlace?,
onReady? } & google.maps.MapOptions & MapComponentEventArgs`. Sample types
are written to be consistent with these — not a hand-invented approximation.
The `@on*` event args are typed by `MapComponentEventArgs`, so demo event
handlers match the real handler shapes.

## Best-effort type-checking of the blocks (nice-to-have)

The live fences are *compiled* (types stripped by esbuild/babel), not
*type-checked*. As a final, best-effort task: attempt a lightweight harness
that extracts the `gts`/`ts` fenced blocks to temp files with the right
imports and runs Glint (or `tsc` with the addon's `.d.ts` + `@types/google.maps`)
over them, to verify the samples actually type-check against the real addon
types. If this turns into more than modest tooling effort (missing
`@types/google.maps`, Glint config friction, fence-extraction edge cases),
fall back to authoring the samples directly against the real `.d.ts`
signatures (read them) and skip the automated check. This is explicitly
optional — the samples' correctness does not block on it.

## Testing / verification

Per page: `pnpm --filter docs-app start` with the API key, confirm the live
demo still renders and interacts (Playwright screenshot + interaction, same
as the original port). After all conversions: `pnpm --filter docs-app build`
must stay clean (zero dead links, no template-compile error). Re-check the
inline-mustache-in-prose trap (inline single-backtick span containing `{{`)
on every edited page, since prose is being touched. Final full-site
verification pass across all 18 pages (dev + production build under the
`/ember-google-maps/` base path), same shape as the port's final task.

## Out of scope

- The addon's own `import { inject as service }` deprecation (surfaces as a
  build-time warning now that the addon is TS-compiled) — it's the addon's
  code on `main`, not the docs'. Noted for a separate follow-up.
- Any restructuring of page prose beyond the `advanced.md` treeshaking
  sentence and the mechanical sample conversions.
- Extracting demo sub-components or other "best practice" refactors beyond
  syntax/type modernization — only done if a page's demo is genuinely
  tangled, not as a blanket pass.
