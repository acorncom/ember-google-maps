import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface CircleSignature {
  Args: {
    lat?: number;
    lng?: number;
  } & google.maps.CircleOptions &
    MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const Circle: ComponentLike<CircleSignature>;
