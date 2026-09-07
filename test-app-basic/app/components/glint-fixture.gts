// Regression coverage for ember-google-maps's hand-written public API
// types. Not rendered anywhere — this file exists to be typechecked.
import { GMap, Marker, Circle, Control, Autocomplete } from 'ember-google-maps';
import type { MapEvent } from 'ember-google-maps';
import { modifier } from 'ember-modifier';

// Event-handler args (anything on*-prefixed) get routed to a separate
// events hash at runtime, not into the options a component reads by
// name -- but the template's Args signature still needs to accept them,
// since this is how consumers legitimately bind them. A zero-arg handler is
// still fine (fewer params than the typed event is allowed).
function handleClick() {}

// A handler typed for the real event payload: Marker's onClick carries a
// MapEvent envelope wrapping a google.maps.MapMouseEvent.
function handleMarkerClick(
  event: MapEvent<google.maps.MapMouseEvent, google.maps.Marker>,
) {
  event.googleEvent.latLng?.lat();
}

// A handler typed for the wrong payload -- used below to prove the pass site
// rejects a mismatched handler, which the old rubber-stamp event args couldn't.
function handleWrongPayload(_event: { notAMapEvent: true }) {}

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

    {{! onClick's handler receives a typed MapEvent envelope, not `any` }}
    <Marker @lat={{1}} @lng={{2}} @onClick={{handleMarkerClick}} />

    {{! a typo'd event name is now a compile error, not a silently-dead
        listener -- the closed event map has no `onClik` }}
    {{! @glint-expect-error: Marker has no onClik event }}
    <Marker @lat={{1}} @lng={{2}} @onClik={{handleClick}} />

    {{! a handler typed for the wrong payload is rejected at the pass site }}
    {{! @glint-expect-error: handler's arg is not a Marker MapEvent }}
    <Marker @lat={{1}} @lng={{2}} @onClick={{handleWrongPayload}} />

    <Control @position="TOP_CENTER" @index={{1}}>
      <button type="button">Recenter</button>
    </Control>

    {{! confirms the yielded hash's `setup` is typed as (input: HTMLInputElement) => void }}
    <Autocomplete as |autocomplete|>
      <input aria-label="Search" {{setupAutocomplete autocomplete.setup}} />
    </Autocomplete>
  </GMap>
</template>
