import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.Rectangle's documented events and hand-maintained
// (verify against Google's docs before trusting).
export type RectangleEvents = MapEvents<
  google.maps.Rectangle,
  {
    click: google.maps.MapMouseEvent;
    dblclick: google.maps.MapMouseEvent;
    contextmenu: google.maps.MapMouseEvent;
    rightclick: google.maps.MapMouseEvent;
    mousedown: google.maps.MapMouseEvent;
    mouseup: google.maps.MapMouseEvent;
    mousemove: google.maps.MapMouseEvent;
    mouseover: google.maps.MapMouseEvent;
    mouseout: google.maps.MapMouseEvent;
    drag: google.maps.MapMouseEvent;
    dragstart: google.maps.MapMouseEvent;
    dragend: google.maps.MapMouseEvent;
    bounds_changed: void;
  }
>;

export interface RectangleSignature {
  Args: google.maps.RectangleOptions & RectangleEvents;
  Blocks: { default: [] };
  Element: null;
}

export declare const Rectangle: ComponentLike<RectangleSignature>;
