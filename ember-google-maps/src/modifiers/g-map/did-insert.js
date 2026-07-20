import { modifier } from 'ember-modifier';
import { assert } from '@ember/debug';

// Runs a callback with the element (and any positional/named args) once it's
// inserted. Ported from the v1 modifiers/g-map/did-insert.js. Used by <Canvas>,
// <Control>, <Overlay>, and <Autocomplete> to hand their DOM element back to the
// owning map component.
export default modifier(function gMapDidInsert(
  element,
  [callback, ...positional],
  named,
) {
  assert(
    '`g-map/did-insert` expects a function as its first positional argument.',
    typeof callback === 'function',
  );

  callback(element, positional, named);
});
