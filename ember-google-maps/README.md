# Ember Google Maps

[![Latest version][npm-version-badge]][npm-url]
[![npm][npm-downloads-badge]][npm-url]
[![Ember Observer Score][ember-observer-badge]][ember-observer-url]
[![Build Status][ci-badge]][ci-url]

A friendly [Ember][ember-url] addon for working with [Google Maps][google-maps-url].

- Create and draw on your maps using Ember components.
- Automatically load the Google Maps API on demand and safely access it across your whole app.

<br>

> #### Thanks for using the addon!
>
> ember-google-maps has been around for years. It started as [Sander Melnikov][sandydoo-url]'s work and is now maintained by [Acorn Web Consultants][acorncom-url], rebuilt as a modern [v2 addon](https://github.com/embroider-build/embroider) for Ember Octane and Polaris.
>
> If you use it in your commercial work, or just find it useful, consider sponsoring ongoing maintenance and API costs.
>
> [![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-%E2%9D%A4-db61a2?logo=githubsponsors)][sponsor-url]
>
> Thank you! 🙌

<br>

- [Documentation](#-documentation)
  - [Quick start](#-quick-start-for-the-impatient)
- [Upgrading from v7](#-upgrading-from-v7)
- [Compatibility](#-compatibility)
- [Examples](#-examples)
- [Companion packages](#-companion-packages)
- [Maintainers](#-maintainers)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

New to Ember? [Learn how to use Ember and install addons →](https://guides.emberjs.com/release/getting-started/quick-start/)

Looking for a more general mapping solution? [Check out ember-leaflet →](https://github.com/miguelcobain/ember-leaflet).

📎 Documentation
--------------------------------------------------------------------------------

**[Get started with ember-google-maps →][docs-url]**

### 💨 Quick start for the impatient

1. Install the addon.

```sh
ember install ember-google-maps
```

2. Provide a Google Maps API key in `config/environment.js`. [Learn how to create an API key →](https://developers.google.com/maps/documentation/javascript/get-api-key)

```js
'ember-google-maps': {
  key: '<GOOGLE_MAPS_API_KEY>',
}
```

3. Give your map a size, or you'll end up staring at a blank screen. `ember-google-map` is the default class for all maps.

```css
.ember-google-map {
  width: 500px;
  height: 500px;
}
```

4. Draw a map at some coordinates.

```hbs
<GMap @lat="51.508530" @lng="-0.076132" />
```

5. That's it — you've drawn a map.\
   **[Now keep reading the docs →][docs-url]**


🚀 Upgrading from v7
--------------------------------------------------------------------------------

v8 is a big change: the addon is now a [v2 (Embroider/Vite) addon](https://github.com/embroider-build/embroider), and the old `<GMap as |g|>` yielded API is deprecated in favour of rendering components as direct children (shown below).

**[Read the v7 → v8 upgrade guide →][upgrade-url]**


🔗 Compatibility
--------------------------------------------------------------------------------

- Ember.js v5.12 or above
- Node.js v18 or above
- A [v2-addon-capable build](https://github.com/embroider-build/embroider): Embroider or Vite


⭐ Examples
--------------------------------------------------------------------------------

Display a map centered on a set of coordinates.

```hbs
<GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}} />
```

Display a set of locations using markers 📍. Render the components as direct children of the map. Advanced markers need a [Map ID](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration#create-map-id) on the map — swap the placeholder for a real one.

```hbs
<GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}} @mapId="DEMO_MAP_ID">
  {{#each this.locations as |location|}}
    <GmapAdvancedMarker
      @lat={{location.lat}}
      @lng={{location.lng}}
      @onClick={{fn this.showDetails location}} />
  {{/each}}
</GMap>
```

Display a custom overlay — like an HTML marker — using template blocks 😱. This lets you do all sorts of fancy things, like CSS animations and bound data.

```hbs
<GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}}>
  {{#each this.rentals as |rental|}}
    <GmapOverlay @lat={{rental.lat}} @lng={{rental.lng}}>
      <div style="transform: translateX(-50%) translateY(-50%);">
        <p class="price">
          {{rental.price}}
        </p>
      </div>
    </GmapOverlay>
  {{/each}}
</GMap>
```

Writing `.gjs` / `.gts` components? Import the components and render them directly — no name resolution needed.

```gjs
import { GMap, AdvancedMarker } from 'ember-google-maps';

<template>
  <GMap @lat="51.508530" @lng="-0.076132" @zoom={{10}} @mapId="DEMO_MAP_ID">
    <AdvancedMarker @lat="51.508530" @lng="-0.076132" />
  </GMap>
</template>
```

**[Learn more →][docs-url]**


📦 Companion packages
--------------------------------------------------------------------------------

- **[Directions][directions-docs-url]** — draw routes and directions on your maps. Being brought over from v7 as a separate package.
- **[Clustering][clustering-docs-url]** — group nearby markers together. Coming soon.


😇 Maintainers
--------------------------------------------------------------------------------

- Maintained by **[Acorn Web Consultants][acorncom-url]** (David Baker).
- Originally created by **[Sander Melnikov][sandydoo-url]**.


Contributing
--------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
--------------------------------------------------------------------------------

[MIT][license-url] © Sander Melnikov and contributors.


Disclaimer
--------------------------------------------------------------------------------

This software is not endorsed, maintained, or supported by Google LLC.

© 2020 Google LLC All rights reserved. Google Maps™ is a trademark of Google LLC.


[npm-version-badge]: https://img.shields.io/npm/v/ember-google-maps.svg?label=latest
[npm-downloads-badge]: https://img.shields.io/npm/dt/ember-google-maps
[npm-url]: https://www.npmjs.org/package/ember-google-maps

[ci-badge]: https://github.com/acorncom/ember-google-maps/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/acorncom/ember-google-maps/actions/workflows/ci.yml

[ember-observer-badge]: https://emberobserver.com/badges/ember-google-maps.svg
[ember-observer-url]: https://emberobserver.com/addons/ember-google-maps

[ember-url]: https://emberjs.com
[google-maps-url]: https://developers.google.com/maps/documentation/javascript/overview

[docs-url]: https://acorncom.github.io/ember-google-maps/getting-started
[upgrade-url]: https://acorncom.github.io/ember-google-maps/upgrading
[directions-docs-url]: https://acorncom.github.io/ember-google-maps/directions
[clustering-docs-url]: https://acorncom.github.io/ember-google-maps/clustering

[acorncom-url]: https://github.com/acorncom
[sandydoo-url]: https://github.com/sandydoo
[sponsor-url]: https://github.com/sponsors/acorncom
[license-url]: https://github.com/acorncom/ember-google-maps/blob/main/LICENSE.md
