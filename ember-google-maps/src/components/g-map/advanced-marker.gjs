import TypicalMapComponent from './typical-map-component.js';
import { toLatLng } from '../../utils/helpers.js';

export default class AdvancedMarker extends TypicalMapComponent {
  get name() {
    return 'advancedMarkers';
  }

  get newOptions() {
    if (!this.args.position) {
      this.options.position = toLatLng(this.args.lat, this.args.lng);
    }

    return this.options;
  }

  // AdvancedMarkerElement attaches to the map via the `map` property — it has NO
  // `setMap()` method (unlike the legacy Marker), so we can't inherit
  // TypicalMapComponent.setup (which calls setMap). Override to assign `.map`.
  setup() {
    let mapComponent = this.newMapComponent(this.newOptions);

    this.addEventsToMapComponent(mapComponent, this.events, this.publicAPI);

    mapComponent.map = this.map;

    return mapComponent;
  }

  update(mapComponent) {
    Object.assign(mapComponent, this.newOptions);

    return mapComponent;
  }

  newMapComponent(options = {}) {
    return new google.maps.marker.AdvancedMarkerElement(options);
  }

  <template>{{yield this.publicAPI}}</template>
}
