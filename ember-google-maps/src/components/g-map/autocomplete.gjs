import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { assert } from '@ember/debug';
import { hash } from '@ember/helper';

import MapComponent from './map-component.js';
import didInsert from '../../modifiers/g-map/did-insert.js';

export default class Autocomplete extends MapComponent {
  id = `ember-google-maps-autocomplete-${guidFor(this)}`;

  get name() {
    return 'autocompletes';
  }

  setup(options, events) {
    assert(
      `
ember-google-maps: No input found for autocomplete.

When using the block form of the autocomplete component, make sure to call the “setup” method on your input to let autocomplete know about it:

<Autocomplete as |autocomplete|>
  <input {{didInsert autocomplete.setup}} />
</Autocomplete>

Did you mean to use the block form? You can also do the following:

<Autocomplete id="my-custom-id" class="my-custom-class" />
      `,
      this.inputElement,
    );

    let autocomplete = new google.maps.places.Autocomplete(
      this.inputElement,
      options,
    );

    this.addEventsToMapComponent(autocomplete, events, this.publicAPI);

    // Compatibility: Register the custom `onSearch` event.
    let onSearch = this.args.onSearch;
    if (onSearch && typeof onSearch === 'function') {
      this.addEventsToMapComponent(
        autocomplete,
        { onPlaceChanged: onSearch },
        this.publicAPI,
      );
    }

    return autocomplete;
  }

  update(mapComponent) {
    mapComponent?.setOptions?.(this.newOptions);

    return mapComponent;
  }

  @action
  getInput(input) {
    this.inputElement = input;
  }

  <template>
    {{#if (has-block)}}
      {{yield (hash setup=this.getInput)}}
    {{else}}
      <input id={{this.id}} ...attributes {{didInsert this.getInput}} />
    {{/if}}
  </template>
}
