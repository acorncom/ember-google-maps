# ember-google-maps

[![Latest version][npm-version-badge]][npm-url]
[![npm][npm-downloads-badge]][npm-url]
[![Ember Observer Score][ember-observer-badge]][ember-observer-url]
[![Build Status][ci-badge]][ci-url]

A friendly [Ember][ember-url] addon for working with [Google Maps][google-maps-url].

- Create and draw on your maps using Ember components.
- Load the Google Maps API on demand and access it safely across your app.
- Tree-shakeable: import only the components you use.

<br>

> #### Thanks for using the addon!
>
> ember-google-maps has been around for quite a while now, with a lot of labor and love poured into it by [sandydoo](https://github.com/sandydoo). He has since moved on but we're still interested in supporting this. I'd love to keep working on this addon in my free time, but could use your support.
>
> If you use ember-google-maps in your commercial work or find it valuable, consider leaving a donation to support on-going maintenance and API costs.
>
> [💜 Sponsor @acorncom on GitHub](https://github.com/acorncom)
>
> Thank you! 🙌🙌🙌\
> — @acorncom

<br>

- [Compatibility](#-compatibility)
- [Quick start](#-quick-start)
- [Examples](#-examples)
- [Migrating from v7 and earlier](#-migrating-from-v7-and-earlier)
- [Building your own map components](#-building-your-own-map-components)
- [Extra addons](#-extra-addons)
- [Maintainers](#-maintainers)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

Are you new to Ember? [Learn how to use Ember and install addons →](https://guides.emberjs.com/release/getting-started/quick-start/)

Looking for a more general mapping solution? [Check out ember-leaflet →](https://github.com/miguelcobain/ember-leaflet).

🔗 Compatibility
--------------------------------------------------------------------------------

- Ember.js v5.12 or above
- Node.js v18 or above
- Embroider or ember-auto-import v2

💨 Quick start
--------------------------------------------------------------------------------

1. Install the addon.

```sh
pnpm add ember-google-maps
```

2. Provide a Google Maps API key in `config/environment.js`. [Learn how to create an API key →](https://developers.google.com/maps/documentation/javascript/get-api-key)

```js
'ember-google-maps': {
  key: '<GOOGLE_MAPS_API_KEY>',
}
```

3. Make sure your map has a size, or you'll end up staring at a blank screen.

```css
.ember-google-map {
  width: 500px;
  height: 500px;
}
```

4. Import and draw a map at some coordinates.

```gjs
import { GMap } from 'ember-google-maps';

<template>
  <GMap @lat="51.508530" @lng="-0.076132" />
</template>
```

Great — you've drawn a map.

⭐ Examples
--------------------------------------------------------------------------------

Display a map centered on a set of coordinates, with a marker on it.

```gjs
import { GMap, Marker } from 'ember-google-maps';

<template>
  <GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}}>
    <Marker @lat="51.508530" @lng="-0.076132" />
  </GMap>
</template>
```

Display an array of locations using markers 📍.

```gjs
import { GMap, Marker } from 'ember-google-maps';
import { fn } from '@ember/helper';

<template>
  <GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}}>
    {{#each this.locations as |location|}}
      <Marker
        @lat={{location.lat}}
        @lng={{location.lng}}
        @onClick={{fn this.showDetails location}}
      />
    {{/each}}
  </GMap>
</template>
```

Display a custom overlay, like a custom HTML marker, using template blocks 😱. This lets you do all sorts of fancy things, like adding CSS animations and binding data.

```gjs
import { GMap, Overlay } from 'ember-google-maps';

<template>
  <GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}}>
    {{#each this.rentals as |rental|}}
      <Overlay @lat={{rental.lat}} @lng={{rental.lng}}>
        <div style="transform: translateX(-50%) translateY(-50%);">
          <p class="price">{{rental.price}}</p>
        </div>
      </Overlay>
    {{/each}}
  </GMap>
</template>
```

Every built-in component (`Marker`, `AdvancedMarker`, `InfoWindow`, `Circle`, `Rectangle`, `Polygon`, `Polyline`, `Control`, `Autocomplete`, `TrafficLayer`, `TransitLayer`, `BicyclingLayer`) is available the same way, imported from `ember-google-maps`. Need routing? See [`ember-google-maps-directions`](../ember-google-maps-directions) below.

🔀 Migrating from v7 and earlier
--------------------------------------------------------------------------------

v8 rewrites the addon for Embroider, but nothing breaks. If your app still uses the v7 yielded style —

```hbs
<GMap @lat={{this.lat}} @lng={{this.lng}} as |g|>
  <g.marker @lat={{this.lat}} @lng={{this.lng}} />
</GMap>
```

— it keeps working. Classic `.hbs` apps get this automatically; apps that import `GMap` directly can opt in with one changed import:

```js
import { GMap } from 'ember-google-maps/deprecated';
```

Either way you'll see a deprecation warning pointing you at the flat replacement — `<GmapMarker>` in `.hbs`, or `import { Marker }` in `.gjs`/`.gts`. The yielded `g.*` namespace is deprecated (planned removal in v9); the flat `<Gmap*>` components are not going away.

🧩 Building your own map components
--------------------------------------------------------------------------------

Third-party components — a marker clusterer, a custom shape — can extend the same base classes the addon's own components use, with no context or registry code of their own:

```js
import { MapComponent, TypicalMapComponent } from 'ember-google-maps';
```

Extend `TypicalMapComponent` for anything backed by a standard `setMap(map)` Google object (markers, shapes, layers). Extend `MapComponent` directly for anything custom — override `setup`/`update`/`teardown` and add a `get name()` for the registry.

🛒 Extra addons
--------------------------------------------------------------------------------

- [ember-google-maps-directions](../ember-google-maps-directions) — Directions, routes, and waypoints, built on the public extension API above. Kept as a separate package so apps that don't need routing don't pull in ember-concurrency.
- [MarkerClustererPlus](https://github.com/acorncom/ember-google-maps-markerclustererplus) — Add marker clustering to your maps with [@googlemaps/markerclustererplus](https://github.com/googlemaps/js-markerclustererplus).

😇 Maintainers
--------------------------------------------------------------------------------

This addon is maintained by **[David Baker][maintainer-url]**.

Contributing
--------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.

License
--------------------------------------------------------------------------------

[MIT][license-url] ©2017-2024 [Sander Melnikov][old-maintainer-url].
[MIT][license-url] ©2024-present [David Baker][maintainer-url].

Disclaimer
--------------------------------------------------------------------------------

This software is not endorsed, maintained, or supported by Google LLC.

© 2020 Google LLC All rights reserved. Google Maps™ is a trademark of Google LLC.


[npm-version-badge]: https://img.shields.io/npm/v/ember-google-maps.svg?label=latest
[npm-downloads-badge]: https://img.shields.io/npm/dt/ember-google-maps
[npm-url]: https://www.npmjs.org/package/ember-google-maps

[ci-badge]: https://github.com/acorncom/ember-google-maps/workflows/CI/badge.svg?branch=main
[ci-url]: https://github.com/acorncom/ember-google-maps/actions?query=workflow%3ACI

[ember-observer-badge]: https://emberobserver.com/badges/ember-google-maps.svg
[ember-observer-url]: https://emberobserver.com/addons/ember-google-maps

[ember-url]: https://emberjs.com
[google-maps-url]: https://developers.google.com/maps/documentation/javascript/overview

[old-maintainer-url]: https://github.com/sandydoo
[maintainer-url]: https://github.com/acorncom
[license-url]: https://github.com/acorncom/ember-google-maps/blob/main/LICENSE
