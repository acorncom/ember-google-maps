import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, Marker } from 'ember-google-maps';
import {
  getMapInstance,
  clearMapInstances,
} from 'ember-google-maps/utils/helpers';

class State {
  @tracked lat = 51.5;
}

// Verifies the arg-change UPDATE path works for a CHILD map component (not just
// <GMap>): changing a tracked @lat re-runs Marker.update() -> marker.setOptions()
// via the `_backburner.on('end')` poll (effects/tracking.js).
module('Integration | marker update (real Google)', function (hooks) {
  setupRenderingTest(hooks);
  hooks.afterEach(() => clearMapInstances());

  test('changing a child <Marker> @lat updates the live marker', async function (assert) {
    const state = new State();

    await render(
      <template>
        <GMap @lat={{51.5}} @lng={{-0.1}} data-test-map>
          <Marker @lat={{state.lat}} @lng={{-0.1}} />
        </GMap>
      </template>,
    );
    await settled();

    const marker = getMapInstance().components.markers[0].mapComponent;
    assert.strictEqual(
      Math.round(marker.getPosition().lat() * 10) / 10,
      51.5,
      'initial marker lat applied',
    );

    state.lat = 52.5;
    await settled();
    assert.strictEqual(
      Math.round(marker.getPosition().lat() * 10) / 10,
      52.5,
      'marker lat updated after arg change (poll -> setOptions)',
    );
  });
});
