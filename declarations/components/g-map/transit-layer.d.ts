import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

// google.maps.TransitLayer's real constructor takes no options at all.
export interface TransitLayerSignature {
  Args: MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const TransitLayer: ComponentLike<TransitLayerSignature>;
