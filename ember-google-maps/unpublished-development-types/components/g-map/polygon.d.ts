import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface PolygonSignature {
  Args: google.maps.PolygonOptions & MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const Polygon: ComponentLike<PolygonSignature>;
