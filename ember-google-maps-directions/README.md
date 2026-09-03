# ember-google-maps-directions

Directions, route, and waypoint components for
[ember-google-maps](https://github.com/acorncom/ember-google-maps). It draws
routes on a map and lets you set waypoints, built on top of the core addon's
map. Route requests run through [ember-concurrency](https://ember-concurrency.com/)
tasks — kept in this package so apps that don't need routing don't have to
depend on ember-concurrency at all.

## Compatibility

- Ember.js v5.12 or above
- `ember-google-maps` v8.0 or above (peer dependency)

## Installation

```
pnpm add ember-google-maps-directions
```

## Usage

```gjs
import { GMap } from 'ember-google-maps';
import { Directions, Route, Waypoint } from 'ember-google-maps-directions';

<template>
  <GMap @lat={{this.lat}} @lng={{this.lng}}>
    <Directions
      @origin="Covent Garden, London"
      @destination="Clerkenwell, London"
      @travelMode="WALKING"
      as |dir|
    >
      <Route @directions={{dir.directions}} />
      <Waypoint @register={{dir.registerWaypoint}} @location="Holborn, London" />
    </Directions>
  </GMap>
</template>
```

`<Directions>` fetches the route and yields `directions` (the raw
`DirectionsResult`) and `registerWaypoint`. `<Route>` renders the fetched
route on the map. `<Waypoint>` registers a stop along the route with its
parent `<Directions>`, not with the map directly.

## License

This project is licensed under the [MIT License](LICENSE.md).
