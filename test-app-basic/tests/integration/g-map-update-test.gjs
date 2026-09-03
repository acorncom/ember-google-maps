import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap } from 'ember-google-maps';

class State {
  @tracked zoom = 5;
}

// Verifies the arg-change UPDATE path: changing a tracked option re-pulls the
// setup effect via the `_backburner.on('end')` poll (effects/tracking.js) ->
// map.setOptions(). The arg change flows through the template, scheduling a
// render runloop whose 'end' fires the poll.
module('Integration | g-map update (real Google)', function (hooks) {
  setupRenderingTest(hooks);

  test('changing @zoom updates the live map', async function (assert) {
    let readyMap;
    const state = new State();
    const onReady = (map) => (readyMap = map);

    await render(
      <template>
        <GMap
          @lat={{51.5}}
          @lng={{-0.1}}
          @zoom={{state.zoom}}
          @onReady={{onReady}}
          data-test-map
        />
      </template>,
    );
    await settled();
    assert.strictEqual(readyMap.getZoom(), 5, 'initial zoom applied');

    state.zoom = 10;
    await settled();
    assert.strictEqual(
      readyMap.getZoom(),
      10,
      'zoom updated after arg change (poll -> setOptions)',
    );
  });
});
