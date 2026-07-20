import didInsert from '../../modifiers/g-map/did-insert.js';

// Renders the map container element and hands it to @onCanvasReady once it's in
// the DOM. This is where <GMap> mounts the google.maps.Map.
<template>
  <div class="ember-google-map" ...attributes {{didInsert @onCanvasReady}}>
    {{yield}}
  </div>
</template>
