import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.Polygon's documented events and hand-maintained
// (verify against Google's docs before trusting). Path mouse events carry a
// PolyMouseEvent (which adds edge/path/vertex over MapMouseEvent); drag events
// carry a plain MapMouseEvent.
export type PolygonEvents = MapEvents<
  google.maps.Polygon,
  {
    click: google.maps.PolyMouseEvent;
    dblclick: google.maps.PolyMouseEvent;
    contextmenu: google.maps.PolyMouseEvent;
    rightclick: google.maps.PolyMouseEvent;
    mousedown: google.maps.PolyMouseEvent;
    mouseup: google.maps.PolyMouseEvent;
    mousemove: google.maps.PolyMouseEvent;
    mouseover: google.maps.PolyMouseEvent;
    mouseout: google.maps.PolyMouseEvent;
    drag: google.maps.MapMouseEvent;
    dragstart: google.maps.MapMouseEvent;
    dragend: google.maps.MapMouseEvent;
  }
>;

export interface PolygonSignature {
  Args: google.maps.PolygonOptions & PolygonEvents;
  Blocks: { default: [] };
  Element: null;
}

export declare const Polygon: ComponentLike<PolygonSignature>;
