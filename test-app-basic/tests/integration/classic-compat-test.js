import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { registerDeprecationHandler } from '@ember/debug';

// C12: classic consumption via NAME RESOLUTION (no imports), the way the
// waterfluence main app uses the addon (.hbs). test-app-basic is @embroider/compat
// + classicEmberSupport, so `<GMap>` / `<g.*>` / `<Gmap*>` resolve by name here.
//   - `<GMap as |g|><g.marker/>` name-resolves to the deprecated bridge (works +
//     warns) — this is how a v1 .hbs app upgrades with zero template changes.
//   - `<GmapMarker/>` name-resolves to the flat compat component (no deprecation).
// (A `.gts` typed-template smoke is deferred to the TypeScript/Glint phase.)
let deprecationIds = [];
let handlerRegistered = false;

module('Integration | classic compat (name resolution)', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  hooks.beforeEach(function () {
    deprecationIds = [];
    if (!handlerRegistered) {
      // Observe, don't swallow: call next so other handlers (and other test
      // files' handlers) still run. Handlers can't be unregistered.
      registerDeprecationHandler((message, options, next) => {
        deprecationIds.push(options?.id);
        next(message, options);
      });
      handlerRegistered = true;
    }
  });

  test('classic <GMap as |g|><g.marker/> resolves by name and warns', async function (assert) {
    await render(hbs`
      <GMap @lat={{this.lat}} @lng={{this.lng}} as |g|>
        <g.marker @lat={{this.lat}} @lng={{this.lng}} />
      </GMap>
    `);

    let {
      components: { markers },
    } = await this.waitForMap();

    assert.strictEqual(
      markers.length,
      1,
      'marker registered via name resolution',
    );
    assert.true(
      deprecationIds.includes('ember-google-maps.g-namespace.marker'),
      'g-namespace deprecation fired',
    );
  });

  test('classic <GmapMarker/> resolves by name with no deprecation', async function (assert) {
    await render(hbs`
      <GMap @lat={{this.lat}} @lng={{this.lng}}>
        <GmapMarker @lat={{this.lat}} @lng={{this.lng}} />
      </GMap>
    `);

    let {
      components: { markers },
    } = await this.waitForMap();

    assert.strictEqual(markers.length, 1, 'marker registered via <GmapMarker>');
    assert.false(
      deprecationIds.some((id) =>
        id?.startsWith('ember-google-maps.g-namespace.'),
      ),
      'no g-namespace deprecation fired for the flat compat component',
    );
  });
});
