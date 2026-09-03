import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, Rectangle } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/rectangle-test.js, rewritten
// to the v2 import API (<GMap><Rectangle/></GMap>) and tracked local state instead
// of this.set(...). Runs against real Google.
class State {
  @tracked bounds;
}

module('Integration | Component | rectangle', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a rectangle', async function (assert) {
    const state = new State();

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          {{#if state.bounds}}
            <Rectangle @bounds={{state.bounds}} />
          {{/if}}
        </GMap>
      </template>,
    );

    let { map } = await this.waitForMap();

    state.bounds = map.getBounds();

    let api = await this.waitForMap();
    let rectangle = api.components.rectangles[0].mapComponent;

    assert.ok(rectangle, 'rectangle rendered');
    assert.ok(
      rectangle.getBounds().equals(map.getBounds()),
      "rectangle rendered with the map's bounds",
    );
  });
});
