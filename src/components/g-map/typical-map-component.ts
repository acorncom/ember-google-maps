import MapComponent from './map-component.ts';
import type { MapComponentSignature } from './map-component.ts';

// `MapInstance` is the real Google Maps object a subclass builds --
// google.maps.Marker, google.maps.Circle, google.maps.Data, ... It defaults
// to `unknown` so today's untyped .gjs leaf components are unaffected; a
// .ts/.gts subclass can supply it to get a genuinely typed setup()/update()
// instead of fighting a base-declared setMap()/setOptions() shape that not
// every real Google Maps object implements -- google.maps.marker
// .AdvancedMarkerElement, for one, has no setMap() at all (see
// advanced-marker.gjs, which already has to override setup() for exactly
// this reason).
export default class TypicalMapComponent<
  S = MapComponentSignature,
  MapInstance = unknown,
> extends MapComponent<S> {
  get newOptions() {
    return this.options;
  }

  newMapComponent(_options: Record<string, unknown>): MapInstance {
    return undefined as MapInstance;
  }

  setup(): MapInstance {
    const mapComponent = this.newMapComponent(this.newOptions);

    this.addEventsToMapComponent(
      mapComponent as unknown as object,
      this.events,
      this.publicAPI,
    );

    (mapComponent as { setMap?: (map: unknown) => void } | undefined)?.setMap?.(
      this.map,
    );

    return mapComponent;
  }

  update(mapComponent: MapInstance): MapInstance {
    (
      mapComponent as { setOptions?: (options: unknown) => void } | undefined
    )?.setOptions?.(this.newOptions);

    return mapComponent;
  }
}
