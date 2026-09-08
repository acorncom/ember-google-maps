import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// Unlike the other components, Overlay attaches its listeners to its own
// rendered <div> (overlay.gjs -> addEventsToMapComponent(this.overlayElement)),
// so handlers receive DOM events, not google.maps events. AI-derived from the
// standard DOM events an overlay div realistically emits, and hand-maintained.
export type OverlayEvents = MapEvents<
  HTMLDivElement,
  {
    click: MouseEvent;
    dblclick: MouseEvent;
    contextmenu: MouseEvent;
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    mousemove: MouseEvent;
    mouseover: MouseEvent;
    mouseout: MouseEvent;
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
  }
>;

export interface OverlaySignature {
  Args: {
    lat?: number;
    lng?: number;
    position?: google.maps.LatLng | google.maps.LatLngLiteral;
    zIndex?: number | string;
    paneName?: keyof google.maps.MapPanes;
  } & OverlayEvents;
  Blocks: { default: [] };
  Element: HTMLDivElement;
}

export declare const Overlay: ComponentLike<OverlaySignature>;
