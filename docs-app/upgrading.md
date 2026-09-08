# Upgrading to v8

v8 is a big change under the hood, but for most apps the day-to-day code stays the same. This guide walks through what changed, what you need to do, and the one or two things that might trip you up.

## The big picture

v8 is a full rebuild of the addon as a [v2 (Embroider/Vite) addon](https://github.com/embroider-build/embroider). In v7 the addon compiled itself into your app at build time and allowed custom components under the hood as well. In v8 it ships as prebuilt, typed ES modules that your app imports like any other package.

What that means for you:

- You need a build that can consume a v2 addon — **Embroider or Vite**. A classic ember-cli build without Embroider won't work.
- Unused components are dropped automatically through normal ES imports. The old build-time options that used to control this are gone (more on that below).
- The addon now passes map state to child components through [`ember-provide-consume-context`](https://github.com/customerio/ember-provide-consume-context). It's a peer dependency, so add it to your app — `pnpm add ember-provide-consume-context` (or the npm/yarn equivalent). Every app shares a single copy of it, which is why it's a peer rather than something each addon bundles. Strict-resolver apps have one more small thing to add on top (see [The context setup](#the-context-setup)).

## Before you start

Check that your app meets the new baseline:

- **Ember 5.12 or above**
- **Node 18 or above**
- An **Embroider- or Vite-based build**

Add one required peer dependency (see [The context setup](#the-context-setup) for why):

- `ember-provide-consume-context` — `pnpm add ember-provide-consume-context`

Two more peers are optional — add them only if you use that part of the addon:

- `@ember/test-helpers` — needed if you import the test helpers
- `@types/google.maps` — needed for TypeScript / Glint types

## The context setup

The biggest change in v8 is how a map shares its state with the components inside it. In v7, `<GMap>` yielded a `g` block and you hung children off it (`<g.marker/>`). In v8, those children read the map from *context*, so you render them as plain children of `<GMap>`. The next section shows that template change in full.

Why the move? Two reasons: better tree-shaking under Embroider, and routed-map scenarios — where child components render in different routes but still need to hook into their parent map. It's built on `ember-provide-consume-context`, and structured so we can switch to Ember's own context API once that lands.

Setup is quick once the context peer is installed:

::: tip Classic and @embroider/compat apps
Nothing to do — an initializer wires up context for you automatically.
:::

::: tip Strict-resolver apps (Vite / Polaris)
Add this line once in your `app.js`:

```js
import 'ember-google-maps/setup';
```

Without it, child components like `<Marker>` silently read no map context and don't render. In development you'll get a loud assertion saying exactly this; in production it just fails quietly. If your markers vanish after upgrading, this is probably why.
:::


## The `<GMap as |g|>` API is deprecated

This is the main template change. In v7 you rendered child components off a yielded `g` block:

```hbs
<!-- v7 -->
<GMap @lat={{this.lat}} @lng={{this.lng}} as |g|>
  <g.marker @lat={{this.lat}} @lng={{this.lng}} />
</GMap>
```

In v8 you render them as **direct children** of the map instead:

```hbs
<!-- v8, classic .hbs -->
<GMap @lat={{this.lat}} @lng={{this.lng}}>
  <GmapMarker @lat={{this.lat}} @lng={{this.lng}} />
</GMap>
```

```gjs
// v8, .gjs / .gts
import { GMap, Marker } from 'ember-google-maps';

<template>
  <GMap @lat={{this.lat}} @lng={{this.lng}}>
    <Marker @lat={{this.lat}} @lng={{this.lng}} />
  </GMap>
</template>
```

And where you used to read the map off <code v-pre>{{g.map}}</code>, use the `@onReady` action, which hands you the `google.maps.Map`:

```hbs
<!-- v7 -->
<GMap ... as |g|>
  {{do-something g.map}}
</GMap>

<!-- v8 -->
<GMap ... @onReady={{this.onReady}} />
```

The `<g.*>` translations, one for one:

| v7 | v8 (`.hbs`) | v8 (`.gjs` / `.gts`) |
| --- | --- | --- |
| `<g.marker/>` | `<GmapMarker/>` | `import { Marker }` → `<Marker/>` |
| `<g.circle/>` | `<GmapCircle/>` | `import { Circle }` → `<Circle/>` |
| `<g.infoWindow/>` | `<GmapInfoWindow/>` | `import { InfoWindow }` → `<InfoWindow/>` |
| `<g.overlay/>` | `<GmapOverlay/>` | `import { Overlay }` → `<Overlay/>` |
| <code v-pre>{{g.map}}</code> | `@onReady` | `@onReady` |
| …and so on for every yielded component | `<Gmap*/>` | named import |

::: tip A temporary escape hatch
Migrating a large app all at once? Import `GMap` from the deprecated entry point in a `.gjs` / `.gts` file and your existing `<GMap as |g|>` templates keep working (with deprecation warnings) until v9:

```js
import { GMap } from 'ember-google-maps/deprecated';
```

This is a bridge, not a long-term solution. Plan to move off it before v9.
:::

::: warning Nested per-marker yields are gone
Separately from the top-level `g` hash, v7 let you nest a component **inside a
marker's block** — most commonly an info window:
<code v-pre>&lt;g.marker as |marker|&gt;&lt;marker.infoWindow/&gt;&lt;/g.marker&gt;</code>.
In v8 a marker yields only its public API (`{ map, mapComponent }`), not child
components, and the deprecated bridge does **not** shim these nested yields.
Point the child at the marker with `@target` instead — the same pattern works
for `<Marker>` and `<AdvancedMarker>`:

```hbs
{{! v7 }}
<g.marker as |marker|>
  <marker.infoWindow @isOpen={{true}} @content="Hi" />
</g.marker>

{{! v8 }}
<Marker as |m|>
  <InfoWindow @target={{m.mapComponent}} @isOpen={{true}} @content="Hi" />
</Marker>
```
:::

### Two styles going forward — and both are fine

Once you're off the `g` hash, there are two supported ways to render components, and neither is deprecated:

- **`.gjs` / `.gts`:** `import { Marker } from 'ember-google-maps'` and render `<Marker/>`. Explicit, no name resolution.
- **Classic `.hbs`:** `<GmapMarker/>` resolves by name — no import needed.

Pick whichever fits the file you're in. We'll likely drop the `<Gmap*>` files at some point but there's not much rush there.

## Removed: build-time options and auto-discovery

Two v7 features that lived in `ember-cli-build.js` are gone, because v8 doesn't have work that way any more in Embroider / Vite.

**Component filtering options.** `only`, `except`, `customComponents`, and `mergeCustomComponents` under `'ember-google-maps'` no longer do anything. You don't need them — unused components are already dropped when you don't import them.

**The `g-map-addons/*` convention.** v7 auto-discovered third-party components by a package keyword and a folder convention. v8 drops the discovery machinery. Third-party components now **extend exported base classes** instead:

```js
import { MapComponent, TypicalMapComponent } from 'ember-google-maps';
```

Context, registration, and teardown are all handled by the base class — no need to wire up code. See [Advanced](/advanced) for a full custom-component example.

## Directions moved to its own package

We've moved `directions`, `route`, and `waypoint` components out of the core addon into a separate `ember-google-maps-directions` package. That package exists but hasn't been published yet as I don't directly use it. If you use it on your end, [let me know](https://github.com/acorncom/ember-google-maps/issues) and it shouldn't be hard to have AI do the upgrade on your side.

## Markers: prefer AdvancedMarker

Google [soft-deprecated](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration) `google.maps.Marker` in February 2024. `<Marker>` / `<GmapMarker>` still work, so nothing breaks on upgrade — but for new work, plan to use `<AdvancedMarker>`.

One difference to know: advanced markers need a [Map ID](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration#create-map-id) on the map, and they don't take the classic `styles` option.

```hbs
<GMap @lat={{this.lat}} @lng={{this.lng}} @mapId="YOUR_MAP_ID">
  <GmapAdvancedMarker @lat={{this.lat}} @lng={{this.lng}} />
</GMap>
```

See [Advanced markers](/advanced-markers) for details.

## Config: mostly unchanged

Your `config/environment.js` settings carry over as-is:

```js
ENV['ember-google-maps'] = {
  key: process.env.GOOGLE_MAPS_API_KEY,
  language: 'en',
  region: 'GB',
  version: '3.55',
  libraries: ['geometry', 'places'],
};
```

The one behind-the-scenes change: in v7 the API URL was built at compile time; in v8 the service builds it at runtime from the same settings. Same config, same result — just computed later. (The old build-time warnings for conflicting `key`/`client` or a `channel` without a `client` are no longer emitted.)

## Testing: no changes

The test helpers are the same. Keep importing from `ember-google-maps/test-support`:

```js
import { setupMapTest, waitForMap, trigger, getDirectionsQuery } from 'ember-google-maps/test-support';
```

`waitForMap` still resolves with `{ map, components, getComponent }`, and children are still grouped by name (`components.markers`, `components.circles`, and so on). `@ember/test-helpers` is now an optional peer dependency — you almost certainly already have it. See [Testing](/testing) for the full guide.

## Quick checklist

- [ ] On Ember 5.12+, Node 18+, and an Embroider/Vite build
- [ ] Replace `<GMap as |g|>` + `<g.*>` with direct children (or imported the deprecated bridge for now)
- [ ] Swapped <code v-pre>{{g.map}}</code> for `@onReady`
- [ ] Dropp the `only` / `except` / `customComponents` / `mergeCustomComponents` config
- [ ] Rewrite any `g-map-addons/*` components as subclasses of `MapComponent` / `TypicalMapComponent`
- [ ] Add `ember-google-maps-directions` if you use directions
- [ ] Plan to use `<AdvancedMarker>` for new markers
- [ ] Strict-resolver app? Added `import 'ember-google-maps/setup';` to `app.js`

Stuck on something this guide doesn't cover? [Open an issue](https://github.com/acorncom/ember-google-maps/issues) — we're happy to help.
