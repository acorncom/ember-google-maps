import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../src/components/g-map/map-component.ts';

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
    MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const GMap: ComponentLike<GMapSignature>;
