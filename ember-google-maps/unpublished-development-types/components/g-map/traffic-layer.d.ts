import type { ComponentLike } from '@glint/template';

export interface TrafficLayerSignature {
  Args: google.maps.TrafficLayerOptions;
  Blocks: { default: [] };
  Element: null;
}

export declare const TrafficLayer: ComponentLike<TrafficLayerSignature>;
