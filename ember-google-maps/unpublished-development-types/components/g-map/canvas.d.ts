import type { ComponentLike } from '@glint/template';

export interface CanvasSignature {
  Args: {
    onCanvasReady?: (element: HTMLDivElement) => void;
  };
  Blocks: { default: [] };
  Element: HTMLDivElement;
}

export declare const Canvas: ComponentLike<CanvasSignature>;
