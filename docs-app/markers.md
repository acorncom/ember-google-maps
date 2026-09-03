# Creating markers

::: warning
Google has [deprecated the legacy `Marker`](https://developers.google.com/maps/deprecations#googlemapsmarker_in_the_deprecated_as_of_february_2024)
as of February 21st, 2024 (Maps JavaScript API v3.56). It still works
today, but you're encouraged to switch to the new
[`AdvancedMarker`](/advanced-markers) when you can.
:::

You can create a basic marker with the `Marker` component. As with `GMap`,
you can set its position with either `@lat` and `@lng`, or `@position`.

Every argument you pass to `Marker` is passed straight through as an
option, the same as `GMap`. Events work the same way too.

::: tip
Remember these are Google Maps events, not Ember events — see
[Events](/events) for how the `@on*` convention works.
:::

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  <Marker @lat={{51.5074}} @lng={{-0.1278}} @onClick={{this.onMarkerClick}} />
</GMap>
```

## Example

Click on a marker to find out its coordinates.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/owner';
import { fn } from '@ember/helper';
import { GMap, Marker } from 'ember-google-maps';
import { createLocations } from './lib/create-locations.js';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class MarkersExample extends Component {
  @tracked message = 'Click on a marker to find out its coordinates.';

  get googleMapsApi() {
    return getOwner(this).lookup('service:google-maps-api');
  }

  get google() {
    return this.googleMapsApi.google;
  }

  get locations() {
    let { maps } = this.google;

    if (!maps) {
      return [];
    }

    let origin = new maps.LatLng(LONDON.lat, LONDON.lng);

    return createLocations(this.google, origin);
  }

  @action
  flash(location) {
    this.message = `Clicked: ${location.lat}, ${location.lng}`;
  }

  <template>
    <p><strong>{{this.message}}</strong></p>
    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{12}}
      style="width: 100%; height: 400px;"
    >
      {{#each this.locations key="id" as |location|}}
        <Marker
          @lat={{location.lat}}
          @lng={{location.lng}}
          @visible={{true}}
          @draggable={{false}}
          @onClick={{fn this.flash location}}
        />
      {{/each}}
    </GMap>
  </template>
}
```
