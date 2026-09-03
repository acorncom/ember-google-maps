# docs-app design

## Problem

The v1 `main` branch had a full documentation site at `docs/` — 19 content
pages (getting-started, map, markers, circles, polylines, overlays,
info-windows, controls, events, advanced, advanced-markers, canvas,
complex-ui, transit-layers, clustering, directions, testing, components)
plus a "sweet rentals" worked example, deployed to
`ember-google-maps.sandydoo.me`. That whole directory was deleted in the
"Move ember-google-maps into a pnpm monorepo" commit during the v2 migration
and never rebuilt — `test-app-basic` is the real-Google test harness, not a
docs site, and has no narrative content. There is currently no documentation
site anywhere for the addon.

## Goals

- Full content parity with the v1 site: all 19 pages, rewritten for the v2
  import API (`<Marker>` etc., not the deprecated `<g.*>` yield).
- Every demo on the site runs the actual current addon code, so the docs
  can't silently drift out of sync with the addon's real behavior.
- Publishable to GitHub Pages on a new domain (domain TBD later by the
  user — the pipeline should not hardcode one).

## Non-goals

- A visual redesign. Reuse the v1 layout/CSS as a starting point.
- New content beyond the 19 pages + example.
- Duplicating the addon's real-Google test coverage inside the docs app.

## Architecture

A new workspace package, **`docs-app/`** (deliberately not `docs/` — that
name stays reserved for planning specs like this one, per the original
migration plan). It is a private, unpublished Ember app built the same way
as `test-app-basic`: Vite + Embroider-compat, `.gjs` templates, no
TypeScript (matches the addon's authoring-format decision).

`docs-app` consumes `ember-google-maps` and `ember-google-maps-directions`
as real workspace dependencies (`workspace:*`, injected — same pattern as
the other test apps), so every live demo runs the addon's actual current
source, not a frozen copy.

## Components

- One route per doc page under `docs-app/app/templates/docs/*.gjs`: all 19
  pages listed above, plus `examples/sweet-rentals.gjs`.
- A shared layout ported from v1's `templates/docs.hbs` — sidebar nav
  (`NavMain`), footer (`FooterMain`), two-column split (prose left, sticky
  live demo right). Reused as a starting point; light cleanup is fine, a
  redesign is not in scope.
- Small callout components ported from v1: `DocTip`, `DocDanger`.
- Content rewritten for the v2 import API throughout — this is also where
  the addon's own migration story (deprecated bridge, `<Gmap*>` compat)
  gets documented for real, not just described in the README.

## Code snippet display — OPEN DECISION

v1 used `ember-code-snippet` (a Broccoli-era addon: build-time extraction of
named snippet blocks via `{{! BEGIN-SNIPPET name}}...{{! END-SNIPPET}}`
comments) plus Prism.js for syntax highlighting. Whether `ember-code-snippet`
still works under Embroider/Vite is unverified, and the Ember community has
modern replacements worth surveying before picking one. **Do not decide this
during implementation planning — bring options back to the user first.** A
fallback exists (Vite's native `?raw` import + a highlighter) if nothing
modern fits, but the decision itself is deferred, not the fallback.

## Build & deploy

- Add `docs-app` as its own entry in `pnpm-workspace.yaml` — the
  `test-app-*`/`test-addon-*` globs won't match it (the same gotcha
  `ember-google-maps-directions` hit during Phase 3).
- New `.github/workflows/docs.yml`: build `docs-app` on push to `main`,
  publish via GitHub's native Pages deployment (`upload-pages-artifact` +
  `deploy-pages`), not a `gh-pages` branch.
- Manual one-time steps for the user, called out explicitly so they aren't
  missed: flip **Settings → Pages → Source: GitHub Actions**; add a `CNAME`
  file once a domain is chosen; add the deployed domain as an allowed HTTP
  referrer on the Google Cloud API key used by the deployed site.
- **API key:** the deployed site cannot reuse the test suite's
  localhost-only `.env.test` key. Since a public site's key ships in public
  JS, it should be a separate, domain-restricted key, stored as its own
  repo secret (e.g. `GOOGLE_MAPS_DOCS_API_KEY`), not the CI test key.

## Testing

A build/lint check in CI is sufficient (`pnpm --filter docs-app lint` +
`pnpm --filter docs-app build`). The addon's own real-Google component
tests in `test-app-basic` already cover correctness; re-testing the same
behavior inside the docs app would be redundant.
