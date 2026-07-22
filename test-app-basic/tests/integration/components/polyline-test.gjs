import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { GMap, Polyline } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/polyline-test.js, rewritten
// to the v2 import API (<GMap><Polyline/></GMap>) and tracked local state instead
// of this.set(...). Runs against real Google.
class State {
  @tracked path;
}

module('Integration | Component | polyline', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it updates a polylines when the path attribute changes', async function (assert) {
    const state = new State();
    state.path = A([
      { lat: 51.56742722687343, lng: -0.25783538818359375 },
      { lat: 51.51917163898047, lng: -0.23586273193359375 },
      { lat: 51.46680134633284, lng: -0.09922027587890625 },
      { lat: 51.476892649684764, lng: -0.0006866455078125 },
    ]);

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Polyline @path={{state.path}} />
        </GMap>
      </template>,
    );

    let {
      components: { polylines },
    } = await this.waitForMap();

    let polyline = polylines[0].mapComponent;

    assert.ok(polyline, 'polyline exists');

    let newCoords = { lat: 51.500154286474746, lng: 0.05218505859375 };
    state.path.pushObject(newCoords);

    await this.waitForMap();

    assert.deepEqual(polyline.getPath().getAt(4).toJSON(), newCoords);
  });
});
