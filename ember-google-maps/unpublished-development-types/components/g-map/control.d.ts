import type { ComponentLike } from '@glint/template';

// Control is a positioned container -- it wraps no google.maps object and
// fires no events, so it carries no event args.
export interface ControlSignature {
  Args: {
    position: keyof typeof google.maps.ControlPosition;
    index?: number;
  };
  Blocks: { default: [] };
  Element: HTMLDivElement;
}

export declare const Control: ComponentLike<ControlSignature>;
