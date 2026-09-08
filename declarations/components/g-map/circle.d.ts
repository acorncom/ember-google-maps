import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.Circle's documented events and hand-maintained
// (verify against Google's docs before trusting).
export type CircleEvents = MapEvents<
  google.maps.Circle,
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
    center_changed: void;
    radius_changed: void;
  }
>;

export interface CircleSignature {
  Args: {
    lat?: number;
    lng?: number;
  } & google.maps.CircleOptions &
    CircleEvents;
  Blocks: { default: [] };
  Element: null;
}

export declare const Circle: ComponentLike<CircleSignature>;
