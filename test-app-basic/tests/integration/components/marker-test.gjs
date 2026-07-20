import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest, trigger } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, Marker } from 'ember-google-maps';
import { toLatLng } from 'ember-google-maps/utils/helpers';

// Ported from legacy/tests/integration/components/g-map/marker-test.js, rewritten
// to the v2 import API (<GMap><Marker/></GMap>) and tracked local state instead
// of this.set(...). Runs against real Google.
class State {
  @tracked showMarker = true;
  @tracked lat;
  @tracked lng;
}

module('Integration | Component | marker', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a marker', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Marker @lat={{this.lat}} @lng={{this.lng}} />
        </GMap>
      </template>,
    );

    let {
      map,
      components: { markers },
    } = await this.waitForMap();

    let marker = markers[0].mapComponent;

    assert.strictEqual(markers.length, 1);
    assert.deepEqual(marker.map, map);
  });

  test('it attaches an event to a marker', async function (assert) {
    assert.expect(1);

    this.onClick = () => assert.ok('It binds events to actions');

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Marker
            @lat={{this.lat}}
            @lng={{this.lng}}
            @onClick={{this.onClick}}
          />
        </GMap>
      </template>,
    );

    let {
      components: { markers },
    } = await this.waitForMap();

    let marker = markers[0].mapComponent;

    trigger(marker, 'click');
  });

  test('it sets options on a marker', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Marker @lat={{this.lat}} @lng={{this.lng}} @draggable={{true}} />
        </GMap>
      </template>,
    );

    let {
      components: { markers },
    } = await this.waitForMap();

    let marker = markers[0].mapComponent;

    assert.true(marker.draggable);
  });

  test('it unregisters a marker on teardown', async function (assert) {
    assert.expect(2);

    const state = new State();

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          {{#if state.showMarker}}
            <Marker @lat={{this.lat}} @lng={{this.lng}} @draggable={{true}} />
          {{/if}}
        </GMap>
      </template>,
    );

    let {
      components: { markers },
    } = await this.waitForMap();

    assert.strictEqual(markers.length, 1, 'marker registered');

    state.showMarker = false;
    await this.waitForMap();

    // Confirms the markers array is updated when the marker is torn down.
    assert.strictEqual(markers.length, 0, 'marker unregistered');
  });

  test('it updates the marker’s position', async function (assert) {
    const state = new State();
    state.lat = this.lat;
    state.lng = this.lng;

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <Marker @lat={{state.lat}} @lng={{state.lng}} />
        </GMap>
      </template>,
    );

    await this.waitForMap();

    let newLatLng = google.maps.geometry.spherical.computeOffset(
      toLatLng(state.lat, state.lng),
      500,
      0,
    );

    state.lat = newLatLng.lat();
    state.lng = newLatLng.lng();

    let { components } = await this.waitForMap();
    let marker = components.markers[0].mapComponent;

    assert.ok(
      newLatLng.equals(marker.getPosition()),
      'marker position updated',
    );
  });
});
