import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { GMap, BicyclingLayer } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/bicycling-layer-test.js,
// rewritten to the v2 import API (<GMap><BicyclingLayer/></GMap>). Runs against
// real Google.
module('Integration | Component | bicycling-layer', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a bicycling layer', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <BicyclingLayer />
        </GMap>
      </template>,
    );

    let {
      components: { bicyclingLayers },
    } = await this.waitForMap();

    assert.strictEqual(bicyclingLayers.length, 1);
    assert.ok(bicyclingLayers[0].mapComponent.getMap());
  });
});
