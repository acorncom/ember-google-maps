# Advanced

## Overriding the Google Maps API URL at runtime

Sometimes you want to control the URL used to load the Google Maps API
while your Ember app is actually running — to set the language parameter
based on the current user's preferences, for example.

To change the URL, override the `buildGoogleMapsUrl` hook on the
`google-maps-api` service. It receives whatever configuration options you
set in `environment.js`.

```js
// app/services/google-maps-api.js
import GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';
import { inject as service } from '@ember/service';

export default class extends GoogleMapsApiService {
  @service currentUser;

  buildGoogleMapsUrl(config) {
    return super.buildGoogleMapsUrl({
      ...config,
      language: this.currentUser.locale,
    });
  }
}
```

The URL can also depend on external, asynchronously loaded data. Sticking
with the localisation example, you could fetch the current user's language
preference from an external database. While you wait for it to respond,
just return the promise — it'll resolve with the right URL for the API.

```js
// app/services/google-maps-api.js
import GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';
import { inject as service } from '@ember/service';

export default class extends GoogleMapsApiService {
  @service store;
  @service session;

  async buildGoogleMapsUrl(config) {
    let user = await this.store.findRecord('user', this.session.currentUserId);

    return super.buildGoogleMapsUrl({ ...config, language: user.locale });
  }
}
```

## Custom components

Sometimes the built-in components just aren't enough, or they don't quite
work the way you want. That's where custom components come in — write your
own and use it exactly like any of the built-in ones.

Every built-in component is built on two public base classes exported from
`ember-google-maps`: `MapComponent`, for anything custom, and
`TypicalMapComponent`, for the common case of a Google Maps object with a
`setMap(map)` method (markers, shapes, layers). Extending either gets you
the map context and the async setup/update/teardown lifecycle for free — no
context or registration code required.

```js
// app/components/heatmap-layer.gjs
import { TypicalMapComponent } from 'ember-google-maps';

export default class HeatmapLayer extends TypicalMapComponent {
  get name() {
    return 'heatmapLayers';
  }

  newMapComponent(options) {
    return new google.maps.visualization.HeatmapLayer(options);
  }

  <template></template>
}
```

```hbs
<GMap @lat={{51.5}} @lng={{-0.1}} @zoom={{12}}>
  <HeatmapLayer @data={{this.points}} />
</GMap>
```

There isn't a guide yet on writing your own components from scratch, so the
best way in is to read one of the built-in ones and go from there.

## Treeshaking

Ember apps that lean heavily on addons can end up quite large, which hurts
load times. Addons — this one included — serve a wide range of developers
and end up including features you may never touch.

The good news: every component is a plain, individually-importable ES
module. You only import the ones you actually use —

```js
import { GMap, Marker, Circle } from 'ember-google-maps';
```

— so your bundler tree-shakes the rest away automatically. There's no more
build-time `only`/`except` configuration to maintain.

## Performance issues

This addon leans heavily on Ember components, which is what makes it
simple and pleasant to use. That comes at a cost, though: each component
carries a bit of setup overhead that can add up. Normally that's not a
problem, outside some extreme cases. If you're rendering thousands of
markers, you're better off creating them directly in JavaScript, or just
showing fewer markers in the first place.
