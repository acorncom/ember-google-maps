import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

// google.maps.BicyclingLayer's real constructor takes no options at all.
export interface BicyclingLayerSignature {
  Args: MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const BicyclingLayer: ComponentLike<BicyclingLayerSignature>;
