import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.InfoWindow's documented events and
// hand-maintained (verify against Google's docs). InfoWindow events all fire
// with no payload.
export type InfoWindowEvents = MapEvents<
  google.maps.InfoWindow,
  {
    closeclick: void;
    content_changed: void;
    domready: void;
    position_changed: void;
    visible: void;
    zindex_changed: void;
  }
>;

export interface InfoWindowSignature {
  Args: {
    lat?: number;
    lng?: number;
    isOpen?: boolean;
    target?:
      google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement | null;
  } & google.maps.InfoWindowOptions &
    InfoWindowEvents;
  Blocks: {
    default: [
      publicAPI: {
        map: google.maps.Map;
        mapComponent: google.maps.InfoWindow;
      },
    ];
  };
  Element: null;
}

export declare const InfoWindow: ComponentLike<InfoWindowSignature>;
