import type { ComponentLike } from '@glint/template';
import type { MapComponentEventArgs } from '../../../src/components/g-map/map-component.ts';

export interface AutocompleteSignature {
  Args: google.maps.places.AutocompleteOptions & MapComponentEventArgs;
  Blocks: {
    default: [autocomplete: { setup: (input: HTMLInputElement) => void }];
  };
  Element: HTMLInputElement;
}

export declare const Autocomplete: ComponentLike<AutocompleteSignature>;
