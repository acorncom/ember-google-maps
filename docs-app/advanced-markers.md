# Creating advanced markers

The [Advanced Marker](https://developers.google.com/maps/documentation/javascript/advanced-markers/overview)
is Google's successor to the legacy [`Marker`](/markers). To use advanced
markers, the map needs a
[Map ID](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration#create-map-id).
Legacy styling with `styles` is disabled once the map has one.

You can create an advanced marker with the `AdvancedMarker` component. As
with `GMap` and `Marker`, you can set its position with either `@lat` and
`@lng`, or `@position`.

Every argument you pass to `AdvancedMarker` is passed straight through as
an option, the same as `Marker`.

::: tip
Remember these are Google Maps events, not Ember events — see
[Events](/events) for how the `@on*` convention works.
:::

::: warning
The live demo below passes a placeholder `@mapId` — `DEMO_MAP_ID` isn't
tied to a real Google Cloud project. Advanced markers still render fine
with a placeholder (Google falls back to the default pin styling), so
the demo below works end to end. What you won't get without a real Map
ID is any of the cloud-based styling — custom colors, icons, and so on,
configured in the Google Cloud Console. Swap in a Map ID from your own
project to use that.
:::

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}} @mapId="DEMO_MAP_ID">
  {{! DEMO_MAP_ID is a placeholder — swap in a real Google Cloud Map ID for cloud-based marker styling }}
  <AdvancedMarker
    @lat={{51.5074}}
    @lng={{-0.1278}}
    @gmpDraggable={{false}}
    @onClick={{this.onMarkerClick}}
  />
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
import { GMap, AdvancedMarker } from 'ember-google-maps';
import { createLocations } from './lib/create-locations.js';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class AdvancedMarkersExample extends Component {
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
    {{! DEMO_MAP_ID is a placeholder — swap in a real Google Cloud Map ID for cloud-based marker styling }}
    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{12}}
      @mapId="DEMO_MAP_ID"
      style="width: 100%; height: 400px;"
    >
      {{#each this.locations key="id" as |location|}}
        <AdvancedMarker
          @lat={{location.lat}}
          @lng={{location.lng}}
          @gmpDraggable={{false}}
          @onClick={{fn this.flash location}}
        />
      {{/each}}
    </GMap>
  </template>
}
```
