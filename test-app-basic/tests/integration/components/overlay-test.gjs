import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { find, render, waitFor, click } from '@ember/test-helpers';
import { later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { GMap, Overlay } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/overlay-test.js to the
// v2 import API. The v1 `<g.canvas id="map-canvas"/>` is replaced by forwarding
// `id` to <GMap>'s auto-rendered canvas via ...attributes (the import API has no
// self-wiring custom-canvas path yet — see the Phase C notes).
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function coinToss() {
  return Math.random() >= 0.5 ? true : false;
}

async function generateLocations(googlePromise, { lat, lng }) {
  let google = await googlePromise;

  let origin = new google.maps.LatLng(lat, lng);

  return Array(42)
    .fill()
    .map((_e, i) => {
      let heading = randomInt(1, 360),
        distance = randomInt(100, 5000),
        n = google.maps.geometry.spherical.computeOffset(
          origin,
          distance,
          heading,
        );
      return { id: i, lat: n.lat(), lng: n.lng() };
    });
}

class State {
  @tracked locations;
}

module('Integration | Component | overlay', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a custom overlay', async function (assert) {
    assert.expect(4);

    this.onClick = () => assert.ok('can attach events to overlays');

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}} id="map-canvas">
          <Overlay
            id="overlay-container"
            @lat={{this.lat}}
            @lng={{this.lng}}
            @onClick={{this.onClick}}
          >
            <div id="custom-overlay"></div>
          </Overlay>
        </GMap>
      </template>,
    );

    let {
      components: { overlays },
    } = await this.waitForMap();

    let overlay = await waitFor('#custom-overlay');
    let mapDiv = find('#map-canvas');

    assert.strictEqual(overlays.length, 1, 'overlay registered');

    assert.ok(overlay, 'overlay rendered');

    assert.ok(mapDiv.contains(overlay), 'overlay is child of map node');

    await click('#overlay-container');
  });

  test('it survives a performance test without errors', async function (assert) {
    assert.expect(0);

    const state = new State();

    let googleMapsApi = this.owner.lookup('service:google-maps-api');

    let originalLocations = await generateLocations(googleMapsApi.google, {
      lat: this.lat,
      lng: this.lng,
    });

    let perturbLocations = (times) => {
      for (let i = 1; i <= times; i++) {
        later(() => {
          state.locations = originalLocations.filter(coinToss);
        }, 100 * i);
      }
    };

    state.locations = originalLocations;

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}}>
          {{#each state.locations as |location|}}
            <Overlay @lat={{location.lat}} @lng={{location.lng}}>
              <div>Test</div>
            </Overlay>
          {{/each}}
        </GMap>
      </template>,
    );

    perturbLocations(20);

    await this.waitForMap();
  });
});
