import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest, trigger } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, AdvancedMarker } from 'ember-google-maps';
import { toLatLng } from 'ember-google-maps/utils/helpers';

// Ported from legacy/tests/integration/components/g-map/advanced-marker-test.js
// to the v2 import API. Advanced markers need a @mapId and the `marker` library.
const mapId = 'ember-google-maps';

class State {
  @tracked showMarker = true;
  @tracked markerLat;
  @tracked markerLng;
}

module('Integration | Component | advanced-marker', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders an advanced-marker', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @mapId={{mapId}}>
          <AdvancedMarker @lat={{this.lat}} @lng={{this.lng}} />
        </GMap>
      </template>,
    );

    let {
      map,
      components: { advancedMarkers },
    } = await this.waitForMap();

    let advancedMarker = advancedMarkers[0].mapComponent;

    assert.strictEqual(advancedMarkers.length, 1);
    assert.deepEqual(advancedMarker.map, map);
  });

  test('it attaches an event to an advanced marker', async function (assert) {
    assert.expect(1);

    this.onClick = () => assert.ok('It binds events to actions');

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @mapId={{mapId}}>
          <AdvancedMarker
            @lat={{this.lat}}
            @lng={{this.lng}}
            @onClick={{this.onClick}}
          />
        </GMap>
      </template>,
    );

    let {
      components: { advancedMarkers },
    } = await this.waitForMap();

    let advancedMarker = advancedMarkers[0].mapComponent;

    trigger(advancedMarker, 'click');
  });

  test('it sets options on an advanced marker', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @mapId={{mapId}}>
          <AdvancedMarker
            @lat={{this.lat}}
            @lng={{this.lng}}
            @gmpDraggable={{true}}
          />
        </GMap>
      </template>,
    );

    let {
      components: { advancedMarkers },
    } = await this.waitForMap();

    let advancedMarker = advancedMarkers[0].mapComponent;

    assert.true(advancedMarker.gmpDraggable);
  });

  test('it unregisters an advanced marker on teardown', async function (assert) {
    assert.expect(2);

    const state = new State();

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @mapId={{mapId}}>
          {{#if state.showMarker}}
            <AdvancedMarker
              @lat={{this.lat}}
              @lng={{this.lng}}
              @gmpDraggable={{true}}
            />
          {{/if}}
        </GMap>
      </template>,
    );

    let {
      components: { advancedMarkers },
    } = await this.waitForMap();

    assert.strictEqual(advancedMarkers.length, 1, 'advanced marker registered');

    state.showMarker = false;
    await this.waitForMap();

    assert.strictEqual(advancedMarkers.length, 0, 'marker unregistered');
  });

  test('it updates the advanced marker’s position', async function (assert) {
    const state = new State();
    state.markerLat = this.lat;
    state.markerLng = this.lng;

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @mapId={{mapId}}>
          <AdvancedMarker @lat={{state.markerLat}} @lng={{state.markerLng}} />
        </GMap>
      </template>,
    );

    await this.waitForMap();

    let newLatLng = google.maps.geometry.spherical.computeOffset(
      toLatLng(state.markerLat, state.markerLng),
      5000,
      0,
    );

    state.markerLat = newLatLng.lat();
    state.markerLng = newLatLng.lng();

    let { components } = await this.waitForMap();
    let advancedMarker = components.advancedMarkers[0].mapComponent;

    let newPosition = new google.maps.LatLng(advancedMarker.position);

    assert.ok(
      newLatLng.equals(newPosition),
      'advanced marker position updated',
    );
  });
});
