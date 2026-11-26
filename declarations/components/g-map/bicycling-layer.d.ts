import type { ComponentLike } from '@glint/template';

// google.maps.BicyclingLayer's real constructor takes no options at all, and it
// fires no events -- so it accepts no args.
export interface BicyclingLayerSignature {
  Args: Record<string, never>;
  Blocks: { default: [] };
  Element: null;
}

export declare const BicyclingLayer: ComponentLike<BicyclingLayerSignature>;
