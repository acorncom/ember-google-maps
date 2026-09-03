import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface InfoWindowSignature {
  Args: {
    lat?: number;
    lng?: number;
    isOpen?: boolean;
    target?:
      google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement | null;
  } & google.maps.InfoWindowOptions &
    MapComponentEventArgs;
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
