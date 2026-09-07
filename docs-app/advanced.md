# Advanced

## Overriding the Google Maps API URL at runtime

Sometimes you want to control the URL used to load the Google Maps API
while your Ember app is actually running — to set the language parameter
based on the current user's preferences, for example.

To change the URL, override the `buildGoogleMapsUrl` hook on the
`google-maps-api` service. It receives whatever configuration options you
set in `environment.js`.

```ts
// app/services/google-maps-api.ts
import GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';
import { service } from '@ember/service';

// currentUser is a hypothetical service from your own app, not something
// this addon declares -- type it to match your app's own service.
export default class extends GoogleMapsApiService {
  @service declare currentUser: { locale: string };

  buildGoogleMapsUrl(config: Record<string, unknown>) {
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

```ts
// app/services/google-maps-api.ts
import GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';
import { service } from '@ember/service';

// store and session are hypothetical services from your own app, not
// something this addon declares -- type them to match your app's own
// services.
export default class extends GoogleMapsApiService {
  @service declare store: {
    findRecord(type: string, id: string): Promise<{ locale: string }>;
  };
  @service declare session: { currentUserId: string };

  async buildGoogleMapsUrl(config: Record<string, unknown>) {
    const user = await this.store.findRecord(
      'user',
      this.session.currentUserId,
    );

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

```gts
// app/components/ground-overlay.gts
import { TypicalMapComponent } from 'ember-google-maps';

// newMapComponent receives the map component's options as a loose bag
// (the base signature is Record<string, unknown>), so extend that with the
// concrete fields this component expects.
interface GroundOverlayOptions extends Record<string, unknown> {
  url: string;
  bounds: google.maps.LatLngBoundsLiteral;
}

export default class GroundOverlay extends TypicalMapComponent {
  get name() {
    return 'groundOverlays';
  }

  newMapComponent(options: GroundOverlayOptions) {
    return new google.maps.GroundOverlay(options.url, options.bounds);
  }

  <template></template>
}
```

```hbs
<GMap @lat={{51.5}} @lng={{-0.1}} @zoom={{12}}>
  <GroundOverlay @url="/floorplan.png" @bounds={{this.bounds}} />
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

— so your bundler tree-shakes the rest away automatically.

## Performance issues

This addon leans heavily on Ember components, which is what makes it
simple and pleasant to use. That comes at a cost, though: each component
carries a bit of setup overhead that can add up. Normally that's not a
problem, outside some extreme cases. If you're rendering thousands of
markers, you're better off creating them directly in JavaScript, or just
showing fewer markers in the first place.
