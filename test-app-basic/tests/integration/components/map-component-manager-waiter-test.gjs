import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { getPendingWaiterState } from '@ember/test-waiters';
import { render, setupOnerror } from '@ember/test-helpers';
import { GMap } from 'ember-google-maps';
import MapComponent from 'ember-google-maps/components/g-map/map-component';

// A map component whose setup() throws. It still routes through the custom
// map-component-manager (inherited via MapComponent), so the manager opens a
// test waiter for it before calling setup().
class BoomComponent extends MapComponent {
  setup() {
    throw new Error('boom in map component setup');
  }

  <template>
    {{! setup() throws before this renders anything }}
  </template>
}

module(
  'Integration | map-component-manager (waiter leak on throwing setup)',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMapTest(hooks);

    test('a throwing setup() fails fast instead of hanging settled()', async function (assert) {
      // Capture the setup() error so it surfaces as data rather than failing the
      // test as an uncaught error — we want to assert on the *waiter*, not the
      // throw itself.
      let captured;
      setupOnerror((e) => {
        captured = e;
      });

      // Before the fix, the manager calls beginAsync() then never endAsync()s
      // when setup() throws, so settled() (awaited by render) never resolves and
      // this line hangs until the test times out.
      await render(
        <template>
          <GMap @lat={{40.015}} @lng={{-105.2705}} @zoom={{12}}>
            <BoomComponent />
          </GMap>
        </template>,
      );

      assert.ok(captured, 'the setup() error surfaced');
      assert.ok(
        /boom in map component setup/.test(captured?.message ?? ''),
        'the surfaced error is the one setup() threw',
      );

      let waiters = getPendingWaiterState().waiters;
      assert.notOk(
        waiters['ember-google-maps:map-component-waiter'],
        'map-component-waiter was not left pending after the throw',
      );
    });
  },
);
