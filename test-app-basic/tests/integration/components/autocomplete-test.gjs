import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest, trigger } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { find, render } from '@ember/test-helpers';
import { GMap, Autocomplete } from 'ember-google-maps';
import didInsert from 'ember-google-maps/modifiers/g-map/did-insert';

// Ported from legacy/tests/integration/components/g-map/autocomplete-test.js to
// the v2 import API. Block form wires a custom input via the addon's
// g-map/did-insert modifier calling the yielded `autocomplete.setup`.
module('Integration | Component | autocomplete', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders an input and binds the `place_changed` event', async function (assert) {
    assert.expect(3);

    this.onPlaceChanged = () => assert.ok('Did call `place_changed`');

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Autocomplete
            id="custom-id"
            @onPlaceChanged={{this.onPlaceChanged}}
          />
        </GMap>
      </template>,
    );

    let {
      components: { autocompletes },
    } = await this.waitForMap();

    assert.strictEqual(autocompletes.length, 1);

    let input = find('#custom-id');
    let autocomplete = autocompletes[0].mapComponent;

    assert.ok(input, 'input rendered');

    trigger(autocomplete, 'place_changed');
  });

  test('compat: it renders an input and binds the legacy `onSearch` event', async function (assert) {
    assert.expect(3);

    this.onSearch = () => assert.ok('Did call `onSearch`');

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Autocomplete id="custom-id" @onSearch={{this.onSearch}} />
        </GMap>
      </template>,
    );

    let {
      components: { autocompletes },
    } = await this.waitForMap();

    assert.strictEqual(autocompletes.length, 1);

    let input = find('#custom-id');
    let autocomplete = autocompletes[0].mapComponent;

    assert.ok(input, 'input rendered');

    trigger(autocomplete, 'place_changed');
  });

  test('it registers a custom input in block form', async function (assert) {
    assert.expect(1);

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Autocomplete as |autocomplete|>
            <label for="custom-id">Custom input</label>
            <input id="custom-id" {{didInsert autocomplete.setup}} />
          </Autocomplete>
        </GMap>
      </template>,
    );

    await this.waitForMap();

    assert.ok('Everything seems fine');
  });
});
