// Regression coverage for ember-google-maps's hand-written public API
// types. Not rendered anywhere — this file exists to be typechecked.
import { GMap, Marker, Circle, Control, Autocomplete } from 'ember-google-maps';
import { modifier } from 'ember-modifier';

// Event-handler args (anything on*-prefixed) get routed to a separate
// events hash at runtime, not into the options a component reads by
// name -- but the template's Args signature still needs to accept them,
// since this is how consumers legitimately bind them.
function handleClick() {}

const setupAutocomplete = modifier(
  (element: HTMLInputElement, [setup]: [(input: HTMLInputElement) => void]) => {
    setup(element);
  },
);

<template>
  {{! @mapId, @disableDefaultUI, @cameraControl and the other MapOptions
      below aren't listed on GMapSignature by name -- they typecheck because
      GMapSignature intersects google.maps.MapOptions wholesale. }}
  <GMap
    @lat={{1}}
    @lng={{2}}
    @zoom={{10}}
    @mapId="demo-map"
    @disableDefaultUI={{true}}
    @cameraControl={{true}}
  >
    {{! @draggable and @title are google.maps.MarkerOptions, not listed by
        name on MarkerSignature -- they typecheck because MarkerSignature
        intersects google.maps.MarkerOptions wholesale. }}
    <Marker
      @lat={{1}}
      @lng={{2}}
      @draggable={{true}}
      @title="A marker"
      @onClick={{handleClick}}
      as |m|
    >
      {{#if m.map}}Ready{{/if}}
    </Marker>

    <Circle @lat={{1}} @lng={{2}} @radius={{500}} />

    <Control @position="TOP_CENTER" @index={{1}}>
      <button type="button">Recenter</button>
    </Control>

    {{! confirms the yielded hash's `setup` is typed as (input: HTMLInputElement) => void }}
    <Autocomplete as |autocomplete|>
      <input aria-label="Search" {{setupAutocomplete autocomplete.setup}} />
    </Autocomplete>
  </GMap>
</template>
