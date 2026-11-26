import type { ComponentLike } from '@glint/template';

// google.maps.TransitLayer's real constructor takes no options at all, and it
// fires no events -- so it accepts no args.
export interface TransitLayerSignature {
  Args: Record<string, never>;
  Blocks: { default: [] };
  Element: null;
}

export declare const TransitLayer: ComponentLike<TransitLayerSignature>;
