# Circles

## Creating circles

Circles are pretty much markers with a radius. Use the `Circle` component
to create one.

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  <Circle
    @lat={{51.507568}}
    @lng={{-0.127762}}
    @radius={{500}}
    @fillColor="#00F900"
    @fillOpacity={{0.3}}
    @strokeColor="darkgreen"
    @strokeOpacity={{0.5}}
    @strokeWeight={{1}}
  />
</GMap>
```

## Example

Modify the radius and fill color below and watch the circle update live.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { run } from '@ember/runloop';
import { on } from '@ember/modifier';
import { GMap, Circle } from 'ember-google-maps';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class CirclesExample extends Component {
  @tracked radius = 1000;
  @tracked fillColor = '#00F900';

  @action
  updateRadius(event) {
    let value = event.target.valueAsNumber;
    run(() => (this.radius = value));
  }

  @action
  updateFillColor(event) {
    let value = event.target.value;
    run(() => (this.fillColor = value));
  }

  <template>
    <div>
      <label for="radius-input">Radius: {{this.radius}}m</label>
      <br />
      <input
        id="radius-input"
        type="number"
        step="100"
        min="100"
        max="1500"
        value={{this.radius}}
        {{on "input" this.updateRadius}}
      />

      <label for="fill-color-input">Fill color</label>
      <input
        id="fill-color-input"
        type="color"
        value={{this.fillColor}}
        {{on "input" this.updateFillColor}}
      />
    </div>

    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{14}}
      style="width: 100%; height: 400px;"
    >
      <Circle
        @lat={{LONDON.lat}}
        @lng={{LONDON.lng}}
        @radius={{this.radius}}
        @fillColor={{this.fillColor}}
        @fillOpacity={{0.3}}
        @strokeColor="darkgreen"
        @strokeOpacity={{0.5}}
        @strokeWeight={{1}}
      />
    </GMap>
  </template>
}
```
