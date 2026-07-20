import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { GMap } from 'ember-google-maps';

// Proves <GMap> sets up against LIVE Google Maps. The setup effect's first pull
// is kicked off by scheduleInitialPull (schedule('afterRender', …)) because the
// async API load brings no runloop for the passive _backburner.on('end') poll to
// ride; the poll still drives later updates.
module('Integration | real-google smoke', function (hooks) {
  setupRenderingTest(hooks);

  test('<GMap> loads a real google.maps.Map and fires @onReady', async function (assert) {
    let readyMap;
    const onReady = (map) => (readyMap = map);

    await render(
      <template>
        <GMap @lat={{51.5}} @lng={{-0.1}} @onReady={{onReady}} data-test-map />
      </template>,
    );
    await settled();

    assert.dom('[data-test-map]').exists('canvas rendered');
    assert.ok(readyMap, '@onReady fired');
    assert.true(
      readyMap instanceof window.google.maps.Map,
      'a real google.maps.Map was created',
    );
  });
});
