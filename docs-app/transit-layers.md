# Traffic, transit, and bicycling layers

`ember-google-maps` ships three layer components that overlay live Google
data on top of the map: `TrafficLayer`, `TransitLayer`, and
`BicyclingLayer`. Each one takes whatever options the underlying
`google.maps.*Layer` class accepts, and renders nothing itself — just drop
it inside `GMap`.

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  <TrafficLayer />
</GMap>
```

Only one of these makes sense on screen at a time, so switching between
them usually means conditionally rendering one or the other based on some
state you track yourself:

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  {{#if this.isTraffic}}
    <TrafficLayer />
  {{else if this.isTransit}}
    <TransitLayer />
  {{else if this.isBicycling}}
    <BicyclingLayer />
  {{/if}}
</GMap>
```

## Example

Switch between layers with the buttons below.

::: tip
The `run()` call below is only there because this live example runs in a
sandbox with no Ember event dispatcher, so a plain `on "click"` handler
doesn't get wrapped in a runloop for free. In a real Ember app you'd just
write `this.layer = newLayer` — no `run()` needed.
:::

```gts live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { run } from '@ember/runloop';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { GMap, TrafficLayer, TransitLayer, BicyclingLayer } from 'ember-google-maps';

const LONDON = { lat: 51.507568, lng: -0.127762 };

type Layer = 'traffic' | 'transit' | 'bicycling';

export default class TransitLayersExample extends Component {
  @tracked layer: Layer = 'traffic';

  switchLayer = (newLayer: Layer) => {
    // run() is only needed in this live docs sandbox (no Ember event
    // dispatcher to wrap the handler in a runloop); a real Ember app
    // doesn't need it.
    run(() => (this.layer = newLayer));
  };

  get isTraffic() {
    return this.layer === 'traffic';
  }

  get isTransit() {
    return this.layer === 'transit';
  }

  get isBicycling() {
    return this.layer === 'bicycling';
  }

  <template>
    <p>
      <button type="button" disabled={{this.isTraffic}} {{on "click" (fn this.switchLayer "traffic")}}>
        Traffic
      </button>
      <button type="button" disabled={{this.isTransit}} {{on "click" (fn this.switchLayer "transit")}}>
        Transit
      </button>
      <button type="button" disabled={{this.isBicycling}} {{on "click" (fn this.switchLayer "bicycling")}}>
        Bicycling
      </button>
    </p>

    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{12}}
      @minZoom={{10}}
      style="width: 100%; height: 400px;"
    >
      {{#if this.isTraffic}}
        <TrafficLayer />
      {{else if this.isTransit}}
        <TransitLayer />
      {{else if this.isBicycling}}
        <BicyclingLayer />
      {{/if}}
    </GMap>
  </template>
}
```
