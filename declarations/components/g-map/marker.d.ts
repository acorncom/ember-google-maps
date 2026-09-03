import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

// Marker forwards every non-on*/lat/lng arg straight into
// `new google.maps.Marker(options)` (see typical-map-component.ts and
// marker.gjs#newOptions), so Args needs the whole google.maps.MarkerOptions
// bag -- the same reasoning as GMapSignature's google.maps.MapOptions.
export interface MarkerSignature {
  Args: {
    lat?: number;
    lng?: number;
  } & google.maps.MarkerOptions &
    MapComponentEventArgs;
  Blocks: {
    default: [
      publicAPI: { map: google.maps.Map; mapComponent: google.maps.Marker },
    ];
  };
  Element: null;
}

export declare const Marker: ComponentLike<MarkerSignature>;
