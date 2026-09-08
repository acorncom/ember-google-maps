import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.Map's documented events and hand-maintained
// (verify against Google's docs). Note `click` fires with a MapMouseEvent
// normally but an IconMouseEvent when a POI icon is clicked; the map's own
// drag events carry no payload. `onReady` is NOT here -- it's the addon's
// canvas-ready callback (an explicit arg below), not a google.maps.Map event.
export type GMapEvents = MapEvents<
  google.maps.Map,
  {
    click: google.maps.MapMouseEvent | google.maps.IconMouseEvent;
    dblclick: google.maps.MapMouseEvent;
    contextmenu: google.maps.MapMouseEvent;
    rightclick: google.maps.MapMouseEvent;
    mousemove: google.maps.MapMouseEvent;
    mouseover: google.maps.MapMouseEvent;
    mouseout: google.maps.MapMouseEvent;
    drag: void;
    dragstart: void;
    dragend: void;
    bounds_changed: void;
    center_changed: void;
    heading_changed: void;
    idle: void;
    maptypeid_changed: void;
    projection_changed: void;
    tilesloaded: void;
    tilt_changed: void;
    zoom_changed: void;
  }
>;

// GMap forwards every arg that isn't `lat`/`lng`/`renderCanvasInPlace`/`onReady`
// or `on*` straight into `new google.maps.Map(canvas, options)` (see
// map-component.ts's options/events split and g-map.gjs#newOptions) -- so its
// Args need the whole google.maps.MapOptions bag, not a hand-picked subset.
// Listing only a few option names (as this used to) lets the rest -- mapId,
// disableDefaultUI, cameraControl, ... -- through unchecked instead of typed.
export interface GMapSignature {
  Args: {
    lat?: number;
    lng?: number;
    renderCanvasInPlace?: boolean;
    onReady?: (map: google.maps.Map) => void;
  } & google.maps.MapOptions &
    GMapEvents;
  Blocks: { default: [] };
  Element: null;
}

export declare const GMap: ComponentLike<GMapSignature>;
