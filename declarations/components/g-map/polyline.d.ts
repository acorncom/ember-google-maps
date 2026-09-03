import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface PolylineSignature {
  Args: google.maps.PolylineOptions & MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const Polyline: ComponentLike<PolylineSignature>;
