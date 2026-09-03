import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface RectangleSignature {
  Args: google.maps.RectangleOptions & MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const Rectangle: ComponentLike<RectangleSignature>;
