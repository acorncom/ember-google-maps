import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.Marker's documented event list and
// hand-maintained -- verify against Google's docs and update the map below
// when Google adds/removes/retypes an event. Keyed in Google's own snake_case;
// MapEvents derives the `on<PascalCase>` handler args. Payloads come from
// @types/google.maps ("void" = the event fires with no payload).
export type MarkerEvents = MapEvents<
  google.maps.Marker,
  {
    click: google.maps.MapMouseEvent;
    dblclick: google.maps.MapMouseEvent;
    contextmenu: google.maps.MapMouseEvent;
    rightclick: google.maps.MapMouseEvent;
    mousedown: google.maps.MapMouseEvent;
    mouseup: google.maps.MapMouseEvent;
    mouseover: google.maps.MapMouseEvent;
    mouseout: google.maps.MapMouseEvent;
    drag: google.maps.MapMouseEvent;
    dragstart: google.maps.MapMouseEvent;
    dragend: google.maps.MapMouseEvent;
    animation_changed: void;
    clickable_changed: void;
    cursor_changed: void;
    draggable_changed: void;
    flat_changed: void;
    icon_changed: void;
    position_changed: void;
    shape_changed: void;
    title_changed: void;
    visible_changed: void;
    zindex_changed: void;
  }
>;

// Marker forwards every non-on*/lat/lng arg straight into
// `new google.maps.Marker(options)` (see typical-map-component.ts and
// marker.gjs#newOptions), so Args needs the whole google.maps.MarkerOptions
// bag -- the same reasoning as GMapSignature's google.maps.MapOptions.
export interface MarkerSignature {
  Args: {
    lat?: number;
    lng?: number;
  } & google.maps.MarkerOptions &
    MarkerEvents;
  Blocks: {
    default: [
      publicAPI: { map: google.maps.Map; mapComponent: google.maps.Marker },
    ];
  };
  Element: null;
}

export declare const Marker: ComponentLike<MarkerSignature>;
