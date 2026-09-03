// Public test helpers: `import { setupMapTest, waitForMap, trigger } from
// 'ember-google-maps/test-support'`. Ported from the v1 addon-test-support.
import { settled } from '@ember/test-helpers';

import { clearMapInstances, getMapInstance } from './utils/helpers.js';

export function setupMapTest(hooks) {
  hooks.beforeEach(function () {
    this.waitForMap = waitForMap.bind(this);
  });

  hooks.afterEach(function () {
    clearMapInstances();
  });
}

// Resolves once rendering has settled, returning the map's publicAPI
// (`{ map, components, getComponent }`) registered by <GMap>.
export async function waitForMap(id) {
  await settled();
  return getMapInstance(id);
}

export function trigger(component, eventName, ...options) {
  google.maps.event.trigger(component, eventName, ...options);
}

export function getDirectionsQuery(directions) {
  let { origin, destination } = directions.request;
  return { origin: origin.query, destination: destination.query };
}
