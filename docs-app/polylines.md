# Polylines

## Creating polylines

Use the `Polyline` component to create a new polyline.

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{10}}>
  <Polyline
    @path={{this.flightCoordinates}}
    @geodesic={{true}}
    @strokeColor="orange"
    @strokeOpacity={{1}}
    @strokeWeight={{3}}
  />
</GMap>
```

## Example

Click on the map to append new points to the polyline.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { GMap, Polyline } from 'ember-google-maps';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class PolylinesExample extends Component {
  @tracked path = [
    { lat: 51.56742722687343, lng: -0.25783538818359375 },
    { lat: 51.51917163898047, lng: -0.23586273193359375 },
    { lat: 51.46680134633284, lng: -0.09922027587890625 },
    { lat: 51.476892649684764, lng: -0.0006866455078125 },
    { lat: 51.500154286474746, lng: 0.05218505859375 },
  ];

  @action
  appendPoint(event) {
    let { latLng } = event.googleEvent;

    this.path = [...this.path, { lat: latLng.lat(), lng: latLng.lng() }];
  }

  <template>
    <p>Points: {{this.path.length}}</p>

    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{10}}
      @onClick={{this.appendPoint}}
      style="width: 100%; height: 400px;"
    >
      <Polyline
        @path={{this.path}}
        @geodesic={{true}}
        @strokeColor="orange"
        @strokeOpacity={{1}}
        @strokeWeight={{3}}
      />
    </GMap>
  </template>
}
```
