// Type-only consumer probe for the typed map-event API, resolved from the
// addon's public root export (same packed-install discipline as
// public-api.probe.ts).
import type {
  MapEvent,
  MapEvents,
  MarkerSignature,
  PolygonSignature,
  GMapSignature,
  InfoWindowSignature,
  OverlaySignature,
} from 'ember-google-maps';

// MapEvent is the envelope every map-event handler receives: the raw google
// event payload plus the map + the component instance it fired on.
type MarkerClick = MapEvent<google.maps.MapMouseEvent, google.maps.Marker>;

const payload: MarkerClick = {
  event: undefined,
  googleEvent: null as unknown as google.maps.MapMouseEvent,
  eventName: 'click',
  target: null as unknown as google.maps.Marker,
  map: null as unknown as google.maps.Map,
  mapComponent: null as unknown as google.maps.Marker,
};

// googleEvent resolves to the real google type (not any/unknown) -- reaching
// a real MapMouseEvent member proves it.
const latLng: google.maps.LatLng | null = payload.googleEvent.latLng ?? null;

// MapEvents turns a snake_case { event: payload } map into on-PascalCase
// handler args, each typed with the MapEvent envelope for its payload.
type MarkerHandlers = MapEvents<
  google.maps.Marker,
  {
    click: google.maps.MapMouseEvent;
    bounds_changed: void; // snake_case derives onBoundsChanged
  }
>;

const handlers: MarkerHandlers = {
  onClick(e) {
    // payload is typed: e.googleEvent is a real MapMouseEvent
    const _ll: google.maps.LatLng | null | undefined = e.googleEvent.latLng;
    void _ll;
  },
  onBoundsChanged(e) {
    // the envelope's map is always present
    const _m: google.maps.Map = e.map;
    void _m;
  },
};

// A handler name not in the map is rejected -- this is the typo protection
// the open `on${string}` index signature could never give.
// @ts-expect-error onClik is not a declared handler for this component
const typo: MarkerHandlers = { onClik() {} };

// --- the built-in leaf signatures now type their events through MapEvents ---

// Marker mouse events carry a real google.maps.MapMouseEvent envelope.
const markerArgs: MarkerSignature['Args'] = {
  onClick: (e) => void (e.googleEvent.latLng ?? null),
};
const markerWrongPayload: MarkerSignature['Args'] = {
  // @ts-expect-error onClick receives a MapEvent envelope, not a bare number
  onClick: (n: number) => void n,
};
const markerTypo: MarkerSignature['Args'] = {
  // @ts-expect-error Marker has no `onClik` event -- typo'd names are rejected now
  onClik: () => {},
};

// Polygon/Polyline mouse events carry a PolyMouseEvent, not a MapMouseEvent.
const polygonArgs: PolygonSignature['Args'] = {
  onClick: (e) => void (e.googleEvent.edge ?? null),
};

// GMap click is MapMouseEvent | IconMouseEvent; changed/idle events are void.
const gmapArgs: GMapSignature['Args'] = {
  onClick: (e) => void e.googleEvent,
  onBoundsChanged: (e) => void e.map,
};

// InfoWindow closeclick has no payload.
const infoWindowArgs: InfoWindowSignature['Args'] = {
  onCloseclick: (e) => void e.eventName,
};

// Overlay events are DOM events (it listens on its own <div>), not google events.
const overlayArgs: OverlaySignature['Args'] = {
  onClick: (e) => void (e.googleEvent.clientX ?? 0),
};

console.log(
  payload,
  latLng,
  handlers,
  typo,
  markerArgs,
  markerWrongPayload,
  markerTypo,
  polygonArgs,
  gmapArgs,
  infoWindowArgs,
  overlayArgs,
);
