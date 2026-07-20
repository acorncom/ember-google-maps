import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, waitUntil } from '@ember/test-helpers';
import {
  getMapInstance,
  clearMapInstances,
} from 'ember-google-maps/utils/helpers';

// Production-vs-test probe. An acceptance test boots the full app and keeps it
// mounted (no mid-test teardown), unlike a rendering test. If <GMap> sets up
// here but not in the rendering test, the failure is the rendering-test
// teardown race (addon works in a real app). If it fails here too, the
// _backburner effect mechanism is genuinely broken in the modern runtime.
module('Acceptance | map probe (real Google)', function (hooks) {
  setupApplicationTest(hooks);
  hooks.afterEach(() => clearMapInstances());

  test('visiting a route with <GMap> sets up a real google.maps.Map', async function (assert) {
    await visit('/map-probe');

    // Poll for the map to finish setting up (async API load + effect flush).
    await waitUntil(() => getMapInstance()?.map, { timeout: 15000 });

    let mapAPI = getMapInstance();
    assert.ok(mapAPI, 'map registered — setup() ran in a full-app context');
    assert.ok(
      mapAPI?.map instanceof window.google.maps.Map,
      'a real google.maps.Map was created',
    );
  });
});
