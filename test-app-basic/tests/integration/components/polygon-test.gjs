import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { render } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { GMap, Polygon } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/polygon-test.js, rewritten
// to the v2 import API (<GMap><Polygon/></GMap>) and tracked local state instead
// of this.set(...). Runs against real Google.
class State {
  @tracked lat;
  @tracked lng;
  @tracked path;
}

module('Integration | Component | polygon', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);

  test('it renders a polygon', async function (assert) {
    const state = new State();
    state.lat = 24.886;
    state.lng = -70.268;

    state.path = A([
      { lat: 25.774, lng: -80.19 },
      { lat: 18.466, lng: -66.118 },
      { lat: 32.321, lng: -64.757 },
      { lat: 25.774, lng: -80.19 },
    ]);

    await render(
      <template>
        <GMap @lat={{state.lat}} @lng={{state.lng}}>
          <Polygon @path={{state.path}} />
        </GMap>
      </template>,
    );

    let {
      components: { polygons },
    } = await this.waitForMap();

    assert.ok(polygons[0].mapComponent, 'the polygon is rendered');
  });
});
