import { TypicalMapComponent } from 'ember-google-maps';

// Renders a fetched route on the map via a google.maps.DirectionsRenderer.
// Given the DirectionsResult from <Directions>: <Route @directions={{d.directions}} />.
export default class Route extends TypicalMapComponent {
  get name() {
    return 'routes';
  }

  get newOptions() {
    // Don't render until we have a valid result.
    if (this.options.directions?.status !== 'OK') {
      return {};
    }

    return this.options;
  }

  newMapComponent(options = {}) {
    return new google.maps.DirectionsRenderer(options);
  }

  <template>{{yield}}</template>
}
