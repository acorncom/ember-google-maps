import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface TrafficLayerSignature {
  Args: google.maps.TrafficLayerOptions & MapComponentEventArgs;
  Blocks: { default: [] };
  Element: null;
}

export declare const TrafficLayer: ComponentLike<TrafficLayerSignature>;
