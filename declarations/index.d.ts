// Side-effect import: pulls in the ambient `declare module '@glimmer/env'`
// augmentation so it travels with this file into every consumer's
// compilation, without requiring an explicit import of its (nonexistent)
// exports. This file already has real imports/exports below, making it an
// ES module, so a plain import is the correct idiom here (not a triple-
// slash reference, which is for script-style ambient files with no
// imports/exports of their own).
import './glimmer-env.d.ts';

export {
  default as MapComponent,
  type MapComponentSignature,
} from '../src/components/g-map/map-component.ts';
export { default as TypicalMapComponent } from '../src/components/g-map/typical-map-component.ts';

export { GMap, type GMapSignature } from './components/g-map.d.ts';
export { Canvas, type CanvasSignature } from './components/g-map/canvas.d.ts';
export { Marker, type MarkerSignature } from './components/g-map/marker.d.ts';
export {
  AdvancedMarker,
  type AdvancedMarkerSignature,
} from './components/g-map/advanced-marker.d.ts';
export {
  InfoWindow,
  type InfoWindowSignature,
} from './components/g-map/info-window.d.ts';
export { Circle, type CircleSignature } from './components/g-map/circle.d.ts';
export {
  Rectangle,
  type RectangleSignature,
} from './components/g-map/rectangle.d.ts';
export {
  Polygon,
  type PolygonSignature,
} from './components/g-map/polygon.d.ts';
export {
  Polyline,
  type PolylineSignature,
} from './components/g-map/polyline.d.ts';
export {
  TrafficLayer,
  type TrafficLayerSignature,
} from './components/g-map/traffic-layer.d.ts';
export {
  TransitLayer,
  type TransitLayerSignature,
} from './components/g-map/transit-layer.d.ts';
export {
  BicyclingLayer,
  type BicyclingLayerSignature,
} from './components/g-map/bicycling-layer.d.ts';
export {
  Control,
  type ControlSignature,
} from './components/g-map/control.d.ts';
export {
  Overlay,
  type OverlaySignature,
} from './components/g-map/overlay.d.ts';
export {
  Autocomplete,
  type AutocompleteSignature,
} from './components/g-map/autocomplete.d.ts';

// Flat <Gmap*> compat components (permanent classic API): name-resolvable
// re-exports for classic/.hbs apps. Each is a runtime one-line re-export of
// the component above with the same name -- no unique type information of
// its own, so no separate signature file.
export { Marker as GmapMarker } from './components/g-map/marker.d.ts';
export { AdvancedMarker as GmapAdvancedMarker } from './components/g-map/advanced-marker.d.ts';
export { InfoWindow as GmapInfoWindow } from './components/g-map/info-window.d.ts';
export { Circle as GmapCircle } from './components/g-map/circle.d.ts';
export { Rectangle as GmapRectangle } from './components/g-map/rectangle.d.ts';
export { Polygon as GmapPolygon } from './components/g-map/polygon.d.ts';
export { Polyline as GmapPolyline } from './components/g-map/polyline.d.ts';
export { TrafficLayer as GmapTrafficLayer } from './components/g-map/traffic-layer.d.ts';
export { TransitLayer as GmapTransitLayer } from './components/g-map/transit-layer.d.ts';
export { BicyclingLayer as GmapBicyclingLayer } from './components/g-map/bicycling-layer.d.ts';
export { Control as GmapControl } from './components/g-map/control.d.ts';
export { Overlay as GmapOverlay } from './components/g-map/overlay.d.ts';
export { Autocomplete as GmapAutocomplete } from './components/g-map/autocomplete.d.ts';
export { Canvas as GmapCanvas } from './components/g-map/canvas.d.ts';
