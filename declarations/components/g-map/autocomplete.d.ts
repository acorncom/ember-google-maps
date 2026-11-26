import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived from google.maps.places.Autocomplete's documented events and
// hand-maintained (verify against Google's docs). `place_changed` fires with
// no payload; the selected place is read via `autocomplete.getPlace()`.
export type AutocompleteEvents = MapEvents<
  google.maps.places.Autocomplete,
  {
    place_changed: void;
  }
>;

export interface AutocompleteSignature {
  Args: google.maps.places.AutocompleteOptions & AutocompleteEvents;
  Blocks: {
    default: [autocomplete: { setup: (input: HTMLInputElement) => void }];
  };
  Element: HTMLInputElement;
}

export declare const Autocomplete: ComponentLike<AutocompleteSignature>;
