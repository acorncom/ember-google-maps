# Complex UI

A full worked example app for the pattern below isn't ported yet — tracked
separately in
[issue #23](https://github.com/acorncom/ember-google-maps/issues/23).

## Building a rentals website

It's time to show what you can build with these pieces! A popular pattern
is the Airbnb-style interface — a list of data on one side, a map
visualising it on the other. (Even the Ember guides build a rentals app to
teach this.) The pattern below draws on a good chunk of what this addon can
do, and shows how it can improve both your productivity and your code.

Picture simulating a geo-bound query against a backend — filtering an array
of locations as you pan the map — with a few mouseover effects layered on
top.

## How it works

Here's a walkthrough of the pieces involved:

1. Set the map's center and zoom level up front.
2. Set a handful of map options: reshape the tiles with `@styles`, disable
   the scroll wheel so the page scrolls instead of the map, and trim down
   the map controls for a minimal look.
3. Use `@onReady` to grab the map instance once it's ready, and
   `@onBoundsChanged` to react every time the visible bounds change.
   Filter your array of locations against the current bounds on each
   change — this simulates loading data from the server as the user pans
   or zooms.
4. Loop over the filtered locations with an `each` loop and render an
   `Overlay` with custom content at each one's coordinates. Inside the
   overlay, render a styled tooltip `div` showing the rental's price.
5. `@onMouseover` and `@onMouseleave` toggle an `active` flag on the
   rental, which drives the tooltip and list-card animation. `@onClick`
   scrolls the clicked rental's card into view in the list.

```gts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { GMap, Overlay } from 'ember-google-maps';

// A rental's full shape isn't defined by this addon -- it's whatever data
// your own app models a rental as. This interface only names the fields the
// demo itself touches (lat/lng for the map, price for the tooltip, active
// for the hover state); your app's real rental model will have more.
interface Rental {
  lat: number;
  lng: number;
  price: number;
  active?: boolean;
}

interface RentalsMapSignature {
  Args: {
    rentals: Rental[];
    mapStyle?: google.maps.MapTypeStyle[];
  };
}

export default class RentalsMap extends Component<RentalsMapSignature> {
  @tracked bounds?: google.maps.LatLngBounds;
  map?: google.maps.Map;

  get visibleRentals() {
    const bounds = this.bounds;
    if (!bounds) return this.args.rentals;

    return this.args.rentals.filter((rental) => bounds.contains(rental));
  }

  onMapReady = (map: google.maps.Map) => {
    this.map = map;
  };

  onBoundsChanged = () => {
    this.bounds = this.map!.getBounds();
  };

  toggleActive = (rental: Rental, active: boolean) => {
    rental.active = active;
  };

  <template>
    <GMap
      @lat={{37.7749}}
      @lng={{-122.4194}}
      @zoom={{12}}
      @styles={{@mapStyle}}
      @scrollwheel={{false}}
      @onReady={{this.onMapReady}}
      @onBoundsChanged={{this.onBoundsChanged}}
    >
      {{#each this.visibleRentals as |rental|}}
        <Overlay @lat={{rental.lat}} @lng={{rental.lng}}>
          <div
            class="rental-tooltip {{if rental.active 'active'}}"
            {{on "mouseover" (fn this.toggleActive rental true)}}
            {{on "mouseleave" (fn this.toggleActive rental false)}}
          >
            ${{rental.price}}
          </div>
        </Overlay>
      {{/each}}
    </GMap>
  </template>
}
```
