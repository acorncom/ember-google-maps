import TypicalMapComponent from './typical-map-component.js';
import { toLatLng } from '../../utils/helpers.js';

export default class Marker extends TypicalMapComponent {
  get name() {
    return 'markers';
  }

  get newOptions() {
    if (!this.args.position) {
      this.options.position = toLatLng(this.args.lat, this.args.lng);
    }

    return this.options;
  }

  newMapComponent(options = {}) {
    return new google.maps.Marker(options);
  }

  // Yields the marker's publicAPI so children can anchor to it, e.g.
  // `<Marker as |m|><InfoWindow @target={{m.mapComponent}} /></Marker>` — the
  // supported, first-class per-component composition API (distinct from, and NOT
  // the deprecated, top-level `<GMap as |g|>` hash yield).
  <template>{{yield this.publicAPI}}</template>
}
