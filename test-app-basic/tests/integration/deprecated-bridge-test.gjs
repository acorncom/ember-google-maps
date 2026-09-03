import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { registerDeprecationHandler } from '@ember/debug';
import { GMap } from 'ember-google-maps/deprecated';

// C11: the opt-in `/deprecated` bridge lets a v1 `<GMap as |g|><g.marker/>`
// template keep working by changing ONE import line. It must (a) render the
// marker and (b) fire the `ember-google-maps.g-namespace.<name>` deprecation.
let deprecationIds = [];
let handlerRegistered = false;

module('Integration | deprecated bridge', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  hooks.beforeEach(function () {
    deprecationIds = [];
    if (!handlerRegistered) {
      // Observe, don't swallow: call next so other test files' handlers still
      // run (handlers can't be unregistered and chain across files).
      registerDeprecationHandler((message, options, next) => {
        deprecationIds.push(options?.id);
        next(message, options);
      });
      handlerRegistered = true;
    }
  });

  test('<GMap as |g|><g.marker/> renders and warns', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} as |g|>
          <g.marker @lat={{this.lat}} @lng={{this.lng}} />
        </GMap>
      </template>,
    );

    let {
      components: { markers },
    } = await this.waitForMap();

    assert.strictEqual(markers.length, 1, 'marker registered via the bridge');

    assert.true(
      deprecationIds.includes('ember-google-maps.g-namespace.marker'),
      'the g-namespace deprecation fired',
    );
  });
});
