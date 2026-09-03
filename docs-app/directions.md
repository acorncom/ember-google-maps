# Directions

`Directions`, `Route`, and `Waypoint` live in a separate package,
[`ember-google-maps-directions`](https://github.com/acorncom/ember-google-maps),
so apps that don't need routing don't pay for it.

```sh
ember install ember-google-maps-directions
```

## Fetching directions

The `Directions` component fetches directions between locations. It's a
convenience wrapper for Google's
[`DirectionsService`](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsService):
render it, and it looks up the real `DirectionsService` for you and makes
the request. It yields the result as `directions`.

You need to provide at least the three
[`DirectionsRequest`](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsRequest)
options: `origin`, `destination`, and `travelMode`.

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  <Directions
    @origin="Covent Garden"
    @destination="Clerkenwell"
    @travelMode="WALKING"
    as |dir|
  >
    <!-- dir.directions is the DirectionsResult once it resolves -->
  </Directions>
</GMap>
```

For convenience, pass an `@onDirectionsChanged` handler and it's called
whenever the directions update. This is a custom event the addon fires
itself, similar to the native event on the
[`DirectionsRenderer`](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsRenderer).

## Adding waypoints

`Directions` also yields a `registerWaypoint` function. Pass it to a
`Waypoint` component's `@register` argument, along with a `@location` and
an optional `@stopover`, and the waypoint adds itself to the request:

```hbs
<Directions @origin="Covent Garden" @destination="Clerkenwell" @travelMode="WALKING" as |dir|>
  <Waypoint @register={{dir.registerWaypoint}} @location="Leather Lane" />
</Directions>
```

## Displaying routes

You might notice that `Directions` doesn't actually draw the route on the
map. That's deliberate — the results from `DirectionsService` are complex,
and you may not want to render the first route it comes back with by
default.

To actually draw a route, render a `Route` component and pass it the
`directions` result. Under the hood it uses a
[`DirectionsRenderer`](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsRenderer):

```hbs
<Directions @origin="Covent Garden" @destination="Clerkenwell" @travelMode="WALKING" as |dir|>
  <Route @directions={{dir.directions}} />
</Directions>
```

## Complex routing

Let's recreate one of Google's own
[complex directions examples](https://developers.google.com/maps/documentation/javascript/examples/directions-complex):
walk from Covent Garden to Clerkenwell, fetch the route, and drop a marker
on the map for every step along the way. Each marker gets an
[info window](/info-windows) attached, showing that step's instructions.
And since we're passing through the area anyway, let's add a waypoint at
Leather Lane for a coffee stop.

```hbs
<Directions
  @origin="Covent Garden"
  @destination="Clerkenwell"
  @travelMode="WALKING"
  @onDirectionsChanged={{this.onDirectionsChanged}}
  as |dir|
>
  <Waypoint @register={{dir.registerWaypoint}} @location="Leather Lane" />

  <Route
    @directions={{dir.directions}}
    @polylineOptions={{hash strokeColor="green" strokeWeight=8 strokeOpacity=0.7}}
  />

  {{#each this.routeSteps as |step|}}
    <Marker @position={{step.start_location}} @onClick={{this.toggleStep step}} />
  {{/each}}
</Directions>
```

If you're doing complex routing like this, manipulating the directions
object straight from a template gets painful fast. It's worth writing a
small helper. Here's one that pulls the steps out of the first leg of the
first route:

```js
// get-route-steps.js
export function getRouteSteps(directions) {
  try {
    return directions.routes[0].legs[0].steps;
  } catch (error) {
    return [];
  }
}
```

## Example

::: warning
The live demo below needs a Google Maps API key authorized for the
Directions API. The shared key this docs site runs on isn't, so
`DirectionsService` comes back with `REQUEST_DENIED` and no route draws —
same category of limitation as the `RefererNotAllowedMapError` you'll see
noted on other live-map pages, not a bug in the addon. Everything up to
that point — the component mounting, the task firing, the real request
going out to Google and the rejection coming back — works. Point this
page at a key with Directions enabled and the route, waypoint, and
step markers below all render.
:::

Click a marker to see that step's instructions, once a route is available.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fn, hash } from '@ember/helper';
import { GMap, Marker, InfoWindow } from 'ember-google-maps';
import { Directions, Route, Waypoint } from 'ember-google-maps-directions';
import { getRouteSteps } from './lib/get-route-steps.js';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class DirectionsExample extends Component {
  @tracked directionsResult = null;
  @tracked openStepIndex = null;

  get routeSteps() {
    return getRouteSteps(this.directionsResult);
  }

  get stepEntries() {
    return this.routeSteps.map((step, index) => ({
      step,
      index,
      isOpen: this.openStepIndex === index,
    }));
  }

  @action
  onDirectionsChanged(directionsAPI) {
    this.directionsResult = directionsAPI.directions;
  }

  @action
  toggleStep(index) {
    this.openStepIndex = this.openStepIndex === index ? null : index;
  }

  @action
  closeStep() {
    this.openStepIndex = null;
  }

  <template>
    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{14}}
      style="width: 100%; height: 500px;"
    >
      <Directions
        @origin="Covent Garden"
        @destination="Clerkenwell"
        @travelMode="WALKING"
        @onDirectionsChanged={{this.onDirectionsChanged}}
        as |dir|
      >
        <Waypoint @register={{dir.registerWaypoint}} @location="Leather Lane" />

        <Route
          @directions={{dir.directions}}
          @polylineOptions={{hash strokeColor="green" strokeWeight=8 strokeOpacity=0.7}}
        />

        {{#each this.stepEntries as |entry|}}
          <Marker
            @position={{entry.step.start_location}}
            @onClick={{fn this.toggleStep entry.index}}
            as |m|
          >
            <InfoWindow
              @target={{m.mapComponent}}
              @isOpen={{entry.isOpen}}
              @onCloseclick={{this.closeStep}}
            >
              {{entry.step.instructions}}
            </InfoWindow>
          </Marker>
        {{/each}}
      </Directions>
    </GMap>
  </template>
}
```
