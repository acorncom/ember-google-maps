import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { GMap, TrafficLayer } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/traffic-layer-test.js,
// rewritten to the v2 import API (<GMap><TrafficLayer/></GMap>). Runs against
// real Google.
module('Integration | Component | traffic-layer', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a traffic layer', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <TrafficLayer />
        </GMap>
      </template>,
    );

    let {
      components: { trafficLayers },
    } = await this.waitForMap();

    assert.strictEqual(trafficLayers.length, 1);
    assert.ok(trafficLayers[0].mapComponent.getMap());
  });
});
