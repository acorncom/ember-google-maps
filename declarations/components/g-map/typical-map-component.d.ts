import MapComponent from './map-component.ts';
import type { MapComponentSignature } from './map-component.ts';
export default class TypicalMapComponent<S = MapComponentSignature, MapInstance = unknown> extends MapComponent<S> {
    get newOptions(): Record<string, unknown>;
    newMapComponent(_options: Record<string, unknown>): MapInstance;
    setup(): MapInstance;
    update(mapComponent: MapInstance): MapInstance;
}
//# sourceMappingURL=typical-map-component.d.ts.map