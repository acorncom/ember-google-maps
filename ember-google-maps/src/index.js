// Extension surface (public API). Third-party addons and apps build custom map
// components by extending these base classes — they consume the map context and
// register with the nearest <GMap> internally, so a custom component needs zero
// context/registry code. Extend `TypicalMapComponent` for a standard
// google.maps object with `setMap(map)` (marker/shape/layer style); extend
// `MapComponent` directly for anything custom. See spec D3 / §4.3.
export { default as MapComponent } from './components/g-map/map-component.js';
export { default as TypicalMapComponent } from './components/g-map/typical-map-component.js';

export { default as GMap } from './components/g-map.gjs';
export { default as Canvas } from './components/g-map/canvas.gjs';
export { default as Marker } from './components/g-map/marker.gjs';
export { default as AdvancedMarker } from './components/g-map/advanced-marker.gjs';
export { default as InfoWindow } from './components/g-map/info-window.gjs';
export { default as Circle } from './components/g-map/circle.gjs';
export { default as Rectangle } from './components/g-map/rectangle.gjs';
export { default as Polygon } from './components/g-map/polygon.gjs';
export { default as Polyline } from './components/g-map/polyline.gjs';
export { default as TrafficLayer } from './components/g-map/traffic-layer.gjs';
export { default as TransitLayer } from './components/g-map/transit-layer.gjs';
export { default as BicyclingLayer } from './components/g-map/bicycling-layer.gjs';
export { default as Control } from './components/g-map/control.gjs';
export { default as Overlay } from './components/g-map/overlay.gjs';
export { default as Autocomplete } from './components/g-map/autocomplete.gjs';

// Flat <Gmap*> compat components (permanent classic API): name-resolvable
// re-exports giving classic/.hbs apps a no-deprecation path.
export { default as GmapMarker } from './components/gmap-marker.gjs';
export { default as GmapAdvancedMarker } from './components/gmap-advanced-marker.gjs';
export { default as GmapInfoWindow } from './components/gmap-info-window.gjs';
export { default as GmapCircle } from './components/gmap-circle.gjs';
export { default as GmapRectangle } from './components/gmap-rectangle.gjs';
export { default as GmapPolygon } from './components/gmap-polygon.gjs';
export { default as GmapPolyline } from './components/gmap-polyline.gjs';
export { default as GmapTrafficLayer } from './components/gmap-traffic-layer.gjs';
export { default as GmapTransitLayer } from './components/gmap-transit-layer.gjs';
export { default as GmapBicyclingLayer } from './components/gmap-bicycling-layer.gjs';
export { default as GmapControl } from './components/gmap-control.gjs';
export { default as GmapOverlay } from './components/gmap-overlay.gjs';
export { default as GmapAutocomplete } from './components/gmap-autocomplete.gjs';
export { default as GmapCanvas } from './components/gmap-canvas.gjs';
