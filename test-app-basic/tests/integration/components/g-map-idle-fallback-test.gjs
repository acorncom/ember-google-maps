import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { render } from '@ember/test-helpers';
import { GMap } from 'ember-google-maps';

// Regression test for the `pauseTestForIdle` waiter leak.
//
// In DEBUG builds <GMap> holds `settled()` open until the map fires an `idle`
// event. If a map is torn down before it settles, `idle` never fires. Before the
// fallback timeout was added, the @waitFor promise stayed pending forever and
// `settled()` (so `render()` here) would hang until the QUnit test timeout.
//
// We simulate "idle never fires" by dropping every `idle` listener the addon
// registers, then assert that rendering still settles — via the fallback —
// rather than hanging.
module('Integration | Component | g-map (idle fallback)', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);

  hooks.beforeEach(async function () {
    // The Google Maps API loads lazily on first render, so `google.maps.event`
    // doesn't exist yet. Force it to load before we patch it, and only patch
    // if it's really there so we never restore an `undefined` onto later tests.
    let api = this.owner.lookup('service:google-maps-api');
    await api.google;

    this.originalAddListenerOnce = google.maps.event.addListenerOnce;
    this.originalRemoveListener = google.maps.event.removeListener;
    this.droppedIdleListeners = new WeakSet();
    this.idleWasSuppressed = false;

    google.maps.event.addListenerOnce = (instance, eventName, handler) => {
      if (eventName === 'idle') {
        // Never invoke the handler, so the only way `pauseTestForIdle` can
        // resolve is via its fallback timeout.
        this.idleWasSuppressed = true;
        let fake = { remove: () => {} };
        this.droppedIdleListeners.add(fake);
        return fake;
      }
      return this.originalAddListenerOnce.call(
        google.maps.event,
        instance,
        eventName,
        handler,
      );
    };

    // `pauseTestForIdle` cleans up with `removeListener(listener)`; tolerate
    // the fake handles we hand back above.
    google.maps.event.removeListener = (listener) => {
      if (listener && this.droppedIdleListeners.has(listener)) {
        return;
      }
      return this.originalRemoveListener.call(google.maps.event, listener);
    };
  });

  hooks.afterEach(function () {
    if (this.originalAddListenerOnce) {
      google.maps.event.addListenerOnce = this.originalAddListenerOnce;
    }
    if (this.originalRemoveListener) {
      google.maps.event.removeListener = this.originalRemoveListener;
    }
  });

  test('rendering settles via the fallback when the map never goes idle', async function (assert) {
    // Without the fallback this `render()` never resolves and the test times
    // out. With it, render settles and we can read the map back.
    await render(
      <template>
        <GMap @lat={{40.015}} @lng={{-105.2705}} @zoom={{12}} />
      </template>,
    );

    let { map } = await this.waitForMap();

    assert.true(
      this.idleWasSuppressed,
      'the map `idle` event was suppressed for this test',
    );
    assert.ok(
      map,
      'render settled via the fallback timeout even though idle never fired',
    );
  });
});
