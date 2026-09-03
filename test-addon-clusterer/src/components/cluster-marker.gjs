import { toLatLng } from 'ember-google-maps/utils/helpers';
import { MapComponent } from 'ember-google-maps';

// A custom leaf map component that registers with a parent <MarkerClusterer>
// instead of the map. It extends `MapComponent` for the async lifecycle + map
// context (proving a third-party component gets both from the public base), but
// overrides setup/teardown to hand its google.maps.Marker to the clusterer via
// the yielded `@cluster` API rather than calling `setMap(this.map)`.
export default class ClusterMarker extends MapComponent {
  get name() {
    return 'clusterMarkers';
  }

  get cluster() {
    return this.args.cluster;
  }

  setup() {
    let marker = new google.maps.Marker({
      position: toLatLng(this.args.lat, this.args.lng),
    });

    // Add to the cluster, NOT the map.
    this.cluster.registerMarker(marker);

    return marker;
  }

  update(marker) {
    marker.setOptions({ position: toLatLng(this.args.lat, this.args.lng) });

    return marker;
  }

  teardown(marker) {
    this.cluster?.unregisterMarker(marker);
    super.teardown(marker);
  }

  <template></template>
}
