import { settled } from '@ember/test-helpers';
import { clearMapInstances, getMapInstance } from './component-managers/map-component-manager.js';

// Public test helpers: `import { setupMapTest, waitForMap, trigger } from
// 'ember-google-maps/test-support'`. Ported from the v1 addon-test-support.
function setupMapTest(hooks) {
  hooks.beforeEach(function () {
    this.waitForMap = waitForMap.bind(this);
  });
  hooks.afterEach(function () {
    clearMapInstances();
  });
}

// Resolves once rendering has settled, returning the map's publicAPI
// (`{ map, components, getComponent }`) registered by <GMap>.
async function waitForMap(id) {
  await settled();
  return getMapInstance(id);
}
function trigger(component, eventName, ...options) {
  google.maps.event.trigger(component, eventName, ...options);
}
function getDirectionsQuery(directions) {
  let {
    origin,
    destination
  } = directions.request;
  return {
    origin: origin.query,
    destination: destination.query
  };
}

export { getDirectionsQuery, setupMapTest, trigger, waitForMap };
//# sourceMappingURL=test-support.js.map
