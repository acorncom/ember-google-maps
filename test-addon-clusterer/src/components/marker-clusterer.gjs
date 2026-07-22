import { action } from '@ember/object';
import { hash } from '@ember/helper';
import { trackedSet } from '@ember/reactive/collections';
import { MarkerClusterer as GoogleMarkerClusterer } from '@googlemaps/markerclusterer';
import { MapComponent } from 'ember-google-maps';

// A custom CONTAINER map component built entirely on ember-google-maps' public
// extension surface. It extends `MapComponent` (so it gets `this.map` via
// context and the async setup/update/teardown lifecycle for free — zero context
// code), collects its child markers in a reactive `trackedSet`, and feeds them
// to @googlemaps/markerclusterer. Because setup/update read the tracked set,
// markers registering/unregistering re-cluster reactively.
//
// Usage:
//   <MarkerClusterer as |cluster|>
//     {{#each this.locations as |loc|}}
//       <ClusterMarker @lat={{loc.lat}} @lng={{loc.lng}} @cluster={{cluster}} />
//     {{/each}}
//   </MarkerClusterer>
export default class MarkerClusterer extends MapComponent {
  get name() {
    return 'markerClusterers';
  }

  // Reactive set of the google.maps.Marker instances registered by children.
  markers = trackedSet();

  @action
  registerMarker(marker) {
    this.markers.add(marker);
  }

  @action
  unregisterMarker(marker) {
    this.markers.delete(marker);
  }

  setup() {
    return new GoogleMarkerClusterer({
      map: this.map,
      markers: Array.from(this.markers),
    });
  }

  update(clusterer) {
    // Reading the tracked set here is what makes register/unregister re-cluster.
    clusterer.clearMarkers();
    clusterer.addMarkers(Array.from(this.markers));

    return clusterer;
  }

  teardown(clusterer) {
    clusterer?.clearMarkers();
    super.teardown(clusterer);
  }

  <template>
    {{yield
      (hash
        registerMarker=this.registerMarker unregisterMarker=this.unregisterMarker
      )
    }}
  </template>
}
