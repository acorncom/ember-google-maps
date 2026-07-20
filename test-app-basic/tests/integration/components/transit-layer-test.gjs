import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { GMap, TransitLayer } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/transit-layer-test.js,
// rewritten to the v2 import API (<GMap><TransitLayer/></GMap>). Runs against
// real Google.
module('Integration | Component | transit-layer', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a transit layer', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <TransitLayer />
        </GMap>
      </template>,
    );

    let {
      components: { transitLayers },
    } = await this.waitForMap();

    assert.strictEqual(transitLayers.length, 1);
    assert.ok(transitLayers[0].mapComponent.getMap());
  });
});
