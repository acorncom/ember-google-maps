import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface AdvancedMarkerSignature {
  Args: {
    lat?: number;
    lng?: number;
  } & google.maps.marker.AdvancedMarkerElementOptions &
    MapComponentEventArgs;
  Blocks: {
    default: [
      publicAPI: {
        map: google.maps.Map;
        mapComponent: google.maps.marker.AdvancedMarkerElement;
      },
    ];
  };
  Element: null;
}

export declare const AdvancedMarker: ComponentLike<AdvancedMarkerSignature>;
