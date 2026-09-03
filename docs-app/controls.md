# Controls

## Adding, removing, and repositioning built-in controls

Almost anything you pass to `GMap` gets passed straight through as an
option to the underlying map, and control options are no exception. Add or
remove a specific control by setting its variable to `true` or `false`.
Learn more at Google's own
[Controls guide](https://developers.google.com/maps/documentation/javascript/controls).

Let's disable the default UI, then turn the zoom control back on and move
it to the top left:

```hbs
<GMap
  @lat={{51.5074}}
  @lng={{-0.1278}}
  @zoom={{12}}
  @disableDefaultUI={{true}}
  @zoomControl={{true}}
  @zoomControlOptions={{hash position=this.google.maps.ControlPosition.TOP_LEFT}}
/>
```

::: tip
Positions come from constants defined on `google.maps.ControlPosition` —
plain integers under the hood. You don't normally have access to the
`google` global in a template, so the safe way to reach it is through the
`google-maps-api` service, looked up via `getOwner`:

```ts
import { getOwner } from '@ember/owner';

get google() {
  return getOwner(this).lookup('service:google-maps-api').google;
}
```

That way, once `google` finishes loading, the template updates with the
real position value.
:::

## Adding custom map controls

For more complex map UIs, you might want to add your own controls — a
button that lets the user trigger some custom action right from the map.
Let's add a button to the top center of the map that pans back to London
and resets the zoom level to 12.

The `Control` component takes a `@position` argument and a block. The
position is a string naming one of Google's
[`ControlPosition`](https://developers.google.com/maps/documentation/javascript/reference/control#ControlPosition)
constants — the component looks it up on `google.maps.ControlPosition`
for you, so you never have to touch the constant directly. Whatever you
put in the block renders inside the control, attached to the map at that
position.

Grab the underlying `google.maps.Map` instance with `@onReady` on `GMap`,
then use it in your button's click handler:

```gts
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { GMap, Marker, Control } from 'ember-google-maps';

export default class MapWithControls extends Component {
  map?: google.maps.Map;

  onMapReady = (map: google.maps.Map) => {
    this.map = map;
  };

  recenterMap = () => {
    this.map!.setZoom(12);
    this.map!.panTo({ lat: 51.5074, lng: -0.1278 });
  };

  <template>
    <GMap
      @lat={{51.5074}}
      @lng={{-0.1278}}
      @zoom={{12}}
      @onReady={{this.onMapReady}}
    >
      <Marker @lat={{51.5074}} @lng={{-0.1278}} />

      <Control @position="TOP_CENTER">
        <button type="button" {{on "click" this.recenterMap}}>
          Recenter map
        </button>
      </Control>
    </GMap>
  </template>
}
```

## Example

Pan or zoom the map around, then click the button to snap it back.

```gts live
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { GMap, Marker, Control } from 'ember-google-maps';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class ControlsExample extends Component {
  map?: google.maps.Map;

  onMapReady = (map: google.maps.Map) => {
    this.map = map;
  };

  recenterMap = () => {
    this.map!.setZoom(12);
    this.map!.panTo(LONDON);
  };

  <template>
    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{12}}
      @onReady={{this.onMapReady}}
      style="width: 100%; height: 400px;"
    >
      <Marker @lat={{LONDON.lat}} @lng={{LONDON.lng}} />

      <Control @position="TOP_CENTER">
        <button type="button" {{on "click" this.recenterMap}}>
          Recenter map
        </button>
      </Control>
    </GMap>
  </template>
}
```
