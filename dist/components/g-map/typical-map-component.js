import MapComponent from './map-component.js';

// `MapInstance` is the real Google Maps object a subclass builds --
// google.maps.Marker, google.maps.Circle, google.maps.Data, ... It defaults
// to `unknown` so today's untyped .gjs leaf components are unaffected; a
// .ts/.gts subclass can supply it to get a genuinely typed setup()/update()
// instead of fighting a base-declared setMap()/setOptions() shape that not
// every real Google Maps object implements -- google.maps.marker
// .AdvancedMarkerElement, for one, has no setMap() at all (see
// advanced-marker.gjs, which already has to override setup() for exactly
// this reason).
class TypicalMapComponent extends MapComponent {
  get newOptions() {
    return this.options;
  }
  newMapComponent(_options) {
    return undefined;
  }
  setup() {
    const mapComponent = this.newMapComponent(this.newOptions);
    this.addEventsToMapComponent(mapComponent, this.events, this.publicAPI);
    mapComponent?.setMap?.(this.map);
    return mapComponent;
  }
  update(mapComponent) {
    mapComponent?.setOptions?.(this.newOptions);
    return mapComponent;
  }
}

export { TypicalMapComponent as default };
//# sourceMappingURL=typical-map-component.js.map
