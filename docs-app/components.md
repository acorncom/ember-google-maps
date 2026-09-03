# Components

## Contextual components

Render map components as direct children of `<GMap>`. They automatically
register with the nearest map, wire themselves up to it, and wait to render
until the map is actually ready — you don't have to think about load order
yourself.

The addon currently provides the following components:

- [`Canvas`](/canvas)
- [`Marker`](/markers)
- [`AdvancedMarker`](/advanced-markers)
- [`Circle`](/circles)
- `Rectangle`
- [`Polyline`](/polylines)
- `Polygon`
- [`InfoWindow`](/info-windows)
- [`Control`](/controls)
- [`Overlay`](/overlays)
- `Autocomplete`
- [`Directions`, `Route`, `Waypoint`](/directions) — from the separate
  [`ember-google-maps-directions`](https://github.com/acorncom/ember-google-maps)
  package
- [`TrafficLayer`, `TransitLayer`, `BicyclingLayer`](/transit-layers)

All of these are named exports of `ember-google-maps`:

```js
import { GMap, Marker, Circle } from 'ember-google-maps';
```

## Setting options on components

Almost every argument you pass to a component gets passed straight through
as an option to the underlying Google Maps object. These docs don't try to
cover every option for every component — that's not really the point of
this addon. It's on you to look up what Google Maps itself supports. Where
it helps, we'll link out to the relevant Google Maps guide or reference,
like this: [Reference](https://developers.google.com/maps/documentation/javascript/reference/).

## Accessing component instances

Since these Ember components are just light wrappers around the real
Google Maps classes, you'll sometimes want the underlying instance
directly — to call a method Google Maps exposes that this addon doesn't
wrap, for example.

Render a component in block form and it yields its own `publicAPI`, which
exposes `mapComponent` (the raw Google Maps object) and `map` (the parent
`google.maps.Map`):

```hbs
<Marker @lat={{51.5074}} @lng={{-0.1278}} as |marker|>
  <InfoWindow @target={{marker.mapComponent}}>
    Hello!
  </InfoWindow>
</Marker>
```

If it's the map instance itself you're after — to call `panTo`, say — pass
an `@onReady` handler to `<GMap>`. It fires once, with the `google.maps.Map`
instance, as soon as the map is ready:

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @onReady={{this.onMapReady}} />
```

```js
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Example extends Component {
  @action
  onMapReady(map) {
    map.panTo({ lat: 51.5074, lng: -0.1278 });
  }
}
```

Learn more about what you can do with these components on their individual
pages.
