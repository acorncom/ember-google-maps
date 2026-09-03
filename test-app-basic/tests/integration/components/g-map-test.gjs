import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest, trigger } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { find, render } from '@ember/test-helpers';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { GMap } from 'ember-google-maps';
import { toLatLng } from 'ember-google-maps/utils/helpers';

// Ported from legacy/tests/integration/components/g-map-test.js to the v2 import
// API. The v1 `g-map/hash` helper is replaced by `{{hash}}` from @ember/helper.
class State {
  @tracked lat;
  @tracked lng;
  @tracked zoom;
}

module('Integration | Component | g-map', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders without any coordinates or options', async function (assert) {
    // Google Maps treats all options as optional, so this should render a gray
    // square without throwing.
    await render(<template><GMap /></template>);

    let api = await this.waitForMap();

    assert.ok(api.map);
  });

  test('it renders a map', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}} />
      </template>,
    );

    let { map } = await this.waitForMap();

    assert.ok(map, 'map initialized');
  });

  test('it passes arguments as options to the map', async function (assert) {
    await render(
      <template>
        <GMap
          @lat={{this.lat}}
          @lng={{this.lng}}
          @zoom={{12}}
          @zoomControl={{false}}
        />
      </template>,
    );

    let { map } = await this.waitForMap();

    assert.notOk(map.zoomControl, 'zoom control disabled');
  });

  test('it accepts an options hash', async function (assert) {
    await render(
      <template>
        <GMap
          @lat={{this.lat}}
          @lng={{this.lng}}
          @options={{hash zoom=12 zoomControl=false}}
        />
      </template>,
    );

    let { map } = await this.waitForMap();

    assert.notOk(map.zoomControl, 'zoom control disabled');
  });

  test('it updates the map when arguments are changed', async function (assert) {
    const state = new State();
    state.lat = this.lat;
    state.lng = this.lng;
    state.zoom = 12;

    await render(
      <template>
        <GMap @lat={{state.lat}} @lng={{state.lng}} @zoom={{state.zoom}} />
      </template>,
    );

    let { map } = await this.waitForMap();

    assert.strictEqual(map.zoom, state.zoom);

    state.zoom = 15;

    await this.waitForMap();

    assert.strictEqual(map.zoom, state.zoom, 'map zoom updated');

    let newLatLng = google.maps.geometry.spherical.computeOffset(
      toLatLng(state.lat, state.lng),
      500,
      0,
    );

    state.lat = newLatLng.lat();
    state.lng = newLatLng.lng();

    await this.waitForMap();

    assert.ok(newLatLng.equals(map.getCenter()), 'map center updated');
  });

  test('it extracts events from the arguments and binds them to the map', async function (assert) {
    assert.expect(1);

    this.onZoomChanged = ({ eventName }) => {
      assert.strictEqual(eventName, 'zoom_changed', 'zoom changed event');
    };

    await render(
      <template>
        <GMap
          @lat={{this.lat}}
          @lng={{this.lng}}
          @zoom={{12}}
          @onZoomChanged={{this.onZoomChanged}}
        />
      </template>,
    );

    let { map } = await this.waitForMap();

    map.setZoom(10);
  });

  test('it supports events that trigger only once', async function (assert) {
    assert.expect(1);

    this.onLoad = ({ eventName }) => {
      assert.strictEqual(eventName, 'idle', 'map loaded and idle');
    };

    await render(
      <template>
        <GMap
          @lat={{this.lat}}
          @lng={{this.lng}}
          @zoom={{12}}
          @onceOnIdle={{this.onLoad}}
        />
      </template>,
    );

    let { map } = await this.waitForMap();

    map.panBy(250, 250);

    await this.waitForMap();
  });

  test('it accepts both an events hash and individual attribute events', async function (assert) {
    assert.expect(2);

    this.onClick = ({ eventName }) => {
      assert.strictEqual(eventName, 'click', 'click attribute event');
    };

    this.onZoomChanged = ({ eventName }) => {
      assert.strictEqual(
        eventName,
        'zoom_changed',
        'zoom changed event from events hash',
      );
    };

    await render(
      <template>
        <GMap
          @lat={{this.lat}}
          @lng={{this.lng}}
          @zoom={{12}}
          @onClick={{this.onClick}}
          @events={{hash onZoomChanged=this.onZoomChanged}}
        />
      </template>,
    );

    let { map } = await this.waitForMap();

    trigger(map, 'click');

    map.setZoom(10);
  });

  test('it passes attributes to the default canvas', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} class="attributes-test" />
      </template>,
    );

    await this.waitForMap();

    assert.ok(find('.attributes-test'), 'attributes passed to default canvas');
    assert.ok(
      find('.ember-google-map'),
      'default class appended to attributes',
    );
  });

  test('it renders a default canvas in block form', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} class="attributes-test" />
      </template>,
    );

    assert.ok(find('.ember-google-map'), 'default canvas rendered');
  });
});
