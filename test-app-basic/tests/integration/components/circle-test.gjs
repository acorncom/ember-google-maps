import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, Circle } from 'ember-google-maps';
import { toLatLng } from 'ember-google-maps/utils/helpers';

// Ported from legacy/tests/integration/components/g-map/circle-test.js, rewritten
// to the v2 import API (<GMap><Circle/></GMap>) and tracked local state instead
// of this.setProperties(...). Runs against real Google.
class State {
  @tracked circleLat;
  @tracked circleLng;
}

module('Integration | Component | circle', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a circle', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Circle @lat={{this.lat}} @lng={{this.lng}} />
        </GMap>
      </template>,
    );

    let {
      components: { circles },
    } = await this.waitForMap();

    assert.strictEqual(circles.length, 1);
    assert.ok(circles[0].mapComponent.getMap());
  });

  test('it updates the circle’s center', async function (assert) {
    const state = new State();
    state.circleLat = this.lat;
    state.circleLng = this.lng;

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Circle @lat={{state.circleLat}} @lng={{state.circleLng}} />
        </GMap>
      </template>,
    );

    let { components } = await this.waitForMap();
    let circle = components.circles[0].mapComponent;

    let newLatLng = google.maps.geometry.spherical.computeOffset(
      toLatLng(state.circleLat, state.circleLng),
      500,
      0,
    );

    state.circleLat = newLatLng.lat();
    state.circleLng = newLatLng.lng();

    await this.waitForMap();

    assert.ok(newLatLng.equals(circle.getCenter()), 'circle center updated');
  });
});
