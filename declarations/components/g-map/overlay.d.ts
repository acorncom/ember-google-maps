import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface OverlaySignature {
  Args: {
    lat?: number;
    lng?: number;
    position?: google.maps.LatLng | google.maps.LatLngLiteral;
    zIndex?: number | string;
    paneName?: keyof google.maps.MapPanes;
  } & MapComponentEventArgs;
  Blocks: { default: [] };
  Element: HTMLDivElement;
}

export declare const Overlay: ComponentLike<OverlaySignature>;
