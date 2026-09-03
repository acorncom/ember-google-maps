import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface ControlSignature {
  Args: {
    position: keyof typeof google.maps.ControlPosition;
    index?: number;
  } & MapComponentEventArgs;
  Blocks: { default: [] };
  Element: HTMLDivElement;
}

export declare const Control: ComponentLike<ControlSignature>;
